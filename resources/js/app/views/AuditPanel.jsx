import React from 'react';

export default function AuditPanel({ logs }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Audit log</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every mutation is tracked for accountability.</p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Time</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">User</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Action</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Object</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{log.user?.name || 'system'}</td>
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{log.action}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{log.auditable_type}#{log.auditable_id}</td>
                                </tr>
                            ))}
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">No audit logs yet.</td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
