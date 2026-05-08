import clsx from 'clsx';
import React, { useMemo } from 'react';

import { priorityClass, statusLabels } from '../constants';
import { Donut, MiniTrendChart, SimpleSparkline } from '../charts';
import { StatCard } from '../ui/StatCard';

export default function DashboardView({ board, boardCounts, stats, responseCompliance, setMenu }) {
    const completionRate = boardCounts.total > 0 ? Math.round((boardCounts.closed / boardCounts.total) * 100) : 0;
    const tickets = useMemo(() => Object.values(board.columns || {}).flat(), [board]);
    const latestTickets = useMemo(() => {
        const sorted = [...tickets].sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime();
            const tb = new Date(b.created_at || 0).getTime();
            return tb - ta;
        });
        return sorted.slice(0, 8);
    }, [tickets]);

    const openTickets = stats?.open_tickets ?? 0;
    const escalatedTickets = boardCounts.escalated ?? 0;
    const escalatedPct = openTickets > 0 ? Math.round((escalatedTickets / openTickets) * 100) : 0;
    const closedToday = stats?.closed_today ?? 0;
    const responseBreached = stats?.sla_response_breached ?? 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Dashboard</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Overview operasional NOC dan status insiden.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <StatCard
                    title="Open tickets"
                    value={openTickets}
                    deltaLabel={openTickets > 0 ? `${escalatedPct}% escalated` : 'No active incidents'}
                    deltaTone={escalatedPct >= 15 ? 'bad' : 'ok'}
                    icon="tickets"
                    chartTone="accent"
                />
                <StatCard
                    title="Response breach"
                    value={responseBreached}
                    deltaLabel={`${responseCompliance}% compliance`}
                    deltaTone={responseBreached > 0 ? 'bad' : 'ok'}
                    icon="audit"
                    chartTone="warning"
                />
                <StatCard
                    title="Closed today"
                    value={closedToday}
                    deltaLabel={`${completionRate}% completion rate`}
                    deltaTone="ok"
                    icon="dashboard"
                    chartTone="success"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-base font-medium text-slate-900 dark:text-slate-100">Total incidents</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Trend across the last 12 hours (sample)</div>
                        </div>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setMenu('tickets')}
                        >
                            View all
                        </button>
                    </div>
                    <div className="mt-5">
                        <MiniTrendChart />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-base font-medium text-slate-900 dark:text-slate-100">SLA overview</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Response vs resolution targets</div>
                        </div>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setMenu('tickets')}
                        >
                            Open board
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                            <div className="text-sm text-slate-500 dark:text-slate-400">Response</div>
                            <div className="mt-2 text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-100">{responseCompliance}%</div>
                            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Compliance rate</div>
                            <div className="mt-3">
                                <SimpleSparkline />
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                            <div className="text-sm text-slate-500 dark:text-slate-400">Completion</div>
                            <div className="mt-2 text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-100">{completionRate}%</div>
                            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Closed vs total</div>
                            <div className="mt-3">
                                <Donut value={completionRate} caption="Closed" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <div className="text-base font-medium text-slate-900 dark:text-slate-100">Latest tickets</div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Most recent incidents from monitoring + helpdesk</div>
                    </div>
                    <button
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        type="button"
                        onClick={() => setMenu('tickets')}
                    >
                        View all
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Ticket</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Created</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Node</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Priority</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Assignee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {latestTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100 whitespace-nowrap">{ticket.ticket_code}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</td>
                                    <td className="px-6 py-3 text-slate-700 dark:text-slate-200">{ticket.node_name || '-'}</td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            {statusLabels[ticket.status] || ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', priorityClass[ticket.priority] || priorityClass.P3)}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-700 dark:text-slate-200">{ticket.assignee?.name || '-'}</td>
                                </tr>
                            ))}
                            {latestTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        No tickets yet. Ingest a webhook or submit a helpdesk report.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
