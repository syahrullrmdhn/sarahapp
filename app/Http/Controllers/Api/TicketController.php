<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TicketAssignRequest;
use App\Http\Requests\TicketStatusUpdateRequest;
use App\Http\Requests\TicketStoreRequest;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 30), 1), 100);

        $query = Ticket::query()
            ->with(['assignee:id,name', 'reporter:id,name', 'node:id,name,criticality_level'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority')->toString());
        }

        if ($request->filled('q')) {
            $search = $request->string('q')->toString();
            $query->where(function ($inner) use ($search): void {
                $inner->where('ticket_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('node_name', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function board(): JsonResponse
    {
        $tickets = Ticket::query()
            ->with(['assignee:id,name'])
            ->orderByRaw("CASE priority WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 WHEN 'P3' THEN 3 WHEN 'P4' THEN 4 ELSE 5 END")
            ->latest('created_at')
            ->limit(200)
            ->get();

        return response()->json([
            'columns' => [
                'new' => $tickets->where('status', 'new')->values(),
                'acknowledged' => $tickets->where('status', 'acknowledged')->values(),
                'in_progress' => $tickets->where('status', 'in_progress')->values(),
                'resolved' => $tickets->where('status', 'resolved')->values(),
                'closed' => $tickets->where('status', 'closed')->values(),
                'escalated' => $tickets->where('status', 'escalated')->values(),
            ],
            'meta' => [
                'total_open' => $tickets->whereNotIn('status', ['closed'])->count(),
                'breached_response' => $tickets
                    ->whereNull('acknowledged_at')
                    ->where('sla_response_deadline_at', '<', now())
                    ->count(),
                'breached_resolution' => $tickets
                    ->whereNull('resolved_at')
                    ->where('sla_resolution_deadline_at', '<', now())
                    ->count(),
            ],
        ]);
    }

    public function store(TicketStoreRequest $request): JsonResponse
    {
        $ticket = $this->ticketService->createTicket($request->validated(), $request->user());

        return response()->json($ticket, 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load(['assignee:id,name,email', 'reporter:id,name,email', 'node:id,name,criticality_level', 'activities.user:id,name']);

        return response()->json($ticket);
    }

    public function updateStatus(TicketStatusUpdateRequest $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->updateStatus(
            $ticket,
            $request->validated('status'),
            $request->user(),
            $request->validated('note'),
        );

        return response()->json($ticket);
    }

    public function assign(TicketAssignRequest $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->assign(
            $ticket,
            (int) $request->validated('assignee_id'),
            $request->user(),
        );

        return response()->json($ticket);
    }
}
