// types/account.ts
import { AccountStatus, AccountType, CurrencyCode, DocumentCategory } from './accountTypes';

// Base DTO for account information
export interface AccountDTO {
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  status: AccountStatus;
  currency: CurrencyCode;
  balance: number;
  availableBalance: number;
  openingDate: string;
  lastTransactionDate: string;
  customerBasicNumber: string;
  isJoint: boolean;
  jointHolders?: string[];
  accountManager?: string;
  branchCode?: string;
  interestRate: number;
  maturityDate?: string;
  accountFeaturesEnabled: {
    internetBanking: boolean;
    mobileApp: boolean;
    debitCard: boolean;
    checkbook: boolean;
    standinginstructions: boolean;
    directDebit: boolean;
  };
  documents: {
    documentName: string;
    uploadStatus: 'Pending' | 'Uploaded';
    uploadDate?: string;
    category?: DocumentCategory;
  }[];
}

// DTO for creating a new account
export interface AccountCreateDTO {
  accountName: string;
  accountType: AccountType;
  currency: CurrencyCode;
  customerBasicNumber: string;
  isJoint: boolean;
  jointHolders?: string[];
}

// DTO for updating an existing account
export interface AccountUpdateDTO {
  accountName?: string;
  status?: AccountStatus;
  interestRate?: number;
  maturityDate?: string;
  internetBankingEnabled?: boolean;
  mobileAppEnabled?: boolean;
  debitCardEnabled?: boolean;
  checkbookEnabled?: boolean;
  standingInstructionsEnabled?: boolean;
  directDebitEnabled?: boolean;
  // Add joint account management properties
  isJoint?: boolean;
  jointHolders?: string[];
  // Add account manager property
  accountManager?: string;
  // Add branch code property
  branchCode?: string;
}

// DTO for account requirement details
export interface AccountRequirementDTO {
  documentName: string;
  isRequired: boolean;
  category: string;
}

// DTO for account type details
export interface AccountTypeDetailsDTO {
  name: string;
  description: string;
  minimumBalance: number;
  maintenanceFee: number;
  interestRate: number;
  isOfferedToIndividuals: boolean;
  isOfferedToCorporates: boolean;
  currenciesSupported: CurrencyCode[];
  documentRequirements: AccountRequirementDTO[];
  features: string[];
}

// DTO for select options (dropdowns)
export interface SelectOptionDTO {
  value: string;
  label: string;
}

// DTO for document upload results
export interface UploadResultDTO {
  success: boolean;
  message: string;
}

// DTO for account summary statistics
export interface AccountSummaryDTO {
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  frozenAccounts: number;
  dormantAccounts: number;
  closedAccounts: number;
  balancesByCurrency: Record<string, number>;
  accountTypeDistribution: Record<string, number>;
}