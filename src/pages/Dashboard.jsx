export default function Dashboard(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border">Total Campaigns: —</div>
        <div className="p-4 bg-white rounded-2xl border">Templates: —</div>
        <div className="p-4 bg-white rounded-2xl border">Delivery Rate: —</div>
      </div>
      <div className="p-4 bg-white rounded-2xl border"><b>Recent Campaigns</b><div className="text-sm text-slate-500 mt-2">Coming soon…</div></div>
    </div>
  );
}
