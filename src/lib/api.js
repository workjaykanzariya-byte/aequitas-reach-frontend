// Mock API for frontend-only development.
// Roles: admin | user | member

const MOCK_ADMIN  = { id: 1, name: 'System Admin',  email: 'admin@aequitas.com',  role: 'admin',  pw: 'Secret123!' };
const MOCK_USER   = { id: 2, name: 'Aequitas User',  email: 'user@aequitas.com',   role: 'user',   pw: 'Secret123!' };
const MOCK_MEMBER = { id: 3, name: 'Demo Member',    email: 'member@aequitas.com', role: 'member', pw: 'Secret123!' };

let USERS = [MOCK_ADMIN, MOCK_USER, MOCK_MEMBER];

// Settings (used elsewhere)
let SETTINGS = {
  'whatsapp.token': '••••••••',
  'whatsapp.phone_number_id': '210058865514527',
  'whatsapp.template_name': 'realestatedemo',
  'whatsapp.lang_code': 'en',
  'whatsapp.image_url': 'https://example.com/image.jpg',
};

// Contacts demo (if your app has it; harmless if unused)
let CONTACTS = [];

// Keep in-memory mock data on the global object so it survives HMR
const g = typeof window !== 'undefined' ? window : globalThis;

// ----- Templates (mock) -----
// template: { id, name, html, createdAt?, updatedAt? }
g.TEMPLATES = g.TEMPLATES || [
  {
    id: 1,
    name: 'Test Template',
    html: '<p>Hello <strong>world</strong></p>',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-05T11:00:00Z',
  },
];
let TEMPLATES = g.TEMPLATES;

// Campaign has { id, name, description?, templateIds?, status?, assignees? }
g.CAMPAIGNS = g.CAMPAIGNS || [
  { id: 101, name: 'Launch Alpha',   status: 'draft', assignees: [3], description: 'Sept push',       templateIds: [1] },
  { id: 102, name: 'Festive Promo',  status: 'draft', assignees: [],   description: 'Dormant users',  templateIds: [] },
  { id: 103, name: 'VIP Outreach',   status: 'draft', assignees: [2,3], description: 'VIP outreach',  templateIds: [] },
];
let CAMPAIGNS = g.CAMPAIGNS;

export async function mockGetTemplates() {
  await delay(120);
  return TEMPLATES.map(t => ({ ...t }));
}

function delay(ms=250){ return new Promise(r=>setTimeout(r, ms)); }
function userById(id){ return USERS.find(u => u.id === id) || null; }

//// ---------- AUTH ----------
export async function mockLogin({ email, password }) {
  await delay();
  const user = USERS.find(u => u.email === email && u.pw === password);
  if (!user) throw new Error('Invalid credentials');
  const token = user.role === 'admin'  ? 'mock_admin_token'
              : user.role === 'member' ? 'mock_member_token'
              : 'mock_user_token';
  return { token, user: { id:user.id, name:user.name, email:user.email, role:user.role } };
}
export function mockLogout(){ return Promise.resolve({ ok:true }); }
export async function mockMe(token){
  await delay(120);
  const map = {
    'mock_admin_token':  'admin@aequitas.com',
    'mock_user_token':   'user@aequitas.com',
    'mock_member_token': 'member@aequitas.com',
  };
  const email = map[token];
  const u = USERS.find(x => x.email === email);
  if (!u) throw new Error('Unauthenticated');
  return { id:u.id, name:u.name, email:u.email, role:u.role };
}

//// ---------- REGISTER / FORGOT ----------
export async function mockRegister({ name, email, password }){
  await delay();
  if (USERS.some(u => u.email.toLowerCase()===email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const id = USERS.reduce((m,u)=>Math.max(m,u.id),0)+1;
  USERS.push({ id, name, email, role:'member', pw: password });
  return { message: 'Registered successfully. Please log in.', role:'member' };
}
export async function mockForgotPassword(){
  await delay();
  return { message: 'If the email exists, a reset link has been sent.' };
}

//// ---------- SETTINGS ----------
export async function mockGetAdminSettings(){ await delay(); return { ...SETTINGS }; }
export async function mockUpdateAdminSettings(p){ SETTINGS = { ...SETTINGS, ...p }; await delay(); return { message:'Settings updated' }; }

//// ---------- PEOPLE ----------
export async function mockGetPeople(role){
  await delay();
  return USERS.filter(u => u.role === role)
    .map(u => ({ id:u.id, name:u.name, email:u.email, mobile:u.mobile, role:u.role }));
}
export async function mockGetAllPeople(){
  await delay();
  return USERS.map(u => ({ id:u.id, name:u.name, email:u.email, mobile:u.mobile, role:u.role }));
}

// Add many users at once from CSV or other bulk sources
export async function bulkAddUsers(items){
  await delay(120);
  const startId = USERS.reduce((m,u)=>Math.max(m,u.id),0);
  let nextId = startId;
  const existingMobiles = new Set(USERS.map(u=>u.mobile));
  for(const it of items){
    const name = String(it?.name||'').trim();
    const mobile = String(it?.mobile||'').trim();
    if(!name || !/^[0-9]+$/.test(mobile)) continue; // basic validation
    if(existingMobiles.has(mobile)) continue; // skip duplicates
    nextId += 1;
    USERS.push({ id: nextId, name, mobile, role:'user' });
    existingMobiles.add(mobile);
  }
  return USERS.map(u=>({ ...u }));
}

//// ---------- CONTACTS (optional demo) ----------
export async function mockGetContacts(){ await delay(120); return CONTACTS.map(c => ({...c})); }
export async function mockAddContact({name,phone}){ await delay(120); const id=(CONTACTS.at(-1)?.id||0)+1; CONTACTS.push({id,name,phone}); return {id}; }
export async function mockDeleteContact(id){ await delay(100); CONTACTS = CONTACTS.filter(c=>c.id!==id); return {ok:true}; }
export async function mockBulkAddContacts(items){ await delay(180); let added=0; for(const it of items){ if(!it?.phone) continue; const id=(CONTACTS.at(-1)?.id||0)+1; CONTACTS.push({id,name:it.name||'',phone:String(it.phone)}); added++; } return {added,total:CONTACTS.length}; }

//// ---------- CAMPAIGNS ----------
/**
 * Return campaigns + assigneeSummaries: [{id, name, role}]
 */
export async function mockGetCampaigns(){
  await delay();
  return CAMPAIGNS.map(c => ({
    ...c,
    assigneeSummaries: c.assignees
      .map(id => userById(id))
      .filter(Boolean)
      .map(u => ({ id:u.id, name:u.name, role:u.role })),
  }));
}

export async function mockCreateCampaign({ name }){
  await delay();
  const id = CAMPAIGNS.reduce((m,c)=>Math.max(m,c.id),100)+1;
  const c = { id, name: String(name||'Untitled').trim() || 'Untitled', status:'draft', assignees:[] };
  CAMPAIGNS.unshift(c);
  return { id: c.id, status: c.status };
}

// Permissions (unchanged idea):
// - Admin: execute any + assign to MEMBERS
// - Member: execute assigned + assign to USERS
// - User:   execute assigned
export async function mockExecuteCampaign(campaignId, currentUser){
  await delay();
  const c = CAMPAIGNS.find(x => x.id===campaignId);
  if (!c) throw new Error('Campaign not found');
  const canAdmin  = currentUser?.role === 'admin';
  const canMember = currentUser?.role === 'member' && c.assignees.includes(currentUser.id);
  const canUser   = currentUser?.role === 'user'   && c.assignees.includes(currentUser.id);
  if (!(canAdmin || canMember || canUser)) throw new Error('You are not allowed to execute this campaign');

  // status: sending → done (simulate)
  c.status = 'sending';
  setTimeout(()=>{ c.status = 'done'; }, 1000);
  return { message:'Campaign execution started', id:c.id, status:c.status };
}

export async function mockAssignCampaignToMember(campaignId, memberId, currentUser){
  await delay();
  if (currentUser?.role !== 'admin') throw new Error('Only Admin can assign to a Member');
  const c = CAMPAIGNS.find(x => x.id===campaignId); if (!c) throw new Error('Campaign not found');
  const member = USERS.find(u => u.id===memberId && u.role==='member'); if (!member) throw new Error('Member not found');
  if (!c.assignees.includes(member.id)) c.assignees.push(member.id);
  c.status = 'assigned';
  return { message:'Assigned to member', campaignId, memberId, status:c.status };
}

export async function mockAssignCampaignToUser(campaignId, userId, currentUser){
  await delay();
  if (currentUser?.role !== 'member') throw new Error('Only Member can assign to a User');
  const c = CAMPAIGNS.find(x => x.id===campaignId); if (!c) throw new Error('Campaign not found');
  const user = USERS.find(u => u.id===userId && u.role==='user'); if (!user) throw new Error('User not found');
  if (!c.assignees.includes(user.id)) c.assignees.push(user.id);
  c.status = 'assigned';
  return { message:'Assigned to user', campaignId, userId, status:c.status };
}

// ----- Template ↔ Campaign helpers -----
export function getTemplateById(id) {
  id = Number(id);
  return (TEMPLATES || []).find(t => Number(t.id) === id) || null;
}

export function getTemplates() {
  return TEMPLATES || [];
}

export function getCampaigns() {
  return CAMPAIGNS || [];
}

export function getCampaignById(id) {
  id = Number(id);
  return (CAMPAIGNS || []).find(c => Number(c.id) === id) || null;
}

export function getCampaignsByTemplateId(templateId) {
  const tid = Number(templateId);
  return getCampaigns().filter(
    c => Array.isArray(c.templateIds) && c.templateIds.includes(tid)
  );
}

export function getTemplatesByCampaignId(campaignId) {
  const cid = Number(campaignId);
  return getTemplates().filter(
    t => getCampaignById(cid)?.templateIds?.includes(t.id)
  );
}

export function assignTemplateToCampaign(templateId, campaignId) {
  const c = getCampaignById(campaignId);
  if (!c) throw new Error('Campaign not found');
  const id = Number(templateId);
  if (!Array.isArray(c.templateIds)) c.templateIds = [];
  if (!c.templateIds.includes(id)) c.templateIds.push(id);
  return c;
}

export function unassignTemplateFromCampaign(templateId, campaignId) {
  const c = getCampaignById(campaignId);
  if (!c || !Array.isArray(c.templateIds)) return c;
  const id = Number(templateId);
  c.templateIds = c.templateIds.filter(tid => Number(tid) !== id);
  return c;
}

