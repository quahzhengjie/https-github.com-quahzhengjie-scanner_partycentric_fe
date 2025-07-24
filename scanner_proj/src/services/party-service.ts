// src/services/party-service.ts

import { ApiClient } from '@/lib/api-client';
import { Party } from '@/lib/types';

export class PartyService {
  static async getParties(): Promise<Party[]> {
    return ApiClient.parties.getAll();
  }
  
  static async getParty(partyId: string): Promise<Party> {
    return ApiClient.parties.getById(partyId);
  }
  
  static async createParty(partyData: Omit<Party, 'partyId' | 'createdAt' | 'updatedAt'>): Promise<Party> {
    return ApiClient.parties.create(partyData);
  }
  
  static async updateParty(partyId: string, updates: Partial<Party>): Promise<Party> {
    return ApiClient.parties.update(partyId, updates);
  }
}