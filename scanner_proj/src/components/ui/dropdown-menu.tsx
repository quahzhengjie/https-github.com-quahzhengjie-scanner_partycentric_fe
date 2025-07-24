// src/components/ui/dropdown-menu.tsx

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  
  const { open, setOpen } = context;
  
  const handleClick = () => {
    setOpen(!open);
  };
  
  if (asChild && React.isValidElement(children)) {
    // Type-safe clone without any
    const childElement = children as React.ReactElement<{ onClick?: () => void }>;
    return React.cloneElement(childElement, { 
      onClick: handleClick 
    });
  }
  
  return (
    <button 
      type="button"
      onClick={handleClick} 
      className="inline-flex items-center"
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuContent({ 
  align = 'center', 
  children, 
  className 
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');
  
  const { open, setOpen } = context;
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);
  
  if (!open) return null;
  
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };
  
  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95',
        'dark:bg-slate-800 dark:border-slate-700',
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function DropdownMenuItem({ 
  onClick, 
  children, 
  className,
  disabled = false
}: DropdownMenuItemProps) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');
  
  const { setOpen } = context;
  
  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      setOpen(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-slate-100 dark:hover:bg-slate-700',
        'focus:bg-slate-100 dark:focus:bg-slate-700',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}