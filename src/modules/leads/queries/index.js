import { unref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import leadsApi from '../api/endpoints';

export function useLeadsQuery(filters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsApi.fetchLeads(unref(filters)),
    placeholderData: (previousData) => previousData
  });
}

export function useLeadQuery(id) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.fetchLeadById(unref(id)),
    enabled: computed(() => !!unref(id))
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.updateLead,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useAssignLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.assignLead,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useBulkAssignLeadsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.bulkAssignLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}

export function useDistributeLeadsBatchRoundRobinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.distributeLeadsBatchRoundRobin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['educationLeads'] });
    }
  });
}

export function useChangeLeadStageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.changeLeadStage,
    // Optimistic Update implementation for Kanban Board
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Snapshot the previous values in all leads queries
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ['leads'] });
      const previousSnapshots = [];

      queries.forEach(query => {
        const queryKey = query.queryKey;
        // Skip specific single lead queries if they are active, or snapshot them
        if (queryKey.length === 2 && queryKey[1] === id) {
          const previousLead = queryClient.getQueryData(queryKey);
          previousSnapshots.push({ queryKey, previousData: previousLead });
          if (previousLead && previousLead.data) {
            queryClient.setQueryData(queryKey, {
              ...previousLead,
              data: { ...previousLead.data, status }
            });
          }
        } else if (queryKey[0] === 'leads') {
          const previousList = queryClient.getQueryData(queryKey);
          previousSnapshots.push({ queryKey, previousData: previousList });
          if (previousList && previousList.data) {
            // Check if it's a paginated array response
            const updatedRows = previousList.data.map(lead => 
              lead._id === id || lead.id === id ? { ...lead, status } : lead
            );
            queryClient.setQueryData(queryKey, {
              ...previousList,
              data: updatedRows
            });
          }
        }
      });

      return { previousSnapshots };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context && context.previousSnapshots) {
        context.previousSnapshots.forEach(({ queryKey, previousData }) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useAddLeadNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.addLeadNote,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useLogLeadActivityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.logLeadActivity,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useAddLeadFollowUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.addLeadFollowUp,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useReopenLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.reopenLead,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables] });
    }
  });
}

export function useMarkLeadWonMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.markLeadWon,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables] });
    }
  });
}

export function useMarkLeadLostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.markLeadLost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    }
  });
}

export function useCustomerLeadsQuery(customerId) {
  return useQuery({
    queryKey: ['customers', customerId, 'leads'],
    queryFn: () => leadsApi.fetchCustomerLeads(unref(customerId)),
    enabled: computed(() => !!unref(customerId)),
  });
}
