// services/accountApiService.ts
import axios, { AxiosResponse } from 'axios';
import { 
  AccountDTO, 
  AccountCreateDTO, 
  AccountUpdateDTO, 
  AccountTypeDetailsDTO,
  SelectOptionDTO,
  UploadResultDTO,
  AccountSummaryDTO
} from '@/types/account';
import { AccountStatus, AccountType } from '@/types/accountTypes';

// API base URL - can be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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

export const AccountApiService = {


  // Get all accounts
  getAllAccounts: async (): Promise<AccountDTO[]> => {
    try {
      const response: AxiosResponse<AccountDTO[]> = await api.get(ACCOUNT_API.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Get account by account number
  getAccountByNumber: async (accountNumber: string): Promise<AccountDTO> => {
    try {
      const response: AxiosResponse<AccountDTO> = await api.get(ACCOUNT_API.GET_BY_ID(accountNumber));
      return response.data;
    } catch (error) {
      console.error(`Error fetching account ${accountNumber}:`, error);
      throw error;
    }
  },

  // Get accounts for a specific customer
  getAccountsByCustomerNumber: async (basicNumber: string): Promise<AccountDTO[]> => {
    try {
      const response: AxiosResponse<AccountDTO[]> = await api.get(ACCOUNT_API.GET_BY_CUSTOMER(basicNumber));
      return response.data;
    } catch (error) {
      console.error(`Error fetching accounts for customer ${basicNumber}:`, error);
      throw error;
    }
  },

  // Get account type details
  getAccountTypeDetails: async (accountType: AccountType): Promise<AccountTypeDetailsDTO> => {
    try {
      const response: AxiosResponse<AccountTypeDetailsDTO> = await api.get(ACCOUNT_API.GET_TYPE_DETAILS(accountType));
      return response.data;
    } catch (error) {
      console.error(`Error fetching account type details for ${accountType}:`, error);
      throw error;
    }
  },

  // Get all account type options for dropdown selection
  getAccountTypeOptions: async (): Promise<SelectOptionDTO[]> => {
    try {
      const response: AxiosResponse<SelectOptionDTO[]> = await api.get(ACCOUNT_API.GET_TYPE_OPTIONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching account type options:', error);
      throw error;
    }
  },

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

  // Update an existing account
  updateAccount: async (accountNumber: string, updates: AccountUpdateDTO): Promise<AccountDTO> => {
    try {
      const response: AxiosResponse<AccountDTO> = await api.put(
        ACCOUNT_API.UPDATE(accountNumber),
        updates
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating account ${accountNumber}:`, error);
      throw error;
    }
  },

  // Change account status
  changeAccountStatus: async (accountNumber: string, newStatus: AccountStatus): Promise<AccountDTO> => {
    try {
      const response: AxiosResponse<AccountDTO> = await api.patch(
        ACCOUNT_API.UPDATE_STATUS(accountNumber),
        null,
        { params: { status: newStatus } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error changing status for account ${accountNumber}:`, error);
      throw error;
    }
  },

  // Get accounts by status
  getAccountsByStatus: async (status: AccountStatus): Promise<AccountDTO[]> => {
    try {
      const response: AxiosResponse<AccountDTO[]> = await api.get(ACCOUNT_API.GET_BY_STATUS(status));
      return response.data;
    } catch (error) {
      console.error(`Error fetching accounts with status ${status}:`, error);
      throw error;
    }
  },

  // Update account document status
  updateAccountDocument: async (
    accountNumber: string,
    documentName: string,
    file: File
  ): Promise<UploadResultDTO> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // For file uploads, we need to change the header to multipart/form-data
      const response: AxiosResponse<UploadResultDTO> = await axios.post(
        ACCOUNT_API.UPDATE_DOCUMENT(accountNumber, documentName),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading document for account ${accountNumber}:`, error);
      throw error;
    }
  },

  // Check if an account has all required documents
  hasAllRequiredDocuments: async (accountNumber: string): Promise<boolean> => {
    try {
      const response: AxiosResponse<boolean> = await api.get(ACCOUNT_API.VALIDATE_DOCUMENTS(accountNumber));
      return response.data;
    } catch (error) {
      console.error(`Error checking document requirements for account ${accountNumber}:`, error);
      throw error;
    }
  },

  // Get missing documents for an account
  getMissingDocuments: async (accountNumber: string): Promise<string[]> => {
    try {
      const response: AxiosResponse<string[]> = await api.get(ACCOUNT_API.GET_MISSING_DOCUMENTS(accountNumber));
      return response.data;
    } catch (error) {
      console.error(`Error getting missing documents for account ${accountNumber}:`, error);
      throw error;
    }
  },

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

  // Generate account summary statistics
  getAccountSummary: async (): Promise<AccountSummaryDTO> => {
    try {
      const response: AxiosResponse<AccountSummaryDTO> = await api.get(ACCOUNT_API.GET_SUMMARY);
      return response.data;
    } catch (error) {
      console.error('Error fetching account summary:', error);
      throw error;
    }
  }
};

export default AccountApiService;