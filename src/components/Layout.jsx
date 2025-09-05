import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold">Aequitas Reach</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name} • {user?.role}</span>
            <button onClick={logout} className="text-sm px-3 py-1.5 rounded-xl border">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white rounded-2xl border p-3 space-y-2">
            <NavLink to="/dashboard" className={({isActive})=>`block px-3 py-2 rounded-xl ${isActive?'bg-black text-white':'hover:bg-slate-100'}`}>Dashboard</NavLink>
            <NavLink to="/profile" className={({isActive})=>`block px-3 py-2 rounded-xl ${isActive?'bg-black text-white':'hover:bg-slate-100'}`}>My Profile</NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin/settings" className={({isActive})=>`block px-3 py-2 rounded-xl ${isActive?'bg-black text-white':'hover:bg-slate-100'}`}>Admin Settings</NavLink>
            )}
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}
