// src/lib/types.ts - Enhanced version with richer data models

// ============================================================================
// Core Types
// ============================================================================

export type UserRole = 'RM' | 'Checker' | 'Compliance' | 'GM' | 'Admin';

export type CaseStatus = 
  | 'Draft' 
  | 'Pending Checker Review' 
  | 'Pending Compliance Review' 
  | 'Pending GM Approval' 
  | 'Approved' 
  | 'Rejected' 
  | 'Active';

export type AccountStatus = 
  | 'Proposed' 
  | 'Pending Checker Review' 
  | 'Pending Compliance Review' 
  | 'Active' 
  | 'Rejected'
  | 'Dormant'
  | 'Closed';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ResidencyStatus = 'Singaporean/PR' | 'Foreigner';

export type DocumentStatus = 
  | 'Missing' 
  | 'Pending Checker Verification' 
  | 'Pending Compliance Verification' 
  | 'Verified' 
  | 'Rejected'
  | 'Expired';

export type PartyType = 'Individual' | 'Corporate Entity';

export type EntityType = 
  | 'Individual Account'
  | 'Non-Listed Company'
  | 'Listed Company'
  | 'Partnership'
  | 'Trust'
  | 'Society / Association / Club'
  | 'Charity'
  | 'Sole-Proprietorship'
  | 'Government Entity'
  | 'Financial Institution';

export type Industry = 
  | 'Banking & Financial Services'
  | 'Technology'
  | 'Healthcare'
  | 'Manufacturing'
  | 'Retail & E-commerce'
  | 'Real Estate'
  | 'Energy & Utilities'
  | 'Telecommunications'
  | 'Transportation & Logistics'
  | 'Education'
  | 'Entertainment & Media'
  | 'Agriculture'
  | 'Mining & Resources'
  | 'Professional Services'
  | 'Non-Profit'
  | 'Government'
  | 'Other';

export type Country = string; // ISO country codes

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  profilePicture?: string;
  lastLogin?: string;
  isActive: boolean;
}

// ============================================================================
// Enhanced Party (Individual/Corporate)
// ============================================================================

export interface Party {
  // Core fields
  partyId: string;
  name: string;
  type: PartyType;
  
  // Individual-specific fields
  residencyStatus?: ResidencyStatus;
  nationality?: Country;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  occupation?: string;
  employer?: string;
  
  // Corporate-specific fields
  registrationNumber?: string;
  incorporationDate?: string;
  incorporationCountry?: Country;
  businessType?: Industry;
  
  // Contact Information
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address: Address;
  mailingAddress?: Address;
  
  // Risk & Compliance
  isPEP: boolean;
  isSanctioned: boolean;
  riskScore?: number;
  riskFactors: string[];
  
  // Financial Information
  annualIncome?: string;
  netWorth?: string;
  sourceOfWealth?: string;
  sourceOfFunds?: string;
  
  // Documents
  documentLinks: PartyDocumentLink[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  kycRefreshDate?: string;
  nextReviewDate?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: Country;
}

// ============================================================================
// Enhanced Case
// ============================================================================

export interface Case {
  // Core fields
  caseId: string;
  status: CaseStatus;
  riskLevel: RiskLevel;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  
  // Assignment & Workflow
  assignedTo: string;
  assignedTeam?: string;
  checkedBy?: string;
  approvedBy?: string;
  
  // Entity Information
  entityData: EntityData;
  
  // Relationships
  relatedPartyLinks: CasePartyLink[];
  accounts: Account[];
  
  // Documents & Compliance
  documentLinks: CaseDocumentLink[];
  complianceNotes?: string;
  riskAssessment?: RiskAssessment;
  
  // Snapshots
  kycApprovalSnapshot?: ApprovalSnapshot;
  accountApprovalSnapshots: ApprovalSnapshot[];
  
  // Activity & Metadata
  activities: ActivityLog[];
  createdAt: string;
  updatedAt: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
}

export interface EntityData {
  // Core fields
  entityName: string;
  entityType: EntityType;
  
  // Registration & Legal
  registrationNumber?: string;
  taxId?: string;
  legalForm?: string;
  
  // Location & Contact
  registeredAddress: Address;
  operatingAddress?: Address;
  website?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Business Information
  incorporationDate?: string;
  incorporationCountry?: Country;
  operatingCountries?: Country[];
  industry?: Industry;
  businessDescription?: string;
  numberOfEmployees?: string;
  annualRevenue?: string;
  
  // Ownership & Structure
  ownershipStructure?: string;
  parentCompany?: string;
  subsidiaries?: string[];
  isPubliclyTraded?: boolean;
  stockExchange?: string;
  stockSymbol?: string;
}

// ============================================================================
// Enhanced Account
// ============================================================================

export interface Account {
  // Core fields
  accountId: string;
  accountNumber: string;
  accountType: 'Current' | 'Savings' | 'Fixed Deposit' | 'Securities' | 'Loan';
  status: AccountStatus;
  
  // Account Details
  currency: string;
  purpose: string;
  expectedMonthlyCredits?: string;
  expectedMonthlyDebits?: string;
  initialDeposit?: string;
  
  // Parties & Signatories
  primaryHolderId: string;
  jointHolderIds: string[];
  signatoryIds: string[];
  signatureRules?: string; // e.g., "Any one", "Any two", "All"
  
  // Features & Services
  requestedServices?: string[];
  onlineBanking?: boolean;
  checkBook?: boolean;
  debitCard?: boolean;
  
  // Approval & Activation
  accountApprovalSnapshot?: ApprovalSnapshot;
  activatedDate?: string;
  activatedBy?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastReviewDate?: string;
}

// ============================================================================
// Risk Assessment
// ============================================================================

export interface RiskAssessment {
  assessmentId: string;
  overallRisk: RiskLevel;
  
  // Risk Factors
  geographicRisk: RiskLevel;
  productRisk: RiskLevel;
  customerRisk: RiskLevel;
  transactionRisk: RiskLevel;
  
  // Detailed Factors
  riskFactors: RiskFactor[];
  mitigationMeasures: string[];
  
  // Enhanced Due Diligence
  eddRequired: boolean;
  eddReasons?: string[];
  eddCompletedDate?: string;
  
  // Approval
  assessedBy: string;
  assessedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  nextReviewDate: string;
}

export interface RiskFactor {
  category: string;
  factor: string;
  score: number;
  description?: string;
}

// ============================================================================
// Documents & Submissions
// ============================================================================

export interface Document {
  docId: string;
  ownerPartyId: string;
  docType: string;
  category: 'Identity' | 'Address' | 'Financial' | 'Corporate' | 'Legal' | 'Other';
  
  // File Information
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl?: string;
  
  // Blob Storage - will be stored as VARBINARY(MAX) in MSSQL or BLOB in MySQL
  fileData?: string; // Base64 encoded for API transport
  // In the database, this would be stored as binary data
  
  // Document Details
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  documentNumber?: string;
  
  // Verification
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  verificationNotes?: string;
  
  // Metadata
  uploadedAt: string;
  uploadedBy: string;
  lastAccessedAt?: string;
  tags?: string[];
}

export interface Submission {
  submissionId: string;
  masterDocId: string;
  status: DocumentStatus;
  
  // Submission Details
  submittedAt: string;
  submittedBy: string;
  submissionMethod: 'Upload' | 'Scan' | 'Email' | 'API';
  
  // Document Metadata
  publishedDate?: string;
  expiryDate?: string;
  pages?: number;
  
  // Review Process
  checkerReviewedAt?: string;
  checkerReviewedBy?: string;
  complianceReviewedAt?: string;
  complianceReviewedBy?: string;
  
  // Comments & Feedback
  comments: Comment[];
  rejectionReasons?: string[];
}

export interface Comment {
  commentId: string;
  author: string;
  authorRole: UserRole;
  timestamp: string;
  text: string;
  isInternal: boolean;
  attachments?: string[];
}

// ============================================================================
// Linking & Requirements
// ============================================================================

export interface CasePartyLink {
  partyId: string;
  relationshipType: string;
  ownershipPercentage?: number;
  startDate?: string;
  endDate?: string;
  isPrimary: boolean;
}

export interface CaseDocumentLink {
  linkId: string;
  requirementId: string;
  requirementType: 'Standard' | 'Risk-Based' | 'Ad-Hoc';
  submissions: Submission[];
  isMandatory: boolean;
  dueDate?: string;
}

export interface PartyDocumentLink {
  linkId: string;
  requirementName: string;
  documentId: string;
  submissions: Submission[];
  autoLinked: boolean;
  linkedDate: string;
}

// ============================================================================
// Workflow & Approvals
// ============================================================================

export interface ApprovalSnapshot {
  snapshotId: string;
  snapshotType: 'KYC' | 'Account' | 'Transaction';
  
  // Approval Details
  timestamp: string;
  approvedBy: string;
  approverRole: UserRole;
  
  // Decision
  decision: 'Approved' | 'Rejected' | 'Conditional';
  conditions?: string[];
  
  // Documents & Evidence
  documents: VerifiedSubmissionRecord[];
  checklistCompleted: boolean;
  
  // Risk & Compliance
  riskLevel: RiskLevel;
  complianceChecks: ComplianceCheck[];
  
  // Validity
  validUntil?: string;
  periodicReviewRequired: boolean;
  nextReviewDate?: string;
}

export interface VerifiedSubmissionRecord {
  requirementId: string;
  docType: string;
  submissionId: string;
  masterDocId: string;
  verifiedDate: string;
  expiryDate?: string;
}

export interface ComplianceCheck {
  checkType: string;
  result: 'Pass' | 'Fail' | 'Conditional';
  performedAt: string;
  performedBy: string;
  details?: string;
}

// ============================================================================
// Activity & Audit
// ============================================================================

export interface ActivityLog {
  id: string;
  timestamp: string;
  
  // Actor Information
  actor: string;
  actorRole: UserRole;
  actorId: string;
  
  // Action Details
  action: string;
  actionType: 'Create' | 'Update' | 'Delete' | 'Submit' | 'Approve' | 'Reject' | 'Comment' | 'Upload' | 'View';
  
  // Context
  entityType: 'Case' | 'Party' | 'Account' | 'Document';
  entityId: string;
  
  // Change Details
  details?: string;
  previousValue?: string;
  newValue?: string;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// ============================================================================
// Checklist & Requirements
// ============================================================================

export interface DocumentRequirement {
  name: string;
  category: string;
  required: boolean;
  description?: string;
  validityMonths?: number;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  requiresNotarization?: boolean;
  requiresTranslation?: boolean;
}

export interface ChecklistItem extends DocumentRequirement {
  id: string;
  status: DocumentStatus;
  ownerPartyId: string;
  category: 'Identity' | 'Address' | 'Financial' | 'Corporate' | 'Legal' | 'Other';
  submissions: Submission[];
  lastSubmissionDate?: string;
  nextActionRequired?: string;
  priority: 'Low' | 'Normal' | 'High';
}

export interface ChecklistSection {
  title: string;
  description?: string;
  items: ChecklistItem[];
  completionPercentage: number;
  isMandatory: boolean;
}
// Add this to the end of your src/lib/types.ts file:

// Add this to the end of your src/lib/types.ts file:

// Add this to the end of your src/lib/types.ts file:

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateCaseDto {
  entityName: string;
  entityType: EntityType;
  assignedTo?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  riskLevel?: RiskLevel;
}

export interface CreateAccountDto {
  accountType: 'Current' | 'Savings' | 'Fixed Deposit' | 'Securities' | 'Loan';
  currency: string;
  purpose: string;
  primaryHolderId?: string;
  jointHolderIds?: string[];
  signatoryIds?: string[];
  signatureRules?: string;
  requestedServices?: string[];
  onlineBanking?: boolean;
  checkBook?: boolean;
  debitCard?: boolean;
}

export interface UpdateSubmissionDto {
  newStatus: DocumentStatus;
  commentText?: string;
}

export interface CreateSubmissionDto {
  masterDocId: string;
  status: DocumentStatus;
  submittedAt: string;
  submittedBy: string;
  submissionMethod: 'Upload' | 'Scan' | 'Email' | 'API';
  comments?: Comment[];
  publishedDate?: string;
  expiryDate?: string;
  pages?: number;
}