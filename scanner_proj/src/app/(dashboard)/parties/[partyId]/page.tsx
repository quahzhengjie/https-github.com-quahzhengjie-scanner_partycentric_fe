// src/app/(dashboard)/parties/[partyId]/page.tsx

import { notFound } from 'next/navigation';
import { PartyDetailView } from '@/components/parties/party-detail-view';
import { mockParties, mockCases, mockDocuments } from '@/lib/mock-data';

interface PartyDetailPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function PartyDetailPage({ params }: PartyDetailPageProps) {
  // Await params in Next.js 15
  const { partyId } = await params;
  
  // Use mock data during build
  const party = mockParties.find(p => p.partyId === partyId);
  
  if (!party) {
    notFound();
  }

  return (
    <PartyDetailView 
      party={party}
      allCases={mockCases}
      allDocuments={mockDocuments}
    />
  );
}

export async function generateMetadata({ params }: PartyDetailPageProps) {
  // Await params in Next.js 15
  const { partyId } = await params;
  
  const party = mockParties.find(p => p.partyId === partyId);
  
  if (!party) {
    return {
      title: 'Party Not Found - CaseFlow',
    };
  }

  return {
    title: `${party.name} - CaseFlow`,
    description: `Party details for ${party.name}`,
  };
}