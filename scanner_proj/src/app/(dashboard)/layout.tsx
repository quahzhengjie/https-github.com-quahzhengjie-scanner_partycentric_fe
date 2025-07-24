// src/app/(dashboard)/layout.tsx

import { Navbar } from '@/components/common/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}