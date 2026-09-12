import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PersonaShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/persona" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Persona Health</span>
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => signOut()}
                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            )}
            <Link to="/" className="text-sm text-slate-300 hover:text-white transition-colors">
              ← Back to SERA
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
