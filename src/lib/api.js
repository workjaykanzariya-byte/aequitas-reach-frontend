// Mock API for frontend-only development.
// Contains auth (admin|user|member), settings, and campaigns logic.

const MOCK_ADMIN = { id: 1, name: 'System Admin',  email: 'admin@aequitas.com',  role: 'admin',  pw: 'Secret123!' };
const MOCK_USER  = { id: 2, name: 'Aequitas User',  email: 'user@aequitas.com',   role: 'user',   pw: 'Secret123!' };
const MOCK_MEMBER= { id: 3, name: 'Demo Member',    email: 'member@aequitas.com', role: 'member', pw: 'Secret123!' };

let USERS = [MOCK_ADMIN, MOCK_USER, MOCK_MEMBER];

// Minimal admin settings (used by AdminSettings page)
let SETTINGS = {
  'whatsapp.token': '••••••••',
  'whatsapp.phone_number_id': '210058865514527',
  'whatsapp.template_name': 'realestatedemo',
  'whatsapp.lang_code': 'en',
  'whatsapp.image_url': 'https://example.com/image.jpg',
};

// Mock campaigns with assignees (user IDs)
let CAMPAIGNS = [
  { id: 101, name: 'Launch Alpha',   status: 'draft',  assignees: [3] },      // member assigned
  { id: 102, name: 'Festive Promo',  status: 'draft',  assignees: [] },       // unassigned
  { id: 103, name: 'VIP Outreach',   status: 'draft',  assignees: [2,3] },    // user & member assigned
];

function delay(ms=300){ return new Promise(r=>setTimeout(r, ms)); }

export async function mockLogin({ email, password }) {
  await delay(300);
  const user = USERS.find(u => u.email === email && u.pw === password);
  if (!user) throw new Error('Invalid credentials');
  const token = user.role === 'admin' ? 'mock_admin_token'
              : user.role === 'member' ? 'mock_member_token'
              : 'mock_user_token';
  return { token, user: { id:user.id, name:user.name, email:user.email, role:user.role } };
}

export function mockLogout() {
  return Promise.resolve({ ok: true });
}

export async function mockMe(token) {
  await delay(150);
  const map = {
    'mock_admin_token':  'admin@aequitas.com',
    'mock_user_token':   'user@aequitas.com',
    'mock_member_token': 'member@aequitas.com',
  };
  const email = map[token];
  const user = USERS.find(u => u.email === email);
  if (!user) throw new Error('Unauthenticated');
  return { id:user.id, name:user.name, email:user.email, role:user.role };
}

// Register: creates a new MEMBER user (mock only; not persisted across refresh)
export async function mockRegister({ name, email, password }) {
  await delay(350);
  if (USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const id = USERS.reduce((m,u)=>Math.max(m,u.id),0)+1;
  USERS.push({ id, name, email, role:'member', pw: password });
  return { message: 'Registered successfully. Please log in.', role: 'member' };
}

// Forgot password: succeed without revealing if email exists
export async function mockForgotPassword({ email }) {
  await delay(350);
  return { message: 'If the email exists, a reset link has been sent.' };
}

// Admin Settings (already used by AdminSettings page)
export async function mockGetAdminSettings() {
  await delay(200);
  return { ...SETTINGS };
}
export async function mockUpdateAdminSettings(payload) {
  SETTINGS = { ...SETTINGS, ...payload };
  await delay(200);
  return { message: 'Settings updated' };
}

// Campaigns
export async function mockGetCampaigns() {
  await delay(250);
  // Return a shallow copy to avoid direct mutation from UI
  return CAMPAIGNS.map(c => ({ ...c, assignees: [...c.assignees] }));
}

export async function mockExecuteCampaign(campaignId, currentUser) {
  await delay(300);
  const c = CAMPAIGNS.find(x => x.id === campaignId);
  if (!c) throw new Error('Campaign not found');

  const isAdmin = currentUser?.role === 'admin';
  const isAssignedMember = currentUser?.role === 'member' && c.assignees.includes(currentUser.id);
  const isUserAllowed = isAdmin || isAssignedMember;

  if (!isUserAllowed) {
    throw new Error('You are not allowed to execute this campaign');
  }

  c.status = 'queued'; // mock transition
  return { message: 'Campaign execution started', id: c.id, status: c.status };
}

