import apiClient from '@/api/client';

export async function fetchOrgSettings() {
  try {
    const response = await apiClient.get('/settings/org');
    return response.data?.data || response.data;
  } catch (error) {
    return {
      companyName: '',
      spoc: '',
      gstin: '',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      ssoEnabled: false,
      ssoProvider: '',
      featureFlags: {
        whatsappModule: false,
        commissionModule: false,
        reportsModule: false,
        automationEngine: false,
        apiAccess: false
      },
      billing: {
        currentPlan: '',
        activeUsers: 0,
        maxUsers: 0,
        activeBranches: 0,
        maxBranches: 0,
        leadsCount: 0,
        maxLeads: 0,
        storageUsed: 0,
        storageAllocated: 0
      }
    };
  }
}

export async function updateOrgSettings(data) {
  const response = await apiClient.put('/settings/org', data);
  return response.data;
}

export async function fetchBranches() {
  try {
    const response = await apiClient.get('/settings/branches');
    return response.data?.data || response.data;
  } catch (error) {
    return [];
  }
}

export async function createBranch(data) {
  const response = await apiClient.post('/settings/branches', data);
  return response.data;
}

export async function updateBranch({ id, ...data }) {
  const response = await apiClient.put(`/settings/branches/${id}`, data);
  return response.data;
}

export async function fetchUsers() {
  try {
    const response = await apiClient.get('/settings/users');
    return response.data?.data || response.data;
  } catch (error) {
    return [];
  }
}

export async function inviteUser(data) {
  const nameParts = (data.name || '').trim().split(/\s+/);
  const firstName = data.firstName || nameParts[0] || 'User';
  const lastName = data.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName);

  const payload = {
    email: data.email,
    roleId: data.role || data.roleId,
    name: data.name,
    firstName,
    lastName
  };
  if (data.branch || data.branchId) {
    payload.branchId = data.branch || data.branchId;
  }
  if (data.permissionOverrides) {
    payload.permissionOverrides = data.permissionOverrides;
  }
  if (data.password) {
    payload.password = data.password;
    if (data.phone) payload.phone = data.phone;
    try {
      const response = await apiClient.post('/settings/users', payload);
      return response.data;
    } catch (err) {
      const response = await apiClient.post('/settings/users/invite', payload);
      return response.data;
    }
  }

  const response = await apiClient.post('/settings/users/invite', payload);
  return response.data;
}

export async function createUser(data) {
  return inviteUser(data);
}

export async function updateUserStatus({ id, status }) {
  const endpoint = status === 'active'
    ? `/settings/users/${id}/activate`
    : `/settings/users/${id}/deactivate`;
  const response = await apiClient.post(endpoint, {});
  return response.data?.data || response.data;
}

export async function updateUserPermissions({ id, added, removed }) {
  const response = await apiClient.put(`/settings/users/${id}/permissions`, { added, removed });
  return response.data?.data || response.data;
}

export async function transferUserBranch({ id, branchId, leadsReassignment }) {
  const response = await apiClient.post(`/settings/users/${id}/branch`, { branchId, leadsReassignment });
  return response.data;
}

export async function changeUserRole({ id, role }) {
  const response = await apiClient.post(`/settings/users/${id}/role`, { roleId: role });
  return response.data;
}

function convertPermissionsArrayToObject(permissionsArr) {
  const obj = {
    leads: { create: false, read: false, update: false, delete: false },
    deals: { create: false, read: false, update: false, delete: false },
    commissions: { create: false, read: false, update: false, delete: false },
    properties: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
    tasks: { create: false, read: false, update: false, delete: false },
    students: { create: false, read: false, update: false, delete: false },
    classes: { create: false, read: false, update: false, delete: false },
    admissions: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false }
  };
  
  if (Array.isArray(permissionsArr)) {
    permissionsArr.forEach(perm => {
      const normalized = String(perm || '').replace(/:/g, '.').toLowerCase().trim();
      const parts = normalized.split('.');
      if (parts.length === 2) {
        const [scope, action] = parts;
        const targetScope = (scope === 'analytics') ? 'reports' : scope;
        const targetAction = (action === 'view') ? 'read' : (action === 'export') ? 'delete' : action;
        if (!obj[targetScope]) {
          obj[targetScope] = { create: false, read: false, update: false, delete: false };
        }
        obj[targetScope][targetAction] = true;
      } else if (normalized === 'reports' || normalized === 'analytics') {
        obj.reports.read = true;
      }
    });
  }
  return obj;
}

function convertPermissionsObjectToArray(permissionsObj) {
  const arr = [];
  if (permissionsObj && typeof permissionsObj === 'object') {
    Object.entries(permissionsObj).forEach(([scope, actions]) => {
      if (actions && typeof actions === 'object') {
        Object.entries(actions).forEach(([action, value]) => {
          if (value === true) {
            arr.push(`${scope}.${action}`);
            if (scope === 'reports' && action === 'read') {
              arr.push('reports.view');
            }
            if (scope === 'reports' && action === 'delete') {
              arr.push('reports.export');
            }
          }
        });
      }
    });
  }
  return [...new Set(arr)];
}

export async function fetchRoles() {
  try {
    const response = await apiClient.get('/settings/roles');
    const rolesData = response.data?.data || response.data;
    if (Array.isArray(rolesData)) {
      return rolesData.map(role => {
        const permissionKeys = Array.isArray(role.permissions) ? role.permissions : [];
        const permissions = Array.isArray(role.permissions)
          ? convertPermissionsArrayToObject(permissionKeys)
          : (role.permissions || {});
        return {
          ...role,
          id: role.id || role._id,
          permissionKeys,
          permissions
        };
      });
    }
    return rolesData;
  } catch (error) {
    return [];
  }
}

export async function updateRolePermissions({ id, permissions }) {
  const permissionsArr = typeof permissions === 'object' && !Array.isArray(permissions)
    ? convertPermissionsObjectToArray(permissions)
    : permissions;
  const response = await apiClient.put(`/settings/roles/${id}/permissions`, { permissions: permissionsArr });
  return response.data;
}

export async function cloneRole({ id, name }) {
  const response = await apiClient.post(`/settings/roles/${id}/clone`, { name });
  return response.data;
}

export async function fetchAuditLogs(params) {
  try {
    const response = await apiClient.get('/settings/audit-logs', { params });
    return response.data?.data || response.data;
  } catch (error) {
    return [];
  }
}

export async function testIntegrationConnection(name) {
  const response = await apiClient.post(`/settings/integrations/${name}/test`);
  return response.data;
}

export async function fetchLeadScoringRules() {
  try {
    const response = await apiClient.get('/settings/scoring');
    return response.data?.data || response.data;
  } catch (error) {
    return {
      profileFit: [],
      interactions: [],
      decay: []
    };
  }
}

export async function updateLeadScoringRules(data) {
  const response = await apiClient.put('/settings/scoring', data);
  return response.data;
}

export async function fetchAutomationRules() {
  try {
    const response = await apiClient.get('/settings/automation');
    return response.data?.data || response.data;
  } catch (error) {
    return [];
  }
}

export async function createAutomationRule(data) {
  const response = await apiClient.post('/settings/automation', data);
  return response.data;
}

export async function updateAutomationRule({ id, ...data }) {
  const response = await apiClient.put(`/settings/automation/${id}`, data);
  return response.data;
}

export async function deleteAutomationRule(id) {
  const response = await apiClient.delete(`/settings/automation/${id}`);
  return response.data;
}

export async function fetchWhatsAppTemplates() {
  try {
    const response = await apiClient.get('/settings/whatsapp-templates');
    return response.data?.data || response.data;
  } catch (error) {
    return [];
  }
}

export async function syncWhatsAppTemplates() {
  const response = await apiClient.post('/settings/whatsapp-templates/sync');
  return response.data;
}

export async function fetchEmailTemplates() {
  try {
    const response = await apiClient.get('/settings/email-templates');
    return response.data?.data || response.data;
  } catch (error) {
    return [];
  }
}

export async function saveEmailTemplate({ id, ...data }) {
  if (id) {
    const response = await apiClient.put(`/settings/email-templates/${id}`, data);
    return response.data;
  }
  const response = await apiClient.post('/settings/email-templates', data);
  return response.data;
}

export default {
  fetchOrgSettings,
  updateOrgSettings,
  fetchBranches,
  createBranch,
  updateBranch,
  fetchUsers,
  inviteUser,
  updateUserStatus,
  updateUserPermissions,
  transferUserBranch,
  changeUserRole,
  fetchRoles,
  updateRolePermissions,
  cloneRole,
  fetchAuditLogs,
  testIntegrationConnection,
  fetchLeadScoringRules,
  updateLeadScoringRules,
  fetchAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  fetchWhatsAppTemplates,
  syncWhatsAppTemplates,
  fetchEmailTemplates,
  saveEmailTemplate
};

export async function fetchGroupedPermissions() {
  const response = await apiClient.get('/permissions/grouped');
  const groups = response.data?.data || response.data || {};
  return Object.fromEntries(
    Object.entries(groups).map(([group, permissions]) => [
      group,
      permissions.map((permission) => ({
        ...permission,
        key: permission.permissionKey,
        label: permission.description || permission.permissionKey,
      })),
    ]),
  );
}
