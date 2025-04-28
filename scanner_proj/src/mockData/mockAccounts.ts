// mockData/mockAccounts.ts
import { AccountType, AccountStatus, CurrencyCode } from '@/types/accountTypes';

export interface Account {
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
  maturityDate?: string; // For fixed deposits and similar accounts
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
  }[];
}

export const mockAccounts: Account[] = [
  // John Smith accounts (Individual)
  {
    accountNumber: 'SG2150-001-1001',
    accountName: 'John Smith Savings',
    accountType: 'SavingsAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 25000.50,
    availableBalance: 25000.50,
    openingDate: '2022-01-15',
    lastTransactionDate: '2023-11-29',
    customerBasicNumber: 'BN001',
    isJoint: false,
    accountManager: 'Sarah Johnson',
    branchCode: 'SG-MAIN-01',
    interestRate: 0.05,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: true,
      checkbook: false,
      standinginstructions: true,
      directDebit: true
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2022-01-15' },
      { documentName: 'Signature Specimen', uploadStatus: 'Uploaded', uploadDate: '2022-01-15' },
      { documentName: 'Proof of Income', uploadStatus: 'Uploaded', uploadDate: '2022-01-15' }
    ]
  },
  {
    accountNumber: 'FD2150-001-2001',
    accountName: 'John Smith Fixed Deposit',
    accountType: 'FixedDeposit',
    status: 'Active',
    currency: 'SGD',
    balance: 50000.00,
    availableBalance: 0, // Fixed deposit - funds not available until maturity
    openingDate: '2023-06-01',
    lastTransactionDate: '2023-06-01',
    customerBasicNumber: 'BN001',
    isJoint: false,
    accountManager: 'Sarah Johnson',
    branchCode: 'SG-MAIN-01',
    interestRate: 0.8,
    maturityDate: '2024-06-01',
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: false,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-06-01' },
      { documentName: 'Term Instruction Form', uploadStatus: 'Uploaded', uploadDate: '2023-06-01' }
    ]
  },
  
  // ACME Trading Pte Ltd accounts (Corporate)
  {
    accountNumber: 'CA2150-002-1001',
    accountName: 'ACME Trading Operations Account',
    accountType: 'CurrentAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 157890.75,
    availableBalance: 157890.75,
    openingDate: '2022-02-10',
    lastTransactionDate: '2023-11-30',
    customerBasicNumber: 'BN002',
    isJoint: false,
    accountManager: 'Michael Wong',
    branchCode: 'SG-CBD-01',
    interestRate: 0.01,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: true,
      standinginstructions: true,
      directDebit: true
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2022-02-10' },
      { documentName: 'Board Resolution', uploadStatus: 'Uploaded', uploadDate: '2022-02-10' },
      { documentName: 'Authorized Signatories List', uploadStatus: 'Uploaded', uploadDate: '2022-02-10' },
      { documentName: 'Company Mandate', uploadStatus: 'Uploaded', uploadDate: '2022-02-10' }
    ]
  },
  {
    accountNumber: 'FX2150-002-3001',
    accountName: 'ACME Trading USD Account',
    accountType: 'ForeignCurrencyAccount',
    status: 'Active',
    currency: 'USD',
    balance: 75000.00,
    availableBalance: 75000.00,
    openingDate: '2022-03-15',
    lastTransactionDate: '2023-11-25',
    customerBasicNumber: 'BN002',
    isJoint: false,
    accountManager: 'Michael Wong',
    branchCode: 'SG-CBD-01',
    interestRate: 0.01,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: false,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2022-03-15' },
      { documentName: 'Foreign Exchange Declaration', uploadStatus: 'Uploaded', uploadDate: '2022-03-15' }
    ]
  },
  
  // Sarah Johnson accounts (Individual - PEP with more enhanced docs)
  {
    accountNumber: 'SG2150-003-1001',
    accountName: 'Sarah Johnson Savings',
    accountType: 'SavingsAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 78500.25,
    availableBalance: 78500.25,
    openingDate: '2023-08-05',
    lastTransactionDate: '2023-11-30',
    customerBasicNumber: 'BN003',
    isJoint: false,
    accountManager: 'Jennifer Lee',
    branchCode: 'SG-MAIN-01',
    interestRate: 0.05,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: true,
      checkbook: false,
      standinginstructions: false,
      directDebit: true
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-08-05' },
      { documentName: 'Signature Specimen', uploadStatus: 'Uploaded', uploadDate: '2023-08-05' },
      { documentName: 'PEP Declaration', uploadStatus: 'Uploaded', uploadDate: '2023-08-05' },
      { documentName: 'Source of Wealth Declaration', uploadStatus: 'Uploaded', uploadDate: '2023-08-05' },
      { documentName: 'Enhanced Due Diligence Form', uploadStatus: 'Uploaded', uploadDate: '2023-08-05' }
    ]
  },
  {
    accountNumber: 'IN2150-003-4001',
    accountName: 'Sarah Johnson Investment',
    accountType: 'InvestmentAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 250000.00,
    availableBalance: 250000.00,
    openingDate: '2023-09-10',
    lastTransactionDate: '2023-11-28',
    customerBasicNumber: 'BN003',
    isJoint: false,
    accountManager: 'Jennifer Lee',
    branchCode: 'SG-MAIN-01',
    interestRate: 0,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: false,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-09-10' },
      { documentName: 'Investment Risk Disclosure', uploadStatus: 'Uploaded', uploadDate: '2023-09-10' },
      { documentName: 'Investment Objectives Form', uploadStatus: 'Uploaded', uploadDate: '2023-09-10' },
      { documentName: 'PEP Declaration', uploadStatus: 'Uploaded', uploadDate: '2023-09-10' },
      { documentName: 'Source of Wealth Declaration', uploadStatus: 'Uploaded', uploadDate: '2023-09-10' }
    ]
  },
  
  // Global Investments Ltd (Offshore with special considerations)
  {
    accountNumber: 'CD2150-004-5001',
    accountName: 'Global Investments Call Deposit',
    accountType: 'CallDeposit',
    status: 'Frozen', // Account frozen due to compliance concerns
    currency: 'USD',
    balance: 500000.00,
    availableBalance: 0, // Frozen account
    openingDate: '2023-05-20',
    lastTransactionDate: '2023-10-05',
    customerBasicNumber: 'BN004',
    isJoint: false,
    accountManager: 'Richard Tan',
    branchCode: 'SG-CBD-01',
    interestRate: 0.3,
    accountFeaturesEnabled: {
      internetBanking: false,
      mobileApp: false,
      debitCard: false,
      checkbook: false,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-05-20' },
      { documentName: 'Board Resolution', uploadStatus: 'Uploaded', uploadDate: '2023-05-20' },
      { documentName: 'Tax Residency Self-Certification', uploadStatus: 'Uploaded', uploadDate: '2023-05-20' },
      { documentName: 'UBO Screening & Sanctions Check', uploadStatus: 'Uploaded', uploadDate: '2023-05-20' },
      { documentName: 'Enhanced Due Diligence Form', uploadStatus: 'Uploaded', uploadDate: '2023-05-20' }
    ]
  },
  
  // Singapore Holdings Family Trust
  {
    accountNumber: 'TR2150-005-6001',
    accountName: 'SG Holdings Family Trust Account',
    accountType: 'TrustAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 2500000.00,
    availableBalance: 2500000.00,
    openingDate: '2022-10-15',
    lastTransactionDate: '2023-11-30',
    customerBasicNumber: 'BN005',
    isJoint: false,
    accountManager: 'Elizabeth Koh',
    branchCode: 'SG-PB-01', // Private Banking branch
    interestRate: 0.02,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: true,
      standinginstructions: true,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2022-10-15' },
      { documentName: 'Trust Deed', uploadStatus: 'Uploaded', uploadDate: '2022-10-15' },
      { documentName: 'Trustee Declaration', uploadStatus: 'Uploaded', uploadDate: '2022-10-15' },
      { documentName: 'Beneficiary Information', uploadStatus: 'Uploaded', uploadDate: '2022-10-15' }
    ]
  },
  
  // CryptoTech Solutions (High-risk industry)
  {
    accountNumber: 'CA2150-006-1001',
    accountName: 'CryptoTech Operations',
    accountType: 'CurrentAccount',
    status: 'Dormant',
    currency: 'SGD',
    balance: 12500.00,
    availableBalance: 12500.00,
    openingDate: '2023-01-10',
    lastTransactionDate: '2023-08-15', // No activity for more than 3 months
    customerBasicNumber: 'BN006',
    isJoint: false,
    accountManager: 'David Lim',
    branchCode: 'SG-CBD-01',
    interestRate: 0.01,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: true,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-01-10' },
      { documentName: 'Board Resolution', uploadStatus: 'Uploaded', uploadDate: '2023-01-10' },
      { documentName: 'Enhanced Due Diligence Form', uploadStatus: 'Uploaded', uploadDate: '2023-01-10' },
      { documentName: 'Transaction Monitoring Declaration', uploadStatus: 'Uploaded', uploadDate: '2023-01-10' },
      { documentName: 'AML Policy', uploadStatus: 'Pending' } // Missing document
    ]
  },
  
  // Joint account example
  {
    accountNumber: 'JA2150-007-7001',
    accountName: 'David & Mary Lee Joint Account',
    accountType: 'JointAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 35000.00,
    availableBalance: 35000.00,
    openingDate: '2023-04-20',
    lastTransactionDate: '2023-11-29',
    customerBasicNumber: 'BN007', // Primary holder
    isJoint: true,
    jointHolders: ['BN001'], // Secondary holder is John Smith
    accountManager: 'Sarah Johnson',
    branchCode: 'SG-MAIN-01',
    interestRate: 0.03,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: true,
      checkbook: true,
      standinginstructions: false,
      directDebit: true
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-04-20' },
      { documentName: 'Joint Account Declaration', uploadStatus: 'Uploaded', uploadDate: '2023-04-20' },
      { documentName: 'Operating Instructions Mandate', uploadStatus: 'Uploaded', uploadDate: '2023-04-20' }
    ]
  },
  
  // Cayman Wealth Management (Offshore entity in onboarding)
  {
    accountNumber: 'CA2150-008-1001',
    accountName: 'Cayman Wealth Management Operations',
    accountType: 'CurrentAccount',
    status: 'PendingApproval',
    currency: 'USD',
    balance: 0.00,
    availableBalance: 0.00,
    openingDate: '2023-11-25', // Recent application
    lastTransactionDate: '2023-11-25',
    customerBasicNumber: 'BN008',
    isJoint: false,
    accountManager: 'Richard Tan',
    branchCode: 'SG-CBD-01',
    interestRate: 0.01,
    accountFeaturesEnabled: {
      internetBanking: false,
      mobileApp: false,
      debitCard: false,
      checkbook: false,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-11-25' },
      { documentName: 'Board Resolution', uploadStatus: 'Uploaded', uploadDate: '2023-11-25' },
      { documentName: 'Authorized Signatories List', uploadStatus: 'Uploaded', uploadDate: '2023-11-25' },
      { documentName: 'Enhanced Due Diligence Form', uploadStatus: 'Uploaded', uploadDate: '2023-11-25' },
      { documentName: 'Source of Wealth Declaration', uploadStatus: 'Pending' }, // Missing document
      { documentName: 'UBO Screening & Sanctions Check', uploadStatus: 'Pending' } // Missing document
    ]
  },
  
  // Singapore Public Bank Ltd (Regulated entity)
  {
    accountNumber: 'CA2150-009-1001',
    accountName: 'SPB Corporate Account',
    accountType: 'CorporateAccount',
    status: 'Active',
    currency: 'SGD',
    balance: 10000000.00,
    availableBalance: 10000000.00,
    openingDate: '2022-01-05',
    lastTransactionDate: '2023-11-30',
    customerBasicNumber: 'BN009',
    isJoint: false,
    accountManager: 'Elizabeth Koh',
    branchCode: 'SG-CBD-01',
    interestRate: 0.01,
    accountFeaturesEnabled: {
      internetBanking: true,
      mobileApp: true,
      debitCard: false,
      checkbook: true,
      standinginstructions: true,
      directDebit: true
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2022-01-05' },
      { documentName: 'Board Resolution', uploadStatus: 'Uploaded', uploadDate: '2022-01-05' },
      { documentName: 'Regulatory License Copy', uploadStatus: 'Uploaded', uploadDate: '2022-01-05' },
      { documentName: 'Financial Statements', uploadStatus: 'Uploaded', uploadDate: '2022-01-05' }
    ]
  },
  
  // NextGen Technologies (Prospective customer)
  {
    accountNumber: 'CA2150-010-1001',
    accountName: 'NextGen Technologies Operations',
    accountType: 'CurrentAccount',
    status: 'PendingApproval',
    currency: 'SGD',
    balance: 0.00,
    availableBalance: 0.00,
    openingDate: '2023-11-28',
    lastTransactionDate: '2023-11-28',
    customerBasicNumber: 'BN010',
    isJoint: false,
    accountManager: 'Sarah Johnson',
    branchCode: 'SG-MAIN-01',
    interestRate: 0.01,
    accountFeaturesEnabled: {
      internetBanking: false,
      mobileApp: false,
      debitCard: false,
      checkbook: false,
      standinginstructions: false,
      directDebit: false
    },
    documents: [
      { documentName: 'Account Opening Form', uploadStatus: 'Uploaded', uploadDate: '2023-11-28' },
      { documentName: 'Board Resolution', uploadStatus: 'Pending' },
      { documentName: 'Authorized Signatories List', uploadStatus: 'Pending' },
      { documentName: 'Company Mandate', uploadStatus: 'Pending' }
    ]
  }
];