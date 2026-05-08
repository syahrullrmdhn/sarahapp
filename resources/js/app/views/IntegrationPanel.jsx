import React from 'react';

export default function IntegrationPanel({ integrations }) {
    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">Integrations</div>
                    <div className="cartel-card-sub">Webhook receiver secured with HMAC signature verification.</div>
                </div>
            </div>

            <div className="cartel-table-wrap">
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Slug</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(integrations.webhook_sources || []).map((source) => (
                            <tr key={source.slug}>
                                <td className="cartel-table-strong">{source.name}</td>
                                <td className="mono">{source.slug}</td>
                                <td>{source.is_active ? <span className="cartel-badge">Active</span> : <span className="cartel-badge badge-p1">Inactive</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="cartel-mini-card" style={{ marginTop: 14 }}>
                <div className="cartel-mini-kicker">Telegram Webhook Endpoint</div>
                <div className="mono" style={{ marginTop: 8 }}>{integrations.telegram?.webhook_url || '-'}</div>
                <div className="cartel-mini-sub" style={{ marginTop: 10 }}>
                    Secret header: <span className="mono">{integrations.telegram?.secret_header || '-'}</span>
                </div>
            </div>
        </section>
    );
}

