import React from 'react';

export default function NotificationPanel({ logs }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Notification logs</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log notifikasi eskalasi dan assignment (telegram/in-app/email placeholder).</p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Time</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Channel</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Event</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Target</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Ticket</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            {log.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{log.event}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{log.target || '-'}</td>
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100 whitespace-nowrap">{log.ticket?.ticket_code || '-'}</td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">No notifications yet.</td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
