import { useEffect, useState } from 'react';
import { mockGetAdminSettings, mockUpdateAdminSettings } from '../lib/api';

export default function AdminSettings() {
  const [form, setForm] = useState({
    'whatsapp.token': '',
    'whatsapp.phone_number_id': '',
    'whatsapp.template_name': '',
    'whatsapp.lang_code': '',
    'whatsapp.image_url': '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    mockGetAdminSettings().then((data) => setForm(prev => ({ ...prev, ...data })));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    await mockUpdateAdminSettings(form);
    setMsg('Settings saved');
    setTimeout(() => setMsg(''), 1500);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Settings</h1>
      {msg && <div className="text-green-600">{msg}</div>}
      <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
        {Object.entries(form).map(([key, val]) => (
          <label key={key} className="block">
            <span className="block text-sm mb-1">{key}</span>
            <input
              className="w-full border rounded px-3 py-2"
              value={val ?? ''}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <div className="md:col-span-2">
          <button className="px-4 py-2 rounded-xl bg-black text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
