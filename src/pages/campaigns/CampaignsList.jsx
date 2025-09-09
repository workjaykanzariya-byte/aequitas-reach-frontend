import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  mockGetCampaigns,
  mockExecuteCampaign,
  mockGetPeople,
  mockAssignCampaignToMember,
  mockAssignCampaignToUser,
  mockCreateCampaign,
} from '../../lib/api';

// Use fixed classes (no dynamic color strings) so Tailwind includes them.
function RoleBadge({role, name}){
  const cls = role === 'member'
    ? 'bg-indigo-100 text-indigo-700'
    : role === 'user'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-700';
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{name}</span>;
}

function PickerModal({ open, title, items, onSelect, onClose }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
        <div className="max-h-72 overflow-auto divide-y">
          {items.map(it=>(
            <button key={it.id} onClick={()=>onSelect(it)} className="w-full text-left px-3 py-2 hover:bg-gray-50">
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

export default function Campaigns() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('all'); // 'all' | 'mine'
  const [toast, setToast] = useState('');
  const [picker, setPicker] = useState({ open:false, forCampaign:null, items:[], mode:null }); // 'member' | 'user'
  const [newName, setNewName] = useState('');

  const refresh = async ()=> setList(await mockGetCampaigns());
  useEffect(()=>{ refresh(); },[]);

  const visible = useMemo(()=>{
    if (tab==='mine' && user) return list.filter(c => (c.assignees || []).includes(user.id));
    return list;
  }, [tab, list, user]);

  const execute = async (id)=>{
    setToast('');
    try{
      const res = await mockExecuteCampaign(id, user);
      setList(prev => prev.map(c => c.id===id ? { ...c, status: res.status } : c));
      // Auto-refresh to pick up "done" after the simulated delay
      setTimeout(()=>{ refresh(); }, 1200);
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
        const r = await mockAssignCampaignToMember(picker.forCampaign.id, person.id, user);
        setToast(r.message);
      } else if (picker.mode==='user') {
        const r = await mockAssignCampaignToUser(picker.forCampaign.id, person.id, user);
        setToast(r.message);
      }
      await refresh(); // now "Assigned?" should flip to Yes and names appear
    }catch(e){
      setToast(e.message || 'Assignment failed');
    }finally{
      setPicker({ open:false, forCampaign:null, items:[], mode:null });
      setTimeout(()=>setToast(''), 1400);
    }
  };

  const create = async (e)=>{
    e.preventDefault();
    if (!newName.trim()) return;
    await mockCreateCampaign({ name: newName.trim(), createdBy: user?.id });
    setNewName('');
    await refresh();
    setToast('Campaign created');
    setTimeout(()=>setToast(''), 1200);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded ${
              tab === 'all' ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-3 py-1.5 rounded ${
              tab === 'mine' ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Assigned to me
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => nav('/members')}
              className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
            >
              All Members
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'member') && (
            <button
              onClick={() => nav('/users')}
              className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
            >
              All Users
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="text-sm text-slate-700 bg-white border rounded-xl px-3 py-2">
          {toast}
        </div>
      )}

      {/* Create new campaign */}
      <form
        onSubmit={create}
        className="flex flex-wrap items-end gap-2 bg-white border rounded-xl p-3 shadow-sm"
      >
        <div>
          <label className="block text-sm mb-1">New campaign name</label>
          <input
            className="border rounded px-3 py-2 w-64"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., September Push"
          />
        </div>
        <button className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">
          Create Campaign
        </button>
      </form>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Assigned To</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Assigned?</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => {
              const assignedToMe = user ? (c.assignees || []).includes(user.id) : false;
              const assignedAny =
                (c.assignees && c.assignees.length > 0) ||
                (c.assigneeSummaries && c.assigneeSummaries.length > 0);
              const canExecute =
                user?.role === 'admin' ||
                (user?.role === 'member' && assignedToMe) ||
                (user?.role === 'user' && assignedToMe);
              return (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{c.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/campaigns/${c.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.assigneeSummaries || []).length > 0 ? (
                        c.assigneeSummaries.map((s) => (
                          <RoleBadge key={s.id} role={s.role} name={s.name} />
                        ))
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3">{assignedAny ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => execute(c.id)}
                      disabled={!canExecute}
                      className={`px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 ${
                        !canExecute ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      Execute
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => openAssignToMember(c)}
                        className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Assign Member
                      </button>
                    )}
                    {user?.role === 'member' && (
                      <button
                        onClick={() => openAssignToUser(c)}
                        className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Assign User
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                  No campaigns
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PickerModal
        open={picker.open}
        title={picker.mode === 'member' ? 'Assign to Member' : 'Assign to User'}
        items={picker.items}
        onSelect={selectFromPicker}
        onClose={() =>
          setPicker({ open: false, forCampaign: null, items: [], mode: null })
        }
      />
    </div>
  );
}

