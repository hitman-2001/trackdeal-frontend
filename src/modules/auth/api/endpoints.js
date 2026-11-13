import apiClient from '@/api/client';
import { flushSessionCookies } from '@/services/sessionCookies';

export async function login({ organization, tenant, email, password }) {
  const payload = { email, password };
  const orgName = organization || tenant;
  if (orgName && String(orgName).trim()) {
    payload.organization = String(orgName).trim();
  }
  const response = await apiClient.post('/auth/login', payload);
  await flushSessionCookies();
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

export async function refreshTokens() {
  const response = await apiClient.post('/auth/refresh', {});
  await flushSessionCookies();
  return response.data;
}

export async function logout() {
  const response = await apiClient.post('/auth/logout', {});
  await flushSessionCookies();
  return response.data;
}

export async function verifyMfa({ mfaToken, code }) {
  const response = await apiClient.post('/auth/mfa/verify', { mfaToken, code });
  await flushSessionCookies();
  return response.data;
}

export async function resendMfa({ mfaToken }) {
  const response = await apiClient.post('/auth/mfa/resend', { mfaToken });
  return response.data;
}

export default {
  login,
  verifyMfa,
  resendMfa,
  forgotPassword,
  resetPassword,
  validateInvitationToken,
  acceptInvitation,
  refreshTokens,
  logout
};
