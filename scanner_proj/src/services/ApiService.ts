// services/ApiService.ts
import axios, { AxiosResponse } from 'axios';
import { Customer, CustomerLifecycleStatus } from '@/types/customer';
import { Document } from '@/types/document';
import { 
  AccountDTO, 
  AccountCreateDTO, 
} from '@/types/account';

// API base URL - same as other services
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
};

// Document API endpoints
const DOCUMENT_API = {
  GET_BY_CUSTOMER: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}`,
  UPLOAD: (basicNumber: string, documentName: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/${documentName}/upload`,
  DELETE: (basicNumber: string, documentName: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/${documentName}`,
  UPDATE_STATUS: (basicNumber: string, documentName: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/${documentName}/status`,
  HAS_OUTSTANDING: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding`,
  GET_OUTSTANDING_LIST: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`,
  VALIDATE_DOCUMENTS: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/validate`,
  GET_BY_CATEGORY: (basicNumber: string, category: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/category/${category}`,
  GET_PROGRESS: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/progress`,
};
// Account API endpoints
const ACCOUNT_API = {
  GET_ALL: `${API_BASE_URL}/accounts`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/accounts/${id}`,
  GET_BY_CUSTOMER: (basicNumber: string) => `${API_BASE_URL}/accounts/customer/${basicNumber}`,
  GET_TYPE_DETAILS: (type: string) => `${API_BASE_URL}/accounts/type-details/${type}`,
  GET_TYPE_OPTIONS: `${API_BASE_URL}/accounts/type-options`,
  CREATE: `${API_BASE_URL}/accounts`,
  UPDATE: (id: string) => `${API_BASE_URL}/accounts/${id}`,
  UPDATE_STATUS: (id: string) => `${API_BASE_URL}/accounts/${id}/status`,
  GET_BY_STATUS: (status: string) => `${API_BASE_URL}/accounts/status/${status}`,
  UPDATE_DOCUMENT: (accountNumber: string, documentName: string) => `${API_BASE_URL}/accounts/${accountNumber}/documents/${documentName}`,
  VALIDATE_DOCUMENTS: (accountNumber: string) => `${API_BASE_URL}/accounts/${accountNumber}/documents/validate`,
  GET_MISSING_DOCUMENTS: (accountNumber: string) => `${API_BASE_URL}/accounts/${accountNumber}/documents/missing`,
  GET_SUMMARY: `${API_BASE_URL}/accounts/summary`,
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

export const ApiService = {

// Create a new account
createAccount: async (accountData: AccountCreateDTO): Promise<AccountDTO> => {
  try {
    const response: AxiosResponse<AccountDTO> = await api.post(ACCOUNT_API.CREATE, accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
},
  // Customer methods
  getCustomerByBasicNumber: async (basicNumber: string): Promise<Customer> => {
    try {
      const response: AxiosResponse<Customer> = await api.get(
        CUSTOMER_API.GET_BY_ID(basicNumber)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${basicNumber}:`, error);
      throw error;
    }
  },
  
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
  
  // Document methods

    // Add this method to ApiService:
getAccountDocumentStatus: async (accountNumber: string): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await api.get(
      ACCOUNT_API.VALIDATE_DOCUMENTS(accountNumber)
    );
    return !response.data; // If documents are valid, then there are no outstanding docs
  } catch (error) {
    console.error(`Error checking document requirements for account ${accountNumber}:`, error);
    return false; // Default to no outstanding documents
  }
},
  getDocumentsForCustomer: async (basicNumber: string): Promise<Document[]> => {
    try {
      const response: AxiosResponse<Document[]> = await api.get(
        DOCUMENT_API.GET_BY_CUSTOMER(basicNumber)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for customer ${basicNumber}:`, error);
      // Return empty array instead of throwing error to avoid breaking the UI
      return [];
    }
  },
  
  updateDocumentStatus: async (
    basicNumber: string,
    documentName: string,
    status: string
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse<boolean> = await api.patch(
        DOCUMENT_API.UPDATE_STATUS(basicNumber, documentName),
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating document status for ${documentName}:`, error);
      throw error;
    }
  },
  
  hasOutstandingDocuments: async (basicNumber: string): Promise<boolean> => {
    try {
      // Use the direct endpoint for outstanding documents
      const response: AxiosResponse<boolean> = await api.get(
        DOCUMENT_API.HAS_OUTSTANDING(basicNumber)
      );
      return response.data; // Use the response directly as returned by the backend
    } catch (error) {
      console.error(`Error checking document status for customer ${basicNumber}:`, error);
      // Return false by default to avoid breaking the UI
      return false;
    }
  },
  
  
  // Account methods
  getAccountsByCustomerNumber: async (basicNumber: string): Promise<AccountDTO[]> => {
    try {
      const response: AxiosResponse<AccountDTO[]> = await api.get(
        ACCOUNT_API.GET_BY_CUSTOMER(basicNumber)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching accounts for customer ${basicNumber}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  },
  
  // Additional methods that may be needed later
  
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response: AxiosResponse<Customer[]> = await api.get(CUSTOMER_API.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }
  },
  
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
  
  getAllAccounts: async (): Promise<AccountDTO[]> => {
    try {
      const response: AxiosResponse<AccountDTO[]> = await api.get(ACCOUNT_API.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      throw error;
    }
  },
  
  getAccountByNumber: async (accountNumber: string): Promise<AccountDTO> => {
    try {
      const response: AxiosResponse<AccountDTO> = await api.get(ACCOUNT_API.GET_BY_ID(accountNumber));
      return response.data;
    } catch (error) {
      console.error(`Error fetching account ${accountNumber}:`, error);
      throw error;
    }
  }
};

export default ApiService;