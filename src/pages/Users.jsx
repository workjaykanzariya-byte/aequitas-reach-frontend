import { useEffect, useState, useRef } from 'react';
import { mockGetPeople, bulkAddUsers } from '../lib/api';

export default function Users(){
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef(null);

  useEffect(()=>{ (async()=> setList(await mockGetPeople('user')))(); },[]);
  const filtered = list.filter(x => (x.name+(x.email||'')+(x.mobile||'')).toLowerCase().includes(q.toLowerCase()));

  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    const headers = lines.shift()?.split(',').map(h=>h.trim().toLowerCase()) || [];
    const nameIdx = headers.indexOf('name');
    const mobileIdx = headers.indexOf('mobile');
    if(nameIdx === -1 || mobileIdx === -1) throw new Error('Missing headers');
    return lines.map(line => {
      const cols = line.split(',');
      return { name: cols[nameIdx]?.trim(), mobile: cols[mobileIdx]?.trim() };
    });
  }

  function onFileChange(e){
    setError(''); setSuccess('');
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{
        const rows = parseCSV(String(ev.target?.result || ''))
          .filter(r => r.name && /^[0-9]+$/.test(String(r.mobile)));
        if(rows.length===0) setError('No valid rows found');
        setPreview(rows);
      }catch{
        setError('CSV is malformed');
        setPreview([]);
      }
    };
    reader.onerror = () => { setError('CSV is malformed'); setPreview([]); };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function save(){
    setError(''); setSuccess('');
    try{
      const before = list.length;
      const updated = await bulkAddUsers(preview);
      const usersOnly = updated.filter(u=>u.role==='user');
      setList(usersOnly);
      const added = usersOnly.length - before;
      setSuccess(`${added} users imported successfully`);
      setPreview([]);
    }catch(err){
      setError(err.message || 'Failed to save users');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All Users</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="w-full md:w-64 border rounded-xl px-3 py-2" />
        <div>
          <button onClick={()=>fileRef.current?.click()} className="border px-3 py-2 rounded-xl bg-white">Import CSV</button>
          <input type="file" accept=".csv" ref={fileRef} onChange={onFileChange} className="hidden" />
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      {preview.length>0 && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr><th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Mobile</th></tr>
            </thead>
            <tbody>
              {preview.map((p,i)=>(
                <tr key={i} className="border-t"><td className="px-4 py-2">{p.name}</td><td className="px-4 py-2">{p.mobile}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 text-right">
            <button onClick={save} className="border px-3 py-2 rounded-xl bg-slate-100">Save to Users</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Email</th><th className="text-left px-4 py-2">Mobile</th></tr>
          </thead>
          <tbody>
            {filtered.map(m=>(<tr key={m.id} className="border-t"><td className="px-4 py-2">{m.name}</td><td className="px-4 py-2">{m.email}</td><td className="px-4 py-2">{m.mobile}</td></tr>))}
            {filtered.length===0 && <tr><td colSpan="3" className="px-4 py-6 text-center text-slate-500">No users</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

