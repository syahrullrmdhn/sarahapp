import clsx from 'clsx';

import Icon from './Icon';

export function StatCard({ title, value, deltaLabel, deltaTone = 'ok', icon = 'dashboard', chartTone = 'accent' }) {
    return (
        <section className="cartel-card cartel-stat-card">
            <div className="cartel-stat-head">
                <div>
                    <div className="cartel-stat-title">{title}</div>
                    <div className="cartel-stat-value">{value}</div>
                    <div className={clsx('cartel-stat-delta', deltaTone === 'bad' && 'is-bad')}>{deltaLabel}</div>
                </div>
                <div className="cartel-stat-icon" aria-hidden="true">
                    <Icon name={icon} />
                </div>
            </div>
            <div className="cartel-stat-chart" aria-hidden="true">
                <MiniAreaSpark tone={chartTone} />
            </div>
        </section>
    );
}

export function MiniAreaSpark({ tone = 'accent' }) {
    const colors = {
        accent: { stroke: 'var(--accent)', fill: 'color-mix(in srgb, var(--accent) 26%, transparent)' },
        warning: { stroke: 'var(--warning)', fill: 'color-mix(in srgb, var(--warning) 22%, transparent)' },
        success: { stroke: 'var(--success)', fill: 'color-mix(in srgb, var(--success) 22%, transparent)' },
    };
    const c = colors[tone] || colors.accent;

    // Static sparkline for now; later we can feed it real telemetry.
    const d = 'M0 42 C 18 28, 36 56, 54 40 C 72 26, 90 28, 108 38 C 126 48, 144 20, 162 28 C 180 36, 198 46, 216 34 C 234 22, 252 30, 270 26';
    const area = `${d} L 270 60 L 0 60 Z`;

    return (
        <svg viewBox="0 0 270 60" preserveAspectRatio="none" className="cartel-spark">
            <path d={area} fill={c.fill} />
            <path d={d} fill="none" stroke={c.stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

