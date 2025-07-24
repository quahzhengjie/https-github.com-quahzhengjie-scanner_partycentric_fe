// src/components/cases/case-detail-tabs.tsx

'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Download,
  PlusCircle,
  ShieldCheck,
  Banknote,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Case,
  Party,
  ChecklistSection,
  ChecklistItem,
  ActivityLog,
  Account,
  CasePartyLink,
  ApprovalSnapshot
} from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { generateChecklist, cn, formatDateTime, formatAddress } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusBadge, DocumentStatusBadge } from '@/components/ui/badges';
import { EmptyState } from '@/components/common/empty-state';
import { documentRequirementsTemplate } from '@/lib/document-requirements';

interface ChecklistTabProps {
  caseData: Case;
  allParties: Party[];
  onSelectItem: (item: ChecklistItem) => void;
}

export function ChecklistTab({ caseData, allParties, onSelectItem }: ChecklistTabProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState('');
  const currentUser = useAuthStore((state) => state.currentUser);
  const darkMode = useUIStore((state) => state.darkMode);

  const handleToggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleAction = (action: string) => {
    setActionMessage(`${action} documents...`);
    setTimeout(() => setActionMessage(''), 2000);
  };

  const mainChecklist = useMemo(() => {
    const checklist = generateChecklist(caseData, allParties);
    return checklist.filter(sec => !sec.title.startsWith('Account Forms'));
  }, [caseData, allParties]);

  const requiredItems = mainChecklist.flatMap(s => s.items).filter(i => i.required);
  const totalItems = requiredItems.length;
  
  let completedItems = 0;
  if (currentUser?.role === 'RM') {
    completedItems = requiredItems.filter(item => item.status !== 'Missing' && item.status !== 'Rejected').length;
  } else {
    completedItems = requiredItems.filter(item => item.status === 'Verified').length;
  }
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn(
          'text-xl font-semibold',
          darkMode ? 'text-slate-200' : 'text-slate-800'
        )}>
          KYC & Party Checklist
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAction('Emailing')} 
            disabled={selectedItems.size === 0} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Mail size={14}/> Email
          </button>
          <button 
            onClick={() => handleAction('Downloading selected')} 
            disabled={selectedItems.size === 0} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Download size={14}/> Download Selected
          </button>
          <button 
            onClick={() => handleAction('Downloading all')} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Download size={14}/> Download All
          </button>
        </div>
      </div>
      
      {actionMessage && (
        <div className="p-2 text-sm text-center bg-blue-100 text-blue-800 rounded-md">
          {actionMessage}
        </div>
      )}
      
      {/* Progress section with custom title */}
      <div>
        <div className="flex justify-between mb-1">
          <span className={cn(
            'text-xs font-medium',
            darkMode ? 'text-slate-300' : 'text-slate-600'
          )}>
            {currentUser?.role === 'RM' ? 'Document Collection Progress' : 'Document Verification Progress'}
          </span>
          <span className={cn(
            'text-sm font-semibold',
            darkMode ? 'text-white' : 'text-slate-800'
          )}>
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar 
          progress={progress} 
          size="md"
        />
      </div>
      
      <div className="space-y-4">
        {mainChecklist.map((section, index) => (
          <ChecklistSectionComponent 
            key={index} 
            section={section} 
            darkMode={darkMode} 
            selectedItems={selectedItems} 
            onToggleSelection={handleToggleSelection}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}

interface ChecklistSectionComponentProps {
  section: ChecklistSection;
  darkMode: boolean;
  selectedItems: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onSelectItem: (item: ChecklistItem) => void;
}

function ChecklistSectionComponent({
  section,
  darkMode,
  selectedItems,
  onToggleSelection,
  onSelectItem
}: ChecklistSectionComponentProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      darkMode ? 'border-slate-700' : 'border-slate-200'
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex justify-between items-center p-4',
          darkMode ? 'bg-slate-800' : 'bg-slate-50'
        )}
      >
        <h4 className={cn(
          'font-semibold',
          darkMode ? 'text-slate-200' : 'text-slate-800'
        )}>
          {section.title}
        </h4>
        {isOpen ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
      </button>
      {isOpen && (
        <ul className={cn(
          'divide-y',
          darkMode ? 'divide-slate-700' : 'divide-slate-200'
        )}>
          {section.items.map((item) => (
            <ChecklistItemComponent
              key={item.id}
              item={item}
              darkMode={darkMode}
              onSelect={onSelectItem}
              isSelected={selectedItems.has(item.id)}
              onToggleSelect={onToggleSelection}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  darkMode: boolean;
  onSelect: (item: ChecklistItem) => void;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
}

function ChecklistItemComponent({
  item,
  darkMode,
  onSelect,
  isSelected,
  onToggleSelect
}: ChecklistItemComponentProps) {
  return (
    <li className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect(item.id);
        }}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="flex-grow cursor-pointer" onClick={() => onSelect(item)}>
        <div className="flex justify-between items-start">
          <div>
            <p className={cn(
              'font-medium',
              darkMode ? 'text-white' : 'text-slate-900'
            )}>
              {item.name}
            </p>
            {item.description && (
              <p className={cn(
                'text-xs mt-1',
                darkMode ? 'text-slate-400' : 'text-slate-500'
              )}>
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <DocumentStatusBadge status={item.status} />
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>
    </li>
  );
}

interface AccountsTabProps {
  caseData: Case;
  caseParties: (Party & CasePartyLink)[];
  onProposeClick: () => void;
  onSelectItem: (item: ChecklistItem) => void;
  onUpdateAccountStatus: (accountId: string, status: string) => Promise<void>;
}

export function AccountsTab({
  caseData,
  caseParties,
  onProposeClick,
  onSelectItem,
  onUpdateAccountStatus
}: AccountsTabProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={cn(
          'text-xl font-semibold',
          darkMode ? 'text-slate-200' : 'text-slate-800'
        )}>
          Accounts & Signatories
        </h3>
        <button
          onClick={onProposeClick}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle size={16} />
          Propose Account
        </button>
      </div>
      <div className="space-y-4">
        {caseData.accounts.length === 0 && (
          <EmptyState
            icon={Banknote}
            title="No Proposed Accounts"
            message="Propose a new account to get started."
            action={
              <button
                onClick={onProposeClick}
                className="flex items-center mx-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle size={16} />
                Propose Account
              </button>
            }
          />
        )}
        {caseData.accounts.map(acc => (
          <AccountCard
            key={acc.accountId}
            account={acc}
            parties={caseParties}
            caseData={caseData}
            onSelectItem={onSelectItem}
            onUpdateStatus={onUpdateAccountStatus}
          />
        ))}
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  parties: (Party & CasePartyLink)[];
  caseData: Case;
  onSelectItem: (item: ChecklistItem) => void;
  onUpdateStatus: (accountId: string, status: string) => Promise<void>;
}

function AccountCard({
  account,
  parties,
  caseData,
  onSelectItem,
  onUpdateStatus
}: AccountCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const darkMode = useUIStore((state) => state.darkMode);
  
  const signatories = account.signatoryIds.map(sigId => 
    parties.find(p => p.partyId === sigId)?.name || 'Unknown'
  );
  
  const getAccountForms = () => {
    const reqIds = documentRequirementsTemplate.accountOpeningForms.map(
      (req, i) => `req-acct-${account.accountId}-${i}`
    );
    const allItems: ChecklistItem[] = [];
    
    reqIds.forEach(reqId => {
      const link = caseData.documentLinks.find(l => l.requirementId === reqId);
      const req = documentRequirementsTemplate.accountOpeningForms.find(
        r => `req-acct-${account.accountId}-${documentRequirementsTemplate.accountOpeningForms.indexOf(r)}` === reqId
      );
      if (req) {
        const latestSubmission = link?.submissions?.[link.submissions.length - 1];
        allItems.push({
          ...req,
          id: reqId,
          category: 'Corporate',
          status: latestSubmission?.status || 'Missing',
          submissions: link?.submissions || [],
          ownerPartyId: 'ENTITY',
          priority: 'High'
        });
      }
    });
    return allItems;
  };
  
  const accountForms = getAccountForms();
  const allDocsSubmitted = accountForms.every(item => 
    !item.required || (item.status !== 'Missing' && item.status !== 'Rejected')
  );

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(account.accountId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn(
      'p-4 border rounded-lg',
      darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className={cn(
            'font-bold',
            darkMode ? 'text-white' : 'text-slate-800'
          )}>
            {account.accountType} ({account.currency})
          </p>
          <p className={cn(
            'text-sm',
            darkMode ? 'text-slate-400' : 'text-slate-500'
          )}>
            Account No: {account.accountNumber || 'Pending Activation'}
          </p>
        </div>
        <StatusBadge status={account.status} />
      </div>
      
      <p className={cn(
        'text-sm mt-2',
        darkMode ? 'text-slate-400' : 'text-slate-500'
      )}>
        Authorized Signatories: {signatories.join(', ')}
      </p>
      
      <div className={cn(
        'mt-4 pt-4 border-t space-y-3',
        darkMode ? 'border-slate-700' : 'border-slate-200'
      )}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center"
        >
          <h5 className={cn(
            'text-sm font-semibold',
            darkMode ? 'text-slate-200' : 'text-slate-700'
          )}>
            Required Forms
          </h5>
          {isOpen ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
        </button>
        
        {isOpen && (
          <ul className={cn(
            'mt-2 divide-y',
            darkMode ? 'divide-slate-700' : 'divide-slate-600'
          )}>
            {accountForms.map(item => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                darkMode={darkMode}
                onSelect={onSelectItem}
                isSelected={false}
                onToggleSelect={() => {}}
              />
            ))}
          </ul>
        )}
      </div>
      
      {/* Account Actions */}
      {account.status === 'Proposed' && currentUser?.role === 'RM' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleUpdateStatus('Pending Checker Review')}
            disabled={!allDocsSubmitted || isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
          >
            Submit Account for Review
          </button>
          {!allDocsSubmitted && (
            <p className="text-xs text-center mt-2 text-red-500">
              All forms must be submitted to proceed.
            </p>
          )}
        </div>
      )}
      
      {account.status === 'Pending Checker Review' && currentUser?.role === 'Checker' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button
            onClick={() => handleUpdateStatus('Pending Compliance Review')}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400"
          >
            <CheckCircle size={16} />
            Approve Account
          </button>
          <button
            onClick={() => handleUpdateStatus('Rejected')}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 disabled:bg-slate-400"
          >
            <XCircle size={16} />
            Reject Account
          </button>
        </div>
      )}
      
      {account.status === 'Pending Compliance Review' && currentUser?.role === 'Compliance' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button
            onClick={() => handleUpdateStatus('Active')}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400"
          >
            <CheckCircle size={16} />
            Approve Account
          </button>
          <button
            onClick={() => handleUpdateStatus('Rejected')}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 disabled:bg-slate-400"
          >
            <XCircle size={16} />
            Reject Account
          </button>
        </div>
      )}
    </div>
  );
}

interface ApprovalsTabProps {
  caseData: Case;
}

export function ApprovalsTab({ caseData }: ApprovalsTabProps) {
  const [downloadMessage, setDownloadMessage] = useState('');
  const darkMode = useUIStore((state) => state.darkMode);
  
  const handleDownload = () => {
    setDownloadMessage('Downloading documents...');
    setTimeout(() => setDownloadMessage(''), 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className={cn(
        'text-xl font-semibold',
        darkMode ? 'text-slate-200' : 'text-slate-800'
      )}>
        Approval Snapshots
      </h3>
      
      {downloadMessage && (
        <div className="p-2 text-sm text-center bg-blue-100 text-blue-800 rounded-md">
          {downloadMessage}
        </div>
      )}
      
      {!caseData.kycApprovalSnapshot && caseData.accounts.every(a => !a.accountApprovalSnapshot) && (
        <EmptyState
          icon={ShieldCheck}
          title="No Approvals Yet"
          message="Approved KYC and Account snapshots will appear here."
        />
      )}

      {caseData.kycApprovalSnapshot && (
        <ApprovalSnapshotCard
          title="KYC Approval"
          snapshot={caseData.kycApprovalSnapshot}
          onDownload={handleDownload}
        />
      )}

      {caseData.accounts.map(acc => acc.accountApprovalSnapshot && (
        <ApprovalSnapshotCard
          key={acc.accountId}
          title={`Account Opening: ${acc.accountType}`}
          snapshot={acc.accountApprovalSnapshot}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}

interface ApprovalSnapshotCardProps {
  title: string;
  snapshot: ApprovalSnapshot;
  onDownload: () => void;
}

function ApprovalSnapshotCard({ title, snapshot, onDownload }: ApprovalSnapshotCardProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  
  return (
    <div className={cn(
      'p-4 border rounded-lg',
      darkMode ? 'border-slate-700' : 'border-slate-300'
    )}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-semibold text-lg">{title}</h4>
          <p className="text-xs text-slate-500">
            Approved by {snapshot.approvedBy} on {formatDateTime(snapshot.timestamp)}
          </p>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <Download size={14} />
          Download All
        </button>
      </div>
      <ul className="divide-y dark:divide-slate-700">
        {snapshot.documents.map(doc => (
          <li key={doc.submissionId} className="py-2 text-sm">
            {doc.docType}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface EntityProfileTabProps {
  entityData: Case['entityData'];
}

export function EntityProfileTab({ entityData }: EntityProfileTabProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <div className={cn(
      'p-6 rounded-lg border',
      darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
    )}>
      <h3 className={cn(
        'text-xl font-semibold mb-4',
        darkMode ? 'text-slate-100' : 'text-slate-800'
      )}>
        Entity Profile
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
        <div>
          <span className={cn(
            'block text-sm font-medium',
            darkMode ? 'text-slate-400' : 'text-slate-500'
          )}>
            Entity Name
          </span>
          <span className={cn(
            'text-base',
            darkMode ? 'text-white' : 'text-slate-900'
          )}>
            {entityData.entityName}
          </span>
        </div>
        <div>
          <span className={cn(
            'block text-sm font-medium',
            darkMode ? 'text-slate-400' : 'text-slate-500'
          )}>
            Entity Type
          </span>
          <span className={cn(
            'text-base',
            darkMode ? 'text-white' : 'text-slate-900'
          )}>
            {entityData.entityType}
          </span>
        </div>
        <div>
          <span className={cn(
            'block text-sm font-medium',
            darkMode ? 'text-slate-400' : 'text-slate-500'
          )}>
            Tax ID
          </span>
          <span className={cn(
            'text-base',
            darkMode ? 'text-white' : 'text-slate-900'
          )}>
            {entityData.taxId || 'Not provided'}
          </span>
        </div>
        <div>
          <span className={cn(
            'block text-sm font-medium',
            darkMode ? 'text-slate-400' : 'text-slate-500'
          )}>
            Address
          </span>
          <span className={cn(
            'text-base',
            darkMode ? 'text-white' : 'text-slate-900'
          )}>
            {entityData.registeredAddress ? formatAddress(entityData.registeredAddress) : 'Not provided'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ActivityLogTabProps {
  activities: ActivityLog[];
}

export function ActivityLogTab({ activities }: ActivityLogTabProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <div className={cn(
      'p-6 rounded-lg border',
      darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
    )}>
      <h3 className={cn(
        'text-xl font-semibold mb-4',
        darkMode ? 'text-slate-100' : 'text-slate-800'
      )}>
        Activity Log
      </h3>
      <ul className="space-y-4">
        {[...activities].reverse().map(log => (
          <li key={log.id} className={cn(
            'text-sm',
            darkMode ? 'text-slate-300' : 'text-slate-700'
          )}>
            <span className={cn(
              'font-semibold',
              darkMode ? 'text-white' : 'text-slate-900'
            )}>
              {log.actor}
            </span>
            : {log.action}{' '}
            <span className={cn(
              'text-xs',
              darkMode ? 'text-slate-400' : 'text-slate-500'
            )}>
              ({formatDateTime(log.timestamp)})
            </span>
            {log.details && (
              <p className={cn(
                'pl-4 text-xs mt-1',
                darkMode ? 'text-slate-400' : 'text-slate-500'
              )}>
                {log.details}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}