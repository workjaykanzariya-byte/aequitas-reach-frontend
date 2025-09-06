import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockRegister } from '../lib/api';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const submit = async (e)=>{
    e.preventDefault(); setErr(''); setMsg('');
    if (form.password !== form.confirm) { setErr('Passwords do not match'); return; }
    try{
      const res = await mockRegister({ name:form.name, email:form.email, password:form.password });
      setMsg(res.message);
      setTimeout(()=> nav('/login'), 900);
    }catch(e){ setErr(e.message || 'Registration failed'); }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" alt="Aequitas" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">Create your account</h2>
        {err && <div className="mt-3 text-center text-sm text-red-400">{err}</div>}
        {msg && <div className="mt-3 text-center text-sm text-green-400">{msg}</div>}
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-100">Name</label>
            <input className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-100">Email address</label>
            <input type="email" className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-100">Password</label>
            <input type="password" className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-100">Confirm password</label>
            <input type="password" className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} required />
          </div>
          <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Create account</button>
        </form>
        <p className="mt-10 text-center text-sm text-gray-400">
          Already a member? <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

