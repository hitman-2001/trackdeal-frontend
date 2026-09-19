import apiClient from '@/api/client';

export async function fetchReportsDashboardStats(params = {}) {
  const response = await apiClient.get('/reports/dashboard', { params });
  return response.data;
}

export async function fetchLeadAnalytics(params) {
  const response = await apiClient.get('/analytics/leads', { params });
  return response.data;
}

export async function fetchSalesAnalytics(params) {
  const response = await apiClient.get('/analytics/sales', { params });
  return response.data;
}

export async function fetchCommissionAnalytics(params) {
  const response = await apiClient.get('/analytics/commission', { params });
  return response.data;
}

export async function fetchTaskAnalytics(params) {
  const response = await apiClient.get('/analytics/tasks', { params });
  return response.data;
}

export async function fetchExecutiveSummary(params) {
  const response = await apiClient.get('/analytics/executive', { params });
  return response.data;
}

export async function fetchAgentPerformance(params) {
  const response = await apiClient.get('/analytics/agents', { params });
  return response.data;
}

export async function enqueueExport(data) {
  const response = await apiClient.post('/analytics/export', data);
  return response.data;
}

export async function fetchExportStatus(jobId) {
  const response = await apiClient.get(`/analytics/export/${jobId}/status`);
  return response.data;
}

export async function downloadExport(jobId) {
  const response = await apiClient.get(`/analytics/export/${jobId}/download`, { responseType: 'blob' });
  return response;
}

export default {
  fetchLeadAnalytics,
  fetchSalesAnalytics,
  fetchCommissionAnalytics,
  fetchTaskAnalytics,
  fetchExecutiveSummary,
  fetchAgentPerformance,
  enqueueExport,
  fetchExportStatus,
  downloadExport
};
