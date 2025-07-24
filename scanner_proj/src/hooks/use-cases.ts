// src/hooks/use-cases.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CaseService } from '@/services/case-service';
import { Case, EntityType } from '@/lib/types';

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: CaseService.getCases,
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId],
    queryFn: () => CaseService.getCase(caseId),
    enabled: !!caseId,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ entityName, entityType }: { entityName: string; entityType: EntityType }) =>
      CaseService.createCase(entityName, entityType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, updates }: { caseId: string; updates: Partial<Case> }) =>
      CaseService.updateCase(caseId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId] });
    },
  });
}

export function useSubmitForReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (caseId: string) => CaseService.submitForReview(caseId),
    onSuccess: (data, caseId) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
  });
}