<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\Ticket;
use App\Models\User;

class NotificationDispatchService
{
    public function log(string $channel, ?string $target, Ticket $ticket, string $event, string $message, array $meta = []): NotificationLog
    {
        return NotificationLog::query()->create([
            'channel' => $channel,
            'target' => $target,
            'ticket_id' => $ticket->id,
            'event' => $event,
            'message' => $message,
            'status' => 'sent',
            'meta' => $meta,
            'sent_at' => now(),
        ]);
    }

    public function notifyEscalation(Ticket $ticket): void
    {
        $message = sprintf('[ESCALATION] %s (%s) membutuhkan respon lead.', $ticket->ticket_code, $ticket->priority);

        $nocLeads = User::query()->whereHas('roles', fn ($query) => $query->where('slug', 'noc-lead'))->get();
        foreach ($nocLeads as $lead) {
            $this->log('telegram', $lead->telegram_chat_id, $ticket, 'escalated', $message, [
                'target_user_id' => $lead->id,
                'target_role' => 'noc-lead',
            ]);
        }

        if ($ticket->assignee) {
            $this->log('telegram', $ticket->assignee->telegram_chat_id, $ticket, 'escalated', $message, [
                'target_user_id' => $ticket->assignee->id,
                'target_role' => 'assignee',
            ]);
        }
    }
}
