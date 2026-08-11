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
}

export const api = new ApiClient(API_BASE_URL);