// src/components/cases/case-detail-components.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Send,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  Case,
  Party,
  CasePartyLink,
  ChecklistSection,
  CaseStatus
} from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { documentRequirementsTemplate } from '@/lib/document-requirements';

interface PartiesListProps {
  parties: (Party & CasePartyLink)[];
  onLinkParty: () => void;
  entityType: string;
}

export function PartiesList({ parties, onLinkParty, entityType }: PartiesListProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  const router = useRouter();
  
  const handleSelectParty = (partyId: string) => {
    router.push(`/parties/${partyId}`);
  };

  return (
    <div className={cn(
      'p-5 rounded-lg border shadow-sm',
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={cn(
          'text-lg font-semibold',
          darkMode ? 'text-slate-100' : 'text-slate-900'
        )}>
          Related Parties
        </h3>
        <button
          onClick={onLinkParty}
          disabled={entityType === 'Individual Account'}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed disabled:no-underline"
        >
          <UserPlus size={14} />
          Link
        </button>
      </div>
      
      <ul className={cn(
        'divide-y',
        darkMode ? 'divide-slate-700' : 'divide-slate-200'
      )}>
        {parties.map(p => (
          <li key={p.partyId} className="py-3">
            <button
              onClick={() => handleSelectParty(p.partyId)}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {p.name}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {p.relationshipType}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CaseActionsProps {
  caseData: Case;
  checklist: ChecklistSection[];
  onAction: (status: CaseStatus, action: string, risk?: 'High') => void;
}

export function CaseActions({ caseData, checklist, onAction }: CaseActionsProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const darkMode = useUIStore((state) => state.darkMode);
  
  const mainChecklistItems = useMemo(() => 
    checklist.filter(sec => !sec.title.startsWith('Account Forms')).flatMap(sec => sec.items),
    [checklist]
  );

  const isSubmittable = mainChecklistItems.every(item => 
    !item.required || ['Pending Checker Verification', 'Pending Compliance Verification', 'Verified'].includes(item.status)
  );

  const renderActions = () => {
    if (!currentUser) return null;

    if (currentUser.role === 'RM' && caseData.status === 'Draft') {
      return (
        <div className="space-y-3">
          <button
            onClick={() => onAction('Pending Checker Review', 'Submitted KYC for Checker Review')}
            disabled={!isSubmittable}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            Submit for Checker Review
          </button>
          {!isSubmittable && (
            <div className="text-xs text-center text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              All required entity & party documents must be submitted before review.
            </div>
          )}
        </div>
      );
    }

    if (currentUser.role === 'Checker' && caseData.status === 'Pending Checker Review') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('Pending Compliance Review', 'Checker Approved')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle size={16} />
            Approve
          </button>
          <button
            onClick={() => onAction('Draft', 'Checker Rejected')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600"
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      );
    }

    if (currentUser.role === 'Compliance' && caseData.status === 'Pending Compliance Review') {
      const approvalStatus = caseData.riskLevel === 'High' ? 'Pending GM Approval' : 'Approved';
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onAction(approvalStatus, 'Compliance Approved')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} />
              Approve KYC
            </button>
            <button
              onClick={() => onAction('Draft', 'Compliance Rejected')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600"
            >
              <XCircle size={16} />
              Reject KYC
            </button>
          </div>
          <button
            onClick={() => onAction('Draft', 'Case Escalated to High Risk', 'High')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-orange-500 hover:bg-orange-600"
          >
            <AlertTriangle size={16} />
            Escalate to High Risk
          </button>
        </div>
      );
    }

    if (currentUser.role === 'GM' && caseData.status === 'Pending GM Approval') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('Approved', 'GM Final Approved')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle size={16} />
            Final Approve
          </button>
          <button
            onClick={() => onAction('Draft', 'Case Rejected by GM')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600"
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      );
    }

    return <p className="text-sm text-center text-slate-500 dark:text-slate-400">
      No KYC actions available for your role or current case status.
    </p>;
  };

  return (
    <div className={cn(
      'p-5 rounded-lg border shadow-sm',
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    )}>
      <h3 className={cn(
        'text-lg font-semibold mb-4',
        darkMode ? 'text-slate-100' : 'text-slate-900'
      )}>
        Case Actions
      </h3>
      {renderActions()}
    </div>
  );
}

interface LinkPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (partyId: string, role: string) => void;
  masterList: Party[];
  currentPartyIds: string[];
  entityType: string;
}

export function LinkPartyModal({ 
  isOpen, 
  onClose, 
  onLink, 
  masterList, 
  currentPartyIds, 
  entityType 
}: LinkPartyModalProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  const validRoles = documentRequirementsTemplate.entityRoleMapping[
    entityType as keyof typeof documentRequirementsTemplate.entityRoleMapping
  ] || [];
  
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [role, setRole] = useState(validRoles[0] || '');
  
  const availableParties = masterList.filter(p => !currentPartyIds.includes(p.partyId));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className={cn(
        'rounded-lg shadow-xl p-6 w-full max-w-lg',
        darkMode ? 'bg-slate-800' : 'bg-white'
      )}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={cn(
            'text-xl font-bold',
            darkMode ? 'text-white' : 'text-slate-900'
          )}>
            Link Related Party
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'p-1 rounded-full',
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(
              'block text-sm font-medium',
              darkMode ? 'text-slate-300' : 'text-slate-700'
            )}>
              Party
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'
              )}
            >
              <option value="">Select a party...</option>
              {availableParties.map(p => (
                <option key={p.partyId} value={p.partyId}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={cn(
              'block text-sm font-medium',
              darkMode ? 'text-slate-300' : 'text-slate-700'
            )}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'
              )}
            >
              {validRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border',
              darkMode 
                ? 'border-slate-600 hover:bg-slate-700 text-white' 
                : 'border-slate-300 hover:bg-slate-100'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedPartyId}
            onClick={() => {
              onLink(selectedPartyId, role);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
          >
            Link Party
          </button>
        </div>
      </div>
    </div>
  );
}