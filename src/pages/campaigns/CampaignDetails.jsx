import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCampaignById,
  getTemplates,
  assignTemplateToCampaign,
  unassignTemplateFromCampaign
} from '../../lib/api';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [assignId, setAssignId] = useState('');

  const refresh = useCallback(() => {
    setCampaign(getCampaignById(id));
    setTemplates(getTemplates());
  }, [id]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('data-change', onChange);
    return () => window.removeEventListener('data-change', onChange);
  }, [refresh]);

  if (!campaign) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Campaign not found.</p>
        <button onClick={() => navigate('/campaigns')} className="mt-2 px-3 py-1 rounded bg-gray-200">Back</button>
      </div>
    );
  }

  const assignedSet = new Set(campaign.templateIds || []);
  const assignedTemplates = templates.filter(t => assignedSet.has(t.id));
  const unassignedTemplates = templates.filter(t => !assignedSet.has(t.id));

  const doAssign = () => {
    if (!assignId) return alert('Select a template');
    assignTemplateToCampaign(Number(assignId), Number(id));
    setAssignId('');
    refresh();
  };
  const doUnassign = (tid) => {
    unassignTemplateFromCampaign(Number(tid), Number(id));
    refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaign: {campaign.name} <span className="text-gray-400">#{campaign.id}</span></h1>
        <Link to="/campaigns" className="px-3 py-2 rounded bg-gray-200">Back to Campaigns</Link>
      </div>

      <section className="rounded-xl border p-4 bg-white space-y-2">
        <h2 className="font-medium">Details</h2>
        <div className="text-sm text-gray-700">
          <div><strong>ID:</strong> {campaign.id}</div>
          <div><strong>Name:</strong> {campaign.name}</div>
          <div><strong>Status:</strong> {campaign.status || '—'}</div>
        </div>
      </section>

      <section className="rounded-xl border p-4 bg-white space-y-4">
        <h2 className="font-medium">Assigned Templates</h2>
        {assignedTemplates.length === 0 ? (
          <p className="text-sm text-gray-500">No templates assigned.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {assignedTemplates.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="py-2">{t.id}</td>
                  <td className="py-2"><Link to={`/templates/${t.id}`} className="text-indigo-600 hover:underline">{t.name}</Link></td>
                  <td className="py-2">
                    <button onClick={() => doUnassign(t.id)} className="px-3 py-1 rounded bg-red-500 text-white">Unassign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border p-4 bg-white space-y-3">
        <h2 className="font-medium">Assign a Template</h2>
        <div className="flex gap-3 items-center">
          <select value={assignId} onChange={e => setAssignId(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Select template…</option>
            {unassignedTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={doAssign} className="px-3 py-2 rounded bg-indigo-600 text-white">Assign</button>
        </div>
      </section>
    </div>
  );
}

