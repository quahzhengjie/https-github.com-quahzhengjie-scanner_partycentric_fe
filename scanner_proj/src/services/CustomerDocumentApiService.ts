import axios, { AxiosResponse } from 'axios';

// Define the CustomerDocumentDTO interface
export interface CustomerDocumentDTO {
  expiryDate: string;
  id: number;
  documentName: string;
  uploadStatus: string;
  uploadDate: string;
  basicNumber: string;
  customerName: string;
  category: string;
  contentType: string;
  fileContent?: string | number[] | Uint8Array;// Change type to any to handle both string and byte array
}

// Define upload result interface
export interface UploadResultDTO {
  success: boolean;
  message: string;
  documentId?: number;
}

// API base URL - configurable via environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Customer Document API endpoints
const CUSTOMER_DOCUMENT_API = {
  GET_ALL: (basicNumber: string) => `${API_BASE_URL}/customer-documents/${basicNumber}`,
  GET_DOCUMENT: (basicNumber: string, documentName: string) => `${API_BASE_URL}/customer-documents/${basicNumber}/${documentName}`,
  UPLOAD: (basicNumber: string, documentName: string) => `${API_BASE_URL}/customer-documents/${basicNumber}/${documentName}/upload`,
  DELETE: (basicNumber: string, documentName: string) => `${API_BASE_URL}/customer-documents/${basicNumber}/${documentName}`,
  GET_SIGNATURES: (accountNumber: string) => `${API_BASE_URL}/customer-documents/account/${accountNumber}/signatures`,
  GET_SIGNATURE: (basicNumber: string) => `${API_BASE_URL}/customer-documents/${basicNumber}/signature`,
};


// Helper function to convert byte array to base64 data URL
function convertByteArrayToDataUrl(
  byteArray: string | number[] | Uint8Array | undefined, 
  contentType: string
): string {
  if (!byteArray) return '';
  
  try {
    // Handle different types of byte array representations
    let base64String = '';
    
    if (Array.isArray(byteArray)) {
      // Convert numeric array to binary string
      let binary = '';
      const bytes = new Uint8Array(byteArray);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64String = window.btoa(binary);
    } else if (typeof byteArray === 'string') {
      // If it's already a string, check if it's a data URL
      if (byteArray.startsWith('data:')) {
        return byteArray;
      }
      // Otherwise assume it's already base64
      base64String = byteArray;
    } else {
      console.warn('Unknown file content format:', byteArray);
      return '';
    }
    
    return `data:${contentType || 'application/octet-stream'};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting byte array to data URL:', error);
    return '';
  }
}

// Process document to ensure file content is in the correct format
function processDocument(doc: CustomerDocumentDTO): CustomerDocumentDTO {
  if (!doc) return doc;
  
  return {
    ...doc,
    fileContent: doc.fileContent 
      ? convertByteArrayToDataUrl(doc.fileContent, doc.contentType)
      : undefined
  };
}

// Create axios instance with common configuration
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Error handling wrapper
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleApiError = (
  error: Error | unknown, 
  operation: string, 
  identifier: string
): never => {
  // Log detailed error information
  if (axios.isAxiosError(error)) {
    console.error(`API Error during ${operation} for ${identifier}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  } else {
    console.error(`Error during ${operation} for ${identifier}:`, error);
  }
  
  // Rethrow the error to be handled by caller
  throw error;
};

export const CustomerDocumentApiService = {
  // Get all documents for a customer
  getCustomerDocuments: async (basicNumber: string): Promise<CustomerDocumentDTO[]> => {
    try {
      const response: AxiosResponse<CustomerDocumentDTO[]> = await api.get(
        CUSTOMER_DOCUMENT_API.GET_ALL(basicNumber)
      );
      
      // Process each document to ensure file content is in the correct format
      const processedData = response.data.map(doc => processDocument(doc));
      console.log('Processed documents:', processedData);
      
      return processedData;
    } catch (error) {
      console.error(`Error fetching documents for customer ${basicNumber}:`, error);
      return [];
    }
  },

  // Get a specific document
  getCustomerDocument: async (basicNumber: string, documentName: string): Promise<CustomerDocumentDTO | null> => {
    try {
      const response: AxiosResponse<CustomerDocumentDTO> = await api.get(
        CUSTOMER_DOCUMENT_API.GET_DOCUMENT(basicNumber, documentName)
      );
      
      // Process the document to ensure file content is in the correct format
      return processDocument(response.data);
    } catch (error) {
      console.error(`Error fetching document ${documentName} for customer ${basicNumber}:`, error);
      return null;
    }
  },

  // Add this to CustomerDocumentApiService.ts
updateDocumentExpiryDate: async (
  basicNumber: string,
  documentName: string,
  expiryDate: string
): Promise<boolean> => {
  try {
    // Make an API call to update the expiry date
    await api.put(
      `${API_BASE_URL}/customer-documents/${basicNumber}/${documentName}/expiry`,
      { expiryDate }
    );
    return true;
  } catch (error) {
    console.error(`Error updating expiry date for document ${documentName}:`, error);
    return false;
  }
},

  // Upload a document
  uploadDocument: async (basicNumber: string, documentName: string, file: File): Promise<boolean> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Log the upload attempt
      console.log(`Attempting to upload ${file.name} for customer ${basicNumber}, document ${documentName}`);
      console.log(`File type: ${file.type}, size: ${file.size} bytes`);

      // Use a special axios instance for file uploads with more detailed error logging
      const response = await axios.post(
        CUSTOMER_DOCUMENT_API.UPLOAD(basicNumber, documentName),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for uploads
        }
      );
      
      // Log successful response
      console.log('Upload successful:', response.status, response.statusText);
      
      // Handle both response formats (UploadResultDTO or direct boolean)
      if (typeof response.data === 'object' && 'success' in response.data) {
        const result: UploadResultDTO = response.data;
        return result.success;
      }
      
      return response.status >= 200 && response.status < 300;
    } catch (error: unknown) {
      // Enhanced error logging
      console.error(`Error uploading document ${documentName} for customer ${basicNumber}:`);
      
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request Method:', error.config?.method);
        
        // Check for specific error conditions
        if (error.response?.status === 500) {
          console.error('Server error occurred. This might be due to:');
          console.error('- Invalid file format or corrupted file');
          console.error('- Server configuration issues');
          console.error('- Backend validation errors');
        } else if (error.response?.status === 413) {
          console.error('File too large for server to process');
        } else if (error.code === 'ECONNABORTED') {
          console.error('Request timed out - server took too long to respond');
        }
      } else {
        console.error('Non-Axios error:', error);
      }
      
      return false;
    }
  },

  // Delete a document
  deleteDocument: async (basicNumber: string, documentName: string): Promise<boolean> => {
    try {
      await api.delete(CUSTOMER_DOCUMENT_API.DELETE(basicNumber, documentName));
      return true;
    } catch (error) {
      console.error(`Error deleting document ${documentName} for customer ${basicNumber}:`, error);
      return false;
    }
  },

  // Get signatures for an account (all holders)
  getSignaturesForAccount: async (accountNumber: string): Promise<CustomerDocumentDTO[]> => {
    try {
      const response: AxiosResponse<CustomerDocumentDTO[]> = await api.get(
        CUSTOMER_DOCUMENT_API.GET_SIGNATURES(accountNumber)
      );
      
      // Process each document to ensure file content is in the correct format
      return response.data.map(doc => processDocument(doc));
    } catch (error) {
      console.error(`Error fetching signatures for account ${accountNumber}:`, error);
      return [];
    }
  },

  // Get signature for a customer
  getCustomerSignature: async (basicNumber: string): Promise<CustomerDocumentDTO | null> => {
    try {
      const response: AxiosResponse<CustomerDocumentDTO> = await api.get(
        CUSTOMER_DOCUMENT_API.GET_SIGNATURE(basicNumber)
      );
      
      // Process the document to ensure file content is in the correct format
      return processDocument(response.data);
    } catch (error) {
      console.error(`Error fetching signature for customer ${basicNumber}:`, error);
      return null;
    }
  },
  
  // Download a document directly (returns URL for download)
  getDocumentDownloadUrl: (basicNumber: string, documentName: string): string => {
    return `${CUSTOMER_DOCUMENT_API.GET_DOCUMENT(basicNumber, documentName)}?download=true`;
  },
  
  // Batch download of documents (if implemented on backend)
  batchDownloadDocuments: async (basicNumber: string, documentNames: string[]): Promise<Blob | null> => {
    try {
      // This would require a custom endpoint on your backend
      const response = await api.post(
        `${API_BASE_URL}/customer-documents/${basicNumber}/batch-download`,
        { documentNames },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error(`Error batch downloading documents for customer ${basicNumber}:`, error);
      return null;
    }
  }
};

export default CustomerDocumentApiService;