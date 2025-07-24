// src/app/api/parties/[partyId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockParties } from '@/lib/mock-data';
import { Party } from '@/lib/types';

// In-memory storage for development
const parties: Party[] = [...mockParties];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partyId: string }> }
) {
  const { partyId } = await params;
  
  // In production, proxy to Spring Boot
  if (process.env.NODE_ENV === 'production' && process.env.SPRING_API_URL) {
    try {
      const response = await fetch(`${process.env.SPRING_API_URL}/parties/${partyId}`);
      if (!response.ok) {
        return NextResponse.json({ error: 'Party not found' }, { status: 404 });
      }
      return NextResponse.json(await response.json());
    } catch (error) {
      console.error('Failed to fetch from Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock
  const party = parties.find(p => p.partyId === partyId);
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  
  return NextResponse.json(party);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ partyId: string }> }
) {
  const { partyId } = await params;
  const updates = await request.json();
  
  // In production, proxy to Spring Boot
  if (process.env.NODE_ENV === 'production' && process.env.SPRING_API_URL) {
    try {
      const response = await fetch(`${process.env.SPRING_API_URL}/parties/${partyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        return NextResponse.json({ error: 'Party not found' }, { status: 404 });
      }
      return NextResponse.json(await response.json());
    } catch (error) {
      console.error('Failed to update party in Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }
  
  // Development mock
  const partyIndex = parties.findIndex(p => p.partyId === partyId);
  if (partyIndex === -1) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  
  // Update the party
  parties[partyIndex] = { ...parties[partyIndex], ...updates };
  
  return NextResponse.json(parties[partyIndex]);
}