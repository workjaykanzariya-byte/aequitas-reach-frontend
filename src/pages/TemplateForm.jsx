import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createTemplate, updateTemplate, getTemplate } from '../lib/templates';
import RichTextEditor from '../components/RichTextEditor';

export default function TemplateForm(){
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isEdit) {
        getTemplate(id).then(res => {
          if (res.ok && res.data) {
            setName(res.data.name);
            setDescription(res.data.description || '');
          }
        });
    }
  }, [id, isEdit]);

  const save = async e => {
    e.preventDefault();
      let res;
      if (isEdit) {
        res = await updateTemplate(id, { name, description });
      } else {
        res = await createTemplate({ name, description });
      }
      if (res.ok) {
        nav('/templates');
      } else {
        window.alert('Failed to save template');
      }
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

