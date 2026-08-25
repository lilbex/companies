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
export const useCompany = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: () => api.getCompany(),
    enabled: options?.enabled,
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

export const useRegisterMerchant = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }) => api.registerMerchant(data),
  });
};

// Role-agnostic — used by the one shared login form (app/login/page.tsx)
// for both a manager and a merchant account. See api.login()'s comment.
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: {
      emailOrPhone: string;
      password: string;
    }) => api.login(data),
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

// ==================== Restaurant marketplace (merchant account) ====================
// See RESTAURANT_MARKETPLACE_PLAN.md §5a. Mirrors the company/* hooks above,
// scoped to the logged-in merchant.

export const useMerchant = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['merchant'],
    queryFn: () => api.getMerchant(),
    enabled: options?.enabled,
  });
};

export const useCreateMerchant = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      address: string;
      location: { latitude: number; longitude: number };
      phone?: string;
      email?: string;
      openingHours?: string;
    }) => api.createMerchant(data),
  });
};

export const useUpdateMerchant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.updateMerchant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
    },
  });
};

export const useMerchantWallet = () => {
  return useQuery({
    queryKey: ['merchant', 'wallet'],
    queryFn: () => api.getMerchantWallet(),
  });
};

export const useMerchantWalletTransactions = () => {
  return useQuery({
    queryKey: ['merchant', 'wallet', 'transactions'],
    queryFn: () => api.getMerchantWalletTransactions(),
  });
};

// Menu categories
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['merchant', 'menu', 'categories'],
    queryFn: () => api.getMenuCategories(),
  });
};

export const useCreateMenuCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; sortOrder?: number }) => api.createMenuCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu', 'categories'] });
    },
  });
};

export const useUpdateMenuCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: { name?: string; sortOrder?: number } }) =>
      api.updateMenuCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu', 'categories'] });
    },
  });
};

export const useDeleteMenuCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => api.deleteMenuCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu', 'categories'] });
    },
  });
};

// Menu items
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['merchant', 'menu', 'items'],
    queryFn: () => api.getMenuItems(),
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      categoryId: string;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      isAvailable?: boolean;
    }) => api.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu', 'items'] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: any }) => api.updateMenuItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu', 'items'] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu', 'items'] });
    },
  });
};

// Order queue
export const useMerchantOrders = (status?: string) => {
  return useQuery({
    queryKey: ['merchant', 'orders', status],
    queryFn: () => api.getMerchantOrders(status),
    refetchInterval: 10000, // New orders should show up without a manual refresh
  });
};

export const useMerchantOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['merchant', 'orders', 'detail', orderId],
    queryFn: () => api.getMerchantOrder(orderId),
    enabled: !!orderId,
    refetchInterval: 5000,
  });
};

export const useAcceptMerchantOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.acceptMerchantOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
  });
};

export const useRejectMerchantOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) => api.rejectMerchantOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
  });
};

export const useReadyMerchantOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.readyMerchantOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
  });
};