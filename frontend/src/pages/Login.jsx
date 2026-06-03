import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@crm.local', password: 'password123' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-mist lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-ink px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-ink">
            <Building2 size={22} />
          </span>
          <div>
            <p className="text-lg font-black">NexusCRM</p>
            <p className="text-sm text-slate-300">Sales and customer operations</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Interview-ready CRM</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            Manage leads, roles, tasks, reports, and audit history from one workspace.
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          <span className="rounded-md border border-white/15 p-4">RBAC</span>
          <span className="rounded-md border border-white/15 p-4">Pipeline</span>
          <span className="rounded-md border border-white/15 p-4">Exports</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="mb-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-brand lg:hidden">
              <Building2 size={24} />
            </div>
            <h2 className="text-2xl font-black text-ink">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Seed accounts use password `password123`.</p>
          </div>

          {error ? <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <label className="mb-4 block">
            <span className="label">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                className="field pl-10"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </span>
          </label>

          <label className="mb-6 block">
            <span className="label">Password</span>
            <span className="relative block">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                className="field pl-10"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </span>
          </label>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </section>
    </main>
  );
}
