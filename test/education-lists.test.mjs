import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, compileScript } from '@vue/compiler-sfc';
import { ref, computed } from 'vue';
import axios from 'axios';

// Execute the actual component setup with API/lifecycle boundaries stubbed.
function setupPage(filename, overrides = {}) {
  const source = readFileSync(new URL(`../src/modules/education/pages/${filename}.vue`, import.meta.url), 'utf8');
  const { descriptor } = parse(source);
  const script = compileScript(descriptor, { id: filename });
  const dependencies = {
    ref, computed, onMounted: () => {},
    useStore: () => ({ getters: { 'permissions/hasCapability': () => true }, dispatch: () => {} }),
    ...overrides,
  };
  const names = [];
  const code = script.content.replace(/^import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"];?/gm, (_, imports) => {
    const locals = imports.trim().startsWith('{')
      ? imports.replace(/[{}]/g, '').split(',').map(item => item.trim().split(/\s+as\s+/).pop()).filter(Boolean)
      : [imports.trim()];
    names.push(...locals);
    return '';
  }).replace('export default', 'return');
  const component = new Function(...names, code)(...names.map(name => dependencies[name] ?? {}));
  return { state: component.setup({}, { expose: () => {} }), template: descriptor.template.content };
}

const leadPage = (page) => ({
  data: Array.from({ length: 20 }, (_, i) => ({ _id: String((page - 1) * 20 + i) })),
  pagination: { page, limit: 20, total: 400, totalPages: 20 },
});

test('bulk delete sends 371 IDs once, blocks duplicate submits and reloads page one', async () => {
  const toasts = [];
  const requests = [];
  let complete;
  let calls = 0;
  const { state } = setupPage('EducationLeadsList', {
    useStore: () => ({ getters: { 'permissions/hasCapability': () => true }, dispatch: (_, toast) => toasts.push(toast) }),
    bulkDeleteEducationLeads: async ids => {
      calls++;
      assert.equal(ids.length, 371);
      return new Promise(resolve => { complete = resolve; });
    },
    deleteEducationLead: () => assert.fail('must not issue individual deletes'),
    fetchEducationLeads: async params => { requests.push(params); return leadPage(params.page); },
  });
  state.selectedRows.value = Array.from({ length: 371 }, (_, i) => ({ _id: String(i) }));
  state.isBulkDelete.value = true;
  state.isDeleteOpen.value = true;
  state.pagination.value.page = 19;
  const pending = state.confirmDelete();
  await state.confirmDelete();
  state.cancelDelete();
  assert.equal(state.isDeleteOpen.value, true);
  assert.equal(calls, 1);
  complete({ data: { deletedCount: 370, skippedCount: 1 } });
  await pending;
  assert.match(toasts[0].message, /370 student leads deleted.*1 already deleted/);
  assert.equal(state.selectedRows.value.length, 0);
  assert.equal(state.isDeleteOpen.value, false);
  assert.equal(state.isDeleting.value, false);
  assert.equal(requests[0].page, 1);
});

test('failed bulk delete keeps selection and displays the API error', async () => {
  const toasts = [];
  const { state } = setupPage('EducationLeadsList', {
    useStore: () => ({ getters: { 'permissions/hasCapability': () => true }, dispatch: (_, toast) => toasts.push(toast) }),
    bulkDeleteEducationLeads: async () => { throw { response: { data: { error: { message: 'Deletion denied' } } } }; },
  });
  state.selectedRows.value = [{ _id: 'lead' }];
  state.isBulkDelete.value = true;
  state.isDeleteOpen.value = true;
  await state.confirmDelete();
  assert.equal(state.selectedRows.value.length, 1);
  assert.equal(state.isDeleteOpen.value, true);
  assert.equal(state.isDeleting.value, false);
  assert.deepEqual(toasts, [{ message: 'Deletion denied', type: 'error' }]);
});

test('bulk delete API submits all IDs in one authenticated-client POST', async () => {
  const source = readFileSync(new URL('../src/modules/education/api/endpoints.js', import.meta.url), 'utf8');
  const declaration = source.match(/export async function bulkDeleteEducationLeads\([\s\S]*?\n}/)[0];
  const ids = Array.from({ length: 371 }, (_, i) => String(i));
  let calls = 0;
  const apiClient = { post: async (url, body, config) => {
    calls++;
    assert.equal(url, '/education/leads/bulk-delete');
    assert.deepEqual(body, { ids });
    assert.equal(config.timeout, 120000);
    return { data: { data: { deletedCount: 371, skippedCount: 0 } } };
  } };
  const remove = new Function('apiClient', declaration.replace('export ', '') + '\nreturn bulkDeleteEducationLeads;')(apiClient);
  assert.equal((await remove(ids)).data.deletedCount, 371);
  assert.equal(calls, 1);
});

test('lead table uses server pagination and can request the second and final pages', async () => {
  const requests = [];
  const { state, template } = setupPage('EducationLeadsList', {
    fetchEducationLeads: async (params) => { requests.push(params); return leadPage(params.page); },
  });
  assert.match(template, /<AppTable\b[^>]*:pagination="pagination"/);
  await state.load();
  state.handlePageChange(2);
  await Promise.resolve();
  assert.equal(state.rows.value[0]._id, '20');
  state.handlePageChange(20);
  await Promise.resolve();
  assert.equal(state.rows.value[19]._id, '399');
  assert.deepEqual(requests.map(request => request.page), [1, 2, 20]);
});

test('select all passes 400 IDs to single-staff assignment and preserves off-page selection', async () => {
  const all = Array.from({ length: 400 }, (_, i) => ({ _id: String(i) }));
  const { state } = setupPage('EducationLeadsList', {
    fetchEducationLeads: async ({ page }) => leadPage(page),
    fetchEducationLeadSelection: async () => ({ data: all }),
  });
  await state.load();
  await state.selectAllMatching();
  state.openBulkAssign();
  assert.equal(state.targetAssignIds.value.length, 400);
  assert.equal(state.assignModalMode.value, 'single');
  state.toggleSelectAll();
  assert.equal(state.selectedRows.value.length, 380);
  state.toggleSelectAll();
  assert.equal(state.selectedRows.value.length, 400);
  state.onFilterChange();
  assert.equal(state.selectedRows.value.length, 0);
});

test('changing filters invalidates an outstanding select-all response', async () => {
  let resolveSelection;
  const { state } = setupPage('EducationLeadsList', {
    fetchEducationLeadSelection: () => new Promise(resolve => { resolveSelection = resolve; }),
    fetchEducationLeads: async ({ page }) => leadPage(page),
  });
  const selecting = state.selectAllMatching();
  state.onFilterChange();
  resolveSelection({ data: [{ _id: 'stale-lead' }] });
  await selecting;
  assert.equal(state.selectedRows.value.length, 0);
});

test('school dropdown fetches all school options and filters students from page one', async () => {
  const requests = [];
  const { state, template } = setupPage('StudentsList', {
    fetchEducationStudentSchools: async () => ({ data: ['A School', 'Z School'] }),
    fetchEducationStudents: async (params) => {
      requests.push(params);
      return { data: [], pagination: { page: params.page, limit: 10, total: 0, totalPages: 0 } };
    },
  });
  assert.match(template, /<SchoolFilter[^>]*v-model="tempSchool"/);
  await state.loadSchoolOptions();
  assert.deepEqual(state.schoolOptions.value, ['A School', 'Z School']);
  state.pagination.value.page = 5;
  state.openFilterModal();
  state.tempSchool.value = ['Z School'];
  assert.deepEqual(state.schoolFilter.value, []);
  state.applyFiltersInModal();
  await Promise.resolve();
  assert.equal(requests[0].page, 1);
  assert.deepEqual(requests[0].schoolName, ['Z School']);
  state.clearAllFilters();
  assert.equal(requests[1].schoolName, undefined);
});

for (const filename of ['StudentsList', 'EducationLeadsList']) {
  test(`${filename}: All loads the complete filtered result and can switch back to 50`, async () => {
    const requests = [];
    const fetchList = async (params) => {
      requests.push(params);
      const count = params.limit === 'all' ? 400 : params.limit;
      return {
        data: Array.from({ length: count }, (_, i) => ({ _id: String(i) })),
        pagination: { page: 1, limit: count, total: 400, totalPages: 400 / count },
      };
    };
    const { state } = setupPage(filename, { fetchEducationStudents: fetchList, fetchEducationLeads: fetchList });
    state.schoolFilter.value = ['A School'];
    state.handlePageSizeChange('all');
    await Promise.resolve();
    assert.equal(state.rows.value.length, 400);
    assert.equal(state.pagination.value.limit, 'all');
    assert.equal(state.pagination.value.totalPages, 1);
    assert.deepEqual(requests[0].schoolName, ['A School']);
    state.handlePageSizeChange(50);
    await Promise.resolve();
    assert.equal(state.rows.value.length, 50);
    assert.equal(state.pagination.value.page, 1);
    assert.equal(state.pagination.value.totalPages, 8);
  });
}

test('lead school filter applies with other filters, resets drafts and scopes select all', async () => {
  let selectionParams;
  const { state, template } = setupPage('EducationLeadsList', {
    fetchEducationLeadSchools: async () => ({ data: ['Saved School', 'Imported School'] }),
    fetchEducationLeads: async ({ page }) => leadPage(page),
    fetchEducationLeadSelection: async (params) => { selectionParams = params; return { data: [] }; },
  });
  assert.match(template, /<SchoolFilter[^>]*v-model="tempSchool"/);
  state.openFilterModal();
  await Promise.resolve();
  assert.deepEqual(state.schoolOptions.value, ['Saved School', 'Imported School']);
  state.tempSchool.value = ['Imported School'];
  state.tempStatuses.value = ['interested'];
  assert.deepEqual(state.schoolFilter.value, []);
  state.applyFiltersInModal();
  assert.equal(state.activeFilterCount.value, 2);
  await state.selectAllMatching();
  assert.deepEqual(selectionParams.schoolName, ['Imported School']);
  assert.equal(selectionParams.status, 'interested');
  state.openFilterModal();
  state.clearFiltersInModal();
  assert.deepEqual(state.tempSchool.value, []);
  assert.deepEqual(state.schoolFilter.value, ['Imported School']);
  state.applyFiltersInModal();
  assert.deepEqual(state.schoolFilter.value, []);
});

test('multiple dropdown choices are grouped, isolated until Apply, and shared by bulk selection', async () => {
  let selectionParams;
  const { state, template } = setupPage('EducationLeadsList', {
    fetchEducationLeadSchools: async () => ({ data: [] }),
    fetchEducationLeads: async ({ page }) => leadPage(page),
    fetchEducationLeadSelection: async (params) => { selectionParams = params; return { data: [] }; },
  });
  assert.ok(template.indexOf('id="lead-school-filter"') > template.indexOf('Lead Status ('));
  assert.match(template, /<SchoolFilter[^>]*\/>\s*<AppMultiSelect[^>]*id="lead-staff-filter"/);
  state.openFilterModal();
  state.tempSchool.value = ['School, North', 'School South'];
  state.tempStaff.value = ['staff-a', 'staff-b'];
  state.tempInstitutionType.value = ['School', 'College'];
  state.tempEducationBoard.value = ['CBSE', 'ICSE'];
  state.tempStandard.value = ['10', '11'];
  state.tempAcademicStream.value = ['Science', 'Commerce'];
  assert.deepEqual(state.schoolFilter.value, []);
  state.applyFiltersInModal();
  assert.equal(state.activeFilterCount.value, 12);
  await state.selectAllMatching();
  assert.deepEqual(selectionParams, state.getLeadFilters());
  assert.deepEqual(selectionParams.schoolName, ['School, North', 'School South']);
  assert.deepEqual(selectionParams.assignedTo, ['staff-a', 'staff-b']);
  assert.deepEqual(selectionParams.standard, ['10', '11']);
  state.openFilterModal();
  state.tempSchool.value.push('Unapplied School');
  state.tempStaff.value.pop();
  state.isFilterModalOpen.value = false;
  assert.deepEqual(state.schoolFilter.value, ['School, North', 'School South']);
  assert.deepEqual(state.staffFilter.value, ['staff-a', 'staff-b']);
  state.openFilterModal();
  assert.equal(state.tempSchool.value.length, 2);
  state.clearFiltersInModal();
  assert.equal(state.activeFilterCount.value, 12);
  state.applyFiltersInModal();
  assert.equal(state.activeFilterCount.value, 0);
});

test('API requests serialize multiple choices as repeated keys without splitting school names', async () => {
  const client = axios.create({ baseURL: 'http://example.test' });
  const source = readFileSync(new URL('../src/modules/education/api/endpoints.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/export async function/g, 'async function');
  const endpoints = new Function('apiClient', source + '\nreturn [fetchEducationStudents, fetchEducationLeads, fetchEducationLeadSelection];')(client);
  client.defaults.adapter = async (config) => {
    const params = new URL(client.getUri(config)).searchParams;
    assert.deepEqual(params.getAll('schoolName'), ['School, North & East', 'School [South]']);
    assert.deepEqual(params.getAll('assignedTo'), ['staff-a', 'staff-b']);
    assert.equal(params.has('schoolName[]'), false);
    return { status: 200, data: { data: [] }, config };
  };
  for (const endpoint of endpoints) {
    await endpoint({ schoolName: ['School, North & East', 'School [South]'], assignedTo: ['staff-a', 'staff-b'] });
  }
});
