import React from 'react';

export default function EosPanel({ board, selectedEosTicket, onSelectEosTicket, newEosUpdate, setNewEosUpdate, createEosUpdate, eosTicketUpdates }) {
    const tickets = Object.values(board.columns || {}).flat();

    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">EOS Action Updates</div>
                    <div className="cartel-card-sub">Update aksi lapangan EOS dan sinkron status tiket.</div>
                </div>
            </div>

            <form className="user-form mt-4" onSubmit={createEosUpdate}>
                <select className="input" value={selectedEosTicket?.id || ''} onChange={(event) => onSelectEosTicket(event.target.value)}>
                    <option value="">Select ticket</option>
                    {tickets.map((ticket) => (
                        <option key={ticket.id} value={ticket.id}>
                            {ticket.ticket_code} - {ticket.title}
                        </option>
                    ))}
                </select>
                <select
                    className="input"
                    value={newEosUpdate.action_type}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, action_type: event.target.value }))}
                >
                    <option value="update">Update</option>
                    <option value="onsite">Onsite</option>
                    <option value="fix_applied">Fix applied</option>
                    <option value="verification">Verification</option>
                </select>
                <select
                    className="input"
                    value={newEosUpdate.status}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, status: event.target.value }))}
                >
                    <option value="">No status change</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <input
                    className="input md:col-span-2"
                    placeholder="Attachment URL (optional)"
                    value={newEosUpdate.attachment_url}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, attachment_url: event.target.value }))}
                />
                <textarea
                    className="input md:col-span-3"
                    rows={4}
                    required
                    placeholder="Field action update detail"
                    value={newEosUpdate.message}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, message: event.target.value }))}
                />
                <button className="btn-primary" type="submit">Post EOS Update</button>
            </form>

            <div className="cartel-table-wrap" style={{ marginTop: 14 }}>
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>EOS</th>
                            <th>Action</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eosTicketUpdates.map((update) => (
                            <tr key={update.id}>
                                <td>{new Date(update.created_at).toLocaleString()}</td>
                                <td className="cartel-table-strong">{update.eos_user?.name || 'system'}</td>
                                <td><span className="cartel-badge">{update.action_type}</span></td>
                                <td style={{ whiteSpace: 'normal' }}>{update.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

