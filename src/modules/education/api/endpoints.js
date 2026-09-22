import apiClient from '@/api/client';

export async function fetchEducationSummary() {
  const res = await apiClient.get('/education/summary');
  return res.data;
}

export async function fetchEducationAnalytics(params = {}) {
  const res = await apiClient.get('/education/analytics', { params });
  return res.data;
}

export async function fetchEducationClasses(params = {}) {
  const res = await apiClient.get('/education/classes', { params });
  return res.data;
}

export async function createEducationClass(data) {
  const res = await apiClient.post('/education/classes', data);
  return res.data;
}

export async function updateEducationClass(id, data) {
  const res = await apiClient.put(`/education/classes/${id}`, data);
  return res.data;
}

export async function deleteEducationClass(id) {
  const res = await apiClient.delete(`/education/classes/${id}`);
  return res.data;
}

export async function fetchEducationStudents(params = {}) {
  const res = await apiClient.get('/education/students', { params });
  return res.data;
}

export async function createEducationStudent(data) {
  const res = await apiClient.post('/education/students', data);
  return res.data;
}

export async function updateEducationStudent(id, data) {
  const res = await apiClient.put(`/education/students/${id}`, data);
  return res.data;
}

export async function deleteEducationStudent(id) {
  const res = await apiClient.delete(`/education/students/${id}`);
  return res.data;
}

export async function fetchEducationLead(id) {
  const res = await apiClient.get(`/education/leads/${id}`);
  return res.data;
}

export async function fetchEducationLeads(params = {}) {
  const res = await apiClient.get('/education/leads', { params });
  return res.data;
}

export async function createEducationLead(data) {
  const res = await apiClient.post('/education/leads', data);
  return res.data;
}

export async function updateEducationLead(id, data) {
  const res = await apiClient.put(`/education/leads/${id}`, data);
  return res.data;
}

export async function enrollEducationLead(id, data = {}) {
  const res = await apiClient.post(`/education/leads/${id}/enroll`, data);
  return res.data;
}

export async function deleteEducationLead(id) {
  const res = await apiClient.delete(`/leads/${id}`);
  return res.data;
}

/** Conversation history & activities (shared lead engine, education records). */
export async function fetchEducationLeadActivityCenter(leadId) {
  const res = await apiClient.get(`/leads/${leadId}/activity-center`);
  return res.data;
}

export async function logEducationLeadActivity(leadId, data) {
  const res = await apiClient.post(`/leads/${leadId}/activities`, data);
  return res.data;
}

export async function addEducationLeadNote(leadId, data) {
  const res = await apiClient.post(`/leads/${leadId}/notes`, data);
  return res.data;
}

export async function addEducationLeadFollowUp(leadId, data) {
  const res = await apiClient.post(`/leads/${leadId}/follow-up`, data);
  return res.data;
}

