'use client';

import { useRouter } from 'next/navigation';
import { DashboardPage } from '@/components/dashboard/DashboardPage'; // We will create this component

export default function Home() {
  const router = useRouter();

  const handleSelectCase = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  const handleSelectParty = (partyId: string) => {
    router.push(`/parties/${partyId}`);
  };

  return (
      <DashboardPage
        onSelectCase={handleSelectCase}
        onSelectParty={handleSelectParty}
      />
  );
}