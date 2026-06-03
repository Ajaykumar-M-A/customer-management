import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BriefcaseBusiness, ClipboardList, DollarSign, Target } from 'lucide-react';
import { api } from '../api/client.js';
import { StatCard } from '../components/StatCard.jsx';
import { currency, titleize } from '../utils/format.js';

const statusOrder = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, []);

  const pipeline = useMemo(() => {
    const map = new Map((data?.pipeline || []).map((item) => [item.status, item]));
    return statusOrder.map((status) => ({
      status: titleize(status),
      count: map.get(status)?.count || 0,
      value: map.get(status)?.value || 0
    }));
  }, [data]);

  if (loading) return <div className="h-80 rounded-lg border border-line bg-white" />;

  const summary = data.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Pipeline performance, sales value, and operational workload.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BriefcaseBusiness} label="Total leads" value={summary.total_leads} accent="#2563eb" />
        <StatCard icon={DollarSign} label="Pipeline value" value={currency(summary.pipeline_value)} accent="#0f9f8f" />
        <StatCard icon={Target} label="Won revenue" value={currency(summary.won_value)} accent="#d97706" />
        <StatCard icon={ClipboardList} label="Open tasks" value={summary.open_tasks} accent="#e85d5d" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Sales Pipeline</h2>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => (name === 'value' ? currency(value) : value)} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Lead Volume</h2>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0f9f8f" fill="#ccfbf1" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
        <div className="mt-4 divide-y divide-line">
          {data.recentActivity.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                <strong>{item.actor_name || 'System'}</strong> {item.action} {item.entity_type}
              </span>
              <span className="text-slate-500">{new Date(item.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
