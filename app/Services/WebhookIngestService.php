<?php

namespace App\Services;

use App\Models\IncomingWebhookLog;
use App\Models\Ticket;
use App\Models\WebhookSource;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class WebhookIngestService
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function ingest(Request $request, WebhookSource $source): Ticket
    {
        $payload = $request->json()->all() ?: $request->all();

        $title = Arr::get($payload, 'title')
            ?? Arr::get($payload, 'alert_title')
            ?? Arr::get($payload, 'message')
            ?? sprintf('[%s] Alert incoming', strtoupper($source->slug));

        $ticket = $this->ticketService->createTicket([
            'title' => $title,
            'description' => Arr::get($payload, 'description') ?? Arr::get($payload, 'message'),
            'source' => $source->slug,
            'external_alert_id' => (string) (Arr::get($payload, 'event_id') ?? Arr::get($payload, 'id') ?? ''),
            'node_name' => Arr::get($payload, 'node') ?? Arr::get($payload, 'host') ?? Arr::get($payload, 'instance'),
            'severity_input' => Arr::get($payload, 'severity') ?? Arr::get($payload, 'status'),
        ]);

        IncomingWebhookLog::query()->create([
            'source' => $source->slug,
            'signature' => (string) $request->header('X-SARAH-Signature'),
            'ip_address' => $request->ip(),
            'payload' => $payload,
            'http_status' => 201,
            'message' => 'accepted',
        ]);

        return $ticket;
    }
}
