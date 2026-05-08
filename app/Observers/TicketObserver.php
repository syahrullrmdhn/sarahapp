<?php

namespace App\Observers;

use App\Models\Ticket;
use App\Services\AuditLogger;

class TicketObserver
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function created(Ticket $ticket): void
    {
        $this->auditLogger->log($ticket, 'created', [], $ticket->getAttributes());
    }

    public function updated(Ticket $ticket): void
    {
        $this->auditLogger->log(
            $ticket,
            'updated',
            $ticket->getOriginal(),
            $ticket->getAttributes(),
        );
    }
}
