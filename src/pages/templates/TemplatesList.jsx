import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockGetTemplates } from '../../lib/api';

export default function Templates() {
  const [list, setList] = useState([]);

  const refresh = async () => {
    const res = await mockGetTemplates();
    setList(res);
  };
  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Link
          to="/templates/new"
          className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Add Template
        </Link>
      </div>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Name</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{t.id}</td>
                <td className="px-4 py-3">
                  <Link to={`/templates/${t.id}`} className="text-indigo-600 hover:underline">
                    {t.name}
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="2" className="px-4 py-6 text-center text-gray-500">
                  No templates
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

