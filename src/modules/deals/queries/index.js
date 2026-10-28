import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { unref } from 'vue';
import dealsApi from '../api/endpoints';

export function useDealsQuery(filters) {
  return useQuery({
    queryKey: ['deals', 'list', filters],
    queryFn: () => dealsApi.fetchDeals(unref(filters)),
    placeholderData: (previousData) => previousData
  });
}

export function useDealQuery(id) {
  return useQuery({
    queryKey: ['deals', 'details', id],
    queryFn: () => dealsApi.fetchDealById(id),
    enabled: !!id
  });
}

export function useCreateDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    }
  });
}

export function useAddOfferMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.addOffer,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useExtendReservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.extendReservation,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useReleaseReservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.releaseReservation,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'details', variables] });
    }
  });
}

export function useConvertReservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.convertReservation,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'details', variables] });
    }
  });
}

export function useAddPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.addPayment,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useAddRefundMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.addRefund,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.uploadDocument,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useVerifyDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.verifyDocument,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useTransitionStageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.transitionStage,
    onSuccess: (data, variables) => {
      const targetId = typeof variables === 'object' ? variables?.id : variables;
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (targetId) queryClient.invalidateQueries({ queryKey: ['deals', 'details', targetId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}
