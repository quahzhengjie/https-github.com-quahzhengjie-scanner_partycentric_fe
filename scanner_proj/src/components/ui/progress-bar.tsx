// src/components/ui/progress-bar.tsx

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  progress, 
  className,
  showLabel = false,
  size = 'md'
}: ProgressBarProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className={cn(
            'text-xs font-medium',
            darkMode ? 'text-slate-300' : 'text-slate-600'
          )}>
            Progress
          </span>
          <span className={cn(
            'text-xs font-semibold',
            darkMode ? 'text-white' : 'text-slate-800'
          )}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        heights[size],
        darkMode ? 'bg-slate-700' : 'bg-slate-200'
      )}>
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            progress === 100 
              ? 'bg-green-500' 
              : 'bg-blue-500'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}