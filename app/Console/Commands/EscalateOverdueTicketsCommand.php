<?php

namespace App\Console\Commands;

use App\Domain\Tickets\TicketStatus;
use App\Events\TicketUpdated;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Services\NotificationDispatchService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class EscalateOverdueTicketsCommand extends Command
{
    protected $signature = 'sarah:escalate-overdue-tickets';

    protected $description = 'Auto-escalate tickets that breached SLA response target and were not acknowledged';

    public function handle(): int
    {
        $tickets = Ticket::query()
            ->whereIn('status', [TicketStatus::NEW, TicketStatus::ASSIGNED])
            ->whereNull('acknowledged_at')
            ->whereNull('escalated_at')
            ->whereNotNull('sla_response_deadline_at')
            ->where('sla_response_deadline_at', '<', now())
            ->get();

        foreach ($tickets as $ticket) {
            $ticket->update([
                'status' => TicketStatus::ESCALATED,
                'escalated_at' => now(),
            ]);

            TicketActivity::query()->create([
                'ticket_id' => $ticket->id,
                'action' => 'auto_escalated',
                'meta' => [
                    'reason' => 'SLA response breached without acknowledge',
                ],
            ]);

            event(new TicketUpdated($ticket, 'auto_escalated'));

            app(NotificationDispatchService::class)->notifyEscalation($ticket);

            Log::warning('Ticket escalated automatically', [
                'ticket_id' => $ticket->id,
                'ticket_code' => $ticket->ticket_code,
                'priority' => $ticket->priority,
            ]);
        }

        $this->info("Escalated {$tickets->count()} ticket(s).");

        return self::SUCCESS;
    }
}
