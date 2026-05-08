<?php

namespace App\Services;

use App\Domain\Tickets\PriorityResolver;
use App\Domain\Tickets\TicketPriority;
use App\Domain\Tickets\TicketStatus;
use App\Events\TicketUpdated;
use App\Models\Node;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class TicketService
{
    public function __construct(private readonly PriorityResolver $priorityResolver) {}

    public function createTicket(array $payload, ?User $creator = null): Ticket
    {
        return DB::transaction(function () use ($payload, $creator): Ticket {
            $node = $this->resolveNode($payload);
            $priority = Arr::get($payload, 'priority')
                ?: $this->priorityResolver->fromNodeOrSeverity($node, Arr::get($payload, 'severity_input'));

            $now = CarbonImmutable::now();

            $ticket = Ticket::query()->create([
                'title' => Arr::get($payload, 'title', 'Untitled incident'),
                'description' => Arr::get($payload, 'description'),
                'source' => Arr::get($payload, 'source', 'manual'),
                'external_alert_id' => Arr::get($payload, 'external_alert_id'),
                'node_id' => $node?->id,
                'node_name' => Arr::get($payload, 'node_name') ?? $node?->name,
                'severity_input' => Arr::get($payload, 'severity_input'),
                'priority' => in_array($priority, TicketPriority::all(), true) ? $priority : TicketPriority::P3,
                'status' => TicketStatus::NEW,
                'reporter_id' => Arr::get($payload, 'reporter_id'),
                'assignee_id' => Arr::get($payload, 'assignee_id'),
                'created_by' => $creator?->id,
                'sla_response_deadline_at' => $now->addMinutes(TicketPriority::responseMinutes($priority)),
                'sla_resolution_deadline_at' => $now->addMinutes(TicketPriority::resolutionMinutes($priority)),
            ]);

            TicketActivity::query()->create([
                'ticket_id' => $ticket->id,
                'user_id' => $creator?->id,
                'action' => 'created',
                'meta' => [
                    'source' => $ticket->source,
                    'priority' => $ticket->priority,
                ],
            ]);

            event(new TicketUpdated($ticket, 'created'));

            return $ticket->fresh(['assignee:id,name', 'reporter:id,name', 'node:id,name,criticality_level']) ?? $ticket;
        });
    }

    public function updateStatus(Ticket $ticket, string $status, ?User $actor, ?string $note = null): Ticket
    {
        $now = CarbonImmutable::now();
        $oldStatus = $ticket->status;

        $ticket->status = $status;

        if ($status === TicketStatus::ACKNOWLEDGED && ! $ticket->acknowledged_at) {
            $ticket->acknowledged_at = $now;
        }

        if ($status === TicketStatus::RESOLVED && ! $ticket->resolved_at) {
            $ticket->resolved_at = $now;
        }

        if ($status === TicketStatus::CLOSED && ! $ticket->closed_at) {
            $ticket->closed_at = $now;
        }

        if ($status === TicketStatus::ESCALATED && ! $ticket->escalated_at) {
            $ticket->escalated_at = $now;
        }

        $ticket->save();

        TicketActivity::query()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $actor?->id,
            'action' => 'status_updated',
            'meta' => [
                'from' => $oldStatus,
                'to' => $status,
                'note' => $note,
            ],
        ]);

        event(new TicketUpdated($ticket, 'status_updated'));

        return $ticket->fresh(['assignee:id,name', 'reporter:id,name', 'node:id,name,criticality_level']) ?? $ticket;
    }

    public function assign(Ticket $ticket, int $assigneeId, ?User $actor): Ticket
    {
        $oldAssignee = $ticket->assignee_id;

        $ticket->assignee_id = $assigneeId;
        if ($ticket->status === TicketStatus::NEW) {
            $ticket->status = TicketStatus::ASSIGNED;
        }
        $ticket->save();

        TicketActivity::query()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $actor?->id,
            'action' => 'assigned',
            'meta' => [
                'from' => $oldAssignee,
                'to' => $assigneeId,
            ],
        ]);

        event(new TicketUpdated($ticket, 'assigned'));

        return $ticket->fresh(['assignee:id,name', 'reporter:id,name', 'node:id,name,criticality_level']) ?? $ticket;
    }

    private function resolveNode(array $payload): ?Node
    {
        $nodeName = trim((string) Arr::get($payload, 'node_name'));

        if ($nodeName === '') {
            return null;
        }

        return Node::query()->firstOrCreate(
            ['name' => $nodeName],
            [
                'criticality_level' => 3,
                'location' => Arr::get($payload, 'location'),
                'type' => Arr::get($payload, 'node_type'),
            ],
        );
    }
}
