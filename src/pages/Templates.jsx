import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockGetTemplates } from '../lib/api';

export default function Templates(){
  const [list, setList] = useState([]);

  const refresh = async () => {
    const res = await mockGetTemplates();
    setList(res);
  };
  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Link to="/templates/new" className="btn">Add Template</Link>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Name</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">
                  <Link to={`/templates/${t.id}`} className="text-indigo-600 hover:underline">
                    {t.name}
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="2" className="px-4 py-6 text-center text-slate-500">No templates</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

