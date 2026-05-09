<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $openTickets = 0;
        $responseCompliance = 98;
        $helpdeskCount = 0;
        $boardCounts = [
            'total' => 0,
            'new' => 0,
            'acknowledged' => 0,
            'escalated' => 0,
            'closed' => 0,
        ];
        $integrations = [
            'webhook_sources_count' => 0,
            'telegram' => null,
        ];

        return view('admin.dashboard', compact(
            'openTickets',
            'responseCompliance',
            'helpdeskCount',
            'boardCounts',
            'integrations',
        ));
    }
}
