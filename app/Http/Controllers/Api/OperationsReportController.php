<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HelpdeskReport;
use App\Models\Ticket;
use App\Models\TicketEosUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OperationsReportController extends Controller
{
    public function summary(): JsonResponse
    {
        $since = now()->subDays(7);

        $ticketsByPriority = Ticket::query()
            ->select('priority', DB::raw('count(*) as total'))
            ->where('created_at', '>=', $since)
            ->groupBy('priority')
            ->pluck('total', 'priority');

        $ticketsByStatus = Ticket::query()
            ->select('status', DB::raw('count(*) as total'))
            ->where('created_at', '>=', $since)
            ->groupBy('status')
            ->pluck('total', 'status');

        $helpdeskChannels = HelpdeskReport::query()
            ->select('channel', DB::raw('count(*) as total'))
            ->where('reported_at', '>=', $since)
            ->groupBy('channel')
            ->pluck('total', 'channel');

        $dailyTicketTrend = Ticket::query()
            ->selectRaw('date(created_at) as day, count(*) as total')
            ->where('created_at', '>=', $since)
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $eosActions = TicketEosUpdate::query()
            ->select('action_type', DB::raw('count(*) as total'))
            ->where('created_at', '>=', $since)
            ->groupBy('action_type')
            ->pluck('total', 'action_type');

        return response()->json([
            'window' => 'last_7_days',
            'tickets_by_priority' => $ticketsByPriority,
            'tickets_by_status' => $ticketsByStatus,
            'helpdesk_channels' => $helpdeskChannels,
            'eos_actions' => $eosActions,
            'daily_ticket_trend' => $dailyTicketTrend,
        ]);
    }
}
