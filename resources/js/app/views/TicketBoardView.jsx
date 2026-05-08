import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { columnsOrder, priorityClass, statusLabels } from '../constants';
import { formatTimer } from '../utils';
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
        </div>
    );
}

function KanbanColumn({ id, title, items, canUpdate, onQuickStatus }) {
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
                        <TicketCard key={ticket.id} ticket={ticket} canUpdate={canUpdate} onQuickStatus={onQuickStatus} />
                    ))}
                </div>
            </SortableContext>
        </article>
    );
}

function TicketCard({ ticket, canUpdate, onQuickStatus }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ticket.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const deadline = ticket.acknowledged_at ? ticket.sla_resolution_deadline_at : ticket.sla_response_deadline_at;
    const overdue = deadline && new Date(deadline).getTime() < Date.now();

    return (
        <div ref={setNodeRef} style={style} className="ticket-card" {...attributes} {...listeners}>
            <div className="ticket-top">
                <span className={clsx('ticket-priority', priorityClass[ticket.priority] || priorityClass.P3)}>{ticket.priority}</span>
                <span className="ticket-code">{ticket.ticket_code}</span>
            </div>

            <h4>{ticket.title}</h4>
            <p>{ticket.description || 'No description provided'}</p>

            <div className="ticket-meta">
                <span>{ticket.node_name || '-'}</span>
                <span className={clsx('ticket-timer', overdue && 'ticket-timer-overdue')}>{formatTimer(deadline)}</span>
            </div>

            {canUpdate ? (
                <div className="ticket-actions">
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
                </div>
            ) : null}
        </div>
    );
}
