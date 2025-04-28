// types/customer.ts
export type CustomerType = 
  | "Individual"
  | "SingaporeTrust" 
  | "OffshoreTrust"
  | "PrivateLimited" 
  | "PublicLimited"
  | "OffshoreCompany"
  | "RegulatedEntity"
  | "CryptoBusiness"
  | "SoleProprietor"
  | "Partnership"
  | "Charity"
  | "GovernmentEntity"
  | "FamilyOffice"
  | "HedgeFund";

// New type to track customer lifecycle
export type CustomerLifecycleStatus = 
  | "Prospective"    // Initial contact or lead
  | "Onboarding"     // Currently in the onboarding process
  | "Active"         // Fully onboarded active customer
  | "Dormant"        // Inactive but not closed
  | "Suspended"      // Temporarily suspended
  | "Closed"         // Account closed
  | "Rejected";      // Application rejected (e.g., failed AML checks)

export interface Customer {
    basicNumber: string;
    name: string;
    email: string;
    address: string;
    phoneNumber: string;
    passport: string;
    customerType: CustomerType;
    incorporationNumber?: string;
    registrationCountry?: string;
    ubos?: string[]; // Ultimate Beneficial Owners
    isPEP?: boolean; // Politically Exposed Person
    amlStatus?: "Pending" | "Approved" | "Rejected" | "Not Required";
    amlCheckDate?: string;
    amlScore?: number;
    amlNotes?: string;
    riskRating?: "Low" | "Medium" | "High" | "Extreme";
    lifecycleStatus?: CustomerLifecycleStatus;
    lifecycleStatusDate?: string;  // Last date the lifecycle status changed
    relationshipManager?: string;  // Person responsible for this customer
    hasOutstandingDocuments?: boolean;
    
    // New fields for enhanced customer data
    dateOfBirth?: string;
    nationality?: string;
    primaryContact?: string;
    businessNature?: string;
}