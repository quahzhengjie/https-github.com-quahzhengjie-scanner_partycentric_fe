// types/accountTypes.ts
export type AccountType = 
  | "SavingsAccount"
  | "CurrentAccount" 
  | "FixedDeposit"
  | "CallDeposit"
  | "InvestmentAccount"
  | "TrustAccount"
  | "CorporateAccount"
  | "JointAccount"
  | "CustodianAccount"
  | "ForeignCurrencyAccount";

export type AccountStatus = 
  | "Active"
  | "Dormant"
  | "Frozen"
  | "Closed"
  | "PendingApproval";

export type CurrencyCode = 
  | "SGD"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "HKD"
  | "CHF"
  | "CNY";

export type DocumentCategory = 
  | "KYC"
  | "Financial"
  | "Legal"
  | "Identification"
  | "Tax"
  | "Account"
  | "Correspondence";

export interface AccountRequirement {
  documentName: string;
  isRequired: boolean;
  category: string;
}

export interface AccountTypeDetails {
  name: string;
  description: string;
  minimumBalance: number;
  maintenanceFee: number;
  interestRate: number;
  isOfferedToIndividuals: boolean;
  isOfferedToCorporates: boolean;
  currenciesSupported: CurrencyCode[];
  documentRequirements: AccountRequirement[];
  features: string[];
}

// Define standard account requirements that can be shared
export const standardAccountRequirements: AccountRequirement[] = [
  { documentName: "Account Opening Form", isRequired: true, category: "Account" },
  { documentName: "Signature Specimen", isRequired: true, category: "Account" }
];

export const individualRequirements: AccountRequirement[] = [
  ...standardAccountRequirements,
  { documentName: "Proof of Income", isRequired: true, category: "Financial" },
  { documentName: "Tax Self-Declaration", isRequired: true, category: "Tax" }
];

export const corporateRequirements: AccountRequirement[] = [
  ...standardAccountRequirements,
  { documentName: "Board Resolution", isRequired: true, category: "Legal" },
  { documentName: "Company Mandate", isRequired: true, category: "Legal" },
  { documentName: "Authorized Signatories List", isRequired: true, category: "Legal" },
  { documentName: "Beneficial Ownership Declaration", isRequired: true, category: "Identification" }
];

export const highValueAccountRequirements: AccountRequirement[] = [
  ...standardAccountRequirements,
  { documentName: "Source of Wealth Declaration", isRequired: true, category: "Financial" },
  { documentName: "Enhanced Due Diligence Form", isRequired: true, category: "KYC" },
  { documentName: "Risk Profile Questionnaire", isRequired: true, category: "Financial" }
];

// Mock account type details
export const accountTypeDetails: Record<AccountType, AccountTypeDetails> = {
  SavingsAccount: {
    name: "Savings Account",
    description: "Basic account for saving money with interest earnings",
    minimumBalance: 500,
    maintenanceFee: 2,
    interestRate: 0.05,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: false,
    currenciesSupported: ["SGD", "USD"],
    documentRequirements: individualRequirements,
    features: [
      "Monthly interest payments",
      "ATM access",
      "Mobile banking",
      "Standing instructions"
    ]
  },
  CurrentAccount: {
    name: "Current Account",
    description: "Everyday banking account for transactions with checkbook",
    minimumBalance: 1000,
    maintenanceFee: 5,
    interestRate: 0.01,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "EUR"],
    documentRequirements: [
      ...standardAccountRequirements,
      { documentName: "Proof of Address", isRequired: true, category: "Identification" },
      { documentName: "Checkbook Request Form", isRequired: false, category: "Account" }
    ],
    features: [
      "Unlimited transactions",
      "Checkbook facility",
      "Overdraft protection (subject to approval)",
      "Bill payment services"
    ]
  },
  FixedDeposit: {
    name: "Fixed Deposit",
    description: "Term deposit with higher interest rates for fixed periods",
    minimumBalance: 5000,
    maintenanceFee: 0,
    interestRate: 0.5,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "EUR", "GBP", "AUD"],
    documentRequirements: [
      ...standardAccountRequirements,
      { documentName: "Term Instruction Form", isRequired: true, category: "Account" }
    ],
    features: [
      "Higher interest rates",
      "Flexible tenures (1/3/6/12/24 months)",
      "Auto-renewal option",
      "Premature withdrawal (subject to penalties)"
    ]
  },
  CallDeposit: {
    name: "Call Deposit",
    description: "Short-term deposit with higher liquidity than fixed deposits",
    minimumBalance: 10000,
    maintenanceFee: 0,
    interestRate: 0.3,
    isOfferedToIndividuals: false,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "EUR"],
    documentRequirements: corporateRequirements,
    features: [
      "24-hour call notice",
      "Higher interest than current accounts",
      "Flexible withdrawal",
      "Corporate treasury management"
    ]
  },
  InvestmentAccount: {
    name: "Investment Account",
    description: "Account for securities trading and investment activities",
    minimumBalance: 20000,
    maintenanceFee: 10,
    interestRate: 0,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "EUR", "GBP", "JPY", "HKD", "CNY"],
    documentRequirements: [
      ...highValueAccountRequirements,
      { documentName: "Investment Risk Disclosure", isRequired: true, category: "Legal" },
      { documentName: "Investment Objectives Form", isRequired: true, category: "Financial" }
    ],
    features: [
      "Securities trading",
      "Portfolio management",
      "Investment advisory",
      "Margin facility",
      "Global market access"
    ]
  },
  TrustAccount: {
    name: "Trust Account",
    description: "Account held by trustees for beneficiaries",
    minimumBalance: 25000,
    maintenanceFee: 15,
    interestRate: 0.02,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "GBP"],
    documentRequirements: [
      ...standardAccountRequirements,
      { documentName: "Trust Deed", isRequired: true, category: "Legal" },
      { documentName: "Trustee Declaration", isRequired: true, category: "Legal" },
      { documentName: "Beneficiary Information", isRequired: true, category: "Identification" }
    ],
    features: [
      "Segregation of trust assets",
      "Multi-beneficiary management",
      "Periodic reporting",
      "Trustee administration tools"
    ]
  },
  CorporateAccount: {
    name: "Corporate Account",
    description: "Specialized business account with advanced treasury features",
    minimumBalance: 50000,
    maintenanceFee: 25,
    interestRate: 0.01,
    isOfferedToIndividuals: false,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "EUR", "GBP", "JPY", "AUD", "HKD", "CHF", "CNY"],
    documentRequirements: [
      ...corporateRequirements,
      { documentName: "Business Plan", isRequired: false, category: "Financial" },
      { documentName: "Financial Statements", isRequired: true, category: "Financial" },
      { documentName: "Corporate Structure Chart", isRequired: true, category: "Identification" }
    ],
    features: [
      "Multi-user access with authorization levels",
      "Bulk payment processing",
      "Integrated invoice management",
      "Trade finance solutions",
      "API banking integration",
      "Virtual account numbers"
    ]
  },
  JointAccount: {
    name: "Joint Account",
    description: "Account shared between two or more individuals",
    minimumBalance: 1000,
    maintenanceFee: 3,
    interestRate: 0.03,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: false,
    currenciesSupported: ["SGD", "USD"],
    documentRequirements: [
      ...individualRequirements,
      { documentName: "Joint Account Declaration", isRequired: true, category: "Legal" },
      { documentName: "Operating Instructions Mandate", isRequired: true, category: "Account" }
    ],
    features: [
      "Shared access",
      "Either/Both to sign options",
      "Survivorship rights",
      "Multiple debit cards"
    ]
  },
  CustodianAccount: {
    name: "Custodian Account",
    description: "Account for safekeeping of securities and assets",
    minimumBalance: 100000,
    maintenanceFee: 50,
    interestRate: 0,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: true,
    currenciesSupported: ["SGD", "USD", "EUR", "GBP", "JPY", "AUD", "HKD", "CHF", "CNY"],
    documentRequirements: [
      ...highValueAccountRequirements,
      { documentName: "Custodian Agreement", isRequired: true, category: "Legal" },
      { documentName: "Asset Transfer Instructions", isRequired: true, category: "Account" }
    ],
    features: [
      "Asset safekeeping",
      "Corporate actions handling",
      "Income collection",
      "Proxy voting services",
      "Tax reclamation",
      "Regular valuation reports"
    ]
  },
  ForeignCurrencyAccount: {
    name: "Foreign Currency Account",
    description: "Account for holding and transacting in foreign currencies",
    minimumBalance: 5000,
    maintenanceFee: 10,
    interestRate: 0.01,
    isOfferedToIndividuals: true,
    isOfferedToCorporates: true,
    currenciesSupported: ["USD", "EUR", "GBP", "JPY", "AUD", "HKD", "CHF", "CNY"],
    documentRequirements: [
      ...standardAccountRequirements,
      { documentName: "Foreign Exchange Declaration", isRequired: true, category: "Legal" },
      { documentName: "Currency Purpose Statement", isRequired: false, category: "Financial" }
    ],
    features: [
      "Multi-currency holdings",
      "Foreign exchange services",
      "International payments",
      "Currency conversion",
      "FX rate alerts"
    ]
  }
};