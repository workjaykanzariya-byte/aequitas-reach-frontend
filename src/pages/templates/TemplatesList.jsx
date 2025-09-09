import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTemplates, deleteTemplate } from '../../lib/api';

export default function TemplatesList() {
  const [rows, setRows] = useState([]);
  const refresh = () => setRows(getTemplates());

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('data-change', onChange);
    return () => window.removeEventListener('data-change', onChange);
  }, []);

  const onDelete = (id) => {
    if (!confirm('Delete this template?')) return;
    deleteTemplate(id);
    refresh();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Templates</h1>
      {/* existing Add Template button continues to navigate to create form */}
      <table className="w-full text-sm">
        <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id} className="border-t">
              <td className="py-2">{t.id}</td>
              <td className="py-2">
                <Link to={`/templates/${t.id}`} className="text-indigo-600 hover:underline">
                  {t.name}
                </Link>
              </td>
              <td className="py-2">
                <button onClick={() => onDelete(t.id)} className="px-2 py-1 rounded bg-red-500 text-white">Delete</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="3" className="py-6 text-center text-gray-500">No templates yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

