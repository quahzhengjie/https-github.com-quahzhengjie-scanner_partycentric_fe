// types/customerDocument.ts

// Define the CustomerDocumentDTO interface
export interface CustomerDocumentDTO {
  id: number;
  documentName: string;
  uploadStatus: string;
  uploadDate: string;
  basicNumber: string;  // Make sure this matches what your backend sends
  customerName: string;
  category: string;
  contentType: string;
  fileContent?: string;
}

// Status constants
export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED'
} as const;

// Export types for document state
export type DocumentStatus = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];

// Document categories
export const DOCUMENT_CATEGORIES = {
  KYC: 'KYC',
  IDENTIFICATION: 'Identification',
  FINANCIAL: 'Financial',
  LEGAL: 'Legal',
  AUTHORIZATION: 'Authorization',
  SIGNATURE: 'Signature',
  OTHER: 'Other'
} as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES];