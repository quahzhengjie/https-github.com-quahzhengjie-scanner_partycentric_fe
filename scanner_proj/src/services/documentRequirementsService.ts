// services/documentRequirementsService.ts
import { CustomerType } from "@/types/customer";
import { Document } from "@/types/document";


// Document definitions organized by customer type
const documentRequirements: Record<CustomerType, Document[]> = {
  Individual: [
    { filename: "Passport Copy", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "NRIC", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Source of Funds Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" }
  ],
  SingaporeTrust: [
    { filename: "Trust Deed / Declaration of Trust", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "ACRA Registration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Trust Tax Identification Number (TIN)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Tax" },
    { filename: "Bank Resolution", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "List of Beneficiaries", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Statement of Trust Assets", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Professional Trustees' License", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Trustee NRIC/Passport", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Trustee Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  OffshoreTrust: [
    { filename: "Notarized Trust Deed", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Certificate of Good Standing", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Legal Opinion", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Beneficial Ownership Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Source of Wealth & Source of Funds", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Trustee NRIC/Passport", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Trustee Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "UBO Screening", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Tax Residency Documents", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Tax" }
  ],
  PrivateLimited: [
    { filename: "Certificate of Incorporation (ACRA)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Business Profile (ACRA BizFile)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Company Constitution", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Board Resolution for Account Opening", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Company Tax Identification Number", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Tax" },
    { filename: "Ultimate Beneficial Owner Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Audited Financial Statements", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Proof of Business Activities", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Directors' NRIC/Passport", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Directors' Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  PublicLimited: [
    { filename: "Certificate of Incorporation", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Company Constitution", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Annual Report / Audited Financial Statements", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Board Resolution for Account Opening", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "SGX Listing Proof (if listed)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Proof of Business Operations", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Directors' NRIC/Passport", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Directors' Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  OffshoreCompany: [
    { filename: "Certificate of Incorporation (Notarized)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Certificate of Good Standing", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Notarized M&AA / Constitution", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Register of Directors & Shareholders", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "UBO Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Board Resolution for Account Opening", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Legal Opinion", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Proof of Business Activities", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Source of Funds", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Tax Residency Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Tax" }
  ],
  RegulatedEntity: [
    { filename: "Regulatory License", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Company Constitution & Business Profile", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Board Resolution for Account Opening", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "AML/Compliance Policy", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" }
  ],
  CryptoBusiness: [
    { filename: "MAS License (Payment Services Act)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Detailed AML Policy", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Proof of Regulatory Compliance", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Transaction Monitoring System Details", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Certificate of Incorporation", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Ultimate Beneficial Owner Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  SoleProprietor: [
    { filename: "Business Registration Certificate", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "NRIC/Passport of Owner", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  Partnership: [
    { filename: "Business Registration Certificate", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Partnership Agreement", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Partners' NRIC/Passport", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Partners' Proof of Address", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  Charity: [
    { filename: "Certificate of Charity Registration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Source of Funds Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Board of Directors KYC", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Proof of Donations", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" }
  ],
  GovernmentEntity: [
    { filename: "Government Registration Documents", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Director KYC", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Board Resolution", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" }
  ],
  FamilyOffice: [
    { filename: "MAS Notification (if licensed)", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "UBO Documentation", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Source of Funds Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Certificate of Incorporation", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" }
  ],
  HedgeFund: [
    { filename: "Fund Prospectus", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Investment Strategy Document", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" },
    { filename: "Certificate of Incorporation", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Fund Manager License", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "AML Policy", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Board Resolution", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Legal" },
    { filename: "Ultimate Beneficial Owner Declaration", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Identification" },
    { filename: "Risk Management Framework", uploadedFile: null, uploadedName: "", expiryDate: "", status: "Pending", category: "Financial" }
  ]
};
// Special documents for high-risk entities
const enhancedDueDiligenceDocuments: Document[] = [
  { 
    filename: "Detailed Source of Funds/Wealth Documentation", 
    uploadedFile: null, 
    uploadedName: "", 
    expiryDate: "", 
    status: "Pending", 
    category: "Financial" 
  },
  { 
    filename: "PEP Declaration", 
    uploadedFile: null, 
    uploadedName: "", 
    expiryDate: "", 
    status: "Pending", 
    category: "Identification" 
  },
  { 
    filename: "Tax Residency Self-Certification (CRS/FATCA)", 
    uploadedFile: null, 
    uploadedName: "", 
    expiryDate: "", 
    status: "Pending", 
    category: "Tax" 
  },
  { 
    filename: "UBO Screening & Sanctions Check", 
    uploadedFile: null, 
    uploadedName: "", 
    expiryDate: "", 
    status: "Pending", 
    category: "Identification" 
  }
];

// Jurisdictional high-risk locations
const highRiskJurisdictions = [
  "North Korea", "Iran", "Syria", "Myanmar", "Yemen", "Afghanistan",
  "Cayman Islands", "Panama", "Bermuda", "Bahamas", "British Virgin Islands",
  "Isle of Man", "Jersey", "Guernsey", "Gibraltar", "Luxembourg", "Liechtenstein",
  "Vanuatu", "Samoa", "Labuan"
];

export const DocumentRequirementsService = {
  // Get document requirements based on customer type and risk factors
  getRequiredDocuments: (
    customerType: CustomerType,
    isPEP: boolean = false,
    registrationCountry: string = "Singapore",
    riskRating: string = "Low"
  ): Document[] => {
    // Start with base documents for the customer type
    let requiredDocs = [...documentRequirements[customerType]];
    
    // Add EDD documents for high-risk customers
    if (
      isPEP || 
      highRiskJurisdictions.includes(registrationCountry) || 
      riskRating === "High" || 
      riskRating === "Extreme" ||
      customerType === "OffshoreCompany" ||
      customerType === "CryptoBusiness" ||
      customerType === "OffshoreTrust"
    ) {
      requiredDocs = [...requiredDocs, ...enhancedDueDiligenceDocuments];
    }
    
    // Create fresh copies of the documents to avoid reference issues
    return JSON.parse(JSON.stringify(requiredDocs));
  },
  
  // Check if a country is considered high-risk
  isHighRiskJurisdiction: (country: string): boolean => {
    return highRiskJurisdictions.includes(country);
  },
  
  // Get a list of customer types for dropdown selection
  getCustomerTypeOptions: () => {
    return [
      { value: "Individual", label: "Individual" },
      { value: "SingaporeTrust", label: "Singapore Trust" },
      { value: "OffshoreTrust", label: "Offshore Trust" },
      { value: "PrivateLimited", label: "Private Limited (Pte Ltd)" },
      { value: "PublicLimited", label: "Public Limited (Ltd)" },
      { value: "OffshoreCompany", label: "Offshore Company" },
      { value: "RegulatedEntity", label: "Regulated Entity" },
      { value: "CryptoBusiness", label: "Cryptocurrency / FinTech" },
      { value: "SoleProprietor", label: "Sole Proprietor" },
      { value: "Partnership", label: "Partnership" },
      { value: "Charity", label: "Charity / NPO" },
      { value: "GovernmentEntity", label: "Government Entity" },
      { value: "FamilyOffice", label: "Family Office" }
    ];
  }
};