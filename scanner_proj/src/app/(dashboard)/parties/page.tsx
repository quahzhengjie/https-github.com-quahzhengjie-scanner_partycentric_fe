// src/app/(dashboard)/parties/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, ChevronRight } from 'lucide-react';
import { mockParties } from '@/lib/mock-data';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

export default function PartiesPage() {
  const router = useRouter();
  const darkMode = useUIStore((state) => state.darkMode);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParties = mockParties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.partyId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectParty = (partyId: string) => {
    router.push(`/parties/${partyId}`);
  };

  const handleCreateParty = () => {
    // TODO: Implement create party modal
    console.log('Create party clicked');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className={cn(
          'text-3xl font-bold tracking-tight',
          darkMode ? 'text-white' : 'text-slate-900'
        )}>
          Parties
        </h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'pl-10 pr-4 py-2 w-full sm:w-64 text-sm rounded-md border',
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300'
              )}
            />
          </div>
          
          {/* Create Button */}
          <button
            onClick={handleCreateParty}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add Party</span>
          </button>
        </div>
      </div>

      {/* Parties List */}
      {filteredParties.length === 0 ? (
        <div className={cn(
          'text-center py-12 rounded-lg border-2 border-dashed',
          darkMode ? 'border-slate-700' : 'border-slate-300'
        )}>
          <UserPlus className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className={cn(
            'mt-4 text-lg font-medium',
            darkMode ? 'text-slate-200' : 'text-slate-900'
          )}>
            No parties found
          </h3>
          <p className={cn(
            'mt-2 text-sm',
            darkMode ? 'text-slate-400' : 'text-slate-500'
          )}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new party'}
          </p>
        </div>
      ) : (
        <div className={cn(
          'shadow-sm border overflow-hidden sm:rounded-lg',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          <ul className={cn(
            'divide-y',
            darkMode ? 'divide-slate-700' : 'divide-slate-200'
          )}>
            {filteredParties.map((party) => (
              <li key={party.partyId}>
                <button
                  onClick={() => handleSelectParty(party.partyId)}
                  className={cn(
                    'w-full px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-opacity-50 transition-colors',
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium',
                        darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                      )}>
                        {party.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </div>
                    <div className="ml-4 text-left">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        darkMode ? 'text-white' : 'text-slate-900'
                      )}>
                        {party.name}
                      </p>
                      <p className={cn(
                        'text-sm',
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      )}>
                        {party.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-2 flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        darkMode 
                          ? 'bg-slate-700 text-slate-300' 
                          : 'bg-slate-100 text-slate-800'
                      )}>
                        {party.type}
                      </span>
                      <span className={cn(
                        'text-xs',
                        darkMode ? 'text-slate-500' : 'text-slate-400'
                      )}>
                        {party.partyId}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}