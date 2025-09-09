import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCampaignById,
  mockGetTemplates,
  assignTemplateToCampaign,
  unassignTemplateFromCampaign,
  getTemplatesByCampaignId,
} from '../../lib/api';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [assignId, setAssignId] = useState('');

  const refresh = useCallback(async () => {
    const c = getCampaignById(id);
    setCampaign(c);
    const ts = await mockGetTemplates();
    setTemplates(ts);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const assignedTemplates = useMemo(() => getTemplatesByCampaignId(id), [id, campaign, templates]);

  const availableTemplates = useMemo(() => {
    const assignedIds = new Set(assignedTemplates.map((t) => t.id));
    return templates.filter((t) => !assignedIds.has(t.id));
  }, [templates, assignedTemplates]);

  if (!campaign) {
    return (
      <div className="p-6 space-y-2">
        <p className="text-sm text-gray-500">Campaign not found.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  const handleAssign = () => {
    if (!assignId) return alert('Please select a template');
    try {
      assignTemplateToCampaign(Number(assignId), Number(id));
      alert('Assigned successfully');
      setAssignId('');
      refresh();
    } catch (e) {
      alert(e.message || 'Failed to assign');
    }
  };

  const handleUnassign = (templateId) => {
    try {
      unassignTemplateFromCampaign(Number(templateId), Number(id));
      alert('Unassigned successfully');
      refresh();
    } catch (e) {
      alert(e.message || 'Failed to unassign');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Campaign: {campaign.name} <span className="text-gray-400">(# {campaign.id})</span>
        </h1>
        <Link
          to="/campaigns"
          className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
        >
          Back to Campaigns
        </Link>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-medium text-lg mb-2">Details</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <div>
            <strong>ID:</strong> {campaign.id}
          </div>
          <div>
            <strong>Name:</strong> {campaign.name}
          </div>
          <div>
            <strong>Status:</strong> {campaign.status || '—'}
          </div>
          <div>
            <strong>Description:</strong> {campaign.description || '—'}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-medium text-lg mb-2">Assigned Templates</h2>
        {assignedTemplates.length === 0 ? (
          <p className="text-sm text-gray-500">No templates assigned yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedTemplates.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{t.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/templates/${t.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {t.name || 'Untitled Template'}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUnassign(t.id)}
                      className="px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <h2 className="font-medium text-lg mb-2">Assign Template</h2>
        <div className="flex gap-3 items-center">
          <select
            value={assignId}
            onChange={(e) => setAssignId(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Select template…</option>
            {availableTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || 'Untitled Template'}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Assign
          </button>
        </div>
      </section>
    </div>
  );
}

