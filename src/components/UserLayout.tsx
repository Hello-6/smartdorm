import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Home } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    import('echarts');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
              <Home size={15} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-xs sm:text-sm">智慧公寓</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <User size={12} className="text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 truncate max-w-16 sm:max-w-none">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200/60 hover:border-red-200/60 transition-all flex-shrink-0"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        {children}
      </main>

      <footer className="text-center py-4 sm:py-6 text-[10px] text-slate-400">
        <p>SmartDorm · Utility Management System</p>
      </footer>
    </div>
  );
}
