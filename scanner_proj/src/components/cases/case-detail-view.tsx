// src/components/cases/case-detail-view.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Building,
  Activity,
  Banknote,
  ShieldCheck
} from 'lucide-react';
import {
  Case,
  Party,

  CaseStatus,
  RiskLevel,
  Account,
  CasePartyLink,
  ActivityLog,
  ChecklistItem,
  VerifiedSubmissionRecord,

} from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { ApiClient } from '@/lib/api-client';
import { generateChecklist, cn } from '@/lib/utils';
import { StatusBadge, RiskBadge } from '@/components/ui/badges';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChecklistTab,
  AccountsTab,
  ApprovalsTab,
  EntityProfileTab,
  ActivityLogTab
} from './case-detail-tabs';
import { AddAccountModal } from './add-account-modal';
import { LinkPartyModal } from './link-party-modal';
import { DocumentReviewModal } from './document-review-modal';
import { PartiesList } from './parties-list';
import { CaseActions } from './case-actions';

interface CaseDetailViewProps {
  caseId: string;
  onSelectParty: (partyId: string) => void;
  onBack: () => void;
}

export function CaseDetailView({ caseId, onSelectParty, onBack }: CaseDetailViewProps) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('checklist');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isLinkPartyModalOpen, setIsLinkPartyModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<ChecklistItem | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const darkMode = useUIStore((state) => state.darkMode);

  // Fetch case data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [caseResponse, partiesResponse] = await Promise.all([
          ApiClient.cases.getById(caseId),
          ApiClient.parties.getAll()
        ]);
        setCaseData(caseResponse);
        setAllParties(partiesResponse);
      } catch (err) {
        setError('Failed to load case data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [caseId]);

  const handleUpdateCase = async (updatedCase: Case) => {
    try {
      const response = await ApiClient.cases.update(updatedCase.caseId, updatedCase);
      setCaseData(response);
    } catch (err) {
      console.error('Failed to update case:', err);
    }
  };

  const handleProposeAccount = (newAccountData: Omit<Account, 'accountId' | 'accountNumber' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!caseData || !currentUser) return;

    const newAccount: Account = {
      ...newAccountData,
      accountId: `ACC-PROP-${Date.now()}`,
      accountNumber: '',
      status: 'Proposed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedCase = {
      ...caseData,
      accounts: [...caseData.accounts, newAccount],
      activities: [
        ...caseData.activities,
        {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          actorRole: currentUser.role,
          actorId: currentUser.id,
          action: 'Account Proposed',
          actionType: 'Create' as const,
          entityType: 'Account' as const,
          entityId: newAccount.accountId,
          details: `Proposed a new ${newAccount.accountType} account in ${newAccount.currency}`
        }
      ]
    };
    
    handleUpdateCase(updatedCase);
  };
  
  const handleLinkParty = (partyId: string, relationshipType: string, ownershipPercentage?: number) => {
    if (!caseData || !currentUser) return;

    const newLink: CasePartyLink = {
      partyId,
      relationshipType,
      isPrimary: relationshipType === 'Primary Holder' || relationshipType === 'Director',
      ownershipPercentage
    };
    
    const party = allParties.find(p => p.partyId === partyId);
    
    const updatedCase = {
      ...caseData,
      relatedPartyLinks: [...caseData.relatedPartyLinks, newLink],
      activities: [
        ...caseData.activities,
        {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          actorRole: currentUser.role,
          actorId: currentUser.id,
          action: 'Party Linked',
          actionType: 'Update' as const,
          entityType: 'Case' as const,
          entityId: caseData.caseId,
          details: `Linked ${party?.name || 'Unknown Party'} as ${relationshipType}`
        }
      ]
    };
    
    // TODO: Auto-link verified documents logic here
    
    handleUpdateCase(updatedCase);
  };
  
  const handleCaseAction = (newStatus: CaseStatus, actionText: string, newRisk?: RiskLevel) => {
    if (!caseData || !currentUser) return;

    // Ensure all existing activities have the required properties
    const validatedActivities: ActivityLog[] = caseData.activities.map(activity => ({
      id: activity.id,
      timestamp: activity.timestamp,
      actor: activity.actor,
      actorRole: 'actorRole' in activity ? activity.actorRole : 'Admin',
      actorId: 'actorId' in activity ? activity.actorId : 'SYSTEM',
      action: activity.action,
      actionType: 'actionType' in activity ? activity.actionType : ('Update' as const),
      entityType: 'entityType' in activity ? activity.entityType : ('Case' as const),
      entityId: 'entityId' in activity ? activity.entityId : caseData.caseId,
      details: 'details' in activity ? activity.details : undefined,
      previousValue: 'previousValue' in activity ? activity.previousValue : undefined,
      newValue: 'newValue' in activity ? activity.newValue : undefined,
      ipAddress: 'ipAddress' in activity ? activity.ipAddress : undefined,
      userAgent: 'userAgent' in activity ? activity.userAgent : undefined,
      sessionId: 'sessionId' in activity ? activity.sessionId : undefined
    }));

    const updatedCase: Case = {
      ...caseData,
      status: newStatus,
      riskLevel: newRisk || caseData.riskLevel,
      activities: [
        ...validatedActivities,
        {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          actorRole: currentUser.role,
          actorId: currentUser.id,
          action: actionText,
          actionType: 'Update' as const,
          entityType: 'Case' as const,
          entityId: caseData.caseId,
          details: `Status changed to ${newStatus}`
        }
      ]
    };
    
    // Create approval snapshot for approved cases
    if (newStatus === 'Approved') {
      const mainChecklistItems = generateChecklist(updatedCase, allParties)
        .filter(sec => !sec.title.startsWith('Account Forms'))
        .flatMap(sec => sec.items);
      
      const verifiedDocs = mainChecklistItems.reduce((acc, item) => {
        const verifiedSubmission = item.submissions.find(s => s.status === 'Verified');
        if (verifiedSubmission) {
          acc.push({
            requirementId: item.id,
            docType: item.name,
            submissionId: verifiedSubmission.submissionId,
            masterDocId: verifiedSubmission.masterDocId,
            verifiedDate: verifiedSubmission.complianceReviewedAt || new Date().toISOString()
          });
        }
        return acc;
      }, [] as VerifiedSubmissionRecord[]);

      updatedCase.kycApprovalSnapshot = {
        snapshotId: `SNAP-KYC-${Date.now()}`,
        snapshotType: 'KYC',
        timestamp: new Date().toISOString(),
        approvedBy: currentUser.name,
        approverRole: currentUser.role,
        decision: 'Approved',
        documents: verifiedDocs,
        checklistCompleted: true,
        riskLevel: updatedCase.riskLevel,
        complianceChecks: [],
        periodicReviewRequired: updatedCase.riskLevel === 'High' || updatedCase.riskLevel === 'Critical'
      };
    }
    
    handleUpdateCase(updatedCase);
  };

  // Commented out unused handlers - implement when needed
  /*
  const handleAddDocument = async (newDocData: Omit<Document, 'docId'>) => {
    try {
      const newDoc = await ApiClient.documents.create(newDocData);
      setAllDocuments(prev => [...prev, newDoc]);
      return newDoc;
    } catch (err) {
      console.error('Failed to add document:', err);
      throw err;
    }
  };

  const handleAddSubmission = async (requirementId: string, newSubmissionData: Omit<Submission, 'submissionId'>) => {
    if (!caseData || !currentUser) return;

    try {
      const updatedCase = await ApiClient.cases.addSubmission(
        caseData.caseId,
        requirementId,
        newSubmissionData
      );
      
      // Add activity log
      updatedCase.activities.push({
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        actorRole: currentUser.role,
        actorId: currentUser.id,
        action: 'Document Submitted',
        actionType: 'Create' as const,
        entityType: 'Document' as const,
        entityId: requirementId,
        details: `A new document was submitted for requirement ${requirementId}`
      });
      
      setCaseData(updatedCase);
    } catch (err) {
      console.error('Failed to add submission:', err);
    }
  };
  
  const handleUpdateSubmission = async (requirementId: string, submissionId: string, newStatus: DocumentStatus, commentText?: string) => {
    if (!caseData || !currentUser) return;

    try {
      const updatedCase = await ApiClient.cases.updateSubmission(
        caseData.caseId,
        requirementId,
        submissionId,
        { newStatus, commentText }
      );
      
      // Add activity log
      updatedCase.activities.push({
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        actorRole: currentUser.role,
        actorId: currentUser.id,
        action: 'Document Reviewed',
        actionType: 'Update' as const,
        entityType: 'Document' as const,
        entityId: submissionId,
        details: `Submission for ${requirementId} set to ${newStatus}`
      });
      
      setCaseData(updatedCase);
    } catch (err) {
      console.error('Failed to update submission:', err);
    }
  };
  */

  const handleUpdateAccountStatus = async (accountId: string, newStatus: string) => {
    if (!caseData || !currentUser) return;

    try {
      // In a real app, this would be an API call
      const updatedCase = { ...caseData };
      const accountIndex = updatedCase.accounts.findIndex(a => a.accountId === accountId);
      
      if (accountIndex !== -1) {
        updatedCase.accounts[accountIndex].status = newStatus as Account['status'];
        
        // Create approval snapshot if account is activated
        if (newStatus === 'Active') {
          // Create approval snapshot if account is activated
          const verifiedDocs: VerifiedSubmissionRecord[] = []; // Would populate from actual submissions
          
          updatedCase.accounts[accountIndex].accountApprovalSnapshot = {
            snapshotId: `SNAP-ACCT-${accountId}-${Date.now()}`,
            snapshotType: 'Account',
            timestamp: new Date().toISOString(),
            approvedBy: currentUser.name,
            approverRole: currentUser.role,
            decision: 'Approved',
            documents: verifiedDocs,
            checklistCompleted: true,
            riskLevel: caseData.riskLevel,
            complianceChecks: [],
            periodicReviewRequired: false
          };
        }
        
        // Add activity log
        updatedCase.activities.push({
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          actorRole: currentUser.role,
          actorId: currentUser.id,
          action: 'Account Status Changed',
          actionType: 'Update' as const,
          entityType: 'Account' as const,
          entityId: accountId,
          details: `Account ${accountId} status set to ${newStatus}`
        });
        
        await handleUpdateCase(updatedCase);
      }
    } catch (err) {
      console.error('Failed to update account status:', err);
    }
  };

  const caseParties = useMemo(() => {
    if (!caseData) return [];
    return caseData.relatedPartyLinks.map(link => ({
      ...allParties.find(p => p.partyId === link.partyId)!,
      ...link
    })).filter(Boolean);
  }, [caseData, allParties]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Case not found'}</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Back to Cases
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      {/* Modals */}
      <LinkPartyModal
        isOpen={isLinkPartyModalOpen}
        onClose={() => setIsLinkPartyModalOpen(false)}
        onLink={handleLinkParty}
        masterList={allParties}
        currentPartyIds={caseData.relatedPartyLinks.map(l => l.partyId)}
        entityType={caseData.entityData.entityType}
      />
      
      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        parties={caseParties}
        onPropose={handleProposeAccount}
        darkMode={darkMode}
      />
      
      {reviewingItem && (
        <DocumentReviewModal
          item={reviewingItem}
          onClose={() => setReviewingItem(null)}
          caseId={caseData.caseId}
          onUpdate={() => {
            // Refresh case data after document update
            ApiClient.cases.getById(caseId).then(setCaseData);
          }}
        />
      )}

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className={cn(
              'text-2xl lg:text-3xl font-bold tracking-tight',
              darkMode ? 'text-slate-100' : 'text-slate-900'
            )}>
              {caseData.entityData.entityName}
            </h1>
            <p className={cn(
              'mt-1 text-sm',
              darkMode ? 'text-slate-400' : 'text-slate-500'
            )}>
              {caseData.entityData.entityType} • Case ID: {caseData.caseId}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={caseData.status} />
            <RiskBadge level={caseData.riskLevel} />
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <PartiesList
            parties={caseParties}
            onLinkParty={() => setIsLinkPartyModalOpen(true)}
            onSelectParty={onSelectParty}
            entityType={caseData.entityData.entityType}
          />
          
          <Card className="p-5">
            <h3 className={cn(
              'text-lg font-semibold mb-4',
              darkMode ? 'text-slate-100' : 'text-slate-900'
            )}>
              Case Actions
            </h3>
            <CaseActions
              caseData={caseData}
              allParties={allParties}
              onCaseAction={handleCaseAction}
            />
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="checklist" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span className="hidden sm:inline">Checklist</span>
                </TabsTrigger>
                <TabsTrigger value="accounts" className="flex items-center gap-2">
                  <Banknote size={16} />
                  <span className="hidden sm:inline">Accounts</span>
                </TabsTrigger>
                <TabsTrigger value="approvals" className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span className="hidden sm:inline">Approvals</span>
                </TabsTrigger>
                <TabsTrigger value="entity_profile" className="flex items-center gap-2">
                  <Building size={16} />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="activity_log" className="flex items-center gap-2">
                  <Activity size={16} />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="checklist">
                  <ChecklistTab
                    caseData={caseData}
                    allParties={allParties}
                    onSelectItem={setReviewingItem}
                  />
                </TabsContent>

                <TabsContent value="accounts">
                  <AccountsTab
                    caseData={caseData}
                    caseParties={caseParties}
                    onProposeClick={() => setIsAddAccountModalOpen(true)}
                    onSelectItem={setReviewingItem}
                    onUpdateAccountStatus={handleUpdateAccountStatus}
                  />
                </TabsContent>

                <TabsContent value="approvals">
                  <ApprovalsTab caseData={caseData} />
                </TabsContent>

                <TabsContent value="entity_profile">
                  <EntityProfileTab entityData={caseData.entityData} />
                </TabsContent>

                <TabsContent value="activity_log">
                  <ActivityLogTab activities={caseData.activities} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}