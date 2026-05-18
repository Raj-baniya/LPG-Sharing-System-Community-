import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export type FeatureCard = {
  title: string;
  description: string;
  to: string;
  badge?: string;
  stateLabel?: string;
  stateTone?: 'neutral' | 'good' | 'warn' | 'danger';
};

type RoleHubProps = {
  roleTitle: string;
  subtitle: string;
  accentClass: string;
  stats: Array<{ label: string; value: string; loading?: boolean }>;
  features: FeatureCard[];
  children?: React.ReactNode;
};

const stateToneClass = {
  neutral: 'border-white/20 bg-white/10 text-[var(--text-primary)]',
  good: 'border-emerald-300/30 bg-emerald-400/15 text-emerald-200',
  warn: 'border-amber-300/30 bg-amber-400/15 text-amber-200',
  danger: 'border-red-300/30 bg-red-400/15 text-red-200',
};

export function RoleHub({ roleTitle, subtitle, accentClass, stats, features, children }: RoleHubProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden transition-colors">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.1),transparent_40%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8 md:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-sm font-semibold tracking-[0.24em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            GASSAHAYAK CONTROL
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-[var(--glass-border)] text-[var(--text-primary)] transition-all"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span className="material-symbols-outlined !text-xl leading-none">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            <Link
              to="/auth"
              className="rounded-xl border border-[var(--glass-border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/10"
            >
              Switch Account
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-[var(--glass-border)] bg-[var(--card-bg)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>
                {roleTitle}
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Workspace</h1>
            </div>
            
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-[var(--glass-border)] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[var(--text-primary)] hover:bg-white hover:text-black hover:border-white transition-all shadow-md self-start"
            >
              <span className="material-symbols-outlined !text-base leading-none">person</span>
              Profile Settings
            </Link>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] md:text-base">{subtitle}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[var(--glass-border)] bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">{stat.label}</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{stat.loading ? '...' : stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="group rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] p-5 transition-all hover:-translate-y-1 hover:border-white/30"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black tracking-tight">{feature.title}</h2>
                {feature.badge || feature.stateLabel ? (
                  <div className="flex flex-col items-end gap-2">
                    {feature.badge ? (
                      <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        {feature.badge}
                      </span>
                    ) : null}
                    {feature.stateLabel ? (
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${stateToneClass[feature.stateTone || 'neutral']}`}>
                        {feature.stateLabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{feature.description}</p>
              <p className="mt-5 text-sm font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">Open module -&gt;</p>
            </Link>
          ))}
        </section>
        {children && <div className="mt-10">{children}</div>}
      </div>
    </div>
  );
}
