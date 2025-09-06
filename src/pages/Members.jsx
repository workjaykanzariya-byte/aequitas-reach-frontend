import { useEffect, useState } from 'react';
import { mockGetPeople } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Members(){
  const { user } = useAuth();
  const [list, setList] = useState([]); const [q, setQ] = useState('');
  useEffect(()=>{ (async()=> setList(await mockGetPeople('member')))(); },[]);
  if (user?.role !== 'admin') return <div className="p-6 bg-white rounded-2xl border">Forbidden</div>;
  const filtered = list.filter(x => (x.name+x.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All Members</h1>
      <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="w-full md:w-64 border rounded-xl px-3 py-2" />
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Email</th></tr></thead>
          <tbody>{filtered.map(m=>(<tr key={m.id} className="border-t"><td className="px-4 py-2">{m.name}</td><td className="px-4 py-2">{m.email}</td></tr>))}
          {filtered.length===0 && <tr><td colSpan="2" className="px-4 py-6 text-center text-slate-500">No members</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}

