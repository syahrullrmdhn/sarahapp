<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OperationsReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_noc_lead_can_view_operations_report(): void
    {
        $this->seed();

        $nocLead = User::query()->where('email', 'noclead@sarah.local')->firstOrFail();
        Sanctum::actingAs($nocLead);

        $response = $this->getJson('/api/reports/operations');

        $response->assertOk()->assertJsonStructure([
            'window',
            'tickets_by_priority',
            'tickets_by_status',
            'helpdesk_channels',
            'eos_actions',
            'daily_ticket_trend',
        ]);
    }
}
