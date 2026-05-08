<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelegramWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_telegram_webhook_accepts_valid_payload_without_secret(): void
    {
        $this->seed();

        $response = $this->postJson('/api/integrations/telegram/webhook', [
            'update_id' => '1001',
            'message' => [
                'chat' => ['id' => '77701'],
                'from' => ['username' => 'noc_tester'],
                'text' => '/ack SARAH-UNKNOWN',
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('ok', true);
    }
}
