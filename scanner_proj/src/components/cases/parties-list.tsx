// src/components/cases/parties-list.tsx

'use client';

import { UserPlus } from 'lucide-react';
import { Party, CasePartyLink } from '@/lib/types';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

interface PartiesListProps {
  parties: (Party & CasePartyLink)[];
  onLinkParty: () => void;
  onSelectParty: (partyId: string) => void;
  entityType: string;
}

export function PartiesList({ 
  parties, 
  onLinkParty, 
  onSelectParty, 
  entityType 
}: PartiesListProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  
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
      
      {parties.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No parties linked yet
        </p>
      ) : (
        <ul className={cn(
          'divide-y',
          darkMode ? 'divide-slate-700' : 'divide-slate-200'
        )}>
          {parties.map(p => (
            <li key={p.partyId} className="py-3">
              <button
                onClick={() => onSelectParty(p.partyId)}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {p.name}
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {p.relationshipType}
                {p.ownershipPercentage && (
                  <span> • {p.ownershipPercentage}% ownership</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}