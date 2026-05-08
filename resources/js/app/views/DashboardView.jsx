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
        <div className="cartel-dashboard">
            <div className="cartel-stat-grid">
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

            <div className="cartel-split-grid">
                <section className="cartel-card">
                    <div className="cartel-card-head">
                        <div>
                            <div className="cartel-card-title">Total incidents</div>
                            <div className="cartel-card-sub">Trend across the last 12 hours (sample)</div>
                        </div>
                        <button className="cartel-link-btn" type="button" onClick={() => setMenu('tickets')}>
                            View all
                            <span aria-hidden="true">↗</span>
                        </button>
                    </div>
                    <div className="cartel-card-body">
                        <MiniTrendChart />
                    </div>
                </section>

                <section className="cartel-card">
                    <div className="cartel-card-head">
                        <div>
                            <div className="cartel-card-title">SLA overview</div>
                            <div className="cartel-card-sub">Response vs resolution targets</div>
                        </div>
                        <button className="cartel-link-btn" type="button" onClick={() => setMenu('tickets')}>
                            Open board
                            <span aria-hidden="true">↗</span>
                        </button>
                    </div>
                    <div className="cartel-card-body cartel-sla-grid">
                        <div className="cartel-mini-card">
                            <div className="cartel-mini-kicker">Response</div>
                            <div className="cartel-mini-value">{responseCompliance}%</div>
                            <div className="cartel-mini-sub">Compliance rate</div>
                            <SimpleSparkline />
                        </div>
                        <div className="cartel-mini-card">
                            <div className="cartel-mini-kicker">Completion</div>
                            <div className="cartel-mini-value">{completionRate}%</div>
                            <div className="cartel-mini-sub">Closed vs total</div>
                            <Donut value={completionRate} caption="Closed" />
                        </div>
                    </div>
                </section>
            </div>

            <section className="cartel-card cartel-table-card">
                <div className="cartel-card-head">
                    <div>
                        <div className="cartel-card-title">Latest tickets</div>
                        <div className="cartel-card-sub">Most recent incidents from monitoring + helpdesk</div>
                    </div>
                    <button className="cartel-link-btn" type="button" onClick={() => setMenu('tickets')}>
                        View all
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>

                <div className="cartel-table-wrap">
                    <table className="cartel-table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Created</th>
                                <th>Node</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Assignee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestTickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td className="cartel-table-strong">{ticket.ticket_code}</td>
                                    <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</td>
                                    <td>{ticket.node_name || '-'}</td>
                                    <td>
                                        <span className="cartel-badge">{statusLabels[ticket.status] || ticket.status}</span>
                                    </td>
                                    <td>
                                        <span className={clsx('cartel-badge', priorityClass[ticket.priority] || priorityClass.P3)}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td>{ticket.assignee?.name || '-'}</td>
                                </tr>
                            ))}
                            {latestTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="cartel-empty">
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

