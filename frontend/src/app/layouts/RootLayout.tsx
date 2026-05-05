import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';
import { Shield, LayoutDashboard, ScanSearch, History, FileText, ChevronLeft, ChevronRight, User, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Bosh sahifa', path: '/dashboard' },
    { icon: ScanSearch, label: 'Yangi scan', path: '/scan/new' },
    { icon: History, label: 'Scan tarixi', path: '/scan/history' },
    { icon: FileText, label: 'Hisobotlar', path: '/reports' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="rounded-2xl border border-white/10 bg-[#020617] px-6 py-4 shadow-2xl shadow-black/40">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0f172a]">
      <aside
        className={`h-full bg-[#020617] border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}
        style={{
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#22c55e]" style={{ filter: 'drop-shadow(0 0 8px #22c55e)' }} />
              <span className="font-semibold text-white">Sentinel-OWASP</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#22c55e]/20 text-[#22c55e]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                style={
                  isActive
                    ? { boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), inset 0 0 10px rgba(34, 197, 94, 0.1)' }
                    : undefined
                }
              >
                <item.icon
                  className="w-5 h-5"
                  style={{
                    strokeWidth: 1.5,
                    filter: isActive ? 'drop-shadow(0 0 4px #22c55e)' : undefined
                  }}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="h-16 border-b border-white/10 flex items-center justify-between px-6"
          style={{
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <h1 className="text-white text-lg">Xavfsizlik Paneli</h1>
            <p className="text-gray-400 text-xs">Haqiqiy vaqt monitoringi va tahlil</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] mr-2 animate-pulse"></span>
              Onlayn
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
              >
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#22c55e] flex items-center justify-center text-white font-semibold"
                  style={{
                    boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-white text-sm">{user.name}</div>
                  <div className="text-gray-400 text-xs">{user.email}</div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden border border-white/10"
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <div className="p-3 border-b border-white/10">
                      <div className="text-white text-sm font-semibold">{user.name}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>

                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profil</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Sozlamalar</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Chiqish</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
