// src/components/common/DocStatusBadge.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { DocumentStatus } from '@/lib/types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileX2 
} from 'lucide-react';

// Define the shape of the configuration object for each badge style
interface BadgeStyle {
  bg: string;
  text: string;
  icon: React.ElementType;
}

// Define the styles for each document status
const badgeStyles: Record<DocumentStatus, BadgeStyle> = {
  'Missing': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    icon: FileX2
  },
  'Pending Checker Verification': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: Clock
  },
  'Pending Compliance Verification': {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    icon: Clock
  },
  'Verified': {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    icon: CheckCircle
  },
  'Rejected': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    icon: XCircle
  },
  'Expired': {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    icon: AlertCircle
  }
};

interface DocStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
  showIcon?: boolean;
}

export function DocStatusBadge({ 
  status, 
  className,
  showIcon = true 
}: DocStatusBadgeProps) {
  const style = badgeStyles[status];
  const Icon = style.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
      style.bg,
      style.text,
      className
    )}>
      {showIcon && <Icon className="h-3 w-3" />}
      {status}
    </span>
  );
}