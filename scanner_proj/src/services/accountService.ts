// services/accountService.ts
import { mockAccounts, Account } from '@/mockData/mockAccounts';
import { AccountType, AccountStatus, accountTypeDetails } from '@/types/accountTypes';

// Create a mutable copy of the accounts data
//accounts' is never reassigned. Use 'const' instead.
const accounts: Account[] = [...mockAccounts];

export const AccountService = {
  // Get all accounts
  getAllAccounts: (): Account[] => {
    return [...accounts];
  },

  // Get account by account number
  getAccountByNumber: (accountNumber: string): Account | undefined => {
    return accounts.find(account => account.accountNumber === accountNumber);
  },

  // Get accounts for a specific customer
  getAccountsByCustomerNumber: (basicNumber: string): Account[] => {
    // Include both primary accounts and joint accounts where the customer is a secondary holder
    return accounts.filter(account => 
      account.customerBasicNumber === basicNumber || 
      (account.isJoint && account.jointHolders?.includes(basicNumber))
    );
  },

  // Get account types and details
  getAccountTypeDetails: (accountType: AccountType) => {
    return accountTypeDetails[accountType];
  },

  // Get all account type options for dropdown selection
  getAccountTypeOptions: () => {
    return Object.keys(accountTypeDetails).map(type => ({
      value: type,
      label: accountTypeDetails[type as AccountType].name
    }));
  },

  // Create a new account
// Then in your createAccount method, use the service instead of directly accessing accountTypeDetails
createAccount: (account: Omit<Account, 'accountNumber'>): Account => {
  // Generate a new account number based on type
  const prefix = account.accountType.substring(0, 2).toUpperCase();
  const lastAccountNum = accounts
    .filter(a => a.accountNumber.startsWith(prefix))
    .map(a => parseInt(a.accountNumber.split('-')[2]))
    .reduce((max, num) => Math.max(max, num), 1000);
  
  const newAccountNumber = `${prefix}2150-${account.customerBasicNumber.replace('BN', '').padStart(3, '0')}-${lastAccountNum + 1}`;
  
  // Use DocumentRequirementsService to get the required documents
  const requiredDocuments = accountTypeDetails[account.accountType].documentRequirements.map(req => ({
    documentName: req.documentName,
    uploadStatus: 'Pending' as 'Pending' | 'Uploaded',
    category: req.category
  }));
  
  const newAccount: Account = {
    ...account,
    accountNumber: newAccountNumber,
    documents: requiredDocuments
  };
  
  accounts.push(newAccount);
  return newAccount;
},

  // Update an existing account
  updateAccount: (accountNumber: string, updates: Partial<Account>): Account | undefined => {
    const index = accounts.findIndex(acc => acc.accountNumber === accountNumber);
    
    if (index === -1) return undefined;
    
    accounts[index] = {
      ...accounts[index],
      ...updates
    };
    
    return accounts[index];
  },

  // Change account status
  changeAccountStatus: (accountNumber: string, newStatus: AccountStatus): Account | undefined => {
    return AccountService.updateAccount(accountNumber, { status: newStatus });
  },

  // Get accounts by status
  getAccountsByStatus: (status: AccountStatus): Account[] => {
    return accounts.filter(account => account.status === status);
  },

  // Update account document status
  updateAccountDocument: (
    accountNumber: string,
    documentName: string,
    uploadStatus: 'Pending' | 'Uploaded',
    uploadDate?: string
  ): Account | undefined => {
    const account = accounts.find(acc => acc.accountNumber === accountNumber);
    
    if (!account) return undefined;
    
    // Find the document index
    const docIndex = account.documents.findIndex(doc => doc.documentName === documentName);
    
    if (docIndex === -1) {
      // Document doesn't exist, add it
      account.documents.push({
        documentName,
        uploadStatus,
        uploadDate
      });
    } else {
      // Update existing document
      account.documents[docIndex] = {
        ...account.documents[docIndex],
        uploadStatus,
        uploadDate
      };
    }
    
    return account;
  },

  // Check if an account has all required documents
  hasAllRequiredDocuments: (accountNumber: string): boolean => {
    const account = accounts.find(acc => acc.accountNumber === accountNumber);
    if (!account) return false;
    
    const accountType = account.accountType;
    const accountDetails = accountTypeDetails[accountType];
    
    // Get all required documents for this account type
    const requiredDocs = accountDetails.documentRequirements
      .filter(doc => doc.isRequired)
      .map(doc => doc.documentName);
    
    // Check if all required documents are uploaded
    return requiredDocs.every(docName => 
      account.documents.some(doc => 
        doc.documentName === docName && doc.uploadStatus === 'Uploaded'
      )
    );
  },

  // Get missing documents for an account
  getMissingDocuments: (accountNumber: string): string[] => {
    const account = accounts.find(acc => acc.accountNumber === accountNumber);
    if (!account) return [];
    
    const accountType = account.accountType;
    const accountDetails = accountTypeDetails[accountType];
    
    // Get all required documents for this account type
    const requiredDocs = accountDetails.documentRequirements
      .filter(doc => doc.isRequired)
      .map(doc => doc.documentName);
    
    // Filter for documents that aren't uploaded
    return requiredDocs.filter(docName => 
      !account.documents.some(doc => 
        doc.documentName === docName && doc.uploadStatus === 'Uploaded'
      )
    );
  },

  // Generate account summary statistics
  getAccountSummary: () => {
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(a => a.status === 'Active').length;
    const pendingAccounts = accounts.filter(a => a.status === 'PendingApproval').length;
    const frozenAccounts = accounts.filter(a => a.status === 'Frozen').length;
    const dormantAccounts = accounts.filter(a => a.status === 'Dormant').length;
    const closedAccounts = accounts.filter(a => a.status === 'Closed').length;
    
    // Calculate total balances by currency
    const balancesByCurrency: Record<string, number> = {};
    accounts.forEach(account => {
      if (account.status !== 'Closed') {
        const currKey = account.currency;
        balancesByCurrency[currKey] = (balancesByCurrency[currKey] || 0) + account.balance;
      }
    });
    
    // Calculate account types distribution
    const accountTypeDistribution: Record<string, number> = {};
    accounts.forEach(account => {
      accountTypeDistribution[account.accountType] = 
        (accountTypeDistribution[account.accountType] || 0) + 1;
    });
    
    return {
      totalAccounts,
      activeAccounts,
      pendingAccounts,
      frozenAccounts,
      dormantAccounts,
      closedAccounts,
      balancesByCurrency,
      accountTypeDistribution
    };
  }
};