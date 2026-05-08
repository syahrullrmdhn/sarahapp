import React from 'react';

export default function OperationsReportPanel({ opsReport }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Operations report</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ringkasan 7 hari terakhir untuk monitoring, helpdesk, ticketing, dan aksi EOS.</p>
            </div>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatBlock title="By priority" payload={opsReport?.tickets_by_priority || {}} />
                <StatBlock title="By status" payload={opsReport?.tickets_by_status || {}} />
                <StatBlock title="Helpdesk channels" payload={opsReport?.helpdesk_channels || {}} />
                <StatBlock title="EOS actions" payload={opsReport?.eos_actions || {}} />
            </section>
        </div>
    );
}

function StatBlock({ title, payload }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-base font-medium text-slate-900 dark:text-slate-100">{title}</div>
            <pre className="mt-3 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                {JSON.stringify(payload, null, 2)}
            </pre>
        </article>
    );
}
