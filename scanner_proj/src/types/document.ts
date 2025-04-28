export type DocumentCategory = 
  | "KYC" 
  | "Financial" 
  | "Legal" 
  | "Identification" 
  | "Tax" 
  | "Correspondence"
  | 'Authorization' 
  | 'Other';

export type Document = {
  filename: string;
  uploadedFile: string | null;
  uploadedName: string;
  expiryDate: string;
  status: "Pending" | "Uploaded";
  category: DocumentCategory;
};

export interface CustomerDocumentDTO {
  id: number;
  documentName: string;
  uploadStatus: string;
  uploadDate: string;
  customerBasicNumber: string;
  customerName: string;
  category: string;
  contentType: string;
  fileContent?: string;
}