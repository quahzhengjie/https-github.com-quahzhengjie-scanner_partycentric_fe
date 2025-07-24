// src/components/parties/party-detail-view.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Building,
  ChevronRight,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Globe
} from 'lucide-react';
import { Party, Case, Document } from '@/lib/types';
import { useUIStore } from '@/store/ui-store';
import { cn, formatDate, formatAddress, calculateAge, getCountryName } from '@/lib/utils';
import { StatusBadge, RiskBadge } from '@/components/ui/badges';
import { EmptyState } from '@/components/common/empty-state';
import { ApiClient } from '@/lib/api-client';

interface PartyDetailViewProps {
  party: Party;
  allCases: Case[];
  allDocuments: Document[];
}

export function PartyDetailView({ 
  party, 
  allCases, 
  allDocuments 
}: PartyDetailViewProps) {
  const router = useRouter();
  const darkMode = useUIStore((state) => state.darkMode);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    docType: '',
    category: 'Identity' as Document['category'],
    fileName: '',
    file: null as File | null,
    issuer: '',
    issueDate: '',
    expiryDate: '',
    documentNumber: ''
  });

  const relatedCases = allCases.filter(c => 
    c.relatedPartyLinks.some(link => link.partyId === party.partyId)
  );
  
  const partyDocuments = allDocuments.filter(d => d.ownerPartyId === party.partyId);

  const handleSelectCase = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadForm(prev => ({
        ...prev,
        file,
        fileName: file.name
      }));
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadForm.docType || !uploadForm.fileName) {
      alert('Please fill in required fields');
      return;
    }

    try {
      // In a real implementation, you would:
      // 1. Upload the file to get a blob/binary data
      // 2. Store it in the database
      // For now, we'll create a mock document
      
      const newDocument: Omit<Document, 'docId'> = {
        ownerPartyId: party.partyId,
        docType: uploadForm.docType,
        category: uploadForm.category,
        fileName: uploadForm.fileName,
        fileSize: uploadForm.file?.size || 0,
        mimeType: uploadForm.file?.type || 'application/pdf',
        issuer: uploadForm.issuer,
        issueDate: uploadForm.issueDate,
        expiryDate: uploadForm.expiryDate,
        documentNumber: uploadForm.documentNumber,
        isVerified: false,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User', // In real app, get from auth context
        tags: []
      };

      await ApiClient.documents.create(newDocument);
      
      setIsUploadModalOpen(false);
      // Reset form
      setUploadForm({
        docType: '',
        category: 'Identity',
        fileName: '',
        file: null,
        issuer: '',
        issueDate: '',
        expiryDate: '',
        documentNumber: ''
      });
      
      router.refresh();
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Party Header */}
      <div className={cn(
        'p-6 rounded-lg border mb-6 shadow-sm',
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={cn(
              'text-2xl lg:text-3xl font-bold tracking-tight',
              darkMode ? 'text-white' : 'text-slate-900'
            )}>
              {party.name}
            </h1>
            <p className={cn(
              'mt-1 text-sm',
              darkMode ? 'text-slate-400' : 'text-slate-500'
            )}>
              Party ID: {party.partyId} • {party.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {party.residencyStatus && (
              <span className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                darkMode 
                  ? 'bg-slate-700 text-slate-300' 
                  : 'bg-slate-100 text-slate-800'
              )}>
                {party.residencyStatus}
              </span>
            )}
            {party.isPEP && (
              <span className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
              )}>
                PEP
              </span>
            )}
            {party.riskScore && party.riskScore > 50 && (
              <RiskBadge level={party.riskScore > 75 ? 'High' : 'Medium'} />
            )}
          </div>
        </div>

        {/* Enhanced Party Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          {party.type === 'Individual' && (
            <>
              {party.dateOfBirth && (
                <div>
                  <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                    Date of Birth
                  </p>
                  <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                    {formatDate(party.dateOfBirth)} (Age: {calculateAge(party.dateOfBirth)})
                  </p>
                </div>
              )}
              {party.nationality && (
                <div>
                  <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                    Nationality
                  </p>
                  <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                    {getCountryName(party.nationality)}
                  </p>
                </div>
              )}
              {party.occupation && (
                <div>
                  <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                    Occupation
                  </p>
                  <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                    {party.occupation}
                    {party.employer && ` at ${party.employer}`}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Contact Information */}
          {party.email && (
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-slate-400 mt-1" />
              <div>
                <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                  Email
                </p>
                <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                  {party.email}
                </p>
              </div>
            </div>
          )}
          {party.phone && (
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-slate-400 mt-1" />
              <div>
                <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                  Phone
                </p>
                <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                  {party.phone}
                </p>
              </div>
            </div>
          )}
          {party.address && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-slate-400 mt-1" />
              <div>
                <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                  Address
                </p>
                <p className={cn('mt-1 text-sm', darkMode ? 'text-white' : 'text-slate-900')}>
                  {formatAddress(party.address)}
                </p>
              </div>
            </div>
          )}

          {/* Financial Information */}
          {party.annualIncome && (
            <div className="flex items-start gap-2">
              <DollarSign size={16} className="text-slate-400 mt-1" />
              <div>
                <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                  Annual Income
                </p>
                <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                  {party.annualIncome}
                </p>
              </div>
            </div>
          )}
          {party.sourceOfWealth && (
            <div className="flex items-start gap-2">
              <Globe size={16} className="text-slate-400 mt-1" />
              <div>
                <p className={cn('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                  Source of Wealth
                </p>
                <p className={cn('mt-1', darkMode ? 'text-white' : 'text-slate-900')}>
                  {party.sourceOfWealth}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Documents */}
        <div className={cn(
          'border rounded-lg shadow-sm',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className={cn(
              'text-lg font-semibold',
              darkMode ? 'text-slate-200' : 'text-slate-800'
            )}>
              Master Documents
            </h2>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Upload size={14} />
              Upload New
            </button>
          </div>
          
          {partyDocuments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No documents"
                message="No master documents have been uploaded for this party."
                action={
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload size={16} />
                    Upload Document
                  </button>
                }
              />
            </div>
          ) : (
            <ul className={cn(
              'divide-y',
              darkMode ? 'divide-slate-700' : 'divide-slate-200'
            )}>
              {partyDocuments.map((doc) => (
                <li key={doc.docId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-slate-400" />
                      <div>
                        <p className={cn(
                          'font-medium',
                          darkMode ? 'text-slate-200' : 'text-slate-800'
                        )}>
                          {doc.docType}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {doc.fileName} • Uploaded: {formatDate(doc.uploadedAt)}
                        </p>
                        {doc.expiryDate && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Expires: {formatDate(doc.expiryDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.isVerified ? (
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        )}>
                          Verified
                        </span>
                      ) : (
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        )}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Associated Cases */}
        <div className={cn(
          'border rounded-lg shadow-sm',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          <h2 className={cn(
            'text-lg font-semibold p-4 border-b',
            darkMode ? 'text-slate-200 border-slate-700' : 'text-slate-800 border-slate-200'
          )}>
            Associated Cases
          </h2>
          
          {relatedCases.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Building}
                title="No associated cases"
                message="This party is not linked to any cases yet."
              />
            </div>
          ) : (
            <ul className={cn(
              'divide-y',
              darkMode ? 'divide-slate-700' : 'divide-slate-200'
            )}>
              {relatedCases.map((caseItem) => {
                const partyLink = caseItem.relatedPartyLinks.find(
                  link => link.partyId === party.partyId
                );
                return (
                  <li key={caseItem.caseId}>
                    <button
                      onClick={() => handleSelectCase(caseItem.caseId)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-opacity-50 transition-colors',
                        darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn(
                            'font-medium',
                            darkMode ? 'text-slate-200' : 'text-slate-800'
                          )}>
                            {caseItem.entityData.entityName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {caseItem.entityData.entityType} • Role: {partyLink?.relationshipType}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={caseItem.status} />
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Risk Indicators */}
      {(party.isPEP || party.riskFactors.length > 0) && (
        <div className={cn(
          'mt-6 p-4 rounded-lg border',
          darkMode 
            ? 'bg-red-900/20 border-red-800' 
            : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className={cn(
                'font-medium',
                darkMode ? 'text-red-300' : 'text-red-900'
              )}>
                Risk Factors
              </h3>
              <ul className="mt-2 space-y-1">
                {party.isPEP && (
                  <li className={cn(
                    'text-sm',
                    darkMode ? 'text-red-200' : 'text-red-700'
                  )}>
                    • Politically Exposed Person (PEP)
                  </li>
                )}
                {party.riskFactors.map((factor, index) => (
                  <li key={index} className={cn(
                    'text-sm',
                    darkMode ? 'text-red-200' : 'text-red-700'
                  )}>
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <div className={cn(
            'rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto',
            darkMode ? 'bg-slate-800' : 'bg-white'
          )}>
            <h2 className={cn(
              'text-xl font-bold mb-4',
              darkMode ? 'text-white' : 'text-slate-900'
            )}>
              Upload Document
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                )}>
                  Document Type *
                </label>
                <input
                  type="text"
                  value={uploadForm.docType}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, docType: e.target.value }))}
                  placeholder="e.g., Passport, Identity Card"
                  className={cn(
                    'w-full px-3 py-2 rounded-md border text-sm',
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-300'
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                )}>
                  Category *
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value as Document['category'] }))}
                  className={cn(
                    'w-full px-3 py-2 rounded-md border text-sm',
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-300'
                  )}
                >
                  <option value="Identity">Identity</option>
                  <option value="Address">Address</option>
                  <option value="Financial">Financial</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                )}>
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className={cn(
                    'w-full px-3 py-2 rounded-md border text-sm',
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white' 
                      : 'bg-white border-slate-300'
                  )}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  )}>
                    Issuer
                  </label>
                  <input
                    type="text"
                    value={uploadForm.issuer}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="e.g., ICA, DMV"
                    className={cn(
                      'w-full px-3 py-2 rounded-md border text-sm',
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  )}>
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={uploadForm.documentNumber}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className={cn(
                      'w-full px-3 py-2 rounded-md border text-sm',
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  )}>
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.issueDate}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    className={cn(
                      'w-full px-3 py-2 rounded-md border text-sm',
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-1',
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  )}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className={cn(
                      'w-full px-3 py-2 rounded-md border text-sm',
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
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
                onClick={handleUploadDocument}
                disabled={!uploadForm.docType || !uploadForm.fileName}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Also export as default for flexibility
export default PartyDetailView;