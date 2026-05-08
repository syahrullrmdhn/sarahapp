<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = NotificationLog::query()
            ->with('ticket:id,ticket_code,status,priority')
            ->latest('created_at')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return response()->json($logs);
    }
}
