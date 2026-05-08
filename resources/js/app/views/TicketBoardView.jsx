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

            <Modal
                title={detailTicket ? `Ticket ${detailTicket.ticket_code || ''}`.trim() : 'Ticket Detail'}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setDetailTicket(null);
                }}
                footer={(
                    <>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setIsDetailOpen(false)}
                        >
                            Close
                        </button>
                        {canUpdateTicket && detailTicket?.id ? (
                            <>
                                <button
                                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    type="button"
                                    onClick={() => updateStatus(detailTicket.id, 'acknowledged')}
                                >
                                    Ack
                                </button>
                                <button
                                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    type="button"
                                    onClick={() => updateStatus(detailTicket.id, 'in_progress')}
                                >
                                    Start
                                </button>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                                    type="button"
                                    onClick={() => updateStatus(detailTicket.id, 'resolved')}
                                >
                                    Resolve
                                </button>
                            </>
                        ) : null}
                    </>
                )}
            >
                {!detailTicket ? (
                    <div className="text-sm text-slate-500 dark:text-slate-400">No ticket selected.</div>
                ) : (
                    <div className="grid gap-3">
                        {isDetailLoading ? (
                            <div className="text-sm text-slate-500 dark:text-slate-400">Loading details...</div>
                        ) : null}

                        <div className="grid gap-2 md:grid-cols-2">
                            <DetailRow label="Title" value={detailTicket.title} strong />
                            <DetailRow label="Status" value={detailTicket.status} badge />
                            <DetailRow label="Priority" value={detailTicket.priority} badge />
                            <DetailRow label="Node" value={detailTicket.node_name || detailTicket.node?.name || '-'} />
                            <DetailRow label="Assignee" value={detailTicket.assignee?.name || '-'} />
                            <DetailRow label="Reporter" value={detailTicket.reporter?.name || '-'} />
                            <DetailRow label="Created" value={detailTicket.created_at ? new Date(detailTicket.created_at).toLocaleString() : '-'} />
                            <DetailRow label="Acknowledged" value={detailTicket.acknowledged_at ? new Date(detailTicket.acknowledged_at).toLocaleString() : '-'} />
                            <DetailRow label="Resolved" value={detailTicket.resolved_at ? new Date(detailTicket.resolved_at).toLocaleString() : '-'} />
                            <DetailRow label="Escalated" value={detailTicket.escalated_at ? new Date(detailTicket.escalated_at).toLocaleString() : '-'} />
                        </div>

                        <div>
                            <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Description</div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200" style={{ whiteSpace: 'pre-wrap' }}>
                                {detailTicket.description || 'No description provided.'}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
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
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetails?.(ticket);
                    }}
                >
                    Details
                </button>
                {canUpdate ? (
                    <>
                        {ticket.status !== 'acknowledged' ? (
                            <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => onQuickStatus(ticket.id, 'acknowledged')}>
                                Ack
                            </button>
                        ) : null}
                        {ticket.status !== 'in_progress' ? (
                            <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => onQuickStatus(ticket.id, 'in_progress')}>
                                Start
                            </button>
                        ) : null}
                        {ticket.status !== 'resolved' ? (
                            <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => onQuickStatus(ticket.id, 'resolved')}>
                                Resolve
                            </button>
                        ) : null}
                    </>
                ) : null}
            </div>
        </div>
    );
}

function DetailRow({ label, value, strong, badge }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/40">
            <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
            {badge ? (
                <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                        {value || '-'}
                    </span>
                </div>
            ) : (
                <div className={clsx('mt-2 text-slate-900 dark:text-slate-100', strong && 'text-slate-900 dark:text-slate-100')}>{value || '-'}</div>
            )}
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
