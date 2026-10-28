import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import commissionsApi from '../api/endpoints';

export function useCommissionsQuery(filters) {
  return useQuery({
    queryKey: ['commissions', 'list', filters],
    queryFn: () => commissionsApi.fetchCommissions(filters),
    placeholderData: (previousData) => previousData
  });
}

export function useCommissionQuery(id) {
  return useQuery({
    queryKey: ['commissions', 'details', id],
    queryFn: () => commissionsApi.fetchCommissionById(id),
    enabled: !!id
  });
}

export function useCreateCommissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.createCommission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    }
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.createInvoice,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['commissions', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useRecordCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.recordCollection,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      // Note: recordCollection uses invoiceId, we will invalidate all details queries
      queryClient.invalidateQueries({ queryKey: ['commissions', 'details'] });
    }
  });
}

export function useReleasePayoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.releasePayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['commissions', 'details'] });
    }
  });
}

export function useProcessClawbackMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.processClawback,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['commissions', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useTransitionStageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.transitionStage,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['commissions', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useClearCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.clearCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['commissions', 'details'] });
    }
  });
}

export function useBounceCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commissionsApi.bounceCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['commissions', 'details'] });
    }
  });
}
