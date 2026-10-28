import apiClient from '@/api/client';

export async function fetchCommissions(params) {
  const response = await apiClient.get('/commissions', { params });
  return response.data;
}

export async function fetchCommissionById(id) {
  const response = await apiClient.get(`/commissions/${id}`);
  return response.data;
}

export async function createCommission(data) {
  const response = await apiClient.post('/commissions', data);
  return response.data;
}

export async function createInvoice({ id, ...data }) {
  const response = await apiClient.post(`/commissions/${id}/invoice`, data);
  return response.data;
}

export async function recordCollection({ invoiceId, ...data }) {
  const response = await apiClient.post(`/commissions/invoices/${invoiceId}/collection`, data);
  return response.data;
}

export async function releasePayout(payoutId) {
  const response = await apiClient.post(`/commissions/payouts/${payoutId}/release`);
  return response.data;
}

export async function processClawback({ id, ...data }) {
  const response = await apiClient.post(`/commissions/${id}/clawback`, data);
  return response.data;
}

export async function transitionStage({ id, stage, status, notes }) {
  const targetStatus = status || stage;
  const response = await apiClient.post(`/commissions/${id}/transition`, {
    status: targetStatus,
    stage: targetStatus,
    notes,
  });
  return response.data;
}

export async function clearCollection(collectionId) {
  const response = await apiClient.post(`/commissions/collections/${collectionId}/clear`);
  return response.data;
}

export async function bounceCollection(collectionId) {
  const response = await apiClient.post(`/commissions/collections/${collectionId}/bounce`);
  return response.data;
}

export async function fetchCommissionSummary(params) {
  const response = await apiClient.get('/commissions/summary', { params });
  return response.data;
}

export async function fetchReceivables(params) {
  const response = await apiClient.get('/commissions/receivables', { params });
  return response.data;
}

export async function recordCommissionPayment({ id, ...data }) {
  const response = await apiClient.post(`/commissions/${id}/payments`, data);
  return response.data;
}

export default {
  fetchCommissions,
  fetchCommissionById,
  fetchCommissionSummary,
  fetchReceivables,
  recordCommissionPayment,
  createCommission,
  createInvoice,
  recordCollection,
  releasePayout,
  processClawback,
  transitionStage,
  clearCollection,
  bounceCollection,
};
