import { Shield, LayoutDashboard, ScanSearch, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Bosh sahifa', active: true },
    { icon: ScanSearch, label: 'Scan', active: false },
    { icon: FileText, label: 'Hisobotlar', active: false },
    { icon: Settings, label: 'Sozlamalar', active: false },
  ];

  return (
    <div
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
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              item.active
                ? 'bg-[#22c55e]/20 text-[#22c55e] shadow-lg'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            style={
              item.active
                ? { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }
                : undefined
            }
          >
            <item.icon className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
