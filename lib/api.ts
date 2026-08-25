import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://web-production-65f03.up.railway.app'
    : 'http://192.168.1.47:4000');


class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('managerToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const message = error.response?.data?.message || error.message || 'Request failed';
        throw new Error(message);
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async get<T = any>(url: string, config?: any): Promise<T> {
    return this.client.get(url, config) as unknown as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post(url, data, config) as unknown as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.patch(url, data, config) as unknown as T;
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('managerToken', token);
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('managerToken');
    }
  }

  // Auth endpoints
  async registerManager(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    return this.post('/auth/manager/register', data);
  }

  async loginManager(data: {
    emailOrPhone: string;
    password: string;
  }) {
    return this.post('/auth/manager/login', data);
  }

  async registerMerchant(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    return this.post('/auth/merchant/register', data);
  }

  // Role-agnostic login (POST /auth/login checks credentials only, no role
  // check) — this is what makes one shared login form work for both a
  // fleet manager and a restaurant merchant account, per
  // RESTAURANT_MARKETPLACE_PLAN.md §5a ("Authentication is unchanged — one
  // login/signup flow for both account types"). The caller is responsible
  // for looking at the returned user.role and rejecting roles this portal
  // doesn't serve (see app/login/page.tsx).
  async login(data: {
    emailOrPhone: string;
    password: string;
  }) {
    return this.post('/auth/login', data);
  }

  // Company endpoints
  async createCompany(data: {
    name: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
  }) {
    return this.post('/company/create', data);
  }

  async getCompany() {
    return this.get('/company/profile');
  }

  async getCompanyStats() {
    return this.get('/company/stats');
  }

  async getCompanyRiders() {
    return this.get('/company/riders');
  }

  async getCompanyDeliveries(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.get('/company/deliveries', { params });
  }

  async createRider(data: {
    name: string;
    email?: string;
    phoneNumber: string;
    password: string;
    vehicleType: string;
    vehicleColor: string;
    licensePlate: string;
  }) {
    return this.post('/company/riders', data);
  }

  async getAnalytics(period?: 'daily' | 'weekly' | 'monthly') {
    return this.get('/company/analytics', { params: { period } });
  }

  async getLiveTracking() {
    return this.get('/company/live-tracking');
  }

  async getFinancialReport(startDate?: string, endDate?: string) {
    return this.get('/company/financial-report', { 
      params: { startDate, endDate } 
    });
  }

  async getBusinessAlerts() {
    return this.get('/company/alerts');
  }

  async getAdvancedEarnings(startDate?: string, endDate?: string) {
    return this.get('/company/advanced-earnings', { 
      params: { startDate, endDate } 
    });
  }

  async getPayoutSummary() {
    return this.get('/company/payout-summary');
  }

  async getRiderDetail(riderId: string) {
    return this.get(`/company/riders/${riderId}/detail`);
  }

  async suspendRider(riderId: string) {
    return this.patch(`/company/riders/${riderId}/suspend`);
  }

  async activateRider(riderId: string) {
    return this.patch(`/company/riders/${riderId}/activate`);
  }

  async approveRider(riderId: string) {
    return this.patch(`/company/riders/${riderId}/approve`);
  }

  async rejectRider(riderId: string, reason: string) {
    return this.patch(`/company/riders/${riderId}/reject`, { reason });
  }

  async updateRider(riderId: string, data: any) {
    return this.patch(`/company/riders/${riderId}/update`, data);
  }

  async getDeliveryDetail(deliveryId: string) {
    return this.get(`/company/deliveries/${deliveryId}/detail`);
  }

  async assignDelivery(deliveryId: string, riderId: string) {
    return this.post(`/company/deliveries/${deliveryId}/assign`, { riderId });
  }

  // Vehicle endpoints
  async getVehicles() {
    return this.get('/company/vehicles');
  }

  async createVehicle(data: { type: string; color: string; licensePlate?: string; make?: string; vehicleModel?: string; year?: number }) {
    return this.post('/company/vehicles', data);
  }

  async updateVehicle(vehicleId: string, data: any) {
    return this.patch(`/company/vehicles/${vehicleId}`, data);
  }

  async assignVehicle(vehicleId: string, riderId: string | null) {
    return this.patch(`/company/vehicles/${vehicleId}/assign`, { riderId });
  }

  async updateVehicleStatus(vehicleId: string, status: string, maintenanceNotes?: string) {
    return this.patch(`/company/vehicles/${vehicleId}/status`, { status, maintenanceNotes });
  }

  async deleteVehicle(vehicleId: string) {
    return this.client.delete(`/company/vehicles/${vehicleId}`) as unknown as any;
  }

  // ==================== Restaurant marketplace (merchant account) ====================
  // Mirrors the merchants/ NestJS module (see RESTAURANT_MARKETPLACE_PLAN.md §5a).
  // Every one of these is scoped server-side to the Merchant owned by the
  // logged-in User — same ownership discipline as the company/* endpoints
  // above, just keyed by merchantId instead of companyId.

  async createMerchant(data: {
    name: string;
    description?: string;
    address: string;
    location: { latitude: number; longitude: number };
    phone?: string;
    email?: string;
    openingHours?: string;
  }) {
    return this.post('/merchants/create', data);
  }

  async getMerchant() {
    return this.get('/merchants/profile');
  }

  async updateMerchant(data: any) {
    return this.patch('/merchants/profile', data);
  }

  async getMerchantWallet() {
    return this.get('/merchants/wallet');
  }

  async getMerchantWalletTransactions() {
    return this.get('/merchants/wallet/transactions');
  }

  // Menu categories
  async getMenuCategories() {
    return this.get('/merchants/menu/categories');
  }

  async createMenuCategory(data: { name: string; sortOrder?: number }) {
    return this.post('/merchants/menu/categories', data);
  }

  async updateMenuCategory(categoryId: string, data: { name?: string; sortOrder?: number }) {
    return this.patch(`/merchants/menu/categories/${categoryId}`, data);
  }

  async deleteMenuCategory(categoryId: string) {
    return this.client.delete(`/merchants/menu/categories/${categoryId}`) as unknown as any;
  }

  // Menu items
  async getMenuItems() {
    return this.get('/merchants/menu/items');
  }

  async createMenuItem(data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
  }) {
    return this.post('/merchants/menu/items', data);
  }

  async updateMenuItem(itemId: string, data: any) {
    return this.patch(`/merchants/menu/items/${itemId}`, data);
  }

  async deleteMenuItem(itemId: string) {
    return this.client.delete(`/merchants/menu/items/${itemId}`) as unknown as any;
  }

  // Order queue (customer checkout happens in the city-wheels app — this
  // portal only ever sees orders once payment has already succeeded)
  async getMerchantOrders(status?: string) {
    return this.get('/merchant-orders/merchant', { params: status ? { status } : undefined });
  }

  async getMerchantOrder(orderId: string) {
    return this.get(`/merchant-orders/merchant/${orderId}`);
  }

  async acceptMerchantOrder(orderId: string) {
    return this.patch(`/merchant-orders/${orderId}/accept`);
  }

  async rejectMerchantOrder(orderId: string, reason?: string) {
    return this.patch(`/merchant-orders/${orderId}/reject`, { reason });
  }

  /** The combined "Ready — Send Rider" action (RESTAURANT_MARKETPLACE_PLAN.md §4/§8). */
  async readyMerchantOrder(orderId: string) {
    return this.patch(`/merchant-orders/${orderId}/ready`);
  }
}

export const api = new ApiClient(API_BASE_URL);