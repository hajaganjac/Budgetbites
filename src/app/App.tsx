import React, { useState, useCallback, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { LogoutProvider } from './context/LogoutContext';
import { LoginScreen } from './pages/LoginScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';

const SESSION_KEY = 'budgetbites_session';

interface Session {
  name: string;
  emoji: string;
}

function getSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [initialName,  setInitialName]  = useState('Student');
  const [initialEmoji, setInitialEmoji] = useState('👨‍🎓');

  // Restore session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setInitialName(session.name);
      setInitialEmoji(session.emoji);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = useCallback((name: string, emoji: string) => {
    setInitialName(name);
    setInitialEmoji(emoji);
    setIsLoggedIn(true);
    saveSession({ name, emoji });
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setInitialName('Student');
    setInitialEmoji('👨‍🎓');
    clearSession();
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
