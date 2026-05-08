import React from 'react';

export default function OperationsReportPanel({ opsReport }) {
    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">Consolidated Operations Report</div>
                    <div className="cartel-card-sub">Ringkasan 7 hari terakhir untuk monitoring, helpdesk, ticketing, dan aksi EOS.</div>
                </div>
            </div>

            <div className="ops-grid">
                <article className="mini-stat">
                    <h3>By Priority</h3>
                    <pre>{JSON.stringify(opsReport?.tickets_by_priority || {}, null, 2)}</pre>
                </article>
                <article className="mini-stat">
                    <h3>By Status</h3>
                    <pre>{JSON.stringify(opsReport?.tickets_by_status || {}, null, 2)}</pre>
                </article>
                <article className="mini-stat">
                    <h3>Helpdesk Channels</h3>
                    <pre>{JSON.stringify(opsReport?.helpdesk_channels || {}, null, 2)}</pre>
                </article>
                <article className="mini-stat">
                    <h3>EOS Actions</h3>
                    <pre>{JSON.stringify(opsReport?.eos_actions || {}, null, 2)}</pre>
                </article>
            </div>
        </section>
    );
}

