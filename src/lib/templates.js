const KEY = 'templates';
const delay = (ms = 100) => new Promise(r => setTimeout(r, ms));

function load(){
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function save(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listTemplates(){
  await delay();
  return load();
}

export async function getTemplate(id){
  await delay();
  return load().find(t => t.id === Number(id)) || null;
}

export async function createTemplate({ name, html }){
  await delay();
  const list = load();
  const id = (list.at(-1)?.id || 0) + 1;
  const t = { id, name, html };
  list.push(t);
  save(list);
  return t;
}

export async function updateTemplate(id, { name, html }){
  await delay();
  const list = load();
  const idx = list.findIndex(t => t.id === Number(id));
  if (idx === -1) throw new Error('Template not found');
  list[idx] = { ...list[idx], name, html };
  save(list);
  return list[idx];
}

export async function deleteTemplate(id){
  await delay();
  const list = load().filter(t => t.id !== Number(id));
  save(list);
  return { ok: true };
}

