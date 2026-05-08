import React from 'react';

export default function AuditPanel({ logs }) {
    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">Audit Log</div>
                    <div className="cartel-card-sub">Every mutation is tracked for accountability.</div>
                </div>
            </div>
            <div className="cartel-table-wrap">
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Object</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                <td className="cartel-table-strong">{log.user?.name || 'system'}</td>
                                <td className="cartel-table-strong">{log.action}</td>
                                <td>{log.auditable_type}#{log.auditable_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

