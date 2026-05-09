import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { columnsOrder, priorityClass, statusLabels } from '../constants';
import { formatTimer } from '../utils';
import { api } from '../api';
import Modal from '../ui/Modal';

const emptyTicket = {
    title: '',
    node_name: '',
    priority: 'P3',
    description: '',
};

export default function TicketBoardView({ board, searchQuery, canCreateTicket, canUpdateTicket, onDragEnd, sensors, updateStatus, createTicket }) {
    const q = (searchQuery || '').trim().toLowerCase();
    const filterItems = (items) => {
        if (!q) {
            return items;
        }
        return items.filter((ticket) => {
            const hay = `${ticket.ticket_code} ${ticket.title} ${ticket.node_name || ''}`.toLowerCase();
            return hay.includes(q);
        });
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({ ...emptyTicket });

    const totalOpen = useMemo(() => (board.meta?.total_open ?? Object.values(board.columns || {}).flat().filter((t) => t.status !== 'closed').length), [board]);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailTicket, setDetailTicket] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const openDetails = async (ticket) => {
        setIsDetailOpen(true);
        setDetailTicket(ticket);
        setIsDetailLoading(true);

        try {
            const res = await api.get(`/tickets/${ticket.id}`);
            setDetailTicket(res.data);
        } catch (_e) {
            // Fallback to the summary ticket already in the board.
        } finally {
            setIsDetailLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Incident kanban</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Drag & drop status. Total open: {totalOpen}.
                </p>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Board updates are near real-time (polling).
                    </div>
                    {canCreateTicket ? (
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                            type="button"
                            onClick={() => {
                                setForm({ ...emptyTicket });
                                setIsCreateOpen(true);
                            }}
                        >
                            Add ticket
                        </button>
                    ) : null}
                </div>

                <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                    <section className="grid grid-cols-6 gap-3 overflow-x-auto p-4 pb-5">
                        {columnsOrder.map((status) => (
                            <KanbanColumn
                                key={status}
                                id={status}
                                title={statusLabels[status]}
                                items={filterItems(board.columns?.[status] || [])}
                                canUpdate={canUpdateTicket}
                                onQuickStatus={updateStatus}
                                onOpenDetails={openDetails}
                            />
                        ))}
                    </section>
                </DndContext>
            </section>

            <Modal
                title="Create Ticket"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                            type="submit"
                            form="ticket-create-form"
                        >
                            Create
                        </button>
                    </>
                )}
            >
                <form
                    id="ticket-create-form"
                    className="grid gap-4"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        const ok = await createTicket({
                            title: form.title,
                            node_name: form.node_name || undefined,
                            priority: form.priority || undefined,
                            description: form.description || undefined,
                            source: 'manual',
                        });
                        if (ok) {
                            setIsCreateOpen(false);
                            setForm({ ...emptyTicket });
                        }
                    }}
                >
                    <Field label="Title" required>
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            required
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        />
                    </Field>
                    <Field label="Node name (optional)">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={form.node_name}
                            onChange={(e) => setForm((p) => ({ ...p, node_name: e.target.value }))}
                        />
                    </Field>
                    <Field label="Priority">
                        <select
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={form.priority}
                            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                        >
                            <option value="P1">P1 (Critical)</option>
                            <option value="P2">P2 (High)</option>
                            <option value="P3">P3 (Medium)</option>
                            <option value="P4">P4 (Low)</option>
                            <option value="P5">P5 (Planning)</option>
                        </select>
                    </Field>
                    <Field label="Description (optional)">
                        <textarea
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all min-h-28"
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        />
                    </Field>
                </form>
            </Modal>

            {isDetailOpen && detailTicket && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-slate-900/70 backdrop-blur-sm" onClick={() => {setIsDetailOpen(false); setDetailTicket(null);}}>
                    <div className="w-full max-w-5xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        
                        {/* Header - Jira style */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    {detailTicket.priority || 'P3'}
                                </span>
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    {detailTicket.ticket_code || `#${detailTicket.id}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                                <button onClick={() => {setIsDetailOpen(false); setDetailTicket(null);}} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Body - Two Column Layout */}
                        <div className="flex flex-col lg:flex-row">
                            {/* Left - Main Content */}
                            <div className="flex-1 p-6 border-r border-slate-200 dark:border-slate-800">
                                {/* Title */}
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                                        {detailTicket.title || 'Untitled Ticket'}
                                    </h2>
                                </div>

                                {/* Status Actions */}
                                {canUpdateTicket && (
                                    <div className="mb-6 flex flex-wrap gap-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 self-center mr-2">Status:</span>
                                        <button onClick={() => updateStatus(detailTicket.id, 'new')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${detailTicket.status === 'new' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>New</button>
                                        <button onClick={() => updateStatus(detailTicket.id, 'acknowledged')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${detailTicket.status === 'acknowledged' ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Acknowledged</button>
                                        <button onClick={() => updateStatus(detailTicket.id, 'in_progress')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${detailTicket.status === 'in_progress' ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>In Progress</button>
                                        <button onClick={() => updateStatus(detailTicket.id, 'resolved')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${detailTicket.status === 'resolved' ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Resolved</button>
                                        <button onClick={() => updateStatus(detailTicket.id, 'closed')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${detailTicket.status === 'closed' ? 'bg-slate-200 border-slate-400 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Closed</button>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Description</h3>
                                    <div className="min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {detailTicket.description || 'No description provided.'}
                                    </div>
                                </div>

                                {/* Activity Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Activity</h3>
                                    <div className="space-y-3">
                                        {isDetailLoading ? (
                                            <div className="text-sm text-slate-500">Loading...</div>
                                        ) : (
                                            <div className="text-sm text-slate-500 dark:text-slate-400">No activities yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right - Sidebar */}
                            <div className="w-full lg:w-80 p-6 bg-slate-50 dark:bg-slate-900/30">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Assignee</div>
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                                                {detailTicket.assignee?.name ? detailTicket.assignee.name.substring(0, 2).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                                {detailTicket.assignee?.name || <span className="text-blue-600 cursor-pointer">Assign...</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Reporter</div>
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                                                {detailTicket.reporter?.name ? detailTicket.reporter.name.substring(0, 2).toUpperCase() : 'ZBX'}
                                            </div>
                                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                                {detailTicket.reporter?.name || detailTicket.source || 'System'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Node</div>
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
                                            {detailTicket.node_name || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Created</div>
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
                                            {detailTicket.created_at ? new Date(detailTicket.created_at).toLocaleString() : '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">SLA Response</div>
                                        <div className={`p-2 rounded-lg border text-sm font-medium ${detailTicket.acknowledged_at ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                                            {detailTicket.acknowledged_at ? 'Acknowledged' : 'Not Acknowledged'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                            <button onClick={() => {setIsDetailOpen(false); setDetailTicket(null);}} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                Close
                            </button>
                            {canUpdateTicket && (
                                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                                    Save Changes
                                </button>
                            )}
                        </div>

                    </div>
</div>
                )}
        </div>
    );
}

function KanbanColumn({ id, title, items, canUpdate, onQuickStatus, onOpenDetails }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <article ref={setNodeRef} className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{items.length}</span>
            </div>
            <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className="mt-3 space-y-3">
                    {items.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            canUpdate={canUpdate}
                            onQuickStatus={onQuickStatus}
                            onOpenDetails={onOpenDetails}
                        />
                    ))}
                </div>
            </SortableContext>
        </article>
    );
}

function TicketCard({ ticket, canUpdate, onQuickStatus, onOpenDetails }) {
    const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({ id: ticket.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const deadline = ticket.acknowledged_at ? ticket.sla_resolution_deadline_at : ticket.sla_response_deadline_at;
    const overdue = deadline && new Date(deadline).getTime() < Date.now();

    return (
        <div ref={setNodeRef} style={style} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div ref={setActivatorNodeRef} className="mb-2 flex items-center justify-between gap-2 cursor-grab select-none" {...attributes} {...listeners}>
                <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', priorityClass[ticket.priority] || priorityClass.P3)}>
                    {ticket.priority}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{ticket.ticket_code}</span>
            </div>

            <h4 className="text-sm text-slate-900 dark:text-slate-100">{ticket.title}</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ticket.description || 'No description provided'}</p>

            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{ticket.node_name || '-'}</span>
                <span className={clsx('font-mono', overdue ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300')}>
                    {formatTimer(deadline)}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <button
                    className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-medium text-white transition-colors shadow-sm"
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetails?.(ticket);
                    }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <label>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                {label}{required ? ' *' : ''}
            </div>
            {children}
        </label>
    );
}
