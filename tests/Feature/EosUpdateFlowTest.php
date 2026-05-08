<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EosUpdateFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_eos_can_post_field_update_to_ticket(): void
    {
        $this->seed();

        $superAdmin = User::query()->where('email', 'superadmin@sarah.local')->firstOrFail();
        Sanctum::actingAs($superAdmin);
        $ticketResponse = $this->postJson('/api/tickets', [
            'title' => 'Core switch issue',
            'description' => 'Port flapping',
            'node_name' => 'core-switch-1',
            'severity_input' => 'medium',
        ]);
        $ticketId = $ticketResponse->json('id');

        $eos = User::query()->where('email', 'eos@sarah.local')->firstOrFail();
        Sanctum::actingAs($eos);

        $response = $this->postJson("/api/tickets/{$ticketId}/eos-updates", [
            'action_type' => 'onsite',
            'message' => 'Engineer arrived on site and started diagnostics.',
            'status' => 'in_progress',
        ]);

        $response->assertCreated()->assertJsonPath('action_type', 'onsite');
        $this->assertEquals('in_progress', Ticket::query()->findOrFail($ticketId)->status);
    }
}
