import { useEffect, useState } from 'react';
import { mockGetCampaigns, mockGetTemplates } from '../lib/api';

export default function Dashboard(){
  const [counts, setCounts] = useState({ campaigns: '—', templates: '—', delivery: '—' });

  useEffect(()=>{
    (async ()=>{
      try{
        const [cs, ts] = await Promise.all([mockGetCampaigns(), mockGetTemplates()]);
        setCounts({
          campaigns: cs.length,
          templates: ts.length,
          delivery: '—',
        });
      }catch{
        setCounts({ campaigns:'0', templates:'0', delivery:'—' });
      }
    })();
  },[]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Total Campaigns</div>
          <div className="text-2xl font-semibold">{counts.campaigns}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Templates</div>
          <div className="text-2xl font-semibold">{counts.templates}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Delivery Rate</div>
          <div className="text-2xl font-semibold">{counts.delivery}</div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border">
        <b>Recent Campaigns</b>
        <div className="text-sm text-slate-500 mt-2">Coming soon…</div>
      </div>
    </div>
  );
}

