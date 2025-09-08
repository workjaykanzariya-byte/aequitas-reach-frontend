import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createTemplate, updateTemplate, getTemplate } from '../lib/templates';

export default function TemplateForm(){
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);
  const [name, setName] = useState('');
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (isEdit) {
      getTemplate(id).then(t => {
        if (t) {
          setName(t.name);
          setHtml(t.html || '');
        }
      });
    }
  }, [id, isEdit]);

  const save = async e => {
    e.preventDefault();
    if (isEdit) {
      await updateTemplate(id, { name, html });
    } else {
      await createTemplate({ name, html });
    }
    nav('/templates');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Template' : 'Add Template'}</h1>
        <Link to="/templates" className="btn-outline">Back</Link>
      </div>
      <form onSubmit={save} className="bg-white border rounded-2xl p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">HTML</label>
          <textarea className="border rounded px-3 py-2 w-full h-48 font-mono" value={html} onChange={e => setHtml(e.target.value)} />
        </div>
        <button className="btn">{isEdit ? 'Save' : 'Create'}</button>
      </form>
    </div>
  );
}

