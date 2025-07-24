'use client';

import Link from 'next/link';
import { 
  Briefcase, 
  Users, 

  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useCases, useParties } from '@/hooks/useApi';

import { StatusBadge } from '@/components/ui/badges';


interface DashboardPageProps {
  onSelectCase: (caseId: string) => void;
  onSelectParty: (partyId: string) => void;
}

export function DashboardPage({ onSelectCase }: DashboardPageProps) {
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const { data: parties = [], isLoading: partiesLoading } = useParties();
  

  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'Active').length,
    pendingReview: cases.filter(c => c.status.includes('Pending')).length,
    totalParties: parties.length,
  };

  const recentCases = cases.slice(0, 5);
  
  if (casesLoading || partiesLoading) {
      return <div>Loading dashboard...</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here is an overview of your KYC operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Cases"
          value={stats.totalCases}
          icon={Briefcase}
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCases}
          icon={CheckCircle}
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Clock}
        />
        <StatCard
          title="Total Parties"
          value={stats.totalParties}
          icon={Users}
        />
      </div>

      {/* Recent Cases */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Cases
          </h2>
          <Link 
            href="/cases"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {recentCases.map((caseItem) => (
              <li key={caseItem.caseId}>
                <button 
                  onClick={() => onSelectCase(caseItem.caseId)}
                  className="w-full text-left block px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {caseItem.entityData.entityName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {caseItem.entityData.entityType} • {caseItem.caseId}
                      </p>
                    </div>
                    <StatusBadge status={caseItem.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType; }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
        </div>
    );
}