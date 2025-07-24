//src/app/layout.tsx 

import './globals.css';
import { Providers }    from './providers';
import ProtectedRoute   from '@/components/ProtectedRoute';

export const metadata = { title: 'CaseFlow' };

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
