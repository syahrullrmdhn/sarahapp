import React from 'react';

export default function EosPanel({ board, selectedEosTicket, onSelectEosTicket, newEosUpdate, setNewEosUpdate, createEosUpdate, eosTicketUpdates }) {
    const tickets = Object.values(board.columns || {}).flat();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">EOS action updates</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update aksi lapangan EOS dan sinkron status tiket.</p>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <form className="grid grid-cols-1 gap-4 md:grid-cols-3" onSubmit={createEosUpdate}>
                    <Field label="Ticket">
                        <select
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={selectedEosTicket?.id || ''}
                            onChange={(event) => onSelectEosTicket(event.target.value)}
                        >
                            <option value="">Select ticket</option>
                            {tickets.map((ticket) => (
                                <option key={ticket.id} value={ticket.id}>
                                    {ticket.ticket_code} - {ticket.title}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Action type">
                        <select
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={newEosUpdate.action_type}
                            onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, action_type: event.target.value }))}
                        >
                            <option value="update">Update</option>
                            <option value="onsite">Onsite</option>
                            <option value="fix_applied">Fix applied</option>
                            <option value="verification">Verification</option>
                        </select>
                    </Field>
                    <Field label="Status change (optional)">
                        <select
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={newEosUpdate.status}
                            onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, status: event.target.value }))}
                        >
                            <option value="">No status change</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="in_progress">In progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </Field>
                    <Field label="Attachment URL (optional)" className="md:col-span-3">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={newEosUpdate.attachment_url}
                            onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, attachment_url: event.target.value }))}
                        />
                    </Field>
                    <Field label="Update message" required className="md:col-span-3">
                        <textarea
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all min-h-28"
                            rows={4}
                            required
                            value={newEosUpdate.message}
                            onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, message: event.target.value }))}
                        />
                    </Field>
                    <div className="md:col-span-3 flex items-center justify-end pt-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="submit">
                            Post update
                        </button>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="text-base font-medium text-slate-900 dark:text-slate-100">Update history</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">EOS updates for selected ticket.</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Time</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">EOS</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Action</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {eosTicketUpdates.map((update) => (
                                <tr key={update.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(update.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{update.eos_user?.name || 'system'}</td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            {update.action_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-700 dark:text-slate-200" style={{ whiteSpace: 'normal' }}>{update.message}</td>
                                </tr>
                            ))}
                            {eosTicketUpdates.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">No updates yet.</td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function Field({ label, required, className, children }) {
    return (
        <label className={className}>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                {label}{required ? ' *' : ''}
            </div>
            {children}
        </label>
    );
}
