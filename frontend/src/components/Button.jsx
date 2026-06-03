import clsx from 'clsx';

const variants = {
  primary: 'bg-brand text-white hover:bg-blue-700',
  secondary: 'border border-line bg-white text-ink hover:bg-slate-50',
  danger: 'bg-coral text-white hover:bg-red-600',
  ghost: 'text-slate-600 hover:bg-slate-100'
};

export function Button({ children, className, variant = 'primary', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={clsx(
        'focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
