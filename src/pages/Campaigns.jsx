import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockGetCampaigns, mockExecuteCampaign } from '../lib/api';

export default function Campaigns(){
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('all'); // 'all' | 'mine'
  const [toast, setToast] = useState('');

  useEffect(()=>{ (async ()=>{
    const data = await mockGetCampaigns();
    setList(data);
  })(); },[]);

  const visible = useMemo(()=>{
    if (tab==='mine' && user) {
      return list.filter(c => c.assignees.includes(user.id));
    }
    return list;
  }, [tab, list, user]);

  const execute = async (id)=>{
    setToast('');
    try{
      const res = await mockExecuteCampaign(id, user);
      setList(prev => prev.map(c => c.id===id ? { ...c, status: res.status } : c));
      setToast('Execution started');
      setTimeout(()=>setToast(''), 1200);
    }catch(e){
      setToast(e.message || 'Not allowed');
      setTimeout(()=>setToast(''), 1500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <div className="flex gap-2">
          <button onClick={()=>setTab('all')}  className={`px-3 py-1.5 rounded-xl border ${tab==='all'?'bg-black text-white':'hover:bg-slate-100'}`}>All</button>
          <button onClick={()=>setTab('mine')} className={`px-3 py-1.5 rounded-xl border ${tab==='mine'?'bg-black text-white':'hover:bg-slate-100'}`}>Assigned to me</button>
        </div>
      </div>

      {toast && <div className="text-sm text-slate-700 bg-white border rounded-xl px-3 py-2">{toast}</div>}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Assigned?</th>
              <th className="text-left px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(c=>{
              const assigned = user ? c.assignees.includes(user.id) : false;
              const allowed  = user?.role === 'admin' || (user?.role === 'member' && assigned);
              return (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.status}</td>
                  <td className="px-4 py-2">{assigned ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={()=>execute(c.id)}
                      disabled={!allowed}
                      className={`px-3 py-1.5 rounded-xl ${allowed?'bg-indigo-600 text-white hover:bg-indigo-500':'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                      title={allowed ? 'Execute campaign' : 'You are not allowed to execute this campaign'}
                    >
                      Execute
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length===0 && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No campaigns</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

