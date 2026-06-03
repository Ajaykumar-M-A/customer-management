import { useEffect, useMemo, useState } from 'react';
import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, downloadCsv } from '../api/client.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { currency, date } from '../utils/format.js';

const emptyLead = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  source: 'Website',
  status: 'new',
  value: 0,
  owner_id: '',
  expected_close_date: '',
  notes: ''
};

export default function Leads() {
  const { isManager, canExport, user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyLead);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => ({ ...(status ? { status } : {}), ...(query ? { q: query } : {}) }), [status, query]);

  function loadLeads() {
    setLoading(true);
    api
      .get('/leads', { params })
      .then((response) => setLeads(response.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLeads();
  }, [params]);

  useEffect(() => {
    if (isManager) {
      api.get('/users').then((response) => setUsers(response.data.data));
    }
  }, [isManager]);

  function openForm(lead = null) {
    setEditing(lead);
    setFormOpen(true);
    setForm(
      lead
        ? {
            ...lead,
            expected_close_date: lead.expected_close_date?.slice(0, 10) || '',
            owner_id: lead.owner_id || ''
          }
        : { ...emptyLead, owner_id: isManager ? user.id : '' }
    );
  }

  async function saveLead(event) {
    event.preventDefault();
    if (editing) {
      await api.put(`/leads/${editing.id}`, form);
    } else {
      await api.post('/leads', form);
    }
    setFormOpen(false);
    setEditing(null);
    setForm(emptyLead);
    loadLeads();
  }

  async function removeLead(lead) {
    if (!window.confirm(`Delete ${lead.company_name}?`)) return;
    await api.delete(`/leads/${lead.id}`);
    loadLeads();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">Lead Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track prospects from first contact through closed revenue.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canExport ? (
            <Button variant="secondary" onClick={() => downloadCsv('/leads/export', 'leads-report.csv')}>
              <Download size={17} />
              Export
            </Button>
          ) : null}
          <Button onClick={() => openForm()}>
            <Plus size={17} />
            Lead
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input className="field" placeholder="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[920px] divide-y divide-line text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Close date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan="7">Loading leads...</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-ink">{lead.company_name}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.contact_name}<br /><span className="text-xs">{lead.email}</span></td>
                  <td className="px-4 py-3"><Badge value={lead.status} /></td>
                  <td className="px-4 py-3 font-semibold">{currency(lead.value)}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.owner_name || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-slate-600">{date(lead.expected_close_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => openForm(lead)} aria-label="Edit lead">
                        <Pencil size={16} />
                      </Button>
                      {isManager ? (
                        <Button variant="danger" className="h-9 w-9 px-0" onClick={() => removeLead(lead)} aria-label="Delete lead">
                          <Trash2 size={16} />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-line lg:hidden">
          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading leads...</div>
          ) : leads.length ? (
            leads.map((lead) => (
              <article key={lead.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-bold text-ink">{lead.company_name}</h2>
                    <p className="mt-1 break-words text-sm text-slate-600">{lead.contact_name}</p>
                    <p className="break-words text-xs text-slate-500">{lead.email || 'No email'}</p>
                  </div>
                  <Badge value={lead.status} />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Value</dt>
                    <dd className="mt-1 font-semibold text-ink">{currency(lead.value)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Close</dt>
                    <dd className="mt-1 text-slate-700">{date(lead.expected_close_date)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-semibold uppercase text-slate-500">Owner</dt>
                    <dd className="mt-1 text-slate-700">{lead.owner_name || 'Unassigned'}</dd>
                  </div>
                </dl>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => openForm(lead)} aria-label="Edit lead">
                    <Pencil size={16} />
                  </Button>
                  {isManager ? (
                    <Button variant="danger" className="h-9 w-9 px-0" onClick={() => removeLead(lead)} aria-label="Delete lead">
                      <Trash2 size={16} />
                    </Button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-slate-500">No leads found.</div>
          )}
        </div>
      </section>

      {formOpen ? (
        <LeadModal
          title={editing ? 'Edit Lead' : 'Create Lead'}
          form={form}
          setForm={setForm}
          users={users}
          isManager={isManager}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
            setForm(emptyLead);
          }}
          onSubmit={saveLead}
        />
      ) : null}
    </div>
  );
}

function LeadModal({ title, form, setForm, users, isManager, onClose, onSubmit }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <label><span className="label">Company</span><input className="field" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required /></label>
        <label><span className="label">Contact</span><input className="field" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} required /></label>
        <label><span className="label">Email</span><input className="field" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label><span className="label">Phone</span><input className="field" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span className="label">Source</span><input className="field" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required /></label>
        <label><span className="label">Status</span><select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        <label><span className="label">Value</span><input className="field" type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></label>
        <label><span className="label">Expected close</span><input className="field" type="date" value={form.expected_close_date || ''} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} /></label>
        {isManager ? (
          <label className="md:col-span-2"><span className="label">Owner</span><select className="field" value={form.owner_id || ''} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>{users.map((u) => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}</select></label>
        ) : null}
        <label className="md:col-span-2"><span className="label">Notes</span><textarea className="field min-h-24" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end md:col-span-2">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="w-full sm:w-auto">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
