import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { api } from '../api/client.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { date } from '../utils/format.js';

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'sales'
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [loading, setLoading] = useState(true);

  function loadUsers() {
    setLoading(true);
    api
      .get('/users')
      .then((response) => setUsers(response.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser(event) {
    event.preventDefault();
    await api.post('/users', form);
    setFormOpen(false);
    setForm(emptyUser);
    loadUsers();
  }

  async function updateUser(user, updates) {
    await api.patch(`/users/${user.id}`, updates);
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">Employee Roles</h1>
          <p className="mt-1 text-sm text-slate-500">Admin-only role and access management for CRM users.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={17} />
          User
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[840px] divide-y divide-line text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan="5">Loading users...</td></tr>
              ) : users.map((user) => (
                <UserRow key={user.id} user={user} onUpdate={updateUser} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line lg:hidden">
          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading users...</div>
          ) : users.map((user) => (
            <UserCard key={user.id} user={user} onUpdate={updateUser} />
          ))}
        </div>
      </section>

      {formOpen ? (
        <Modal title="Create User" onClose={() => setFormOpen(false)}>
          <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">Name</span>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              <span className="label">Email</span>
              <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              <span className="label">Password</span>
              <input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </label>
            <label>
              <span className="label">Role</span>
              <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {['admin', 'manager', 'sales', 'support'].map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end md:col-span-2">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="w-full sm:w-auto">Create</Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function UserRow({ user, onUpdate }) {
  const [draft, setDraft] = useState({ name: user.name, role: user.role, is_active: user.is_active });

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <input className="field max-w-xs" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <select className="field max-w-40" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
          {['admin', 'manager', 'sales', 'support'].map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
          Active
        </label>
      </td>
      <td className="px-4 py-3 text-slate-600">{date(user.created_at)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => onUpdate(user, draft)} aria-label="Save user">
            <Save size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function UserCard({ user, onUpdate }) {
  const [draft, setDraft] = useState({ name: user.name, role: user.role, is_active: user.is_active });

  return (
    <article className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <input className="field font-semibold" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <p className="mt-2 break-words text-xs text-slate-500">{user.email}</p>
        </div>
        <Badge value={draft.role} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="label">Role</span>
          <select className="field" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
            {['admin', 'manager', 'sales', 'support'].map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Status</span>
          <span className="flex h-10 items-center gap-2 rounded-md border border-line px-3">
            <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
            <span className="text-sm text-slate-700">Active</span>
          </span>
        </label>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">Created {date(user.created_at)}</span>
        <Button variant="secondary" onClick={() => onUpdate(user, draft)}>
          <Save size={16} />
          Save
        </Button>
      </div>
    </article>
  );
}
