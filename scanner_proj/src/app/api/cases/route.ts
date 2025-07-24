// src/app/api/cases/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockCases, mockParties } from '@/lib/mock-data';
import { Case, CreateCaseDto, Party } from '@/lib/types';

// Configuration
const SPRING_API_URL = process.env.SPRING_API_URL || 'http://localhost:8081/api';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// In-memory storage for development
class MockDataStore {
  private cases: Case[] = [...mockCases];
  private parties: Party[] = [...mockParties];

  getCases() {
    return this.cases;
  }

  addCase(caseData: Case) {
    this.cases.push(caseData);
  }

  findParty(predicate: (party: Party) => boolean) {
    return this.parties.find(predicate);
  }

  addParty(party: Party) {
    this.parties.push(party);
  }

  getPartiesCount() {
    return this.parties.length;
  }
}

const mockStore = new MockDataStore();

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Forward authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  // Also check for auth token in cookies (if using cookies)
  const authCookie = request.cookies.get('authToken');
  if (authCookie && !authHeader) {
    headers['Authorization'] = `Bearer ${authCookie.value}`;
  }
  
  return headers;
}

export async function GET(request: NextRequest) {
  // Use Spring Boot backend if not in mock mode
  if (!USE_MOCK_DATA) {
    try {
      const headers = getAuthHeaders(request);
      
      // Forward query parameters
      const { searchParams } = new URL(request.url);
      const queryString = searchParams.toString();
      const url = `${SPRING_API_URL}/cases${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return NextResponse.json(
          errorData || { error: 'Failed to fetch cases' },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch from Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock
  return NextResponse.json(mockStore.getCases());
}

export async function POST(request: NextRequest) {
  const data: CreateCaseDto = await request.json();
  
  // Use Spring Boot backend if not in mock mode
  if (!USE_MOCK_DATA) {
    try {
      const headers = getAuthHeaders(request);
      
      const response = await fetch(`${SPRING_API_URL}/cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return NextResponse.json(
          errorData || { error: 'Failed to create case' },
          { status: response.status }
        );
      }
      
      const newCase = await response.json();
      return NextResponse.json(newCase, { status: 201 });
    } catch (error) {
      console.error('Failed to create case in Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock implementation (your existing code)
  let newPartyId: string | null = null;
  
  // For individual accounts, check if party exists or create new one
  if (data.entityType === 'Individual Account') {
    const existingParty = mockStore.findParty(
      p => p.name.toLowerCase() === data.entityName.toLowerCase()
    );
    
    if (existingParty) {
      newPartyId = existingParty.partyId;
    } else {
      // Create a new party with all required fields
      newPartyId = `P${String(mockStore.getPartiesCount() + 1).padStart(3, '0')}`;
      const newParty: Party = {
        partyId: newPartyId,
        name: data.entityName,
        type: 'Individual',
        residencyStatus: 'Singaporean/PR',
        isPEP: false,
        isSanctioned: false,
        riskFactors: [],
        address: {
          line1: 'Address to be updated',
          city: 'Singapore',
          postalCode: '000000',
          country: 'SG'
        },
        documentLinks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: data.assignedTo || 'System'
      };
      mockStore.addParty(newParty);
    }
  }
  
  const newCase: Case = {
    caseId: `CASE-${Date.now()}`,
    status: 'Draft',
    riskLevel: data.riskLevel || 'Medium',
    priority: data.priority || 'Normal',
    assignedTo: data.assignedTo || 'Unassigned',
    entityData: {
      entityName: data.entityName,
      entityType: data.entityType,
      registeredAddress: {
        line1: 'Address to be updated',
        city: 'Singapore',
        postalCode: '000000',
        country: 'SG'
      },
      taxId: '',
    },
    relatedPartyLinks: data.entityType === 'Individual Account' && newPartyId 
      ? [{ 
          partyId: newPartyId, 
          relationshipType: 'Primary Holder',
          isPrimary: true 
        }]
      : [],
    accounts: [],
    accountApprovalSnapshots: [],
    activities: [{
      id: `A-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'System',
      actorRole: 'Admin',
      actorId: 'SYSTEM',
      action: 'Case Created',
      actionType: 'Create',
      entityType: 'Case',
      entityId: `CASE-${Date.now()}`
    }],
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockStore.addCase(newCase);
  return NextResponse.json(newCase, { status: 201 });
}