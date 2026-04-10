import React, { createContext, useContext } from 'react';

const LogoutContext = createContext<() => void>(() => {});

export const LogoutProvider = ({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) => (
  <LogoutContext.Provider value={onLogout}>{children}</LogoutContext.Provider>
);

export const useLogout = () => useContext(LogoutContext);
