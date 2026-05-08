import clsx from 'clsx';
import React from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { columnsOrder, priorityClass, statusLabels } from '../constants';
import { formatTimer } from '../utils';

export default function TicketBoardView({ board, searchQuery, canUpdateTicket, onDragEnd, sensors, updateStatus }) {
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

    return (
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

