// services/CustomerApiService.ts
import axios, { AxiosResponse } from 'axios';
import { Customer, CustomerLifecycleStatus } from '@/types/customer';

// API base URL - can be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Customer API endpoints
const CUSTOMER_API = {
  GET_ALL: `${API_BASE_URL}/customers`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/customers/${id}`,
  ADD: `${API_BASE_URL}/customers`,
  UPDATE: (id: string) => `${API_BASE_URL}/customers/${id}`,
  SEARCH: `${API_BASE_URL}/customers/search`,
  UPDATE_STATUS: (id: string) => `${API_BASE_URL}/customers/${id}/lifecycle-status`,
  GET_BY_STATUS: (status: string) => `${API_BASE_URL}/customers/status/${status}`,
  GET_STATUS_COUNTS: `${API_BASE_URL}/customers/lifecycle-status-counts`,
  GET_STATUS_OPTIONS: `${API_BASE_URL}/customers/lifecycle-status-options`,
};

// Create axios instance with common configuration
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for handling auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add authorization headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service with methods that match your backend service
export const CustomerApiService = {
  // Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response: AxiosResponse<Customer[]> = await api.get(CUSTOMER_API.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by basic number
  getCustomerByBasicNumber: async (basicNumber: string): Promise<Customer> => {
    try {
      const response: AxiosResponse<Customer> = await api.get(CUSTOMER_API.GET_BY_ID(basicNumber));
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${basicNumber}:`, error);
      throw error;
    }
  },

  // Add new customer
  addCustomer: async (customerData: Omit<Customer, 'basicNumber'>): Promise<Customer> => {
    try {
      const response: AxiosResponse<Customer> = await api.post(CUSTOMER_API.ADD, customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update existing customer
  updateCustomer: async (customer: Customer): Promise<Customer> => {
    try {
      const response: AxiosResponse<Customer> = await api.put(
        CUSTOMER_API.UPDATE(customer.basicNumber),
        customer
      );
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Search customers
  searchCustomers: async (
    basicNumber?: string,
    name?: string,
    lifecycleStatus?: CustomerLifecycleStatus
  ): Promise<Customer[]> => {
    try {
      // Build query parameters
      const params: Record<string, string> = {};
      if (basicNumber) params.basicNumber = basicNumber;
      if (name) params.name = name;
      if (lifecycleStatus) params.lifecycleStatus = lifecycleStatus;

      const response: AxiosResponse<Customer[]> = await api.get(CUSTOMER_API.SEARCH, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  // Update customer lifecycle status
  updateLifecycleStatus: async (
    basicNumber: string,
    newStatus: CustomerLifecycleStatus
  ): Promise<Customer> => {
    try {
      const response: AxiosResponse<Customer> = await api.patch(
        CUSTOMER_API.UPDATE_STATUS(basicNumber),
        { status: newStatus }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating customer status:', error);
      throw error;
    }
  },

  // Get customers by lifecycle status
  getCustomersByLifecycleStatus: async (status: CustomerLifecycleStatus): Promise<Customer[]> => {
    try {
      const response: AxiosResponse<Customer[]> = await api.get(CUSTOMER_API.GET_BY_STATUS(status));
      return response.data;
    } catch (error) {
      console.error(`Error fetching customers with status ${status}:`, error);
      throw error;
    }
  },

  // Get lifecycle status counts for dashboard
  getLifecycleStatusCounts: async (): Promise<Record<CustomerLifecycleStatus, number>> => {
    try {
      const response: AxiosResponse<Record<CustomerLifecycleStatus, number>> = await api.get(
        CUSTOMER_API.GET_STATUS_COUNTS
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching status counts:', error);
      throw error;
    }
  },

  // Get all possible lifecycle statuses
  getLifecycleStatusOptions: async (): Promise<{ value: string; label: string }[]> => {
    try {
      const response: AxiosResponse<{ value: string; label: string }[]> = await api.get(
        CUSTOMER_API.GET_STATUS_OPTIONS
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching status options:', error);
      throw error;
    }
  },
};

export default CustomerApiService;