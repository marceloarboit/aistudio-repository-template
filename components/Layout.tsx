import React from 'react';
import { Home, PlusCircle, Database, BarChart3, FileText, LogOut } from 'lucide-react';
import { auth } from '../services/firebase';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Resumo', icon: Home },
    { id: 'entry', label: 'Lançar', icon: PlusCircle },
    { id: 'records', label: 'Histórico', icon: Database },
    { id: 'registry', label: 'Cadastros', icon: BarChart3 }, 
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold tracking-tight">ConcretoTrack Pro</h1>
            <p className="text-xs text-slate-400">Controle de Obra Online</p>
          </div>
          <div className="flex items-center gap-3">
             {/* User Initials */}
            <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
              {auth.currentUser?.email?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-end pb-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};