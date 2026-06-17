// src/components/Topbar.jsx
export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">Admin</span>
        <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-sm font-medium text-slate-700">
          A
        </div>
      </div>
    </header>
  );
}