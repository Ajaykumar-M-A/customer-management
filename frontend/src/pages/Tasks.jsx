import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { date } from '../utils/format.js';

const emptyTask = {
  title: '',
  description: '',
  due_date: '',
  priority: 'medium',
  status: 'todo',
  lead_id: '',
  assigned_to: ''
};

export default function Tasks() {
  const { isManager, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => (status ? { status } : {}), [status]);

  function loadTasks() {
    setLoading(true);
    api
      .get('/tasks', { params })
      .then((response) => setTasks(response.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTasks();
  }, [params]);

  useEffect(() => {
    api.get('/leads').then((response) => setLeads(response.data.data));
    if (isManager) {
      api.get('/users').then((response) => setUsers(response.data.data));
    }
  }, [isManager]);

  function openForm(task = null) {
    setEditing(task);
    setFormOpen(true);
    setForm(
      task
        ? {
            ...task,
            due_date: task.due_date?.slice(0, 10) || '',
            lead_id: task.lead_id || '',
            assigned_to: task.assigned_to || ''
          }
        : { ...emptyTask, assigned_to: isManager ? user.id : '' }
    );
  }

  async function saveTask(event) {
    event.preventDefault();
    if (editing) {
      await api.put(`/tasks/${editing.id}`, form);
    } else {
      await api.post('/tasks', form);
    }
    setFormOpen(false);
    setEditing(null);
    setForm(emptyTask);
    loadTasks();
  }

  async function removeTask(task) {
    if (!window.confirm(`Delete ${task.title}?`)) return;
    await api.delete(`/tasks/${task.id}`);
    loadTasks();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">Task Assignment</h1>
          <p className="mt-1 text-sm text-slate-500">Assign follow-ups, track due dates, and keep customer work moving.</p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus size={17} />
          Task
        </Button>
      </div>

      <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
        <select className="field max-w-full sm:max-w-56" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All tasks</option>
          {['todo', 'in_progress', 'done', 'cancelled'].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[900px] divide-y divide-line text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan="7">Loading tasks...</td></tr>
              ) : tasks.length ? tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.company_name || 'No lead'}</td>
                  <td className="px-4 py-3 text-slate-600">{task.assignee_name || 'Unassigned'}</td>
                  <td className="px-4 py-3"><Badge value={task.priority} /></td>
                  <td className="px-4 py-3"><Badge value={task.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{date(task.due_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => openForm(task)} aria-label="Edit task">
                        <Pencil size={16} />
                      </Button>
                      {isManager ? (
                        <Button variant="danger" className="h-9 w-9 px-0" onClick={() => removeTask(task)} aria-label="Delete task">
                          <Trash2 size={16} />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td className="px-4 py-8 text-slate-500" colSpan="7">No tasks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line lg:hidden">
          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading tasks...</div>
          ) : tasks.length ? tasks.map((task) => (
            <article key={task.id} className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold text-ink">{task.title}</h2>
                  <p className="mt-1 break-words text-sm text-slate-600">{task.company_name || 'No lead'}</p>
                </div>
                <Badge value={task.status} />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Priority</dt>
                  <dd className="mt-1"><Badge value={task.priority} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Due</dt>
                  <dd className="mt-1 text-slate-700">{date(task.due_date)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Assignee</dt>
                  <dd className="mt-1 text-slate-700">{task.assignee_name || 'Unassigned'}</dd>
                </div>
              </dl>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => openForm(task)} aria-label="Edit task">
                  <Pencil size={16} />
                </Button>
                {isManager ? (
                  <Button variant="danger" className="h-9 w-9 px-0" onClick={() => removeTask(task)} aria-label="Delete task">
                    <Trash2 size={16} />
                  </Button>
                ) : null}
              </div>
            </article>
          )) : (
            <div className="px-4 py-8 text-sm text-slate-500">No tasks found.</div>
          )}
        </div>
      </section>

      {formOpen ? (
        <TaskModal
          title={editing ? 'Edit Task' : 'Create Task'}
          form={form}
          setForm={setForm}
          users={users}
          leads={leads}
          isManager={isManager}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
            setForm(emptyTask);
          }}
          onSubmit={saveTask}
        />
      ) : null}
    </div>
  );
}

function TaskModal({ title, form, setForm, users, leads, isManager, onClose, onSubmit }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label">Title</span>
          <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label>
          <span className="label">Priority</span>
          <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['low', 'medium', 'high', 'urgent'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Status</span>
          <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['todo', 'in_progress', 'done', 'cancelled'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Due date</span>
          <input className="field" type="date" value={form.due_date || ''} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </label>
        <label>
          <span className="label">Lead</span>
          <select className="field" value={form.lead_id || ''} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}>
            <option value="">No lead</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.company_name}</option>)}
          </select>
        </label>
        {isManager ? (
          <label className="md:col-span-2">
            <span className="label">Assignee</span>
            <select className="field" value={form.assigned_to || ''} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              {users.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.role}</option>)}
            </select>
          </label>
        ) : null}
        <label className="md:col-span-2">
          <span className="label">Description</span>
          <textarea className="field min-h-24" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end md:col-span-2">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="w-full sm:w-auto">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
