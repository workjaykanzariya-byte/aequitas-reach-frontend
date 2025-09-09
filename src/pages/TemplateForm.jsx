import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createTemplate, updateTemplate, getTemplateById } from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';

export default function TemplateForm(){
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

    useEffect(() => {
      if (isEdit) {
        const t = getTemplateById(id);
        if (t) {
          setName(t.name);
          setDescription(t.html || '');
        }
      }
    }, [id, isEdit]);

  const save = async e => {
    e.preventDefault();
        if (isEdit) {
          updateTemplate(id, { name, html: description });
        } else {
          createTemplate({ name, html: description });
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
            <label className="block text-sm mb-1">Description</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
        <button className="btn">{isEdit ? 'Save' : 'Create'}</button>
      </form>
    </div>
  );
}

