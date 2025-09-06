import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockGetContacts, mockAddContact, mockDeleteContact, mockBulkAddContacts } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { (async () => setContacts(await mockGetContacts()))(); }, []);

  const total = contacts.length;

  // --- CSV parsing: supports header row with "name" and "phone|mobile|number" (case-insensitive)
  function splitCSV(line) {
    const re = /("([^"]|"")*"|[^,]+)/g;
    const out = [];
    let m;
    while ((m = re.exec(line)) !== null) out.push(m[0].replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim());
    return out;
  }
  function parseCSVText(text) {
    const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!rows.length) return [];
    const first = splitCSV(rows[0]);
    let nameIdx = -1, phoneIdx = -1, start = 0;
    const headerLooksLikeHeader = first.some(h => /name|phone|mobile|number/i.test(h));
    if (headerLooksLikeHeader) {
      first.forEach((h, i) => {
        if (/name/i.test(h)) nameIdx = i;
        if (/phone|mobile|number/i.test(h)) phoneIdx = i;
      });
      start = 1;
    } else {
      // Guess by numeric-looking column
      const cleaned = first.map(v => v.replace(/[^\d]/g, ''));
      if (cleaned[0]?.length >= 7) { phoneIdx = 0; nameIdx = 1; }
      else if (cleaned[1]?.length >= 7) { phoneIdx = 1; nameIdx = 0; }
      else { nameIdx = 0; phoneIdx = 1; }
    }

    const items = [];
    for (let i = start; i < rows.length; i++) {
      const t = splitCSV(rows[i]);
      const name = (t[nameIdx] || '').trim();
      const phone = (t[phoneIdx] || '').trim();
      if (!phone) continue;
      items.push({ name, phone });
    }
    return items;
  }

  async function handleCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const items = parseCSVText(text);
    const res = await mockBulkAddContacts(items);
    const fresh = await mockGetContacts();
    setContacts(fresh);
    setMsg(`Imported ${res.added} contact(s). Total: ${res.total}`);
    setTimeout(() => setMsg(''), 1500);
    e.target.value = '';
  }

  async function addManual(e) {
    e.preventDefault();
    if (!form.phone) return;
    await mockAddContact(form);
    setForm({ name: '', phone: '' });
    setContacts(await mockGetContacts());
  }

  async function del(id) {
    await mockDeleteContact(id);
    setContacts(await mockGetContacts());
  }

  const canManage = user?.role === 'admin'; // only Admin can upload/add/delete in this demo
  const visible = contacts; // everyone can see the count/list

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border">
          <div className="text-xs text-slate-500">Total Contacts</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border">Templates: —</div>
        <div className="p-4 bg-white rounded-2xl border">Delivery Rate: —</div>
      </div>

      {/* Contacts management */}
      <div className="p-4 bg-white rounded-2xl border space-y-4">
        <div className="flex items-center justify-between">
          <b>Contacts</b>
          {msg && <div className="text-sm text-slate-600">{msg}</div>}
        </div>

        {canManage && (
          <>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <label className="block">
                <span className="block text-sm mb-1">Upload CSV (Name, Phone)</span>
                <input type="file" accept=".csv" onChange={handleCSV} className="block text-sm" />
              </label>

              <form onSubmit={addManual} className="flex gap-2 items-end">
                <div>
                  <span className="block text-sm mb-1">Name</span>
                  <input className="border rounded px-3 py-2 w-48" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                </div>
                <div>
                  <span className="block text-sm mb-1">Phone</span>
                  <input className="border rounded px-3 py-2 w-48" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required />
                </div>
                <button className="btn">Add</button>
              </form>
            </div>
          </>
        )}

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Phone</th>
                {canManage && <th className="text-left px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((c, idx) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{c.name || '—'}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  {canManage && (
                    <td className="px-4 py-2">
                      <button onClick={()=>del(c.id)} className="btn">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={canManage ? 4 : 3} className="px-4 py-6 text-center text-slate-500">No contacts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

