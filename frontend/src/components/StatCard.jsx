export function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-md" style={{ backgroundColor: accent }}>
          <Icon size={22} className="text-white" />
        </span>
      </div>
    </article>
  );
}
