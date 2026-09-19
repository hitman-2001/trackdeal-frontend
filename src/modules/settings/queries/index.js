import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import settingsApi from '../api/endpoints';

// 1. Organization Settings
export function useOrgSettingsQuery() {
  return useQuery({
    queryKey: ['settings', 'org'],
    queryFn: settingsApi.fetchOrgSettings
  });
}

export function useUpdateOrgSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateOrgSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'org'] });
    }
  });
}

// 2. Branches
export function useBranchesQuery() {
  return useQuery({
    queryKey: ['settings', 'branches'],
    queryFn: settingsApi.fetchBranches
  });
}

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'branches'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'branches'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 3. Users
export function useUsersQuery() {
  return useQuery({
    queryKey: ['settings', 'users'],
    queryFn: settingsApi.fetchUsers
  });
}

export function useInviteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateUserStatus,
    onSuccess: (updatedUser, { id }) => {
      queryClient.setQueryData(['settings', 'users'], (users) => {
        if (!users) return users;
        return users.map((user) =>
          (user._id || user.id) === id ? { ...user, ...updatedUser } : user
        );
      });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useUpdateUserPermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateUserPermissions,
    onSuccess: (updatedUser, { id }) => {
      queryClient.setQueryData(['settings', 'users'], (users) => {
        if (!users) return users;
        return users.map((user) =>
          (user._id || user.id) === id ? { ...user, ...updatedUser } : user
        );
      });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    },
  });
}

export function useTransferUserBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.transferUserBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useChangeUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.changeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 4. Roles & Permissions
export function useRolesQuery() {
  return useQuery({
    queryKey: ['settings', 'roles'],
    queryFn: settingsApi.fetchRoles
  });
}

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateRolePermissions,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useCloneRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.cloneRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 5. Audit Logs
export function useAuditLogsQuery(filters) {
  return useQuery({
    queryKey: ['settings', 'audit', filters],
    queryFn: () => settingsApi.fetchAuditLogs(filters)
  });
}

// 6. Integrations Tester
export function useTestIntegrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.testIntegrationConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 7. Lead Scoring Rules
export function useLeadScoringRulesQuery() {
  return useQuery({
    queryKey: ['settings', 'scoring'],
    queryFn: settingsApi.fetchLeadScoringRules
  });
}

export function useUpdateLeadScoringRulesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateLeadScoringRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'scoring'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 8. Automation Rules
export function useAutomationRulesQuery() {
  return useQuery({
    queryKey: ['settings', 'automation'],
    queryFn: settingsApi.fetchAutomationRules
  });
}

export function useCreateAutomationRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.createAutomationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'automation'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useUpdateAutomationRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateAutomationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'automation'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

export function useDeleteAutomationRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteAutomationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'automation'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 9. WhatsApp Templates
export function useWhatsAppTemplatesQuery() {
  return useQuery({
    queryKey: ['settings', 'whatsapp'],
    queryFn: settingsApi.fetchWhatsAppTemplates
  });
}

export function useSyncWhatsAppTemplatesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.syncWhatsAppTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'whatsapp'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}

// 10. Email Templates
export function useEmailTemplatesQuery() {
  return useQuery({
    queryKey: ['settings', 'email'],
    queryFn: settingsApi.fetchEmailTemplates
  });
}

export function useSaveEmailTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.saveEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'email'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
    }
  });
}
