import React from 'react';

export default function NotificationPanel({ logs }) {
    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">Notification Logs</div>
                    <div className="cartel-card-sub">Log notifikasi eskalasi dan assignment (telegram/in-app/email placeholder).</div>
                </div>
            </div>

            <div className="cartel-table-wrap">
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Channel</th>
                            <th>Event</th>
                            <th>Target</th>
                            <th>Ticket</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                <td><span className="cartel-badge">{log.channel}</span></td>
                                <td className="cartel-table-strong">{log.event}</td>
                                <td>{log.target || '-'}</td>
                                <td className="cartel-table-strong">{log.ticket?.ticket_code || '-'}</td>
                                <td><span className="cartel-badge">{log.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

