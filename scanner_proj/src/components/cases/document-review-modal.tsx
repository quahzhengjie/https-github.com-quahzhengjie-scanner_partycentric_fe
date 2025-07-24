// src/components/cases/document-review-modal.tsx

'use client';

import { useState } from 'react';
import { X, Upload, ScanLine, History, Check, Ban } from 'lucide-react';
import { 
  ChecklistItem, 
  DocumentStatus, 
  Submission // Import Document type with alias to avoid conflict with browser Document
} from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { ApiClient } from '@/lib/api-client';
import { cn, formatDateTime } from '@/lib/utils';

interface DocumentReviewModalProps {
  item: ChecklistItem;
  onClose: () => void;
  caseId: string;
  onUpdate: () => void;
}

export function DocumentReviewModal({
  item,
  onClose,
  caseId,
  onUpdate
}: DocumentReviewModalProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const darkMode = useUIStore((state) => state.darkMode);
  
  const latestSubmission = item.submissions.length > 0 
    ? item.submissions[item.submissions.length - 1] 
    : null;
  
  const canReview = currentUser && (
    (currentUser.role === 'Checker' && item.status === 'Pending Checker Verification') ||
    (currentUser.role === 'Compliance' && item.status === 'Pending Compliance Verification')
  );
  
  const canFulfill = currentUser?.role === 'RM';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" 
      onClick={onClose}
    >
      <div 
        className={cn(
          'rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden',
          darkMode ? 'bg-slate-800' : 'bg-white'
        )} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-start">
          <div>
            <h2 className={cn(
              'text-lg font-bold',
              darkMode ? 'text-white' : 'text-slate-900'
            )}>
              {item.name}
            </h2>
            {item.description && (
              <p className={cn(
                'text-sm mt-1',
                darkMode ? 'text-slate-400' : 'text-slate-500'
              )}>
                {item.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-1 rounded-full',
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {item.submissions.length > 0 ? (
            <SubmissionHistory 
              submissions={[...item.submissions].reverse()} 
              darkMode={darkMode} 
            />
          ) : (
            <p className="text-sm text-center text-slate-500 py-4">
              No documents have been submitted for this requirement yet.
            </p>
          )}
        </div>
        
        {canFulfill && (
          <FulfillRequirementForm
            item={item}
            caseId={caseId}
            onClose={onClose}
            onUpdate={onUpdate}
            darkMode={darkMode}
          />
        )}
        
        {canReview && latestSubmission && (
          <ReviewerCommentForm
            requirementId={item.id}
            submissionId={latestSubmission.submissionId}
            caseId={caseId}
            onClose={onClose}
            onUpdate={onUpdate}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}

interface SubmissionHistoryProps {
  submissions: Submission[];
  darkMode: boolean;
}

function SubmissionHistory({ submissions, darkMode }: SubmissionHistoryProps) {
  return (
    <div className="space-y-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
      <h6 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2">
        <History size={14} />
        Submission History
      </h6>
      {submissions.map((s, index) => (
        <div 
          key={s.submissionId} 
          className={cn(
            'p-2.5 rounded-md',
            darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
          )}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Attempt {submissions.length - index} ({s.status})
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {formatDateTime(s.submittedAt)} by {s.submittedBy}
            </span>
          </div>
          {s.publishedDate && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Published: {formatDateTime(s.publishedDate)}
            </p>
          )}
          {s.expiryDate && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Expires: {formatDateTime(s.expiryDate)}
            </p>
          )}
          {s.comments.map(c => (
            <div 
              key={c.commentId} 
              className={cn(
                'p-2 mt-2 rounded-md text-sm',
                darkMode ? 'bg-slate-800/50' : 'bg-slate-200'
              )}
            >
              <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1">
                - {c.author} ({c.authorRole}) at {formatDateTime(c.timestamp)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface FulfillRequirementFormProps {
  item: ChecklistItem;
  caseId: string;
  onClose: () => void;
  onUpdate: () => void;
  darkMode: boolean;
}

function FulfillRequirementForm({
  item,
  caseId,
  onClose,
  onUpdate,
  darkMode
}: FulfillRequirementFormProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [comment, setComment] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'scan'>('upload');
  const [publishedDate, setPublishedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd handle file upload here
      // For now, we'll create a mock document
      let docToLink = '';
      
      if (uploadMode === 'upload') {
        // Mock document creation with enhanced fields
        const newDoc = await ApiClient.documents.create({
          ownerPartyId: item.ownerPartyId,
          docType: item.name,
          category: item.category, // Use the category directly from the item
          fileName: 'mock_document.pdf', // In real app, get from file input
          fileSize: 1024 * 100, // 100KB mock size
          mimeType: 'application/pdf',
          issuer: undefined,
          issueDate: publishedDate || undefined,
          expiryDate: expiryDate || undefined,
          documentNumber: undefined,
          isVerified: false,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.name,
          tags: []
        });
        docToLink = newDoc.docId;
      }
      
      if (!docToLink) return;

      const newSubmission = {
        masterDocId: docToLink,
        status: 'Pending Checker Verification' as DocumentStatus,
        submittedAt: new Date().toISOString(),
        submittedBy: currentUser.name,
        submissionMethod: 'Upload' as const, // Add the required submissionMethod field
        comments: comment ? [{
          commentId: `C-${Date.now()}`,
          author: currentUser.name,
          authorRole: currentUser.role,
          timestamp: new Date().toISOString(),
          text: comment,
          isInternal: false,
          attachments: []
        }] : [],
        publishedDate: publishedDate || undefined,
        expiryDate: expiryDate || undefined,
      };
      
      await ApiClient.cases.addSubmission(caseId, item.id, newSubmission);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to submit document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      'p-4 mt-4 border-t rounded-b-lg',
      darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
    )}>
      <div className="space-y-4">
        <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
          Upload New Version
        </h5>
        
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setUploadMode('upload')}
              className={cn(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                uploadMode === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              <Upload size={14} className="inline-block mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setUploadMode('scan')}
              className={cn(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                uploadMode === 'scan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              <ScanLine size={14} className="inline-block mr-2" />
              Scan Document
            </button>
          </nav>
        </div>

        {uploadMode === 'upload' && (
          <div className="space-y-4">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload size={32} className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                  <label className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Click to upload</span>
                    <input type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>
        )}

        {uploadMode === 'scan' && (
          <div className="text-center p-4">
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 mx-auto">
              <ScanLine size={16} />
              Start Scan with NAPS2
            </button>
            <p className="text-xs text-slate-500 mt-2">(This is a mock interface)</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Published Date (Optional)
            </label>
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md text-sm',
                darkMode ? 'bg-slate-700 border-slate-600' : 'border-slate-300'
              )}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={cn(
                'mt-1 block w-full rounded-md text-sm',
                darkMode ? 'bg-slate-700 border-slate-600' : 'border-slate-300'
              )}
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Add Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className={cn(
              'mt-1 block w-full rounded-md text-sm',
              darkMode ? 'bg-slate-700 border-slate-600' : 'border-slate-300'
            )}
            placeholder="Initial comment..."
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md border',
              darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReviewerCommentFormProps {
  requirementId: string;
  submissionId: string;
  caseId: string;
  onClose: () => void;
  onUpdate: () => void;
  darkMode: boolean;
}

function ReviewerCommentForm({
  requirementId,
  submissionId,
  caseId,
  onClose,
  onUpdate,
  darkMode
}: ReviewerCommentFormProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (newStatus: DocumentStatus) => {
    if (!comment.trim() && newStatus !== 'Verified' && newStatus !== 'Pending Compliance Verification' && newStatus !== 'Rejected') {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await ApiClient.cases.updateSubmission(
        caseId,
        requirementId,
        submissionId,
        {
          newStatus,
          commentText: comment
        }
      );
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getApproveStatus = (): DocumentStatus => {
    if (currentUser?.role === 'Checker') return 'Pending Compliance Verification';
    if (currentUser?.role === 'Compliance') return 'Verified';
    return 'Verified';
  };

  return (
    <div className={cn(
      'p-3 mt-2 border-t',
      darkMode ? 'border-slate-700' : 'border-slate-600'
    )}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className={cn(
          'block w-full rounded-md text-sm',
          darkMode ? 'bg-slate-700 border-slate-600' : 'border-slate-300'
        )}
        placeholder={`Add comment as ${currentUser?.name}...`}
      />
      <div className="flex justify-end items-center mt-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-md border',
            darkMode ? 'border-slate-500' : 'border-slate-300'
          )}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit('Pending Checker Verification')}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
        >
          Add Comment
        </button>
        <button
          onClick={() => handleSubmit('Rejected')}
          disabled={isSubmitting}
          className="p-1.5 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <Ban size={16} />
        </button>
        <button
          onClick={() => handleSubmit(getApproveStatus())}
          disabled={isSubmitting}
          className="p-1.5 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <Check size={16} />
        </button>
      </div>
    </div>
  );
}