import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockGetCampaigns, mockExecuteCampaign, mockGetPeople, mockAssignCampaignToMember, mockAssignCampaignToUser } from '../lib/api';
import { useNavigate } from 'react-router-dom';

function PickerModal({ open, title, items, onSelect, onClose }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded-lg border">Close</button>
        </div>
        <div className="max-h-72 overflow-auto divide-y">
          {items.map(it=>(
            <button key={it.id} onClick={()=>onSelect(it)} className="w-full text-left px-3 py-2 hover:bg-slate-50">
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-slate-500">{it.email}</div>
            </button>
          ))}
          {items.length===0 && <div className="px-3 py-6 text-center text-slate-500 text-sm">No items</div>}
        </div>
      </div>
    </div>
  );
}

export default function Campaigns(){
  const { user } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('all'); // 'all' | 'mine'
  const [toast, setToast] = useState('');
  const [picker, setPicker] = useState({ open:false, forCampaign:null, items:[], mode:null }); // mode: 'member' | 'user'

  useEffect(()=>{ (async ()=> setList(await mockGetCampaigns()))(); },[]);

  const visible = useMemo(()=>{
    if (tab==='mine' && user) return list.filter(c => c.assignees.includes(user.id));
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

  const openAssignToMember = async (c)=>{
    const members = await mockGetPeople('member');
    setPicker({ open:true, forCampaign:c, items:members, mode:'member' });
  };
  const openAssignToUser = async (c)=>{
    const users = await mockGetPeople('user');
    setPicker({ open:true, forCampaign:c, items:users, mode:'user' });
  };

  const selectFromPicker = async (person)=>{
    if (!picker.forCampaign) return;
    try{
      if (picker.mode==='member') {
        await mockAssignCampaignToMember(picker.forCampaign.id, person.id, user);
        setToast('Assigned to member');
      } else if (picker.mode==='user') {
        await mockAssignCampaignToUser(picker.forCampaign.id, person.id, user);
        setToast('Assigned to user');
      }
      // refresh local list
      const fresh = await mockGetCampaigns();
      setList(fresh);
    }catch(e){
      setToast(e.message || 'Assignment failed');
    }finally{
      setPicker({ open:false, forCampaign:null, items:[], mode:null });
      setTimeout(()=>setToast(''), 1400);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <div className="flex gap-2">
          <button onClick={()=>setTab('all')} className="btn">All</button>
          <button onClick={()=>setTab('mine')} className="btn">Assigned to me</button>
          {/* Quick access to lists */}
          {user?.role==='admin' && <button onClick={()=>nav('/members')} className="btn">All Members</button>}
          {(user?.role==='admin' || user?.role==='member') && <button onClick={()=>nav('/users')} className="btn">All Users</button>}
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
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(c=>{
              const assignedToMe = user ? c.assignees.includes(user.id) : false;
              const canExecute = (user?.role==='admin') || (user?.role==='member' && assignedToMe) || (user?.role==='user' && assignedToMe);
              return (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.status}</td>
                  <td className="px-4 py-2">{assignedToMe ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-2">
                    <button onClick={()=>execute(c.id)} disabled={!canExecute} className="btn">Execute</button>
                    {user?.role==='admin'  && <button onClick={()=>openAssignToMember(c)} className="btn">Assign Member</button>}
                    {user?.role==='member' && <button onClick={()=>openAssignToUser(c)} className="btn">Assign User</button>}
                  </td>
                </tr>
              );
            })}
            {visible.length===0 && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No campaigns</td></tr>}
          </tbody>
        </table>
      </div>

      <PickerModal
        open={picker.open}
        title={picker.mode==='member' ? 'Assign to Member' : 'Assign to User'}
        items={picker.items}
        onSelect={selectFromPicker}
        onClose={()=>setPicker({ open:false, forCampaign:null, items:[], mode:null })}
      />
    </div>
  );
}

