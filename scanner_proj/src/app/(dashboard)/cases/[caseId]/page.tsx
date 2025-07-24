// src/app/(dashboard)/cases/[caseId]/page.tsx

'use client';

import { use } from 'react';
import {  useRouter } from 'next/navigation';
import { CaseDetailView } from '@/components/cases/case-detail-view';

interface CaseDetailPageProps {
  params: Promise<{
    caseId: string;
  }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const router = useRouter();
  const { caseId } = use(params);
  
  const handleSelectParty = (partyId: string) => {
    // Navigate to party detail page
    router.push(`/parties/${partyId}`);
  };
  
  const handleBack = () => {
    // Navigate back to cases list
    router.push('/cases');
  };

  return (
    <CaseDetailView 
      caseId={caseId}
      onSelectParty={handleSelectParty}
      onBack={handleBack}
    />
  );
}