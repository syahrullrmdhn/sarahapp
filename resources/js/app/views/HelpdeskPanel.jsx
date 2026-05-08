import React from 'react';

export default function HelpdeskPanel({ canCreateHelpdesk, helpdeskReports, newHelpdeskReport, setNewHelpdeskReport, createHelpdeskReport }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Helpdesk Reports</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Intake laporan dan auto-konversi menjadi tiket incident.
                </p>
            </div>

            {canCreateHelpdesk ? (
                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-base font-medium text-slate-900 dark:text-slate-100">New report</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Lengkapi detail insiden, lalu submit ke tim helpdesk.</div>
                        </div>
                    </div>

                    <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createHelpdeskReport}>
                        <Field label="Reporter name" required>
                            <input
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                required
                                value={newHelpdeskReport.reporter_name}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, reporter_name: event.target.value }))}
                            />
                        </Field>

                        <Field label="Reporter contact">
                            <input
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                value={newHelpdeskReport.reporter_contact}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, reporter_contact: event.target.value }))}
                            />
                        </Field>

                        <Field label="Channel">
                            <select
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                value={newHelpdeskReport.channel}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, channel: event.target.value }))}
                            >
                                <option value="web">Web</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                            </select>
                        </Field>

                        <Field label="Issue title" required>
                            <input
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                required
                                value={newHelpdeskReport.title}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, title: event.target.value }))}
                            />
                        </Field>

                        <Field label="Location">
                            <input
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                value={newHelpdeskReport.location}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, location: event.target.value }))}
                            />
                        </Field>

                        <Field label="Node name">
                            <input
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                value={newHelpdeskReport.node_name}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, node_name: event.target.value }))}
                            />
                        </Field>

                        <Field label="Impact level (critical/high/medium/low)">
                            <input
                                className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                value={newHelpdeskReport.impact_level}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, impact_level: event.target.value }))}
                            />
                        </Field>

                        <Field label="Incident description" required className="md:col-span-2">
                            <textarea
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all min-h-28"
                                rows={4}
                                required
                                value={newHelpdeskReport.description}
                                onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, description: event.target.value }))}
                            />
                        </Field>

                        <div className="md:col-span-2 flex items-center justify-end pt-2">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                                type="submit"
                            >
                                Submit to helpdesk
                            </button>
                        </div>
                    </form>
                </section>
            ) : null}

            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="text-base font-medium text-slate-900 dark:text-slate-100">Recent reports</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Riwayat laporan terakhir yang masuk.</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Time</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Reporter</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Channel</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Title</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Ticket</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {helpdeskReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {new Date(report.reported_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">
                                        {report.reporter_name}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            {report.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-700 dark:text-slate-200">
                                        {report.title}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                        {report.ticket?.ticket_code || '-'}
                                    </td>
                                </tr>
                            ))}
                            {helpdeskReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        No reports yet.
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
