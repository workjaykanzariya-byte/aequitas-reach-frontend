const KEY = 'templates';
const delay = (ms = 100) => new Promise(r => setTimeout(r, ms));

function save(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function load(){
  try {
    const list = JSON.parse(localStorage.getItem(KEY)) || [];
    let migrated = false;
    for (const t of list) {
      if (t.html && !t.description) {
        t.description = t.html;
        delete t.html;
        migrated = true;
      }
    }
    if (migrated) save(list);
    return list;
  } catch {
    return [];
  }
}

export async function listTemplates(){
  await delay();
  try {
    return { ok: true, data: load() };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function getTemplate(id){
  await delay();
  try {
    const t = load().find(t => t.id === Number(id)) || null;
    if (!t) return { ok: false };
    return { ok: true, data: t };
  } catch {
    return { ok: false };
  }
}

export async function createTemplate({ name, description }){
  await delay();
  try {
    const list = load();
    const id = (list.at(-1)?.id || 0) + 1;
    const t = { id, name, description };
    list.push(t);
    save(list);
    return { ok: true, data: t };
  } catch {
    return { ok: false };
  }
}

export async function updateTemplate(id, { name, description }){
  await delay();
  try {
    const list = load();
    const idx = list.findIndex(t => t.id === Number(id));
    if (idx === -1) return { ok: false };
    list[idx] = { ...list[idx], name, description };
    save(list);
    return { ok: true, data: list[idx] };
  } catch {
    return { ok: false };
  }
}

export async function deleteTemplate(id){
  await delay();
  try {
    const list = load().filter(t => t.id !== Number(id));
    save(list);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

