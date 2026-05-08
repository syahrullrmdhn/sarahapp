import React from 'react';

export default function HelpdeskPanel({ canCreateHelpdesk, helpdeskReports, newHelpdeskReport, setNewHelpdeskReport, createHelpdeskReport }) {
    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">Helpdesk Reports</div>
                    <div className="cartel-card-sub">Intake laporan dan auto-konversi menjadi tiket incident.</div>
                </div>
            </div>

            {canCreateHelpdesk ? (
                <form className="user-form mt-4" onSubmit={createHelpdeskReport}>
                    <input
                        className="input"
                        placeholder="Reporter name"
                        required
                        value={newHelpdeskReport.reporter_name}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, reporter_name: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Reporter contact"
                        value={newHelpdeskReport.reporter_contact}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, reporter_contact: event.target.value }))}
                    />
                    <select
                        className="input"
                        value={newHelpdeskReport.channel}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, channel: event.target.value }))}
                    >
                        <option value="web">Web</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                    </select>
                    <input
                        className="input md:col-span-2"
                        placeholder="Issue title"
                        required
                        value={newHelpdeskReport.title}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, title: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Location"
                        value={newHelpdeskReport.location}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, location: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Node name"
                        value={newHelpdeskReport.node_name}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, node_name: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Impact (critical/high/medium/low)"
                        value={newHelpdeskReport.impact_level}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, impact_level: event.target.value }))}
                    />
                    <textarea
                        className="input md:col-span-3"
                        placeholder="Incident description"
                        rows={4}
                        required
                        value={newHelpdeskReport.description}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, description: event.target.value }))}
                    />
                    <button className="btn-primary" type="submit">Submit To Helpdesk</button>
                </form>
            ) : null}

            <div className="cartel-table-wrap" style={{ marginTop: 14 }}>
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Reporter</th>
                            <th>Channel</th>
                            <th>Title</th>
                            <th>Ticket</th>
                        </tr>
                    </thead>
                    <tbody>
                        {helpdeskReports.map((report) => (
                            <tr key={report.id}>
                                <td>{new Date(report.reported_at).toLocaleString()}</td>
                                <td className="cartel-table-strong">{report.reporter_name}</td>
                                <td><span className="cartel-badge">{report.channel}</span></td>
                                <td>{report.title}</td>
                                <td className="cartel-table-strong">{report.ticket?.ticket_code || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

