import Icon from './Icon';

export function StatCard({ title, value, deltaLabel, deltaTone = 'ok', icon = 'dashboard', chartTone = 'accent' }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
                    <div className="mt-2 text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
                    <div className={deltaTone === 'bad' ? 'mt-2 text-sm text-rose-600 dark:text-rose-300' : 'mt-2 text-sm text-slate-500 dark:text-slate-400'}>
                        {deltaLabel}
                    </div>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300" aria-hidden="true">
                    <span className="h-5 w-5"><Icon name={icon} /></span>
                </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40" aria-hidden="true">
                <MiniAreaSpark tone={chartTone} />
            </div>
        </section>
    );
}

export function MiniAreaSpark({ tone = 'accent' }) {
    const colors = {
        accent: { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.18)' },
        warning: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.18)' },
        success: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.18)' },
    };
    const c = colors[tone] || colors.accent;

    // Static sparkline for now; later we can feed it real telemetry.
    const d = 'M0 42 C 18 28, 36 56, 54 40 C 72 26, 90 28, 108 38 C 126 48, 144 20, 162 28 C 180 36, 198 46, 216 34 C 234 22, 252 30, 270 26';
    const area = `${d} L 270 60 L 0 60 Z`;

    return (
        <svg viewBox="0 0 270 60" preserveAspectRatio="none" className="block h-14 w-full">
            <path d={area} fill={c.fill} />
            <path d={d} fill="none" stroke={c.stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}
