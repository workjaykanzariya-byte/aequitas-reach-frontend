// Mock API for frontend development only.
// Roles: admin | user | member

const MOCK_ADMIN  = { id: 1, name: 'System Admin',  email: 'admin@aequitas.com',  role: 'admin',  pw: 'Secret123!' };
const MOCK_USER   = { id: 2, name: 'Aequitas User',  email: 'user@aequitas.com',   role: 'user',   pw: 'Secret123!' };
const MOCK_MEMBER = { id: 3, name: 'Demo Member',    email: 'member@aequitas.com', role: 'member', pw: 'Secret123!' };

let USERS = [MOCK_ADMIN, MOCK_USER, MOCK_MEMBER];

// Minimal admin settings (used elsewhere)
let SETTINGS = {
  'whatsapp.token': '••••••••',
  'whatsapp.phone_number_id': '210058865514527',
  'whatsapp.template_name': 'realestatedemo',
  'whatsapp.lang_code': 'en',
  'whatsapp.image_url': 'https://example.com/image.jpg',
};

// Campaigns: assignees array holds IDs (can be user OR member IDs)
let CAMPAIGNS = [
  { id: 101, name: 'Launch Alpha',   status: 'draft',  assignees: [3] },     // assigned to member
  { id: 102, name: 'Festive Promo',  status: 'draft',  assignees: [] },
  { id: 103, name: 'VIP Outreach',   status: 'draft',  assignees: [2,3] },   // assigned to user & member
];

function delay(ms=250){ return new Promise(r=>setTimeout(r, ms)); }

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

// Register: creates a new MEMBER
export async function mockRegister({ name, email, password }){
  await delay();
  if (USERS.some(u => u.email.toLowerCase()===email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const id = USERS.reduce((m,u)=>Math.max(m,u.id),0)+1;
  USERS.push({ id, name, email, role:'member', pw: password });
  return { message: 'Registered successfully. Please log in.', role:'member' };
}

// Forgot password: always succeed (mock)
export async function mockForgotPassword({ email }){
  await delay();
  return { message: 'If the email exists, a reset link has been sent.' };
}

// Admin Settings (unchanged)
export async function mockGetAdminSettings(){ await delay(); return { ...SETTINGS }; }
export async function mockUpdateAdminSettings(p){ SETTINGS = { ...SETTINGS, ...p }; await delay(); return { message:'Settings updated' }; }

// People
export async function mockGetPeople(role){ 
  await delay();
  return USERS.filter(u => u.role === role).map(u => ({ id:u.id, name:u.name, email:u.email, role:u.role }));
}

export async function mockGetCampaigns(){
  await delay();
  return CAMPAIGNS.map(c => ({ ...c, assignees: [...c.assignees] }));
}

// Permissions:
// - Admin can execute any campaign and assign campaigns to MEMBERS.
// - Member can execute campaigns assigned to them and assign campaigns to USERS.
// - User can execute campaigns assigned to them.
export async function mockExecuteCampaign(campaignId, currentUser){
  await delay();
  const c = CAMPAIGNS.find(x => x.id===campaignId);
  if (!c) throw new Error('Campaign not found');
  const isAdmin   = currentUser?.role === 'admin';
  const isMember  = currentUser?.role === 'member' && c.assignees.includes(currentUser.id);
  const isUser    = currentUser?.role === 'user'   && c.assignees.includes(currentUser.id);
  if (!(isAdmin || isMember || isUser)) throw new Error('You are not allowed to execute this campaign');
  c.status = 'queued';
  return { message:'Campaign execution started', id:c.id, status:c.status };
}

export async function mockAssignCampaignToMember(campaignId, memberId, currentUser){
  await delay();
  if (currentUser?.role !== 'admin') throw new Error('Only Admin can assign to a Member');
  const c = CAMPAIGNS.find(x => x.id===campaignId);
  if (!c) throw new Error('Campaign not found');
  const member = USERS.find(u => u.id===memberId && u.role==='member');
  if (!member) throw new Error('Member not found');
  if (!c.assignees.includes(member.id)) c.assignees.push(member.id);
  return { message:'Assigned to member', campaignId, memberId };
}

export async function mockAssignCampaignToUser(campaignId, userId, currentUser){
  await delay();
  if (currentUser?.role !== 'member') throw new Error('Only Member can assign to a User');
  const c = CAMPAIGNS.find(x => x.id===campaignId);
  if (!c) throw new Error('Campaign not found');
  const user = USERS.find(u => u.id===userId && u.role==='user');
  if (!user) throw new Error('User not found');
  if (!c.assignees.includes(user.id)) c.assignees.push(user.id);
  return { message:'Assigned to user', campaignId, userId };
}

// ===== Contacts (demo, in-memory) =====
let CONTACTS = [
  // { id: 1, name: 'John Example', phone: '+11234567890' }
];

export async function mockGetContacts() {
  await delay(150);
  return CONTACTS.map(c => ({ ...c }));
}

export async function mockAddContact({ name, phone }) {
  await delay(150);
  const id = CONTACTS.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
  const clean = String(phone || '').trim();
  CONTACTS.push({ id, name: String(name || '').trim(), phone: clean });
  return { id };
}

export async function mockDeleteContact(id) {
  await delay(120);
  CONTACTS = CONTACTS.filter(c => c.id !== id);
  return { ok: true };
}

export async function mockBulkAddContacts(items) {
  // items: [{ name, phone }]
  await delay(200);
  let added = 0;
  for (const it of items) {
    if (!it) continue;
    const name = String(it.name || '').trim();
    const phone = String(it.phone || '').trim();
    if (!phone) continue;
    const id = CONTACTS.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
    CONTACTS.push({ id, name, phone });
    added++;
  }
  return { added, total: CONTACTS.length };
}

