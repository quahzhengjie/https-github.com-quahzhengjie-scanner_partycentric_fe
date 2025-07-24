// // src/app/(dashboard)/cases/page.tsx

// 'use client';

// import { useEffect, useState } from 'react';
// import { CaseListView } from '@/components/cases/case-list-view';
// import { ApiClient } from '@/lib/api-client';
// import { Case } from '@/lib/types';

// export default function CasesPage() {
//   const [cases, setCases] = useState<Case[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCases = async () => {
//       try {
//         const data = await ApiClient.cases.getAll();
//         setCases(data);
//       } catch (err) {
//         console.error('Error fetching cases:', err);
//         setError('Failed to load cases');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCases();
//   }, []);

//   if (loading) {
//     return <CaseListSkeleton />;
//   }

//   if (error) {
//     return (
//       <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
//         <div className="text-center">
//           <p className="text-red-600">{error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return <CaseListView initialCases={cases} />;
// }

// function CaseListSkeleton() {
//   return (
//     <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
//       <div className="animate-pulse">
//         <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {[1, 2, 3, 4, 5, 6].map((i) => (
//             <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-5">
//               <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
//               <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
//               <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// src/app/(dashboard)/cases/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { CaseListView } from '@/components/cases/case-list-view';
import { ApiClient } from '@/lib/api-client';
import { Case } from '@/lib/types';

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      console.log('=== Starting to fetch cases ===');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Full endpoint will be:', `${process.env.NEXT_PUBLIC_API_URL}/cases`);
      
      try {
        console.log('Calling ApiClient.cases.getAll()...');
        const data = await ApiClient.cases.getAll();
        
        console.log('✅ Successfully fetched cases:');
        console.log('Raw data:', data);
        console.log('Data type:', typeof data);
        console.log('Is array?', Array.isArray(data));
        console.log('Number of cases:', data.length);
        
        // Log each case structure
        data.forEach((caseItem, index) => {
          console.log(`Case ${index + 1}:`, {
            caseId: caseItem.caseId,
            status: caseItem.status,
            entityName: caseItem.entityData?.entityName,
            riskLevel: caseItem.riskLevel,
            assignedTo: caseItem.assignedTo
          });
        });
        
        setCases(data);
      } catch (err) {
        console.error('❌ Error fetching cases:', err);
        console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        setError('Failed to load cases');
      } finally {
        console.log('=== Fetch complete, setting loading to false ===');
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  console.log('Current state:', {
    loading,
    error,
    casesCount: cases.length,
    cases: cases
  });

  if (loading) {
    console.log('Rendering loading skeleton...');
    return <CaseListSkeleton />;
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering CaseListView with cases:', cases);
  return <CaseListView initialCases={cases} />;
}

function CaseListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-5">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}