// src/app/page.tsx

'use client';

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main cases page by default.
  // The ProtectedRoute component will handle redirecting to /login if not authenticated.
  redirect('/cases');
}