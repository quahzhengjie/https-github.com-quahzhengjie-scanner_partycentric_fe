// src/components/cases/case-actions.tsx

'use client';

import { useMemo } from 'react';
import { Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Case, Party, CaseStatus, RiskLevel } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { generateChecklist } from '@/lib/utils';

interface CaseActionsProps {
  caseData: Case;
  allParties: Party[];
  onCaseAction: (newStatus: CaseStatus, actionText: string, newRisk?: RiskLevel) => void;
}

export function CaseActions({ caseData, allParties, onCaseAction }: CaseActionsProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const mainChecklistItems = useMemo(() => {
    const checklist = generateChecklist(caseData, allParties);
    return checklist.filter(sec => !sec.title.startsWith('Account Forms')).flatMap(sec => sec.items);
  }, [caseData, allParties]);

  const isSubmittable = mainChecklistItems.every(
    item => !item.required || item.status === 'Pending Checker Verification' || 
    item.status === 'Pending Compliance Verification' || item.status === 'Verified'
  );

  if (!currentUser) {
    return <p className="text-sm text-center text-slate-500 dark:text-slate-400">Please log in to see actions</p>;
  }

  if (currentUser.role === 'RM' && caseData.status === 'Draft') {
    return (
      <div className="space-y-3">
        <button
          onClick={() => onCaseAction('Pending Checker Review', 'Submitted KYC for Checker Review')}
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
          onClick={() => onCaseAction('Pending Compliance Review', 'Checker Approved')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <CheckCircle size={16} />
          Approve
        </button>
        <button
          onClick={() => onCaseAction('Draft', 'Checker Rejected')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600"
        >
          <XCircle size={16} />
          Reject
        </button>
      </div>
    );
  }

  if (currentUser.role === 'Compliance' && caseData.status === 'Pending Compliance Review') {
    const approvalStatus = caseData.riskLevel === 'High' || caseData.riskLevel === 'Critical' 
      ? 'Pending GM Approval' 
      : 'Approved';
    
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onCaseAction(approvalStatus, 'Compliance Approved')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-transparent shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle size={16} />
            Approve KYC
          </button>
          <button
            onClick={() => onCaseAction('Draft', 'Compliance Rejected')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600"
          >
            <XCircle size={16} />
            Reject KYC
          </button>
        </div>
        <button
          onClick={() => onCaseAction('Draft', 'Case Escalated to High Risk', 'High')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-transparent shadow-sm text-white bg-orange-500 hover:bg-orange-600"
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
          onClick={() => onCaseAction('Approved', 'GM Final Approved')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-transparent shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <CheckCircle size={16} />
          Final Approve Case
        </button>
        <button
          onClick={() => onCaseAction('Draft', 'Case Rejected by GM')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600"
        >
          <XCircle size={16} />
          Reject Case
        </button>
      </div>
    );
  }

  return (
    <p className="text-sm text-center text-slate-500 dark:text-slate-400">
      No KYC actions available for your role or current case status.
    </p>
  );
}