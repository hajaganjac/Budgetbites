import React, { useState, useCallback } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { LogoutProvider } from './context/LogoutContext';
import { LoginScreen } from './pages/LoginScreen';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [initialName,  setInitialName]  = useState('Student');
  const [initialEmoji, setInitialEmoji] = useState('👨‍🎓');

  const handleLogin = useCallback((name: string, emoji: string) => {
    setInitialName(name);
    setInitialEmoji(emoji);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setInitialName('Student');
    setInitialEmoji('👨‍🎓');
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!isLoggedIn ? (
        <motion.div
          key="login"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4 }}
          style={{ position: 'fixed', inset: 0 }}
        >
          <LoginScreen onLogin={handleLogin} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{ height: '100vh' }}
        >
          <LogoutProvider onLogout={handleLogout}>
            <AppProvider initialName={initialName} initialEmoji={initialEmoji}>
              <RouterProvider router={router} />
            </AppProvider>
          </LogoutProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
