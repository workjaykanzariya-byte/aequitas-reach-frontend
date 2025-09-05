import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');

  const submit = async (e)=>{
    e.preventDefault();
    setErr('');
    try { await login(form.email, form.password); nav('/dashboard'); }
    catch { setErr('Invalid email or password.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-semibold mb-1 text-center">Aequitas Reach</h1>
        <p className="text-xs text-center text-slate-500 mb-5">Sign in to continue</p>
        {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
        <label className="block mb-1 text-sm">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" value={form.email}
               onChange={e=>setForm({...form, email:e.target.value})} placeholder="admin@aequitas.com or user@aequitas.com"/>
        <label className="block mb-1 text-sm">Password</label>
        <input className="w-full border rounded px-3 py-2 mb-5" type="password" value={form.password}
               onChange={e=>setForm({...form, password:e.target.value})} placeholder="Secret123!"/>
        <button className="w-full rounded-xl py-2 bg-black text-white">Login</button>
        <div className="mt-4 text-xs text-slate-500">
          <p><b>Demo creds:</b> admin@aequitas.com / Secret123! (Admin)</p>
          <p>user@aequitas.com / Secret123! (User)</p>
        </div>
      </form>
    </div>
  );
}
