// src/components/ui/badges.tsx

import { cn } from '@/lib/utils';
import { DocumentStatus, CaseStatus, AccountStatus, RiskLevel } from '@/lib/types';

interface BadgeProps {
  className?: string;
}

export function DocumentStatusBadge({ 
  status, 
  className 
}: BadgeProps & { status: DocumentStatus }) {
  const styles: Record<DocumentStatus, string> = {
    Missing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'Pending Checker Verification': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Pending Compliance Verification': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Expired: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      styles[status],
      className
    )}>
      {status}
    </span>
  );
}

export function RiskBadge({ 
  level, 
  className 
}: BadgeProps & { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Critical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  };
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      styles[level],
      className
    )}>
      {level} Risk
    </span>
  );
}

export function StatusBadge({ 
  status, 
  className 
}: BadgeProps & { status: CaseStatus | AccountStatus }) {
  const statusColors: Record<CaseStatus | AccountStatus, string> = {
    Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    'Pending Checker Review': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Pending Compliance Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Pending GM Approval': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Active: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    Proposed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    Dormant: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      statusColors[status],
      className
    )}>
      {status}
    </span>
  );
}