<?php

namespace Tests\Feature;

use App\Models\HelpdeskReport;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HelpdeskFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_helpdesk_report_creates_ticket(): void
    {
        $this->seed();

        $response = $this->postJson('/api/helpdesk/reports', [
            'reporter_name' => 'Paragonian A',
            'reporter_contact' => '0812345678',
            'channel' => 'whatsapp',
            'title' => 'Internet branch down',
            'description' => 'Tidak bisa akses internet sejak pagi',
            'location' => 'Branch A',
            'impact_level' => 'high',
            'node_name' => 'branch-a-router',
            'severity_input' => 'high',
        ]);

        $response->assertCreated()->assertJsonStructure(['report_id', 'ticket_code', 'ticket_id']);

        $this->assertEquals(1, HelpdeskReport::query()->count());
        $this->assertEquals(1, Ticket::query()->where('source', 'helpdesk')->count());
    }
}
