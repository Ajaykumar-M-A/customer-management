import clsx from 'clsx';
import { titleize } from '../utils/format.js';

const palette = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  contacted: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  qualified: 'bg-teal-50 text-teal-700 ring-teal-200',
  proposal: 'bg-amber-50 text-amber-700 ring-amber-200',
  won: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  lost: 'bg-rose-50 text-rose-700 ring-rose-200',
  todo: 'bg-slate-100 text-slate-700 ring-slate-200',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  urgent: 'bg-rose-50 text-rose-700 ring-rose-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  low: 'bg-slate-100 text-slate-700 ring-slate-200'
};

export function Badge({ value }) {
  return (
    <span
      className={clsx(
        'inline-flex h-6 items-center rounded px-2 text-xs font-semibold ring-1',
        palette[value] || 'bg-slate-100 text-slate-700 ring-slate-200'
      )}
    >
      {titleize(value)}
    </span>
  );
}
