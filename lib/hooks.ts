import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// Query Keys
export const queryKeys = {
  company: ['company'],
  companyStats: ['company', 'stats'],
  companyRiders: ['company', 'riders'],
  companyDeliveries: (params?: any) => ['company', 'deliveries', params],
};

// Company Queries
export const useCompany = () => {
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: () => api.getCompany(),
  });
};

export const useCompanyStats = () => {
  return useQuery({
    queryKey: queryKeys.companyStats,
    queryFn: () => api.getCompanyStats(),
  });
};

export const useCompanyRiders = () => {
  return useQuery({
    queryKey: queryKeys.companyRiders,
    queryFn: () => api.getCompanyRiders(),
  });
};

export const useCompanyDeliveries = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.companyDeliveries(params),
    queryFn: () => api.getCompanyDeliveries(params),
  });
};

// Mutations
export const useCreateCompany = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      address: string;
      phone?: string;
      email?: string;
    }) => api.createCompany(data),
  });
};

export const useCreateRider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      email?: string;
      phoneNumber: string;
      password: string;
      vehicleType: string;
      vehicleColor: string;
      licensePlate: string;
    }) => api.createRider(data),
    onSuccess: () => {
      // Invalidate and refetch riders list
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
      queryClient.invalidateQueries({ queryKey: queryKeys.companyStats });
    },
  });
};

export const useRegisterManager = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }) => api.registerManager(data),
  });
};

export const useLoginManager = () => {
  return useMutation({
    mutationFn: (data: {
      emailOrPhone: string;
      password: string;
    }) => api.loginManager(data),
  });
};

// Analytics Hooks
export const useAnalytics = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => api.getAnalytics(period),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useLiveTracking = () => {
  return useQuery({
    queryKey: ['live-tracking'],
    queryFn: () => api.getLiveTracking(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useFinancialReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['financial-report', startDate, endDate],
    queryFn: () => api.getFinancialReport(startDate, endDate),
  });
};

export const useBusinessAlerts = () => {
  return useQuery({
    queryKey: ['business-alerts'],
    queryFn: () => api.getBusinessAlerts(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useAdvancedEarnings = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['advanced-earnings', startDate, endDate],
    queryFn: () => api.getAdvancedEarnings(startDate, endDate),
  });
};

export const usePayoutSummary = () => {
  return useQuery({
    queryKey: ['payout-summary'],
    queryFn: () => api.getPayoutSummary(),
    refetchInterval: 300000,
  });
};

export const useRiderDetail = (riderId: string) => {
  return useQuery({
    queryKey: ['rider-detail', riderId],
    queryFn: () => api.getRiderDetail(riderId),
    enabled: !!riderId,
  });
};

export const useDeliveryDetail = (deliveryId: string) => {
  return useQuery({
    queryKey: ['delivery-detail', deliveryId],
    queryFn: () => api.getDeliveryDetail(deliveryId),
    enabled: !!deliveryId,
  });
};

export const useSuspendRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (riderId: string) => api.suspendRider(riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
    },
  });
};

export const useActivateRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (riderId: string) => api.activateRider(riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
    },
  });
};

export const useApproveRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (riderId: string) => api.approveRider(riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
    },
  });
};

export const useRejectRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ riderId, reason }: { riderId: string; reason: string }) =>
      api.rejectRider(riderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
    },
  });
};

export const useUpdateRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ riderId, data }: { riderId: string; data: any }) =>
      api.updateRider(riderId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
      queryClient.invalidateQueries({ queryKey: ['riderDetail', variables.riderId] });
    },
  });
};

export const useAssignDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliveryId, riderId }: { deliveryId: string; riderId: string }) =>
      api.assignDelivery(deliveryId, riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'deliveries'] });
    },
  });
};

// Vehicle hooks
export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; color: string; licensePlate?: string; make?: string; vehicleModel?: string; year?: number }) =>
      api.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useAssignVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, riderId }: { vehicleId: string; riderId: string | null }) =>
      api.assignVehicle(vehicleId, riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.companyRiders });
    },
  });
};

export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, status, maintenanceNotes }: { vehicleId: string; status: string; maintenanceNotes?: string }) =>
      api.updateVehicleStatus(vehicleId, status, maintenanceNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => api.deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};