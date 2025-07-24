// src/app/api/cases/[caseId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockCases } from '@/lib/mock-data';
import { Case } from '@/lib/types';

// In-memory storage for development
class CaseStore {
  private cases: Case[] = [...mockCases];

  findCase(caseId: string) {
    return this.cases.find(c => c.caseId === caseId);
  }

  updateCase(caseId: string, updates: Partial<Case>) {
    const index = this.cases.findIndex(c => c.caseId === caseId);
    if (index === -1) return null;
    
    this.cases[index] = { ...this.cases[index], ...updates };
    return this.cases[index];
  }

  deleteCase(caseId: string) {
    const index = this.cases.findIndex(c => c.caseId === caseId);
    if (index === -1) return false;
    
    this.cases.splice(index, 1);
    return true;
  }
}

const caseStore = new CaseStore();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  
  // In production, proxy to Spring Boot
  if (process.env.NODE_ENV === 'production' && process.env.SPRING_API_URL) {
    try {
      const response = await fetch(`${process.env.SPRING_API_URL}/cases/${caseId}`);
      if (!response.ok) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
      return NextResponse.json(await response.json());
    } catch (error) {
      console.error('Failed to fetch from Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock
  const caseData = caseStore.findCase(caseId);
  if (!caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  
  return NextResponse.json(caseData);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const updates = await request.json();
  
  // In production, proxy to Spring Boot
  if (process.env.NODE_ENV === 'production' && process.env.SPRING_API_URL) {
    try {
      const response = await fetch(`${process.env.SPRING_API_URL}/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
      return NextResponse.json(await response.json());
    } catch (error) {
      console.error('Failed to update case in Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock
  const updatedCase = caseStore.updateCase(caseId, updates);
  if (!updatedCase) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  
  return NextResponse.json(updatedCase);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  
  // In production, proxy to Spring Boot
  if (process.env.NODE_ENV === 'production' && process.env.SPRING_API_URL) {
    try {
      const response = await fetch(`${process.env.SPRING_API_URL}/cases/${caseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('Failed to delete case in Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock
  const deleted = caseStore.deleteCase(caseId);
  if (!deleted) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  
  return new NextResponse(null, { status: 204 });
}