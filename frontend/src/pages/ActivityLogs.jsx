import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Badge } from '../components/Badge.jsx';
import { date, titleize } from '../utils/format.js';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/audit-logs')
      .then((response) => setLogs(response.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Activity Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Audit trail for role changes, lead updates, exports, and task actions.</p>
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[820px] divide-y divide-line text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Metadata</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan="5">Loading activity...</td></tr>
              ) : logs.length ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{log.actor_name || 'System'}</p>
                    <p className="mt-1 text-xs text-slate-500">{log.actor_email}</p>
                  </td>
                  <td className="px-4 py-3"><Badge value={log.action} /></td>
                  <td className="px-4 py-3 text-slate-600">{titleize(log.entity_type)}</td>
                  <td className="max-w-md px-4 py-3 text-xs text-slate-500">
                    <pre className="whitespace-pre-wrap break-words font-sans">{JSON.stringify(log.metadata || {}, null, 2)}</pre>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{date(log.created_at)}</td>
                </tr>
              )) : (
                <tr><td className="px-4 py-8 text-slate-500" colSpan="5">No activity yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line lg:hidden">
          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading activity...</div>
          ) : logs.length ? logs.map((log) => (
            <article key={log.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold text-ink">{log.actor_name || 'System'}</h2>
                  <p className="break-words text-xs text-slate-500">{log.actor_email}</p>
                </div>
                <Badge value={log.action} />
              </div>
              <p className="text-sm text-slate-700">{titleize(log.entity_type)} activity on {date(log.created_at)}</p>
              <pre className="max-h-40 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-600">{JSON.stringify(log.metadata || {}, null, 2)}</pre>
            </article>
          )) : (
            <div className="px-4 py-8 text-sm text-slate-500">No activity yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
