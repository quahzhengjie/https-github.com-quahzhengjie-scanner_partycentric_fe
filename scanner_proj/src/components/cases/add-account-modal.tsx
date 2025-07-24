// src/components/cases/add-account-modal.tsx

'use client';

import { useState } from 'react';
import { Account } from '@/lib/types';
import { Party } from '@/lib/types';
import { CasePartyLink } from '@/lib/types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: (Party & CasePartyLink)[];
  onPropose: (newAccount: Omit<Account, 'accountId' | 'accountNumber' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  darkMode: boolean;
}

export function AddAccountModal({
  isOpen,
  onClose,
  parties,
  onPropose,
  darkMode
}: AddAccountModalProps) {
  const [accountType, setAccountType] = useState<Account['accountType']>('Current');
  const [currency, setCurrency] = useState('SGD');
  const [purpose, setPurpose] = useState('Business Operations');
  const [selectedSignatories, setSelectedSignatories] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSignatoryToggle = (partyId: string) => {
    const newSet = new Set(selectedSignatories);
    if (newSet.has(partyId)) {
      newSet.delete(partyId);
    } else {
      newSet.add(partyId);
    }
    setSelectedSignatories(newSet);
  };

  const handleSubmit = () => {
    const signatoryIds = Array.from(selectedSignatories);
    onPropose({
      accountType,
      currency,
      purpose,
      primaryHolderId: signatoryIds[0] || '', // First selected as primary
      jointHolderIds: [],
      signatoryIds: signatoryIds,
      signatureRules: 'Any one',
      requestedServices: [],
      onlineBanking: true,
      checkBook: false,
      debitCard: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-lg`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Propose New Account
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as Account['accountType'])}
              className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                darkMode ? 'dark:bg-slate-700 dark:border-slate-600 dark:text-white' : ''
              }`}
            >
              <option value="Current">Current Account</option>
              <option value="Savings">Savings Account</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="Securities">Securities Account</option>
              <option value="Loan">Loan Account</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                darkMode ? 'dark:bg-slate-700 dark:border-slate-600 dark:text-white' : ''
              }`}
            >
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="HKD">HKD - Hong Kong Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Account Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                darkMode ? 'dark:bg-slate-700 dark:border-slate-600 dark:text-white' : ''
              }`}
              placeholder="e.g., Business Operations, Payroll, Investments"
            />
          </div>

          <div>
            <h3 className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Authorized Signatories
            </h3>
            <div className="mt-2 space-y-2">
              {parties.map((party) => (
                <label key={party.partyId} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedSignatories.has(party.partyId)}
                    onChange={() => handleSignatoryToggle(party.partyId)}
                  />
                  <span className={`text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {party.name} <span className="text-slate-500">({party.relationshipType})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              darkMode ? 'border-slate-600 hover:bg-slate-700 text-white' : 'border-slate-300 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedSignatories.size === 0}
            className="px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
          >
            Propose Account
          </button>
        </div>
      </div>
    </div>
  );
}