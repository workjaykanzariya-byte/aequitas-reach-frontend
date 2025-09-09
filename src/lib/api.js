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

// ----- Seed mock data once and keep on window so it survives navigation -----
if (typeof window !== 'undefined') {
  window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [
    {
      id: 1,
      name: 'Test Template',
      html: '<p>Hello <strong>world</strong></p>',
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-05T11:00:00Z',
    },
  ];
  window.CAMPAIGNS = Array.isArray(window.CAMPAIGNS) ? window.CAMPAIGNS : [
    { id: 101, name: 'Launch Alpha',   status: 'draft', templateIds: [1], assignedToUserIds: [1,2] },
    { id: 102, name: 'Festive Promo',  status: 'draft', templateIds: [],  assignedToUserIds: [] },
    { id: 103, name: 'VIP Outreach',   status: 'draft', templateIds: [1], assignedToUserIds: [1] },
  ];
}

// Tiny event so UI can choose to refresh if listening
function pingChange(topic = 'data-change') {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent(topic));
  }
}

export async function mockGetTemplates() {
  await delay(120);
  return (window.TEMPLATES || []).map(t => ({ ...t }));
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
  return USERS.filter(u => u.role === role).map(u => ({ id:u.id, name:u.name, email:u.email, role:u.role }));
}
export async function mockGetAllPeople(){
  await delay();
  return USERS.map(u => ({ id:u.id, name:u.name, email:u.email, role:u.role }));
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
  return (window.CAMPAIGNS || []).map(c => ({
    ...c,
    assigneeSummaries: c.assignees
      .map(id => userById(id))
      .filter(Boolean)
      .map(u => ({ id:u.id, name:u.name, role:u.role })),
  }));
}

export async function mockCreateCampaign({ name }){
  await delay();
  const id = (window.CAMPAIGNS.reduce((m,c)=>Math.max(m,c.id),100)+1);
  const c = { id, name: String(name||'Untitled').trim() || 'Untitled', status:'draft', assignees:[] };
  window.CAMPAIGNS.unshift(c);
  pingChange();
  return { id: c.id, status: c.status };
}

// Permissions (unchanged idea):
// - Admin: execute any + assign to MEMBERS
// - Member: execute assigned + assign to USERS
// - User:   execute assigned
export async function mockExecuteCampaign(campaignId, currentUser){
  await delay();
  const c = window.CAMPAIGNS.find(x => x.id===campaignId);
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
  const c = window.CAMPAIGNS.find(x => x.id===campaignId); if (!c) throw new Error('Campaign not found');
  const member = USERS.find(u => u.id===memberId && u.role==='member'); if (!member) throw new Error('Member not found');
  if (!c.assignees.includes(member.id)) c.assignees.push(member.id);
  c.status = 'assigned';
  return { message:'Assigned to member', campaignId, memberId, status:c.status };
}

export async function mockAssignCampaignToUser(campaignId, userId, currentUser){
  await delay();
  if (currentUser?.role !== 'member') throw new Error('Only Member can assign to a User');
  const c = window.CAMPAIGNS.find(x => x.id===campaignId); if (!c) throw new Error('Campaign not found');
  const user = USERS.find(u => u.id===userId && u.role==='user'); if (!user) throw new Error('User not found');
  if (!c.assignees.includes(user.id)) c.assignees.push(user.id);
  c.status = 'assigned';
  return { message:'Assigned to user', campaignId, userId, status:c.status };
}

// ----- Template ↔ Campaign helpers -----
export function getTemplates() {
  return [...(window.TEMPLATES || [])];
}

export function getTemplateById(id) {
  id = Number(id);
  return (window.TEMPLATES || []).find(t => Number(t.id) === id) || null;
}

export function _nextTemplateId() {
  const arr = window.TEMPLATES || [];
  return arr.length ? Math.max(...arr.map(t => Number(t.id))) + 1 : 1;
}

export function createTemplate({ name, html }) {
  const now = new Date().toISOString();
  const t = {
    id: _nextTemplateId(),
    name: String(name || 'Untitled'),
    html: String(html || ''),
    createdAt: now,
    updatedAt: now,
  };
  window.TEMPLATES.push(t);
  pingChange();
  return t;
}

export function updateTemplate(id, patch) {
  id = Number(id);
  const t = getTemplateById(id);
  if (!t) throw new Error('Template not found');
  Object.assign(t, patch, { updatedAt: new Date().toISOString() });
  pingChange();
  return t;
}

export function deleteTemplate(id) {
  id = Number(id);
  window.TEMPLATES = (window.TEMPLATES || []).filter(t => Number(t.id) !== id);
  // remove template from any campaign templateIds
  (window.CAMPAIGNS || []).forEach(c => {
    c.templateIds = (c.templateIds || []).filter(tid => Number(tid) !== id);
  });
  pingChange();
}

export function getCampaigns() {
  return [...(window.CAMPAIGNS || [])];
}

export function getCampaignById(id) {
  id = Number(id);
  return (window.CAMPAIGNS || []).find(c => Number(c.id) === id) || null;
}

export function getCampaignsByTemplateId(templateId) {
  const tid = Number(templateId);
  return getCampaigns().filter(c => Array.isArray(c.templateIds) && c.templateIds.includes(tid));
}

export function assignTemplateToCampaign(templateId, campaignId) {
  const c = getCampaignById(campaignId);
  if (!c) throw new Error('Campaign not found');
  c.templateIds = Array.isArray(c.templateIds) ? c.templateIds : [];
  const tid = Number(templateId);
  if (!c.templateIds.includes(tid)) c.templateIds.push(tid);
  pingChange();
  return c;
}

export function unassignTemplateFromCampaign(templateId, campaignId) {
  const c = getCampaignById(campaignId);
  if (!c) return null;
  const tid = Number(templateId);
  c.templateIds = (c.templateIds || []).filter(id => Number(id) !== tid);
  pingChange();
  return c;
}

export function isCampaignAssigned(campaign) {
  return Array.isArray(campaign?.templateIds) && campaign.templateIds.length > 0;
}

