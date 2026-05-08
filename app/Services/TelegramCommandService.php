<?php

namespace App\Services;

use App\Domain\Tickets\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class TelegramCommandService
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function handleCommand(string $text, ?User $actor = null): array
    {
        $parts = preg_split('/\s+/', trim($text)) ?: [];
        $command = strtolower($parts[0] ?? '');
        $ticketCode = $parts[1] ?? null;

        if (! in_array($command, ['/ack', '/resolve', '/close'], true) || ! $ticketCode) {
            return [
                'handled' => false,
                'message' => 'Unknown command. Use /ack SARAH-xxxx, /resolve SARAH-xxxx, or /close SARAH-xxxx',
            ];
        }

        $ticket = Ticket::query()->where('ticket_code', $ticketCode)->first();

        if (! $ticket) {
            return [
                'handled' => true,
                'message' => 'Ticket not found: '.$ticketCode,
            ];
        }

        $nextStatus = match ($command) {
            '/ack' => TicketStatus::ACKNOWLEDGED,
            '/resolve' => TicketStatus::RESOLVED,
            '/close' => TicketStatus::CLOSED,
        };

        $this->ticketService->updateStatus($ticket, $nextStatus, $actor, 'Updated via Telegram command');

        return [
            'handled' => true,
            'message' => sprintf('Ticket %s updated to %s', $ticket->ticket_code, $nextStatus),
        ];
    }
}
