// In src/components/cases/create-case-modal.tsx
// Update the type state and handleSubmit function:

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntityType } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { documentRequirementsTemplate } from '@/lib/document-requirements';
import { cn } from '@/lib/utils';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export function CreateCaseModal({ isOpen, onClose, darkMode }: CreateCaseModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('Non-Listed Company');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const entityTypes = Object.keys(documentRequirementsTemplate.entityTemplates) as EntityType[];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newCase = await ApiClient.cases.create({
        entityName: name,
        entityType: type,
      });
      
      router.push(`/cases/${newCase.caseId}`);
      onClose();
    } catch (err) {
      setError('Failed to create case. Please try again.');
      console.error('Failed to create case:', err);
    } finally {
      setIsLoading(false);
    }
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
          Create New Case
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={cn(
              'block text-sm font-medium',
              darkMode ? 'text-slate-300' : 'text-slate-700'
            )}>
              Entity Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EntityType)}
              className={cn(
                'mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm',
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
              )}
              disabled={isLoading}
            >
              {entityTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={cn(
              'block text-sm font-medium',
              darkMode ? 'text-slate-300' : 'text-slate-700'
            )}>
              {type === 'Individual Account' ? 'Individual\'s Full Name' : 'Entity Name'}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm',
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
              )}
              placeholder={type === 'Individual Account' ? 'John Doe' : 'Company Name Pte Ltd'}
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border',
              darkMode ? 'border-slate-600 hover:bg-slate-700 text-white' : 'border-slate-300 hover:bg-slate-100',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim() || isLoading}
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}