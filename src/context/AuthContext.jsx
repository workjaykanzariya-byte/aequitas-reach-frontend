import { createContext, useContext, useEffect, useState } from 'react';
import { mockLogin, mockLogout, mockMe } from '../lib/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ar_token');
    if (!token) { setBootstrapped(true); return; }
    mockMe(token).then(setUser).finally(() => setBootstrapped(true));
  }, []);

  const login = async (email, password) => {
    const { token, user } = await mockLogin({ email, password });
    localStorage.setItem('ar_token', token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await mockLogout();
    localStorage.removeItem('ar_token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, bootstrapped }}>
      {children}
    </AuthCtx.Provider>
  );
}
