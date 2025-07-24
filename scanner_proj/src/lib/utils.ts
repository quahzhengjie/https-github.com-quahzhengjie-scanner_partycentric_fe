// src/lib/utils.ts - Complete utilities file

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Case, 
  Party, 
  ChecklistSection, 
  ChecklistItem,
  DocumentStatus,
  RiskLevel,
  Address,
  Country,
  DocumentRequirement 
} from './types';
import { documentRequirementsTemplate } from './document-requirements';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency: string = 'SGD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatAddress(address: Address): string {
  const parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts.push(address.city);
  if (address.state) parts.push(address.state);
  parts.push(address.postalCode);
  parts.push(getCountryName(address.country));
  
  return parts.join(', ');
}

export function getCountryName(countryCode: Country): string {
  const countries: Record<string, string> = {
    'SG': 'Singapore',
    'US': 'United States',
    'CN': 'China',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'TH': 'Thailand',
    'HK': 'Hong Kong',
    'JP': 'Japan',
    'AU': 'Australia',
    'GB': 'United Kingdom',
    'CH': 'Switzerland',
    'AE': 'United Arab Emirates',
  };
  return countries[countryCode] || countryCode;
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    'Low': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    'Medium': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    'High': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    'Critical': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  };
  return colors[level];
}

export function getStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    'Missing': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    'Pending Checker Verification': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    'Pending Compliance Verification': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    'Verified': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    'Rejected': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    'Expired': 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  };
  return colors[status];
}

export function isDocumentExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function generateChecklist(caseData: Case, allParties: Party[]): ChecklistSection[] {
  const sections: ChecklistSection[] = [];
  const { entityData, relatedPartyLinks, riskLevel, documentLinks } = caseData;
  
  const createItem = (req: DocumentRequirement, id: string, ownerPartyId: string): ChecklistItem => {
    const link = documentLinks.find(l => l.requirementId === id);
    const latestSubmission = link?.submissions?.[link.submissions.length - 1];
    
    // Check if document is expired
    let status: DocumentStatus = latestSubmission ? latestSubmission.status : 'Missing';
    if (status === 'Verified' && latestSubmission?.expiryDate && isDocumentExpired(latestSubmission.expiryDate)) {
      status = 'Expired';
    }
    
    return {
      ...req,
      id,
      ownerPartyId,
      category: 'Other', // Default category without 'as const'
      status,
      submissions: link ? link.submissions : [],
      lastSubmissionDate: latestSubmission?.submittedAt,
      priority: req.required ? 'High' : 'Normal'
    };
  };

  // Entity Documents
  const entityDocs: ChecklistItem[] = [];
  const entityTemplate = documentRequirementsTemplate.entityTemplates[entityData.entityType as keyof typeof documentRequirementsTemplate.entityTemplates];
  if (entityTemplate) {
    entityTemplate.forEach((req, i) => {
      entityDocs.push(createItem(req, `req-entity-${i}`, 'ENTITY'));
    });
  }
  
 // Bank Forms
 const forms = entityData.entityType === 'Individual Account' 
 ? documentRequirementsTemplate.bankFormTemplates.individualStakeholder
 : documentRequirementsTemplate.bankFormTemplates.corporateMandatory;

forms.forEach((name, i) => {
 entityDocs.push(createItem({ 
   name, 
   category: 'Corporate', // Add the required category field
   required: true
 }, `req-forms-${i}`, 'ENTITY'));
});

  // Risk-based Documents
  const riskDocs = documentRequirementsTemplate.riskBasedDocuments[riskLevel as keyof typeof documentRequirementsTemplate.riskBasedDocuments];
  if (riskDocs) {
    riskDocs.forEach((req, i) => {
      entityDocs.push(createItem(req, `req-risk-${i}`, 'ENTITY'));
    });
  }
  
  if (entityDocs.length > 0) {
    const completed = entityDocs.filter(item => ['Verified', 'Pending Compliance Verification', 'Pending Checker Verification'].includes(item.status)).length;
    sections.push({ 
      title: `${entityData.entityName} (Entity Docs)`,
      description: 'Corporate and entity-level documentation',
      items: entityDocs,
      completionPercentage: entityDocs.length > 0 ? (completed / entityDocs.length) * 100 : 0,
      isMandatory: true
    });
  }

  // Party Documents
  relatedPartyLinks.forEach(link => {
    const partyInfo = allParties.find(p => p.partyId === link.partyId);
    if (!partyInfo) return;
    
    const partyDocs: ChecklistItem[] = [];
    const individualTemplate = partyInfo.residencyStatus 
      ? documentRequirementsTemplate.individualTemplates[partyInfo.residencyStatus as keyof typeof documentRequirementsTemplate.individualTemplates]
      : [];
      
    if (individualTemplate) {
      individualTemplate.forEach((req, i) => {
        partyDocs.push(createItem(req, `req-party-${partyInfo.partyId}-${i}`, partyInfo.partyId));
      });
    }
    
     // Add financial documents for high-risk parties
     if (partyInfo.isPEP || (partyInfo.riskScore !== undefined && partyInfo.riskScore > 50)) {
      partyDocs.push(createItem({
        name: 'Source of Wealth Declaration',
        category: 'Financial', // Add the required category field
        required: true,
        description: 'Required for high-risk individuals'
      }, `req-party-${partyInfo.partyId}-sow`, partyInfo.partyId));
    }
    
    if (partyDocs.length > 0) {
      const completed = partyDocs.filter(item => ['Verified', 'Pending Compliance Verification', 'Pending Checker Verification'].includes(item.status)).length;
      sections.push({ 
        title: `${partyInfo.name} (${link.relationshipType})`,
        description: link.isPrimary ? 'Primary party documentation' : 'Related party documentation',
        items: partyDocs,
        completionPercentage: partyDocs.length > 0 ? (completed / partyDocs.length) * 100 : 0,
        isMandatory: link.isPrimary || false
      });
    }
  });
  
  // Account-specific forms (if accounts exist)
  caseData.accounts.forEach(account => {
    const accountDocs: ChecklistItem[] = [];
    documentRequirementsTemplate.accountOpeningForms.forEach((req, i) => {
      accountDocs.push(createItem(req, `req-acct-${account.accountId}-${i}`, 'ENTITY'));
    });
    
    if (accountDocs.length > 0) {
      const completed = accountDocs.filter(item => ['Verified', 'Pending Compliance Verification', 'Pending Checker Verification'].includes(item.status)).length;
      sections.push({
        title: `Account Forms - ${account.accountType} (${account.currency})`,
        description: `Documentation for account ${account.accountNumber || 'Pending'}`,
        items: accountDocs,
        completionPercentage: accountDocs.length > 0 ? (completed / accountDocs.length) * 100 : 0,
        isMandatory: true
      });
    }
  });
  
  return sections;
}

export function getCaseProgress(caseData: Case, userRole: string): number {
  const checklist = generateChecklist(caseData, []);
  const requiredItems = checklist.flatMap(s => s.items).filter(i => i.required);
  
  if (requiredItems.length === 0) return 100;
  
  let completedItems = 0;
  if (userRole === 'RM') {
    // For RM, "complete" means submitted (any pending or verified status)
    completedItems = requiredItems.filter(
      item => item.status !== 'Missing' && item.status !== 'Rejected'
    ).length;
  } else {
    // For reviewers, "complete" means fully verified by compliance
    completedItems = requiredItems.filter(
      item => item.status === 'Verified'
    ).length;
  }
  
  return (completedItems / requiredItems.length) * 100;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(past);
}