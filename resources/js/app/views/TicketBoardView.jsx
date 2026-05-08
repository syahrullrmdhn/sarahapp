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
        <div className="grid gap-4">
            <section className="cartel-card">
                <div className="cartel-card-head">
                    <div>
                        <div className="cartel-card-title">Incident Kanban</div>
                        <div className="cartel-card-sub">Drag & drop status. Total open: {totalOpen}.</div>
                    </div>
                    {canCreateTicket ? (
                        <button
                            className="cartel-btn cartel-btn-strong"
                            type="button"
                            onClick={() => {
                                setForm({ ...emptyTicket });
                                setIsCreateOpen(true);
                            }}
                        >
                            Add Ticket
                        </button>
                    ) : null}
                </div>

                <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                    <section className="ticket-board">
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
                        <button className="cartel-btn" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="ticket-create-form">Create</button>
                    </>
                )}
            >
                <form
                    id="ticket-create-form"
                    className="grid gap-3"
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
                    <input className="input" placeholder="Title" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                    <input className="input" placeholder="Node name (optional)" value={form.node_name} onChange={(e) => setForm((p) => ({ ...p, node_name: e.target.value }))} />
                    <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                        <option value="P1">P1 (Critical)</option>
                        <option value="P2">P2 (High)</option>
                        <option value="P3">P3 (Medium)</option>
                        <option value="P4">P4 (Low)</option>
                        <option value="P5">P5 (Planning)</option>
                    </select>
                    <textarea className="input" rows={4} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
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
                        <button className="cartel-btn" type="button" onClick={() => setIsDetailOpen(false)}>
                            Close
                        </button>
                        {canUpdateTicket && detailTicket?.id ? (
                            <>
                                <button className="cartel-btn" type="button" onClick={() => updateStatus(detailTicket.id, 'acknowledged')}>
                                    Ack
                                </button>
                                <button className="cartel-btn" type="button" onClick={() => updateStatus(detailTicket.id, 'in_progress')}>
                                    Start
                                </button>
                                <button className="cartel-btn cartel-btn-strong" type="button" onClick={() => updateStatus(detailTicket.id, 'resolved')}>
                                    Resolve
                                </button>
                            </>
                        ) : null}
                    </>
                )}
            >
                {!detailTicket ? (
                    <div className="text-sm" style={{ color: 'var(--text-sub)' }}>No ticket selected.</div>
                ) : (
                    <div className="grid gap-3">
                        {isDetailLoading ? (
                            <div className="text-sm" style={{ color: 'var(--text-sub)' }}>Loading details...</div>
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
                            <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Description</div>
                            <div className="integration-block" style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>
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
        <article ref={setNodeRef} className="kanban-col">
            <div className="kanban-col-head">
                <h3>{title}</h3>
                <span>{items.length}</span>
            </div>
            <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className="kanban-col-body">
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
        <div ref={setNodeRef} style={style} className="ticket-card">
            <div ref={setActivatorNodeRef} className="ticket-top ticket-drag-handle" {...attributes} {...listeners}>
                <span className={clsx('ticket-priority', priorityClass[ticket.priority] || priorityClass.P3)}>{ticket.priority}</span>
                <span className="ticket-code">{ticket.ticket_code}</span>
            </div>

            <h4>{ticket.title}</h4>
            <p>{ticket.description || 'No description provided'}</p>

            <div className="ticket-meta">
                <span>{ticket.node_name || '-'}</span>
                <span className={clsx('ticket-timer', overdue && 'ticket-timer-overdue')}>{formatTimer(deadline)}</span>
            </div>

            <div className="ticket-actions">
                <button
                    className="btn-chip"
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
                            <button className="btn-chip" type="button" onClick={() => onQuickStatus(ticket.id, 'acknowledged')}>
                                Ack
                            </button>
                        ) : null}
                        {ticket.status !== 'in_progress' ? (
                            <button className="btn-chip" type="button" onClick={() => onQuickStatus(ticket.id, 'in_progress')}>
                                Start
                            </button>
                        ) : null}
                        {ticket.status !== 'resolved' ? (
                            <button className="btn-chip" type="button" onClick={() => onQuickStatus(ticket.id, 'resolved')}>
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
        <div className="integration-block" style={{ marginTop: 0 }}>
            <div className="integration-title">{label}</div>
            {badge ? (
                <span className="cartel-badge">{value || '-'}</span>
            ) : (
                <div className={clsx(strong && 'cartel-table-strong')}>{value || '-'}</div>
            )}
        </div>
    );
}
