import { useAuth } from '../context/AuthContext';
export default function Profile(){
  const { user } = useAuth();
  return (
    <div className="p-4 bg-white rounded-2xl border">
      <h2 className="text-xl font-semibold">My Profile</h2>
      <div className="mt-3 text-sm text-slate-700">
        <div><b>Name:</b> {user?.name}</div>
        <div><b>Email:</b> {user?.email}</div>
        <div><b>Role:</b> {user?.role}</div>
      </div>
    </div>
  );
}
