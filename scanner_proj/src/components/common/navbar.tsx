'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuthStore(); // Use the Zustand store
  const { darkMode, toggleDarkMode } = useUIStore();

  const navItems = [
    { href: '/cases', label: 'All Cases' },
    { href: '/parties', label: 'Parties' },
  ];

  return (
    <div className={cn(
      'shadow-sm sticky top-0 z-40 backdrop-blur-lg',
      darkMode ? 'bg-slate-900/80 border-b border-slate-700' : 'bg-white/80 border-b border-slate-200'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/cases" className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-500" />
              <span className={cn(
                'ml-3 text-xl font-semibold tracking-tight',
                darkMode ? 'text-white' : 'text-slate-800'
              )}>
                CaseFlow
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? darkMode ? 'text-white' : 'text-slate-900'
                    : darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className={cn(darkMode ? 'text-slate-400' : 'text-slate-500')}>Welcome, </span>
                  <span className={cn("font-semibold", darkMode ? 'text-white' : 'text-slate-800')}>{currentUser.name}</span>
                </div>
                <button
                  onClick={logout}
                  className={cn("p-2 rounded-full", darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100')}
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
            
            <button
              onClick={toggleDarkMode}
              className={cn(
                'p-2 rounded-full transition-colors',
                darkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}