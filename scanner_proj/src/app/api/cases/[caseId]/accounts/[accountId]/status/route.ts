// src/app/api/cases/[caseId]/accounts/[accountId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockCases } from '@/lib/mock-data';

interface RouteParams {
  params: Promise<{
    caseId: string;
    accountId: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { caseId, accountId } = await params;
    const { status } = await request.json();
    
    // In production, this would update the database
    // For now, we'll return a success response with updated mock data
    
    // Find the case - in real app, this would be a database query
    const caseToUpdate = mockCases.find(c => c.caseId === caseId);
    if (!caseToUpdate) {
      return NextResponse.json(
        { error: `Case ${caseId} not found` },
        { status: 404 }
      );
    }
    
    // Mock implementation - in real app, this would be a database update
    const updatedCase = {
      ...caseToUpdate,
      accounts: caseToUpdate.accounts.map(acc => 
        acc.accountId === accountId 
          ? { ...acc, status } 
          : acc
      ),
      activities: [
        ...caseToUpdate.activities,
        {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Current User',
          actorRole: 'RM' as const,
          actorId: 'U001',
          action: `Account status changed to ${status}`,
          actionType: 'Update' as const,
          entityType: 'Account' as const,
          entityId: accountId,
          details: `Account ${accountId} status updated to ${status}`
        }
      ]
    };
    
    return NextResponse.json(updatedCase);
  } catch (err) {
    console.error('Failed to update account status:', err);
    return NextResponse.json(
      { error: 'Failed to update account status' },
      { status: 500 }
    );
  }
}