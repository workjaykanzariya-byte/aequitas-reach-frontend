import { useEffect, useRef, useState } from 'react';
import { mockCreateTemplate, mockDeleteTemplate, mockGetCampaigns, mockGetTemplates, mockUpdateTemplate } from '../lib/api';

function ToolbarButton({ onClick, children, title }) {
  return <button type="button" onClick={onClick} title={title} className="btn-outline">{children}</button>;
}

function Editor({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && typeof value === 'string' && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);
  const exec = (cmd, arg=null)=>{ document.execCommand(cmd, false, arg); ref.current && onChange(ref.current.innerHTML); };
  const insertLink = ()=>{ const url = window.prompt('Enter URL (https://...)'); if (url) exec('createLink', url) };
  const insertImage = ()=>{ const url = window.prompt('Enter image URL (https://...)'); if (url) exec('insertImage', url) };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton onClick={()=>exec('bold')}>B</ToolbarButton>
        <ToolbarButton onClick={()=>exec('italic')}><span className="italic">I</span></ToolbarButton>
        <ToolbarButton onClick={()=>exec('underline')}><span className="underline">U</span></ToolbarButton>
        <ToolbarButton onClick={()=>exec('formatBlock','H1')}>H1</ToolbarButton>
        <ToolbarButton onClick={()=>exec('formatBlock','H2')}>H2</ToolbarButton>
        <ToolbarButton onClick={()=>exec('insertUnorderedList')}>• List</ToolbarButton>
        <ToolbarButton onClick={()=>exec('insertOrderedList')}>1. List</ToolbarButton>
        <ToolbarButton onClick={insertLink}>Link</ToolbarButton>
        <ToolbarButton onClick={insertImage}>Image</ToolbarButton>
        <ToolbarButton onClick={()=>exec('removeFormat')}>Clear</ToolbarButton>
      </div>
      <div ref={ref} contentEditable className="min-h-[160px] bg-white border rounded-2xl p-3 focus:outline-none"
           onInput={()=>onChange(ref.current?.innerHTML || '')} suppressContentEditableWarning />
    </div>
  );
}

export default function Templates(){
  const [list, setList] = useState([]);
  const [camps, setCamps] = useState([]);
  const [name, setName] = useState('');
  const [html, setHtml] = useState('<p>Start typing…</p>');
  const [assignCid, setAssignCid] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const refresh = async ()=>{ setList(await mockGetTemplates()); setCamps(await mockGetCampaigns()); }
  useEffect(()=>{ refresh(); },[]);

  const submit = async (e)=>{
    e.preventDefault();
    try{
      if (editingId) {
        await mockUpdateTemplate(editingId, { name, html });
        setMsg('Template updated');
      } else {
        await mockCreateTemplate({ name, html, campaignId: assignCid || undefined });
        setMsg('Template created');
      }
      setName(''); setHtml('<p>Start typing…</p>'); setAssignCid(''); setEditingId(null);
      await refresh();
      setTimeout(()=>setMsg(''), 1200);
    }catch(err){ setMsg(err.message || 'Failed'); setTimeout(()=>setMsg(''), 1500); }
  };

  const startEdit = (t)=>{ setEditingId(t.id); setName(t.name); setHtml(t.html || '<p></p>'); window.scrollTo({ top:0, behavior:'smooth' }); };
  const del = async (id)=>{ await mockDeleteTemplate(id); await refresh(); };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Templates</h1>
      {msg && <div className="text-sm text-slate-700 bg-white border rounded-xl px-3 py-2">{msg}</div>}

      <form onSubmit={submit} className="bg-white border rounded-2xl p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">Template name</label>
            <input className="border rounded px-3 py-2 w-full" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Abandoned Cart" required />
            <label className="block text-sm mb-1 mt-3">Assign to campaign (optional)</label>
            <select className="border rounded px-3 py-2 w-full" value={assignCid} onChange={(e)=>setAssignCid(e.target.value)}>
              <option value="">— No assignment —</option>
              {camps.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Template content</label>
            <Editor value={html} onChange={setHtml} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn">{editingId ? 'Update Template' : 'Create Template'}</button>
          {editingId && <button type="button" className="btn-outline" onClick={()=>{ setEditingId(null); setName(''); setHtml('<p>Start typing…</p>'); setAssignCid(''); }}>Cancel</button>}
        </div>
      </form>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Assigned To (campaigns)</th>
              <th className="text-left px-4 py-2">Preview</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t=>(
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2">{t.campaignIds?.length ? t.campaignIds.join(', ') : '—'}</td>
                <td className="px-4 py-2"><div className="line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: t.html || '' }} /></td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="btn-outline" onClick={()=>startEdit(t)}>Edit</button>
                  <button className="btn" onClick={()=>del(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No templates yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

