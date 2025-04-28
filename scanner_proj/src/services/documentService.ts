// services/documentService.ts
import { Customer, CustomerType } from '@/types/customer';
import { Document, DocumentCategory } from '@/types/document';
import { mockDocuments } from "@/mockData/mockDocuments";
import { DocumentRequirementsService } from './documentRequirementsService';
import { AccountType, accountTypeDetails } from '@/types/accountTypes';


interface CustomerWithDocumentStatus extends Customer {
  hasOutstandingDocuments: boolean;
}

export const DocumentService = {
  // Check if customer has any outstanding documents
  hasOutstandingDocuments: (basicNumber: string): boolean => {
    const customerDocs = mockDocuments.find(doc => doc.basicNumber === basicNumber);
    if (!customerDocs) return false;
    
    // Check if any document has "Pending" status
    return customerDocs.documents.some(doc => doc.status === "Pending");
  },
  
  // Enrich customer data with document status
  getCustomersWithDocumentStatus: (customers: Customer[]): CustomerWithDocumentStatus[] => {
    return customers.map(customer => ({
      ...customer,
      hasOutstandingDocuments: DocumentService.hasOutstandingDocuments(customer.basicNumber)
    }));
  },
  
  // Get all documents for a customer
  getDocumentsForCustomer: (basicNumber: string): Document[] => {
    const customerDocs = mockDocuments.find(doc => doc.basicNumber === basicNumber);
    return customerDocs ? customerDocs.documents : [];
  },
  
  // Update document status
  updateDocumentStatus: (basicNumber: string, filename: string, status: Document['status']): void => {
    const customerDocsIndex = mockDocuments.findIndex(doc => doc.basicNumber === basicNumber);
    
    if (customerDocsIndex !== -1) {
      const documentIndex = mockDocuments[customerDocsIndex].documents.findIndex(
        doc => doc.filename === filename
      );
      
      if (documentIndex !== -1) {
        mockDocuments[customerDocsIndex].documents[documentIndex].status = status;
      }
    }
  },

  // Comprehensive document update method
  updateDocument: (
    basicNumber: string, 
    filename: string, 
    updates: Partial<Document>
  ): void => {
    const customerDocsIndex = mockDocuments.findIndex(doc => doc.basicNumber === basicNumber);
    
    if (customerDocsIndex !== -1) {
      const documentIndex = mockDocuments[customerDocsIndex].documents.findIndex(
        doc => doc.filename === filename
      );
      
      if (documentIndex !== -1) {
        mockDocuments[customerDocsIndex].documents[documentIndex] = {
          ...mockDocuments[customerDocsIndex].documents[documentIndex],
          ...updates
        };
      }
    }
  },

  // Get outstanding documents list
  getOutstandingDocumentsList: (basicNumber: string): string[] => {
    const customerDocs = mockDocuments.find(doc => doc.basicNumber === basicNumber);
    if (!customerDocs) return [];
    
    // Return the filenames of pending documents
    return customerDocs.documents
      .filter(doc => doc.status === "Pending")
      .map(doc => doc.filename);
  },
  
  // Initialize customer documents based on their type and risk profile
  initializeCustomerDocuments: (
    basicNumber: string, 
    customerType: CustomerType = "Individual",
    isPEP: boolean = false,
    registrationCountry: string = "Singapore",
    riskRating: string = "Low"
  ): void => {
    // Check if documents already exist for this customer
    const existingDocIndex = mockDocuments.findIndex(doc => doc.basicNumber === basicNumber);
    
    if (existingDocIndex !== -1) {
      console.log(`Documents already exist for customer ${basicNumber}, skipping initialization`);
      return; // Already initialized
    }
    
    console.log(`Initializing documents for ${basicNumber} (${customerType}, ${registrationCountry}, ${riskRating})`);
    
    // Get required documents based on customer type and risk factors
    const requiredDocuments = DocumentRequirementsService.getRequiredDocuments(
      customerType,
      isPEP,
      registrationCountry,
      riskRating
    );
    
    console.log(`Generated ${requiredDocuments.length} required documents for ${customerType}`);
    
    mockDocuments.push({
      basicNumber,
      documents: requiredDocuments
    });
  },

  // Update customer documents when profile changes
  updateCustomerDocuments: (
    basicNumber: string, 
    customerType: CustomerType,
    isPEP: boolean = false,
    registrationCountry: string = "Singapore",
    riskRating: string = "Low"
  ): void => {
    // Find existing documents
    const customerDocIndex = mockDocuments.findIndex(doc => doc.basicNumber === basicNumber);
    if (customerDocIndex === -1) {
      // If no documents exist, initialize them
      DocumentService.initializeCustomerDocuments(
        basicNumber, 
        customerType, 
        isPEP, 
        registrationCountry, 
        riskRating
      );
      return;
    }
    
    console.log(`Updating documents for ${basicNumber} to match ${customerType}`);
    
    // Get current documents
    const currentDocs = mockDocuments[customerDocIndex].documents;
    
    // Get required documents based on updated profile
    const requiredDocuments = DocumentRequirementsService.getRequiredDocuments(
      customerType,
      isPEP,
      registrationCountry,
      riskRating
    );
    
    // Preserve uploaded files for documents that exist in both sets
    const updatedDocs = requiredDocuments.map(newDoc => {
      const existingDoc = currentDocs.find(doc => doc.filename === newDoc.filename);
      if (existingDoc && existingDoc.uploadedFile) {
        return {
          ...newDoc,
          uploadedFile: existingDoc.uploadedFile,
          uploadedName: existingDoc.uploadedName,
          expiryDate: existingDoc.expiryDate,
          status: existingDoc.status
        };
      }
      return newDoc;
    });
    
    // Update the documents
    mockDocuments[customerDocIndex].documents = updatedDocs;
  },

  // Get document categories
  getDocumentCategories: (): DocumentCategory[] => {
    return ["KYC", "Financial", "Legal", "Identification", "Tax", "Correspondence"];
  },

  // Filter documents by category
  getDocumentsByCategory: (basicNumber: string, category: DocumentCategory): Document[] => {
    const customerDocs = mockDocuments.find(doc => doc.basicNumber === basicNumber);
    if (!customerDocs) return [];

    return customerDocs.documents.filter(doc => doc.category === category);
  },

  // Get document upload progress
  getDocumentUploadProgress: (basicNumber: string): number => {
    const customerDocs = mockDocuments.find(doc => doc.basicNumber === basicNumber);
    if (!customerDocs) return 0;

    const totalDocs = customerDocs.documents.length;
    const uploadedDocs = customerDocs.documents.filter(doc => doc.status === "Uploaded").length;

    return Math.round((uploadedDocs / totalDocs) * 100);
  },

  // Validate document requirements
  validateDocuments: (basicNumber: string): { isComplete: boolean; missingDocuments: string[] } => {
    const customerDocs = mockDocuments.find(doc => doc.basicNumber === basicNumber);
    if (!customerDocs) return { isComplete: false, missingDocuments: [] };

    const missingDocuments = customerDocs.documents
      .filter(doc => doc.status === "Pending")
      .map(doc => doc.filename);

    return {
      isComplete: missingDocuments.length === 0,
      missingDocuments
    };
  },

  // Check if a particular document is required for a customer type
  isDocumentRequiredForCustomerType: (documentName: string, customerType: CustomerType): boolean => {
    const requiredDocs = DocumentRequirementsService.getRequiredDocuments(customerType);
    return requiredDocs.some(doc => doc.filename === documentName);
  },
  
  // Get document requirements for a specific account type
getAccountDocumentRequirements: (accountType: AccountType): Document[] => {
  if (!accountTypeDetails[accountType]) {
    return []; // Return empty array if account type not found
  }
  
  // Convert AccountRequirement[] to Document[]
  return accountTypeDetails[accountType].documentRequirements.map(req => ({
    filename: req.documentName,
    uploadedFile: null,
    uploadedName: "",
    expiryDate: "",
    status: "Pending",
    category: req.category as DocumentCategory
  }));
},

// Check if account documents are complete
checkAccountDocumentCompletion: (
  accountType: AccountType,
  uploadedDocuments: string[]
): { complete: boolean; missing: string[] } => {
  if (!accountTypeDetails[accountType]) {
    return { complete: false, missing: [] };
  }
  
  const requiredDocs = accountTypeDetails[accountType].documentRequirements
    .filter(req => req.isRequired)
    .map(req => req.documentName);
  
  const missing = requiredDocs.filter(docName => !uploadedDocuments.includes(docName));
  
  return {
    complete: missing.length === 0,
    missing
  };
}
};