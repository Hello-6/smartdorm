import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Bell, ChevronLeft, ChevronRight, Droplets, Zap, LogOut, Shield, User, Users, DoorOpen, ClipboardList, AlertTriangle, Home, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { path: '/', label: '数据概览', icon: LayoutDashboard },
  { path: '/dormitory/1', label: '楼栋详情', icon: Building2 },
];

const adminNavItems = [
  { path: '/alerts', label: '告警中心', icon: Bell },
  { path: '/admin/users', label: '用户管理', icon: Users },
  { path: '/admin/buildings', label: '楼栋管理', icon: Building2 },
  { path: '/admin/rooms', label: '房间管理', icon: DoorOpen },
  { path: '/admin/records', label: '数据管理', icon: ClipboardList },
  { path: '/admin/alerts', label: '告警管理', icon: AlertTriangle },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    import('echarts');
    const close = () => setMobileMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const isAdminUser = isAdmin();

  return (
    <div className="flex h-screen text-slate-600 overflow-hidden">
      <aside
        className={`bg-white border-r border-slate-200/60 flex-col transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        } hidden md:flex`}
      >
        <SidebarContent isAdminUser={isAdminUser} user={user} sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200/60 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                  <Home size={16} className="text-white" />
                </div>
                <span className="font-semibold text-sm text-slate-800">智慧公寓</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>
            <SidebarContent isAdminUser={isAdminUser} user={user} sidebarCollapsed={false} toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
              <Home size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">智慧公寓</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 truncate max-w-20">{user?.username}</span>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

function SidebarContent({
  isAdminUser, user, sidebarCollapsed, toggleSidebar, handleLogout
}: {
  isAdminUser: boolean;
  user: any;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200/60 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Home size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm text-slate-800 whitespace-nowrap">智慧公寓</span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
        {isAdminUser && (
          <>
            {!sidebarCollapsed && (
              <div className="px-3 py-2 mt-4 mb-1">
                <div className="h-px bg-gradient-to-r from-emerald-500/20 via-slate-200 to-transparent" />
                <span className="text-[10px] text-slate-400 mt-2 block">管理功能</span>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="px-2 py-2 mt-2 mb-1">
                <div className="h-px bg-slate-200" />
              </div>
            )}
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-2 border-t border-slate-200/60">
        {!sidebarCollapsed && user && (
          <div className="px-3 py-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              {isAdminUser ? (
                <Shield size={12} className="text-emerald-500" />
              ) : (
                <User size={12} className="text-slate-400" />
              )}
              <span className="text-xs text-slate-600 truncate">{user.username}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                isAdminUser ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {isAdminUser ? '管理员' : '用户'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Droplets size={10} />
                <span>实时监控中</span>
              </div>
            )}
          </div>
        )}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all mb-1"
          >
            <LogOut size={14} />
            {!sidebarCollapsed && <span>退出登录</span>}
          </button>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </>
  );
}
