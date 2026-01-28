import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { CreateRideRequest, CreateRideResponse, Ride } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

class ApiService {
  private client: AxiosInstance;
  private tenantId: string;

  constructor() {
    this.tenantId = DEFAULT_TENANT_ID;
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add tenant header to all requests
    this.client.interceptors.request.use((config) => {
      config.headers['X-Tenant-Id'] = this.tenantId;
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Generate idempotency key
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // =====================
  // Ride APIs
  // =====================

  async createRide(data: CreateRideRequest): Promise<CreateRideResponse> {
    const response = await this.client.post('/v1/rides', data, {
      headers: {
        'X-Idempotency-Key': this.generateIdempotencyKey(),
      },
    });
    return response.data;
  }

  async getRide(rideId: string): Promise<Ride> {
    const response = await this.client.get(`/v1/rides/${rideId}`);
    return response.data;
  }

  async cancelRide(rideId: string, reason?: string): Promise<void> {
    await this.client.post(`/v1/rides/${rideId}/cancel`, { reason });
  }

  // =====================
  // Driver APIs
  // =====================

  async createDriver(data: {
    name: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
  }) {
    const response = await this.client.post('/v1/drivers', data);
    return response.data;
  }

  async getDriver(driverId: string) {
    const response = await this.client.get(`/v1/drivers/${driverId}`);
    return response.data;
  }

  async updateDriverLocation(
    driverId: string,
    location: { latitude: number; longitude: number; heading?: number; speed?: number }
  ) {
    const response = await this.client.post(`/v1/drivers/${driverId}/location`, location);
    return response.data;
  }

  async acceptRideOffer(offerId: string, driverId: string) {
    const response = await this.client.post(
      `/v1/rides/offers/${offerId}/accept`,
      {},
      {
        headers: {
          'X-Driver-Id': driverId,
          'X-Idempotency-Key': this.generateIdempotencyKey(),
        },
      }
    );
    return response.data;
  }

  async declineRideOffer(offerId: string, driverId: string) {
    const response = await this.client.post(
      `/v1/rides/offers/${offerId}/decline`,
      {},
      {
        headers: {
          'X-Driver-Id': driverId,
        },
      }
    );
    return response.data;
  }

  // =====================
  // Rider APIs
  // =====================

  async createRider(data: { name: string; phone: string; email?: string }) {
    const response = await this.client.post('/v1/riders', data);
    return response.data;
  }

  // =====================
  // Trip APIs
  // =====================

  async getTrip(tripId: string) {
    const response = await this.client.get(`/v1/trips/${tripId}`);
    return response.data;
  }

  async startTrip(tripId: string, startLocation: { latitude: number; longitude: number }) {
    const response = await this.client.post(`/v1/trips/${tripId}/start`, { startLocation });
    return response.data;
  }

  async endTrip(
    tripId: string,
    endLocation: { latitude: number; longitude: number },
    actualDistanceMeters?: number
  ) {
    const response = await this.client.post(
      `/v1/trips/${tripId}/end`,
      { endLocation, actualDistanceMeters },
      {
        headers: {
          'X-Idempotency-Key': this.generateIdempotencyKey(),
        },
      }
    );
    return response.data;
  }

  // =====================
  // Payment APIs
  // =====================

  async createPayment(data: {
    tripId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
  }) {
    const response = await this.client.post('/v1/payments', data, {
      headers: {
        'X-Idempotency-Key': this.generateIdempotencyKey(),
      },
    });
    return response.data;
  }

  async getPayment(paymentId: string) {
    const response = await this.client.get(`/v1/payments/${paymentId}`);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
