import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function loadFunction(file, name, apiClient) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const declaration = source.match(new RegExp(`export async function ${name}\\([\\s\\S]*?\\n}`))[0];
  return new Function('apiClient', `${declaration.replace('export ', '')}\nreturn ${name};`)(apiClient);
}

test('each upload target sends all 400 rows in one bulk HTTP request', async () => {
  const rows = Array.from({ length: 400 }, (_, index) => ({ mobile: String(9000000000 + index) }));
  const cases = [
    ['../src/modules/education/api/endpoints.js', 'bulkImportEducationLeads', '/education/leads/bulk-import'],
    ['../src/modules/education/api/endpoints.js', 'bulkImportEducationStudents', '/education/students/bulk-import'],
    ['../src/modules/leads/api/endpoints.js', 'bulkImportLeads', '/leads/bulk-import'],
  ];

  for (const [file, name, expectedUrl] of cases) {
    let calls = 0;
    const apiClient = { post: async (url, body, config) => {
      calls++;
      assert.equal(url, expectedUrl);
      assert.equal(body.rows.length, 400);
      assert.equal(config.timeout, 120000);
      assert.equal(config.skipErrorToast, true);
      return { data: { data: { importedCount: 400, failedCount: 0 } } };
    } };
    const bulkImport = loadFunction(file, name, apiClient);
    assert.equal((await bulkImport(rows)).data.importedCount, 400);
    assert.equal(calls, 1);
  }
});

test('the upload modal uses bulk endpoints instead of a per-row create loop', () => {
  const source = readFileSync(new URL('../src/modules/leads/components/LeadBulkUploadModal.vue', import.meta.url), 'utf8');
  const executeImport = source.slice(source.indexOf('async function executeImport()'), source.indexOf('\nonMounted(', source.indexOf('async function executeImport()')));
  assert.match(executeImport, /bulkImportEducationStudents\(rows\)/);
  assert.match(executeImport, /bulkImportEducationLeads\(rows\)/);
  assert.match(executeImport, /bulkImportLeads\(rows\)/);
  assert.doesNotMatch(executeImport, /for\s*\(const row of validRows\)/);
});
