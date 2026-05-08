<?php

namespace Tests\Feature;

use App\Models\WebhookSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookIngestTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_signature_can_create_ticket_from_webhook(): void
    {
        $this->seed();

        $source = WebhookSource::query()->where('slug', 'zabbix')->firstOrFail();
        $payload = [
            'title' => 'Core router down',
            'message' => 'Interface uplink is down',
            'node' => 'core-router-jkt-01',
            'severity' => 'critical',
            'event_id' => 'evt-123',
        ];

        $raw = json_encode($payload);
        $signature = hash_hmac('sha256', $raw, $source->shared_secret);

        $response = $this->withHeaders([
            'X-SARAH-Signature' => $signature,
        ])->postJson('/api/webhooks/zabbix', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Webhook accepted');
    }

    public function test_invalid_signature_is_rejected(): void
    {
        $this->seed();

        $response = $this->withHeaders([
            'X-SARAH-Signature' => 'invalid-signature',
        ])->postJson('/api/webhooks/zabbix', [
            'title' => 'Anything',
        ]);

        $response->assertStatus(401);
    }
}
