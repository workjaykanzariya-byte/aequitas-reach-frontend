import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const MOCK_ADMIN = { id:1, name:'System Admin', email:'admin@aequitas.com', role:'admin' };
const MOCK_USER  = { id:2, name:'Aequitas User', email:'user@aequitas.com', role:'user' };

function mockMe(token){
  if (token==='mock_admin_token') return Promise.resolve(MOCK_ADMIN);
  if (token==='mock_user_token')  return Promise.resolve(MOCK_USER);
  return Promise.reject(new Error('Unauthenticated'));
}
function mockLogin({email,password}){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      if (email==='admin@aequitas.com' && password==='Secret123!') resolve({token:'mock_admin_token', user:MOCK_ADMIN});
      else if (email==='user@aequitas.com' && password==='Secret123!') resolve({token:'mock_user_token', user:MOCK_USER});
      else reject(new Error('Invalid'));
    },300);
  });
}
function mockLogout(){ return Promise.resolve({ok:true}); }

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ar_token');
    if (!token) { setBootstrapped(true); return; }
    mockMe(token).then(setUser).finally(()=>setBootstrapped(true));
  }, []);

  const login = async (email,password)=>{
    const {token, user} = await mockLogin({email,password});
    localStorage.setItem('ar_token', token);
    setUser(user);
    return user;
  };
  const logout = async ()=>{
    await mockLogout();
    localStorage.removeItem('ar_token');
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, login, logout, bootstrapped }}>{children}</AuthCtx.Provider>;
}
