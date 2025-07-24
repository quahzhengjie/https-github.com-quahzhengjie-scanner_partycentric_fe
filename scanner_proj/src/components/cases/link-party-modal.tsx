// src/components/cases/link-party-modal.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Party } from '@/lib/types';
import { documentRequirementsTemplate } from '@/lib/document-requirements';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

interface LinkPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (partyId: string, relationshipType: string, ownershipPercentage?: number) => void;
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
  
  const validRoles = useMemo(() => 
    documentRequirementsTemplate.entityRoleMapping[entityType as keyof typeof documentRequirementsTemplate.entityRoleMapping] || [],
    [entityType]
  );
  
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [role, setRole] = useState<string>(validRoles[0] || '');
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>('');
  
  useEffect(() => {
    setRole(validRoles[0] || '');
  }, [validRoles]);
  
  if (!isOpen) return null;
  
  const availableParties = masterList.filter(p => !currentPartyIds.includes(p.partyId));
  
  const handleSubmit = () => {
    const ownership = ownershipPercentage ? parseFloat(ownershipPercentage) : undefined;
    onLink(selectedPartyId, role, ownership);
    onClose();
    // Reset form
    setSelectedPartyId('');
    setOwnershipPercentage('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className={cn(
        'rounded-lg shadow-xl p-6 w-full max-w-lg',
        darkMode ? 'bg-slate-800' : 'bg-white'
      )}>
        <h2 className={cn(
          'text-xl font-bold mb-4',
          darkMode ? 'text-white' : 'text-slate-900'
        )}>
          Link Related Party
        </h2>
        
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
              onChange={e => setSelectedPartyId(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm',
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
              )}
            >
              <option value="">Select a party...</option>
              {availableParties.map(p => (
                <option key={p.partyId} value={p.partyId}>
                  {p.name} ({p.isPEP ? 'PEP • ' : ''}{p.residencyStatus})
                </option>
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
              onChange={e => setRole(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm',
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
              )}
            >
              {validRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          {(role === 'Beneficial Owner' || role === 'Shareholder') && (
            <div>
              <label className={cn(
                'block text-sm font-medium',
                darkMode ? 'text-slate-300' : 'text-slate-700'
              )}>
                Ownership Percentage (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={ownershipPercentage}
                onChange={e => setOwnershipPercentage(e.target.value)}
                className={cn(
                  'mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm',
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
                )}
                placeholder="e.g., 25.5"
              />
            </div>
          )}
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
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
          >
            Link Party
          </button>
        </div>
      </div>
    </div>
  );
}