import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns, isCampaignAssigned } from '../../lib/api';

export default function CampaignsList() {
  const [rows, setRows] = useState([]);
  const refresh = () => setRows(getCampaigns());

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('data-change', onChange);
    return () => window.removeEventListener('data-change', onChange);
  }, []);

  return (
    <table className="w-full text-sm">
      <thead><tr><th>ID</th><th>Name</th><th>Assigned?</th><th>Actions</th></tr></thead>
      <tbody>
        {rows.map(c => (
          <tr key={c.id} className="border-top">
            <td className="py-2">{c.id}</td>
            <td className="py-2">
              <Link to={`/campaigns/${c.id}`} className="text-indigo-600 hover:underline">{c.name}</Link>
            </td>
            <td className="py-2">{isCampaignAssigned(c) ? 'Yes' : 'No'}</td>
            <td className="py-2">
              {/* keep your existing Execute / Assign Member buttons */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

