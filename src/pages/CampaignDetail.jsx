import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockAssignTemplateToCampaign, mockGetCampaign, mockGetTemplates, mockUnassignTemplateFromCampaign } from '../lib/api';

export default function CampaignDetail(){
  const { id } = useParams();
  const [camp, setCamp] = useState(null);
  const [allTemplates, setAllTemplates] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const refresh = async ()=>{ setCamp(await mockGetCampaign(id)); setAllTemplates(await mockGetTemplates()); }
  useEffect(()=>{ refresh(); },[id]);

  const assign = async (tid)=>{ await mockAssignTemplateToCampaign(id, tid); await refresh(); setPickerOpen(false); };
  const unassign = async (tid)=>{ await mockUnassignTemplateFromCampaign(id, tid); await refresh(); };

  if (!camp) return <div className="p-6 bg-white rounded-2xl border">Loading…</div>;

  const available = allTemplates.filter(t => !(camp.templates || []).some(ct => ct.id === t.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaign: {camp.name}</h1>
        <Link to="/campaigns" className="btn-outline">Back to Campaigns</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Status</div>
          <div className="text-2xl font-semibold">{camp.status}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Assignees</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(camp.assigneeSummaries || []).map(a=>{
              const cls = a.role==='member' ? 'bg-indigo-100 text-indigo-700' : a.role==='user' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';
              return <span key={a.id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{a.name}</span>
            })}
            {(!camp.assigneeSummaries || !camp.assigneeSummaries.length) && <span className="text-slate-400">—</span>}
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Templates</div>
          <div className="text-2xl font-semibold">{camp.templates?.length || 0}</div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border space-y-3">
        <div className="flex items-center justify-between">
          <b>Assigned Templates</b>
          <button className="btn" onClick={()=>setPickerOpen(true)}>Assign Template</button>
        </div>
        <div className="divide-y">
          {(camp.templates || []).map(t=>(
            <div key={t.id} className="py-3 flex items-start gap-3">
              <div className="min-w-[56px] text-slate-500 text-sm">#{t.id}</div>
              <div className="grow">
                <div className="font-medium">{t.name}</div>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: t.html || '' }} />
              </div>
              <button className="btn-outline" onClick={()=>unassign(t.id)}>Unassign</button>
            </div>
          ))}
          {(!camp.templates || !camp.templates.length) && <div className="py-6 text-center text-slate-500">No templates assigned</div>}
        </div>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <b>Select a template</b>
              <button className="btn-outline" onClick={()=>setPickerOpen(false)}>Close</button>
            </div>
            <div className="max-h-72 overflow-auto divide-y">
              {available.map(t=>(
                <button key={t.id} onClick={()=>assign(t.id)} className="w-full text-left px-3 py-2 hover:bg-slate-50">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-1" dangerouslySetInnerHTML={{ __html: t.html || '' }} />
                </button>
              ))}
              {!available.length && <div className="px-3 py-6 text-center text-slate-500 text-sm">No more templates</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

