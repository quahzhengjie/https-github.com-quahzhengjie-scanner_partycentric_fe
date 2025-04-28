import { Document } from "@/types/document";
import { DocumentRequirementsService } from "@/services/documentRequirementsService";
import { mockCustomers } from "./customer";

// ✅ Mutable `mockDocuments` (Only initialized once)
export let mockDocuments: { basicNumber: string; documents: Document[] }[] = [];

// ✅ Initialize only if empty (prevents reset on import)
if (mockDocuments.length === 0) {
  // Generate documents based on customer type for each customer
  mockDocuments = mockCustomers.map(customer => {
    // Get required documents based on customer type and risk factors
    const customerDocs = DocumentRequirementsService.getRequiredDocuments(
      customer.customerType,
      customer.isPEP || false,
      customer.registrationCountry || "Singapore",
      customer.riskRating || "Low"
    );
    
    return {
      basicNumber: customer.basicNumber,
      documents: customerDocs
    };
  });
  
  console.log(`Initialized documents for ${mockDocuments.length} customers based on their types`);
}

// Fallback documents in case we need them
export const getDefaultDocuments = (): Document[] => {
  return [
    { filename: "Passport Copy", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Bank Statement", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Employment Letter", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Utility Bill", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "ID Card", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Visa Document", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" }
  ];
};
