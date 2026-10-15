import apiClient from '@/api/client';

export async function fetchCustomFields(module, options = {}) {
  const params = {};
  if (module) params.module = module;
  if (options.includeStandard !== undefined) params.includeStandard = options.includeStandard;
  if (options.includeInactive !== undefined) params.includeInactive = options.includeInactive;
  const response = await apiClient.get('/custom-fields', { params });
  return response.data?.data || response.data || [];
}

export async function createCustomField(payload) {
  const response = await apiClient.post('/custom-fields', payload);
  return response.data?.data || response.data;
}

export async function updateCustomField(id, payload) {
  const response = await apiClient.patch(`/custom-fields/${id}`, payload);
  return response.data?.data || response.data;
}

export async function deleteCustomField(id) {
  const response = await apiClient.delete(`/custom-fields/${id}`);
  return response.data?.data || response.data;
}

export default {
  fetchCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
};

