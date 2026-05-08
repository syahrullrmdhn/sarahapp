<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Ticket $ticket, public string $action) {}

    public function broadcastOn(): array
    {
        return [new Channel('tickets')];
    }

    public function broadcastAs(): string
    {
        return 'ticket.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->ticket->id,
            'ticket_code' => $this->ticket->ticket_code,
            'status' => $this->ticket->status,
            'priority' => $this->ticket->priority,
            'action' => $this->action,
            'updated_at' => $this->ticket->updated_at,
        ];
    }
}
