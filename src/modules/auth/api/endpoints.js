import apiClient from '@/api/client';

export async function login({ organization, tenant, email, password }) {
  const payload = { email, password };
  const orgName = organization || tenant;
  if (orgName && String(orgName).trim()) {
    payload.organization = String(orgName).trim();
  }
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
}

export async function forgotPassword({ email }) {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword({ token, password }) {
  const response = await apiClient.post('/auth/reset-password', { token, password });
  return response.data;
}

export async function validateInvitationToken(token) {
  const response = await apiClient.get(`/auth/invitations/validate?token=${token}`);
  return response.data;
}

export async function acceptInvitation({ token, password }) {
  const response = await apiClient.post('/auth/invitations/accept', { invitationToken: token, password });
  return response.data;
}

export async function refreshTokens(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
}

export default {
  login,
  forgotPassword,
  resetPassword,
  validateInvitationToken,
  acceptInvitation,
  refreshTokens
};
