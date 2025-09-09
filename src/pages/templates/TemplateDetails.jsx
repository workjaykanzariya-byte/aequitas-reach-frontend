import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  getTemplateById,
  getCampaigns,
  getCampaignsByTemplateId,
  assignTemplateToCampaign,
  unassignTemplateFromCampaign
} from '../../lib/api';

export default function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [assignTo, setAssignTo] = useState('');

  const refresh = useCallback(() => {
    const t = getTemplateById(id);
    setTemplate(t);
    setAllCampaigns(getCampaigns());
    setAssigned(getCampaignsByTemplateId(id));
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  const availableToAssign = useMemo(() => {
    const assignedIds = new Set(assigned.map(c => c.id));
    return allCampaigns.filter(c => !assignedIds.has(c.id));
  }, [allCampaigns, assigned]);

  if (!template) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Template not found.</p>
        <button onClick={() => navigate('/templates')} className="mt-2 px-3 py-1 rounded bg-gray-200">Back</button>
      </div>
    );
  }

  const handleAssign = () => {
    if (!assignTo) return alert('Please select a campaign');
    try {
      assignTemplateToCampaign(Number(id), Number(assignTo));
      alert('Assigned successfully');
      setAssignTo('');
      refresh();
    } catch (e) {
      alert(e.message || 'Failed to assign');
    }
  };

  const handleUnassign = (campaignId) => {
    try {
      unassignTemplateFromCampaign(Number(id), Number(campaignId));
      alert('Unassigned successfully');
      refresh();
    } catch (e) {
      alert(e.message || 'Failed to unassign');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Template: {template.name} <span className="text-gray-400">(# {template.id})</span></h1>
        <Link to="/templates" className="px-3 py-2 rounded bg-gray-200">Back to Templates</Link>
      </div>

      <section className="rounded-xl border p-4 bg-white space-y-2">
        <h2 className="font-medium">Details</h2>
        <div className="text-sm text-gray-700">
          <div><strong>ID:</strong> {template.id}</div>
          <div><strong>Name:</strong> {template.name}</div>
          <div><strong>Created:</strong> {template.createdAt || '—'}</div>
          <div><strong>Updated:</strong> {template.updatedAt || '—'}</div>
        </div>
      </section>

      <section className="rounded-xl border p-4 bg-white space-y-2">
        <h2 className="font-medium">Content Preview</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.html || '') }}
        />
      </section>

      <section className="rounded-xl border p-4 bg-white space-y-4">
        <h2 className="font-medium">Assigned to Campaigns</h2>
        {assigned.length === 0 ? (
          <p className="text-sm text-gray-500">No campaigns assigned yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.id}</td>
                  <td className="py-2">{c.name}</td>
                  <td className="py-2">
                    <button onClick={() => handleUnassign(c.id)} className="px-3 py-1 rounded bg-red-500 text-white">Unassign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border p-4 bg-white space-y-3">
        <h2 className="font-medium">Assign to a Campaign</h2>
        <div className="flex gap-3 items-center">
          <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Select campaign…</option>
            {availableToAssign.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={handleAssign} className="px-3 py-2 rounded bg-indigo-600 text-white">Assign</button>
        </div>
      </section>
    </div>
  );
}
