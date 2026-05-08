<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WebhookIngestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function __construct(private readonly WebhookIngestService $webhookIngestService) {}

    public function ingest(Request $request): JsonResponse
    {
        $source = $request->attributes->get('webhook_source');
        $ticket = $this->webhookIngestService->ingest($request, $source);

        return response()->json([
            'message' => 'Webhook accepted',
            'ticket_code' => $ticket->ticket_code,
            'ticket_id' => $ticket->id,
        ], 201);
    }
}
