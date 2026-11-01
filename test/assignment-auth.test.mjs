import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import axios from 'axios';
import { ref, isRef } from 'vue';
import { getErrorMessage } from '../src/utils/errorHandler.js';

function loadClient() {
  const source = readFileSync(new URL('../src/api/client.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/import\.meta\.env\.VITE_API_BASE_URL/g, "'/api/v1'")
    .replace(/export (const|function)/g, '$1')
    .replace('export default apiClient;', 'return { apiClient, injectStore };');
  return new Function('axios', 'ref', 'isRef', 'getErrorMessage', source)(axios, ref, isRef, getErrorMessage);
}

function loadDistribution(apiClient) {
  const source = readFileSync(new URL('../src/modules/leads/api/endpoints.js', import.meta.url), 'utf8');
  const declaration = source.match(/export async function distributeLeadsBatchRoundRobin\([\s\S]*?\n}/)[0];
  return new Function('apiClient', declaration.replace('export ', '') + '\nreturn distributeLeadsBatchRoundRobin;')(apiClient);
}

function unauthorized(config) {
  return new axios.AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, null, {
    status: 401, data: { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication token.' } }, config,
  });
}

test('Equal Split sends the stored access token, JSON body and tenant header', async () => {
  const { apiClient, injectStore } = loadClient();
  injectStore({ state: { auth: { token: 'test-access-token' }, organization: { tenantId: 'test-tenant' } } });
  apiClient.defaults.adapter = async (config) => {
    assert.equal(config.method, 'post');
    assert.equal(config.url, '/leads/distribute-batch-round-robin');
    assert.equal(config.timeout, 120000);
    assert.equal(config.headers.Authorization, 'Bearer test-access-token');
    assert.equal(config.headers['X-Tenant-ID'], 'test-tenant');
    assert.deepEqual(JSON.parse(config.data), { leadIds: ['lead'], staffIds: ['staff'], mode: 'equal', batchSize: 10, reason: 'Split' });
    return { status: 200, data: { success: true }, config };
  };
  await loadDistribution(apiClient)({ leadIds: ['lead'], staffIds: ['staff'], mode: 'equal', reason: 'Split' });
});

test('Equal Split retries its original POST with a refreshed token after a 401', async () => {
  const { apiClient, injectStore } = loadClient();
  let refreshes = 0;
  let calls = 0;
  const state = { auth: { token: 'expired-access', refreshToken: 'test-refresh' } };
  injectStore({ state, dispatch: async (action) => {
    assert.equal(action, 'auth/refreshUserTokens');
    refreshes++;
    state.auth.token = 'new-access';
    return { accessToken: 'new-access' };
  } });
  apiClient.defaults.adapter = async (config) => {
    calls++;
    assert.equal(JSON.parse(config.data).mode, 'equal');
    if (calls === 1) throw unauthorized(config);
    assert.equal(config.headers.Authorization, 'Bearer new-access');
    return { status: 200, data: { success: true }, config };
  };
  await loadDistribution(apiClient)({ leadIds: ['lead'], staffIds: ['staff'], mode: 'equal' });
  assert.equal(refreshes, 1);
  assert.equal(calls, 2);
});

async function assignmentErrorToast(error) {
  const source = readFileSync(new URL('../src/modules/leads/components/LeadAssignModal.vue', import.meta.url), 'utf8');
  const handler = source.slice(source.indexOf('const handleConfirm = async () => {'), source.lastIndexOf('</script>'));
  let toast;
  const dependencies = {
    errors: {}, assignMode: ref('equal'), selectedStaffIds: ref(['staff']), reason: ref('Split'),
    props: { leadIds: ['lead'] },
    distributeBatchOrEqual: async () => { throw error; },
    store: { dispatch: (action, payload) => { toast = payload; } },
    getErrorMessage,
    emit: () => assert.fail('A failed assignment must not be reported as successful'),
  };
  await new Function(...Object.keys(dependencies), handler + '\nreturn handleConfirm();')(...Object.values(dependencies));
  return toast;
}

test('assignment dialog displays the API authentication error', async () => {
  assert.equal((await assignmentErrorToast(unauthorized({}))).message, 'Invalid or missing authentication token.');
});

test('assignment timeout explains possible ongoing processing and is not retried', async () => {
  const { apiClient, injectStore } = loadClient();
  const toasts = [];
  injectStore({ state: { auth: { token: 'test-access-token' } }, dispatch: (action, payload) => { toasts.push(payload); } });
  let calls = 0;
  apiClient.defaults.adapter = async (config) => {
    calls++;
    throw new axios.AxiosError('timeout exceeded', 'ECONNABORTED', config);
  };
  let error;
  try {
    await loadDistribution(apiClient)({ leadIds: ['lead'], staffIds: ['staff'], mode: 'equal' });
  } catch (failure) { error = failure; }
  assert.equal(calls, 1);
  assert.equal(toasts.length, 0);
  assert.match((await assignmentErrorToast(error)).message, /Check the lead list before retrying/);
});
