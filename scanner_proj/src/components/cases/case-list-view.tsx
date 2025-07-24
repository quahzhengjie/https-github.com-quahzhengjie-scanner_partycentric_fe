// src/components/cases/case-list-view.tsx

'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Search, 
  Send, 
  UserPlus, 
  Download, 
  Mail,
  Filter
} from 'lucide-react';
import { Case, CaseStatus, RiskLevel } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { StatusBadge, RiskBadge } from '@/components/ui/badges';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CreateCaseModal } from '@/components/cases/create-case-modal';
import { EmptyState } from '@/components/common/empty-state';
import { getCaseProgress, cn } from '@/lib/utils';
import { CaseService } from '@/services/case-service';
import { useToast } from '@/components/ui/use-toast';

interface CaseListViewProps {
  initialCases: Case[];
}

export function CaseListView({ initialCases }: CaseListViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [cases, setCases] = useState(initialCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // New state for enhanced features
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  const currentUser = useAuthStore((state) => state.currentUser);
  const darkMode = useUIStore((state) => state.darkMode);

  // Enhanced filtering
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = c.entityData.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.caseId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesRisk = filterRisk === 'all' || c.riskLevel === filterRisk;
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [cases, searchTerm, filterStatus, filterRisk]);

  const handleSelectCase = (caseId: string, event?: React.MouseEvent) => {
    if (event && (event.ctrlKey || event.metaKey || event.shiftKey)) {
      // Multi-select mode
      event.preventDefault();
      const newSelected = new Set(selectedCases);
      if (newSelected.has(caseId)) {
        newSelected.delete(caseId);
      } else {
        newSelected.add(caseId);
      }
      setSelectedCases(newSelected);
    } else {
      // Single select - navigate
      startTransition(() => {
        router.push(`/cases/${caseId}`);
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCases.size === filteredCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(filteredCases.map(c => c.caseId)));
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedCases.size === 0) return;
    
    setIsBulkLoading(true);
    try {
      const result = await CaseService.bulkSubmitForReview(Array.from(selectedCases));
      
      // Update local state
      setCases(prev => prev.map(c => 
        result.succeeded.includes(c.caseId) 
          ? { ...c, status: 'Pending Checker Review' as CaseStatus }
          : c
      ));
      
      toast({
        title: 'Bulk submission complete',
        description: `Successfully submitted ${result.succeeded.length} cases for review`,
      });
      
      setSelectedCases(new Set());
    } catch {
      toast({
        title: 'Bulk submission failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedCases.size === 0) return;
    
    toast({
      title: 'Export started',
      description: `Exporting ${selectedCases.size} cases...`,
    });
    
    // Implement export functionality
    console.log('Exporting cases:', Array.from(selectedCases));
  };

  const handleBulkAssign = () => {
    // Implement assign functionality
    console.log('Assigning cases:', Array.from(selectedCases));
  };

  const handleBulkEmail = () => {
    // Implement email functionality
    console.log('Emailing documents for cases:', Array.from(selectedCases));
  };

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-4 sm:px-0 gap-4">
          <h1 className={cn(
            'text-3xl font-bold tracking-tight',
            darkMode ? 'text-white' : 'text-slate-900'
          )}>
            All Cases
          </h1>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'pl-10 pr-4 py-2 w-full text-sm rounded-md border',
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 placeholder-slate-500'
                )}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2 rounded-md border',
                showFilters && 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
                darkMode
                  ? 'border-slate-600 hover:bg-slate-700'
                  : 'border-slate-300 hover:bg-slate-50'
              )}
              title="Toggle filters"
            >
              <Filter size={20} />
            </button>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 shrink-0"
            >
              <PlusCircle size={16} />
              Create Case
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        {showFilters && (
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex flex-wrap gap-4 items-center">
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value as CaseStatus | 'all')}
              className={cn(
                'text-sm rounded-md border px-3 py-1.5',
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-300'
              )}
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Checker Review">Pending Checker</option>
              <option value="Pending Compliance Review">Pending Compliance</option>
              <option value="Pending GM Approval">Pending GM</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Active">Active</option>
            </select>
            
            <select 
              value={filterRisk} 
              onChange={e => setFilterRisk(e.target.value as RiskLevel | 'all')}
              className={cn(
                'text-sm rounded-md border px-3 py-1.5',
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-300'
              )}
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
            
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterRisk('all');
                setSearchTerm('');
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedCases.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                checked={selectedCases.size === filteredCases.length && filteredCases.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">
                {selectedCases.size} {selectedCases.size === 1 ? 'case' : 'cases'} selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {currentUser?.role === 'RM' && (
                <button 
                  onClick={handleBulkSubmit}
                  disabled={isBulkLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={14} />
                  Submit for Review
                </button>
              )}
              
              <button 
                onClick={handleBulkAssign}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <UserPlus size={14} />
                Assign
              </button>
              
              <button 
                onClick={handleBulkExport}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Download size={14} />
                Export
              </button>
              
              <button 
                onClick={handleBulkEmail}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Mail size={14} />
                Email
              </button>
              
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-2" />
              
              <button 
                onClick={() => setSelectedCases(new Set())} 
                className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Results info */}
        {(searchTerm || filterStatus !== 'all' || filterRisk !== 'all') && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Showing {filteredCases.length} of {cases.length} cases
          </p>
        )}

        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.caseId}
                className={cn(
                  'relative group rounded-lg border transition-all duration-200',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:border-blue-500'
                    : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md',
                  selectedCases.has(caseItem.caseId) && 'ring-2 ring-blue-500',
                  isPending && 'opacity-50 cursor-wait'
                )}
              >
                {/* Selection checkbox - only show when in selection mode */}
                {selectedCases.size > 0 && (
                  <div className="absolute top-4 left-4 z-10">
                    <input 
                      type="checkbox"
                      checked={selectedCases.has(caseItem.caseId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedCases);
                        if (newSelected.has(caseItem.caseId)) {
                          newSelected.delete(caseItem.caseId);
                        } else {
                          newSelected.add(caseItem.caseId);
                        }
                        setSelectedCases(newSelected);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                <div 
                  onClick={(e) => handleSelectCase(caseItem.caseId, e)}
                  className={cn(
                    'cursor-pointer h-full',
                    selectedCases.size > 0 && 'pl-10'
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-md font-semibold text-blue-600 dark:text-blue-400 truncate group-hover:underline">
                        {caseItem.entityData.entityName}
                      </p>
                      <RiskBadge level={caseItem.riskLevel} />
                    </div>
                    <p className={cn(
                      'text-sm mb-4',
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      {caseItem.entityData.entityType}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{caseItem.caseId}</span>
                      <StatusBadge status={caseItem.status} />
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700">
                    <ProgressBar
                      progress={getCaseProgress(caseItem, currentUser?.role || 'RM')}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No Cases Found"
            message={searchTerm || filterStatus !== 'all' || filterRisk !== 'all' 
              ? "Try adjusting your filters or search term." 
              : "Create a new case to get started."}
            action={
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle size={16} />
                Create First Case
              </button>
            }
          />
        )}
      </div>

      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        darkMode={darkMode}
      />
    </>
  );
}