import React from 'react';

// ── Button ────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClass = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-100',
  danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100',
};
const sizeClass = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition-colors
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition-colors
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const badgeColors: Record<string, string> = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Sent:      'bg-green-100 text-green-700',
  Failed:    'bg-red-100 text-red-700',
  Opened:    'bg-blue-100 text-blue-700',
  Email:     'bg-purple-100 text-purple-700',
  WhatsApp:  'bg-green-100 text-green-700',
  Both:      'bg-blue-100 text-blue-700',
};

export function Badge({ label }: { label: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );
}

// ── Stat Tile ─────────────────────────────────────────────────
export function StatTile({ label, value, color = 'text-gray-900' }: {
  label: string; value: number | string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
