<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $openQuery = Ticket::query()->whereNotIn('status', ['closed']);

        return response()->json([
            'open_tickets' => (clone $openQuery)->count(),
            'p1_open' => (clone $openQuery)->where('priority', 'P1')->count(),
            'sla_response_breached' => (clone $openQuery)
                ->whereNull('acknowledged_at')
                ->where('sla_response_deadline_at', '<', now())
                ->count(),
            'sla_resolution_breached' => (clone $openQuery)
                ->whereNull('resolved_at')
                ->where('sla_resolution_deadline_at', '<', now())
                ->count(),
            'closed_today' => Ticket::query()
                ->whereDate('closed_at', now()->toDateString())
                ->count(),
        ]);
    }
}
