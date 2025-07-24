// src/hooks/use-parties.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PartyService } from '@/services/party-service';
import { Party } from '@/lib/types';

export function useParties() {
  return useQuery({
    queryKey: ['parties'],
    queryFn: PartyService.getParties,
  });
}

export function useParty(partyId: string) {
  return useQuery({
    queryKey: ['parties', partyId],
    queryFn: () => PartyService.getParty(partyId),
    enabled: !!partyId,
  });
}

export function useCreateParty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (partyData: Omit<Party, 'partyId'>) =>
      PartyService.createParty(partyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
    },
  });
}

export function useUpdateParty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partyId, updates }: { partyId: string; updates: Partial<Party> }) =>
      PartyService.updateParty(partyId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['parties', variables.partyId] });
    },
  });
}