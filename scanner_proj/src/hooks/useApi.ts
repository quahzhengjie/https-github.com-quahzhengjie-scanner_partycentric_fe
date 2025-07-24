// /src/hooks/useApi.ts
// Custom React hooks for API integration with loading and error states

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api-client';
import { CaseService } from '@/services/case-service';
import { PartyService } from '@/services/party-service';
import authService from '@/services/auth';
import { 
  Case, 
  Party, 
  Document, 
  User, 
  CaseStatus,
  AccountStatus,
  DocumentStatus,
  Submission,
  EntityType,
  Account
} from '@/lib/types';
import { toast } from 'sonner';
import { WebSocketService } from '@/services/websocket-service';

// ============================================================================
// Authentication Hooks
// ============================================================================

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState<User | null>(authService.getUser());

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setIsAuthenticated(true);
      // Fetch full user details after login
      const fullUser = await ApiClient.users.current();
      setUser(fullUser);
      authService.setUser(fullUser);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const quickLogin = useCallback(async (userId: string) => {
    try {
      await authService.quickLogin(userId);
      setIsAuthenticated(true);
      const fullUser = await ApiClient.users.current();
      setUser(fullUser);
      authService.setUser(fullUser);
    } catch (error) {
      console.error('Quick login failed:', error);
      throw error;
    }
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    quickLogin,
  };
}

// ============================================================================
// Case Hooks
// ============================================================================

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => CaseService.getCases(),
    staleTime: 30000, // 30 seconds
  });
}

export function useCase(caseId: string | null) {
  return useQuery({
    queryKey: ['cases', caseId],
    queryFn: () => caseId ? CaseService.getCase(caseId) : null,
    enabled: !!caseId,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityName, entityType }: { entityName: string; entityType: EntityType }) => 
      CaseService.createCase(entityName, entityType),
    onSuccess: (newCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Case created successfully');
      return newCase;
    },
    onError: (error) => {
      toast.error('Failed to create case');
      console.error('Create case error:', error);
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, updates }: { caseId: string; updates: Partial<Case> }) =>
      CaseService.updateCase(caseId, updates),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Case updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update case');
      console.error('Update case error:', error);
    },
  });
}

export function useCaseActions() {
  const queryClient = useQueryClient();

  const submitForReview = useMutation({
    mutationFn: (caseId: string) => CaseService.submitForReview(caseId),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Case submitted for review');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ caseId, status, reason }: { caseId: string; status: CaseStatus; reason?: string }) =>
      ApiClient.cases.updateStatus(caseId, status, reason),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Case status updated');
    },
  });

  const linkParty = useMutation({
    mutationFn: ({ caseId, partyId, relationshipType }: { 
      caseId: string; 
      partyId: string; 
      relationshipType: string;
    }) => ApiClient.cases.linkParty(caseId, partyId, relationshipType),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Party linked successfully');
    },
  });

  const proposeAccount = useMutation({
    mutationFn: ({ caseId, accountData }: { caseId: string; accountData: Omit<Account, 'accountId' | 'accountNumber' | 'status' | 'createdAt' | 'updatedAt'> }) =>
      ApiClient.cases.proposeAccount(caseId, accountData),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Account proposed successfully');
    },
  });

  return {
    submitForReview,
    updateStatus,
    linkParty,
    proposeAccount,
  };
}

// ============================================================================
// Document Submission Hooks
// ============================================================================

export function useDocumentSubmissions() {
  const queryClient = useQueryClient();

  const addSubmission = useMutation({
    mutationFn: ({ caseId, requirementId, submission }: {
      caseId: string;
      requirementId: string;
      submission: Omit<Submission, 'submissionId'>;
    }) => CaseService.addSubmission(caseId, requirementId, submission),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Document submitted successfully');
    },
  });

  const updateSubmission = useMutation({
    mutationFn: ({ caseId, requirementId, submissionId, newStatus, commentText }: {
      caseId: string;
      requirementId: string;
      submissionId: string;
      newStatus: DocumentStatus;
      commentText?: string;
    }) => CaseService.updateSubmission(caseId, requirementId, submissionId, newStatus, commentText),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Submission updated successfully');
    },
  });

  return {
    addSubmission,
    updateSubmission,
  };
}

// ============================================================================
// Party Hooks
// ============================================================================

export function useParties() {
  return useQuery({
    queryKey: ['parties'],
    queryFn: () => PartyService.getParties(),
    staleTime: 60000, // 1 minute
  });
}

export function useParty(partyId: string | null) {
  return useQuery({
    queryKey: ['parties', partyId],
    queryFn: () => partyId ? PartyService.getParty(partyId) : null,
    enabled: !!partyId,
  });
}

export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partyData: Omit<Party, 'partyId' | 'createdAt' | 'updatedAt'>) =>
      PartyService.createParty(partyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast.success('Party created successfully');
    },
  });
}

// ============================================================================
// Document Hooks
// ============================================================================

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => ApiClient.documents.getAll(),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, metadata }: {
      file: File;
      metadata: {
        ownerPartyId: string;
        docType: string;
        category: Document['category'];
        issuer?: string;
        issueDate?: string;
        expiryDate?: string;
        documentNumber?: string;
      };
    }) => ApiClient.documents.upload(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    },
  });
}

// ============================================================================
// Account Hooks
// ============================================================================

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, accountId, status }: {
      caseId: string;
      accountId: string;
      status: AccountStatus;
    }) => CaseService.updateAccountStatus(caseId, accountId, status),
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ['cases', updatedCase.caseId] });
      toast.success('Account status updated');
    },
  });
}

// ============================================================================
// User Hooks
// ============================================================================

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => ApiClient.users.getAll(),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => ApiClient.users.current(),
    staleTime: 300000, // 5 minutes
  });
}

// ============================================================================
// Scan Integration Hook
// ============================================================================

export function useScanDocument() {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scanIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = useCallback(async (params: {
    caseId: string;
    requirementId: string;
    docType: string;
    partyId: string;
    scanProfile?: string;
  }) => {
    try {
      setScanStatus('scanning');
      setError(null);
      setProgress(0);

      const { scanId } = await ApiClient.scan.initiate(params);
      scanIdRef.current = scanId;

      // Start polling for status
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const status = await ApiClient.scan.status(scanId);
          setScanStatus(status.status as 'idle' | 'scanning' | 'processing' | 'completed' | 'failed');
          if (status.progress) setProgress(status.progress);

          if (status.status === 'completed' || status.status === 'failed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            if (status.status === 'failed') {
              setError(status.error || 'Scan failed');
            }
          }
        } catch (err) {
          console.error('Failed to check scan status:', err);
        }
      }, 1000); // Poll every second

    } catch (err) {
      setScanStatus('failed');
      setError(err instanceof Error ? err.message : 'Failed to start scan');
    }
  }, []);

  const cancelScan = useCallback(async () => {
    if (scanIdRef.current) {
      try {
        await ApiClient.scan.cancel(scanIdRef.current);
        setScanStatus('idle');
        setProgress(0);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } catch (err) {
        console.error('Failed to cancel scan:', err);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    scanStatus,
    progress,
    error,
    startScan,
    cancelScan,
  };
}

// ============================================================================
// WebSocket Hook
// ============================================================================

export function useWebSocket(userId: string) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Dynamic import to avoid SSR issues
    import('@/services/websocket-service').then(({ WebSocketService }) => {
      wsRef.current = new WebSocketService(userId);
      
      wsRef.current.on('connected', () => setIsConnected(true));
      wsRef.current.on('disconnected', () => setIsConnected(false));
      
      // Listen for real-time updates
      wsRef.current.on('case_updated', (message: { entityId: string; }) => {
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        queryClient.invalidateQueries({ queryKey: ['cases', message.entityId] });
      });

      wsRef.current.on('document_uploaded', () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      });

      wsRef.current.connect();
    });

    return () => {
      wsRef.current?.disconnect();
    };
  }, [userId, queryClient]);

  return { isConnected };
}

// ============================================================================
// Bulk Operations Hook
// ============================================================================

export function useBulkOperations() {
  const queryClient = useQueryClient();

  const bulkSubmitForReview = useMutation({
    mutationFn: (caseIds: string[]) => CaseService.bulkSubmitForReview(caseIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success(`${result.succeeded.length} cases submitted for review`);
      if (result.failed.length > 0) {
        toast.warning(`${result.failed.length} cases failed to submit`);
      }
    },
  });

  const bulkAssign = useMutation({
    mutationFn: ({ caseIds, assignedTo }: { caseIds: string[]; assignedTo: string }) =>
      CaseService.bulkAssign(caseIds, assignedTo),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success(`${result.succeeded.length} cases assigned`);
      if (result.failed.length > 0) {
        toast.warning(`${result.failed.length} cases failed to assign`);
      }
    },
  });

  return {
    bulkSubmitForReview,
    bulkAssign,
  };
}