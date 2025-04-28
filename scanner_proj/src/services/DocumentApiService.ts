// services/DocumentApiService.ts
import axios, { AxiosResponse } from 'axios';
import { Document } from '@/types/document';

// API base URL - same as other services
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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

// Create axios instance
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

export const DocumentApiService = {
  // Get documents for a customer
  getDocumentsForCustomer: async (basicNumber: string): Promise<Document[]> => {
    try {
      const response: AxiosResponse<Document[]> = await api.get(
        DOCUMENT_API.GET_BY_CUSTOMER(basicNumber)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for customer ${basicNumber}:`, error);
      throw error;
    }
  },

  // Upload a document
  uploadDocument: async (
    basicNumber: string,
    documentName: string,
    file: File,
    category?: string
  ): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (category) {
        formData.append('category', category);
      }

      const response: AxiosResponse<Document> = await axios.post(
        DOCUMENT_API.UPLOAD(basicNumber, documentName),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading document for customer ${basicNumber}:`, error);
      throw error;
    }
  },

  // Update document status
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

  // Check if customer has outstanding documents
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


};

export default DocumentApiService;