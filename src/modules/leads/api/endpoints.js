import apiClient from '@/api/client';

export async function fetchLeads(params) {
  const response = await apiClient.get('/leads', { params });
  return response.data;
}

export async function fetchLeadById(id) {
  const cleanId = typeof id === 'object' && id !== null && 'value' in id ? id.value : id;
  const response = await apiClient.get(`/leads/${cleanId}`);
  return response.data;
}

export async function createLead(data) {
  const response = await apiClient.post('/leads', data);
  return response.data;
}

export async function updateLead({ id, ...data }) {
  const response = await apiClient.put(`/leads/${id}`, data);
  return response.data;
}

export async function deleteLead(id) {
  const response = await apiClient.delete(`/leads/${id}`);
  return response.data;
}

export async function assignLead({ id, assignedTo, reason }) {
  const response = await apiClient.post(`/leads/${id}/assign`, { assignedTo, reason });
  return response.data;
}

export async function bulkAssignLeads({ leadIds, assignedTo, reason }) {
  const response = await apiClient.post('/leads/bulk-assign', { leadIds, assignedTo, reason });
  return response.data;
}

export async function distributeLeadsBatchRoundRobin({ leadIds, staffIds, mode = 'round_robin', batchSize = 10, reason }) {
  const response = await apiClient.post('/leads/distribute-batch-round-robin', { leadIds, staffIds, mode, batchSize, reason });
  return response.data;
}

export async function changeLeadStage({ id, status, lostReason, lostNotes }) {
  const response = await apiClient.post(`/leads/${id}/stage`, { status, lostReason, lostNotes });
  return response.data;
}

export async function addLeadNote({ id, content, isPrivate }) {
  const response = await apiClient.post(`/leads/${id}/notes`, { content, isPrivate });
  return response.data;
}

export async function logLeadActivity({ id, type, activityDate, activityTime, summary, description, customerResponse, nextFollowUpAt, status, assignedTo, metadata }) {
  const response = await apiClient.post(`/leads/${id}/activities`, {
    type,
    activityDate,
    activityTime,
    summary,
    description: description || summary,
    customerResponse,
    nextFollowUpAt,
    status,
    assignedTo,
    metadata,
  });
  return response.data;
}

export async function updateLeadActivity({ leadId, activityId, ...data }) {
  const response = await apiClient.put(`/leads/${leadId}/activities/${activityId}`, data);
  return response.data;
}

export async function deleteLeadActivity({ leadId, activityId }) {
  const response = await apiClient.delete(`/leads/${leadId}/activities/${activityId}`);
  return response.data;
}

export async function updateVisit({ leadId, visitId, ...data }) {
  const response = await apiClient.put(`/leads/${leadId}/visits/${visitId}`, data);
  return response.data;
}

export async function deleteVisit({ leadId, visitId }) {
  const response = await apiClient.delete(`/leads/${leadId}/visits/${visitId}`);
  return response.data;
}

export async function updateQuotation({ leadId, quotationId, ...data }) {
  const response = await apiClient.put(`/leads/${leadId}/quotations/${quotationId}`, data);
  return response.data;
}

export async function deleteQuotation({ leadId, quotationId }) {
  const response = await apiClient.delete(`/leads/${leadId}/quotations/${quotationId}`);
  return response.data;
}

export async function updateLeadNote({ leadId, noteId, ...data }) {
  const response = await apiClient.put(`/leads/${leadId}/notes/${noteId}`, data);
  return response.data;
}

export async function deleteLeadNote({ leadId, noteId }) {
  const response = await apiClient.delete(`/leads/${leadId}/notes/${noteId}`);
  return response.data;
}

export async function updateLeadFollowUp({ leadId, followUpId, ...data }) {
  const response = await apiClient.put(`/leads/${leadId}/follow-ups/${followUpId}`, data);
  return response.data;
}

export async function deleteLeadFollowUp({ leadId, followUpId }) {
  const response = await apiClient.delete(`/leads/${leadId}/follow-ups/${followUpId}`);
  return response.data;
}

export async function addLeadFollowUp({ id, scheduledAt, type, notes, assignedTo }) {
  const response = await apiClient.post(`/leads/${id}/follow-up`, { scheduledAt, type, notes, assignedTo });
  return response.data;
}

export async function reopenLead(id) {
  const response = await apiClient.post(`/leads/${id}/reopen`);
  return response.data;
}

export async function markLeadWon(id) {
  const response = await apiClient.post(`/leads/${id}/won`);
  return response.data;
}

export async function markLeadLost({ id, reason }) {
  const response = await apiClient.post(`/leads/${id}/lost`, { reason });
  return response.data;
}

// ---------------------------------------------------------------------------
// Activity Center APIs
// ---------------------------------------------------------------------------

export async function fetchActivityCenter(leadId) {
  const response = await apiClient.get(`/leads/${leadId}/activity-center`);
  return response.data;
}

export async function createVisit(leadId, data) {
  const response = await apiClient.post(`/leads/${leadId}/visits`, data);
  return response.data;
}

export async function fetchVisits(leadId) {
  const response = await apiClient.get(`/leads/${leadId}/visits`);
  return response.data;
}

export async function createQuotation(leadId, data) {
  const response = await apiClient.post(`/leads/${leadId}/quotations`, data);
  return response.data;
}

export async function fetchQuotations(leadId) {
  const response = await apiClient.get(`/leads/${leadId}/quotations`);
  return response.data;
}

export async function checkDuplicateLead(params) {
  const response = await apiClient.get('/leads/check-duplicate', { params });
  return response.data;
}

export async function fetchCustomerLeads(customerId) {
  const response = await apiClient.get(`/customers/${customerId}/leads`);
  return response.data;
}

export async function lookupCustomer(params) {
  const response = await apiClient.get('/customers/lookup', { params });
  return response.data;
}

export default {
  fetchLeads,
  fetchLeadById,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  bulkAssignLeads,
  distributeLeadsBatchRoundRobin,
  changeLeadStage,
  addLeadNote,
  updateLeadNote,
  deleteLeadNote,
  logLeadActivity,
  updateLeadActivity,
  deleteLeadActivity,
  addLeadFollowUp,
  updateLeadFollowUp,
  deleteLeadFollowUp,
  reopenLead,
  markLeadWon,
  markLeadLost,
  fetchActivityCenter,
  createVisit,
  updateVisit,
  deleteVisit,
  fetchVisits,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  fetchQuotations,
  checkDuplicateLead,
  fetchCustomerLeads,
  lookupCustomer,
};

