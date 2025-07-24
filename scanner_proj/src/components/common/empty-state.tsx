// src/components/common/empty-state.tsx

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  
  return (
    <div className="text-center">
      <div className={cn(
        'mx-auto flex items-center justify-center h-12 w-12 rounded-full',
        darkMode ? 'bg-slate-800' : 'bg-slate-100'
      )}>
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className={cn(
        'mt-4 text-lg font-medium',
        darkMode ? 'text-white' : 'text-slate-900'
      )}>
        {title}
      </h3>
      <p className={cn(
        'mt-1 text-sm',
        darkMode ? 'text-slate-400' : 'text-slate-500'
      )}>
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}