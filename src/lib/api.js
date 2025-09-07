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

// Campaigns: assignees = array of USER IDs (can be members or users)
let CAMPAIGNS = [
  { id: 101, name: 'Launch Alpha',   status: 'draft',  assignees: [3] },  // member assigned
  { id: 102, name: 'Festive Promo',  status: 'draft',  assignees: [] },
  { id: 103, name: 'VIP Outreach',   status: 'draft',  assignees: [2,3] },// user + member
];

// ----- Templates (mock) -----
let TEMPLATES = typeof TEMPLATES !== 'undefined' ? TEMPLATES : [
  { id: 1, name: 'Welcome Flow', html: '<p>Hi <strong>there</strong> 👋</p>', createdAt: new Date().toISOString() },
  { id: 2, name: 'Promo Blast',  html: '<p>Don\u2019t miss our <em>offer</em>!</p>', createdAt: new Date().toISOString() },
];

// Mapping of template assignments to campaigns
let CAMPAIGN_TEMPLATES = typeof CAMPAIGN_TEMPLATES !== 'undefined' ? CAMPAIGN_TEMPLATES : {
  // [campaignId]: [templateId, ...]
  103: [2], // example: VIP Outreach -> Promo Blast
};

// Helper clone
const deepCopy = (o) => JSON.parse(JSON.stringify(o));

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
export async function mockForgotPassword({ email }){
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
  return CAMPAIGNS.map(c => {
    const assigneeSummaries = (c.assignees || [])
      .map(id => USERS.find(u=>u.id===id))
      .filter(Boolean)
      .map(u => ({ id:u.id, name:u.name, role:u.role }));
    const templateCount = (CAMPAIGN_TEMPLATES[c.id] || []).length;
    return { ...deepCopy(c), assigneeSummaries, templateCount };
  });
}

export async function mockCreateCampaign({ name, createdBy }){
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

// ---- Campaign & Template getters ----
export async function mockGetCampaign(campaignId){
  await delay();
  const c = CAMPAIGNS.find(x=>x.id===Number(campaignId));
  if (!c) throw new Error('Campaign not found');
  const assigneeSummaries = (c.assignees || [])
    .map(id => USERS.find(u=>u.id===id))
    .filter(Boolean)
    .map(u => ({ id:u.id, name:u.name, role:u.role }));
  const templateIds = deepCopy(CAMPAIGN_TEMPLATES[c.id] || []);
  const templates = templateIds
    .map(tid => TEMPLATES.find(t=>t.id===tid))
    .filter(Boolean)
    .map(t => deepCopy(t));
  return { ...deepCopy(c), assigneeSummaries, templates };
}

export async function mockGetTemplates(){
  await delay(100);
  // include which campaigns each template is assigned to
  const index = {};
  Object.entries(CAMPAIGN_TEMPLATES).forEach(([cid, tids])=>{
    tids.forEach(tid=>{
      index[tid] = index[tid] || [];
      index[tid].push(Number(cid));
    });
  });
  return TEMPLATES.map(t => ({ ...deepCopy(t), campaignIds: deepCopy(index[t.id] || []) }));
}

export async function mockCreateTemplate({ name, html, campaignId }){
  await delay(120);
  const id = (TEMPLATES.at(0)?.id || 0) + 1;
  const item = { id, name: String(name||'Untitled').trim() || 'Untitled', html: String(html||''), createdAt: new Date().toISOString() };
  TEMPLATES.unshift(item);
  if (campaignId) {
    const cid = Number(campaignId);
    CAMPAIGN_TEMPLATES[cid] = CAMPAIGN_TEMPLATES[cid] || [];
    if (!CAMPAIGN_TEMPLATES[cid].includes(id)) CAMPAIGN_TEMPLATES[cid].push(id);
  }
  return { id };
}

export async function mockUpdateTemplate(id, { name, html }){
  await delay(120);
  const i = TEMPLATES.findIndex(x=>x.id===Number(id));
  if (i===-1) throw new Error('Template not found');
  TEMPLATES[i] = { ...TEMPLATES[i], name: String(name||'').trim() || TEMPLATES[i].name, html: String(html||'') };
  return { ok:true };
}

export async function mockDeleteTemplate(id){
  await delay(100);
  const tid = Number(id);
  TEMPLATES = TEMPLATES.filter(x=>x.id!==tid);
  // also unassign from all campaigns
  Object.keys(CAMPAIGN_TEMPLATES).forEach(cid=>{
    CAMPAIGN_TEMPLATES[cid] = (CAMPAIGN_TEMPLATES[cid] || []).filter(x=>x!==tid);
  });
  return { ok:true };
}

export async function mockAssignTemplateToCampaign(campaignId, templateId){
  await delay(100);
  const cid = Number(campaignId), tid = Number(templateId);
  if (!CAMPAIGNS.find(c=>c.id===cid)) throw new Error('Campaign not found');
  if (!TEMPLATES.find(t=>t.id===tid)) throw new Error('Template not found');
  CAMPAIGN_TEMPLATES[cid] = CAMPAIGN_TEMPLATES[cid] || [];
  if (!CAMPAIGN_TEMPLATES[cid].includes(tid)) CAMPAIGN_TEMPLATES[cid].push(tid);
  return { ok:true };
}

export async function mockUnassignTemplateFromCampaign(campaignId, templateId){
  await delay(100);
  const cid = Number(campaignId), tid = Number(templateId);
  CAMPAIGN_TEMPLATES[cid] = (CAMPAIGN_TEMPLATES[cid] || []).filter(x=>x!==tid);
  return { ok:true };
}

