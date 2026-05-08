<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HelpdeskReportStoreRequest;
use App\Models\HelpdeskReport;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HelpdeskReportController extends Controller
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function index(Request $request): JsonResponse
    {
        $reports = HelpdeskReport::query()
            ->with('ticket:id,ticket_code,status,priority')
            ->latest('reported_at')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return response()->json($reports);
    }

    public function store(HelpdeskReportStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $ticket = $this->ticketService->createTicket([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'source' => 'helpdesk',
            'node_name' => $validated['node_name'] ?? null,
            'severity_input' => $validated['severity_input'] ?? ($validated['impact_level'] ?? null),
            'reporter_id' => $request->user()?->id,
        ], $request->user());

        $report = HelpdeskReport::query()->create([
            'reporter_name' => $validated['reporter_name'],
            'reporter_contact' => $validated['reporter_contact'] ?? null,
            'channel' => $validated['channel'] ?? 'web',
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $validated['location'] ?? null,
            'impact_level' => $validated['impact_level'] ?? null,
            'ticket_id' => $ticket->id,
            'status' => 'converted',
        ]);

        return response()->json([
            'message' => 'Incident report accepted',
            'report_id' => $report->id,
            'ticket_code' => $ticket->ticket_code,
            'ticket_id' => $ticket->id,
        ], 201);
    }
}
