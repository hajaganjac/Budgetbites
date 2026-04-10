import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Menu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { AchievementToast } from './AchievementToast';
import { useLogout } from '../context/LogoutContext';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const onLogout = useLogout();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F9FF' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar isOpen={true} onClose={() => {}} onLogout={onLogout} />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-4 px-4 py-3 flex-shrink-0"
          style={{ background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(true)}
            style={{ color: 'white' }}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #F24E6F, #29B6C5)' }}
            >
              🍝
            </div>
            <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>BudgetBites</span>
          </div>

          {/* Mobile logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity"
            style={{
              background: 'rgba(242,78,111,0.18)',
              border: '1px solid rgba(242,78,111,0.3)',
              color: '#F24E6F',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>

        {/* Page content — animated transitions between routes */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global achievement toast */}
      <AchievementToast />
    </div>
  );
}
