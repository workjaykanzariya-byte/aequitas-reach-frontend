// Mock API to develop frontend first.
// Later: replace functions to call your Laravel endpoints via axios.

const MOCK_ADMIN = {
  id: 1,
  name: 'System Admin',
  email: 'admin@aequitas.com',
  role: 'admin',
};

const MOCK_USER = {
  id: 2,
  name: 'Aequitas User',
  email: 'user@aequitas.com',
  role: 'user',
};

// In-memory settings store
let SETTINGS = {
  'whatsapp.token': '••••••••',
  'whatsapp.phone_number_id': '210058865514527',
  'whatsapp.template_name': 'realestatedemo',
  'whatsapp.lang_code': 'en',
  'whatsapp.image_url': 'https://example.com/image.jpg',
};

export function mockLogin({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@aequitas.com' && password === 'Secret123!') {
        resolve({ token: 'mock_admin_token', user: MOCK_ADMIN });
      } else if (email === 'user@aequitas.com' && password === 'Secret123!') {
        resolve({ token: 'mock_user_token', user: MOCK_USER });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 400);
  });
}

export function mockLogout() {
  return Promise.resolve({ ok: true });
}

export function mockMe(token) {
  if (token === 'mock_admin_token') return Promise.resolve(MOCK_ADMIN);
  if (token === 'mock_user_token') return Promise.resolve(MOCK_USER);
  return Promise.reject(new Error('Unauthenticated'));
}

export function mockGetAdminSettings() {
  return new Promise((resolve) => setTimeout(() => resolve({ ...SETTINGS }), 250));
}

export function mockUpdateAdminSettings(payload) {
  SETTINGS = { ...SETTINGS, ...payload };
  return new Promise((resolve) => setTimeout(() => resolve({ message: 'Settings updated' }), 250));
}
