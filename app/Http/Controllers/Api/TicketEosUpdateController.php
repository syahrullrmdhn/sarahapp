<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EosUpdateStoreRequest;
use App\Models\Ticket;
use App\Models\TicketEosUpdate;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketEosUpdateController extends Controller
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function index(Request $request, Ticket $ticket): JsonResponse
    {
        $updates = TicketEosUpdate::query()
            ->where('ticket_id', $ticket->id)
            ->with('eosUser:id,name,email')
            ->latest('created_at')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return response()->json($updates);
    }

    public function store(EosUpdateStoreRequest $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validated();

        $update = TicketEosUpdate::query()->create([
            'ticket_id' => $ticket->id,
            'eos_user_id' => $request->user()?->id,
            'action_type' => $validated['action_type'] ?? 'update',
            'message' => $validated['message'],
            'attachment_url' => $validated['attachment_url'] ?? null,
        ]);

        if (! empty($validated['status'])) {
            $this->ticketService->updateStatus(
                $ticket,
                $validated['status'],
                $request->user(),
                'Status updated from EOS action',
            );
        }

        return response()->json($update->load('eosUser:id,name,email'), 201);
    }
}
