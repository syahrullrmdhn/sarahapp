export function MiniTrendChart() {
    return (
        <svg viewBox="0 0 780 210" className="hero-chart-svg" aria-hidden="true">
            <path d="M20 180 L100 150 L180 158 L260 126 L340 132 L420 74 L500 88 L580 56 L660 70 L740 34" className="trend-line" />
            <path d="M20 188 L100 172 L180 184 L260 166 L340 174 L420 124 L500 134 L580 112 L660 121 L740 96" className="trend-line-muted" />
        </svg>
    );
}

export function BarPulse({ valueA, valueB, valueC }) {
    const max = Math.max(1, valueA, valueB, valueC);

    const bars = [valueA, valueB, valueC].map((value) => `${Math.max(14, Math.round((value / max) * 100))}%`);

    return (
        <div className="bar-pulse">
            <div style={{ height: bars[0] }} />
            <div style={{ height: bars[1] }} />
            <div style={{ height: bars[2] }} />
        </div>
    );
}

export function SimpleSparkline() {
    return (
        <svg viewBox="0 0 240 92" className="sparkline" aria-hidden="true">
            <path d="M0 60 L30 64 L60 52 L90 67 L120 33 L150 42 L180 28 L210 36 L240 14" className="sparkline-main" />
            <path d="M0 72 L30 76 L60 65 L90 74 L120 58 L150 66 L180 56 L210 64 L240 51" className="sparkline-muted" />
        </svg>
    );
}

export function Donut({ value, caption }) {
    return (
        <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(var(--accent) 0 ${value}%, var(--track) ${value}% 100%)` }}>
                <div className="donut-inner">{value}%</div>
            </div>
            <div className="donut-caption">{caption}</div>
        </div>
    );
}

