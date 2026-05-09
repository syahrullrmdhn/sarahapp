<?php

namespace App\Console\Commands;

use App\Models\ExternalIntegration;
use App\Models\Node;
use App\Models\Ticket;
use App\Models\TicketActivity;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchZabbixAlerts extends Command
{
    protected $signature = 'sarah:fetch-zabbix';
    protected $description = 'Fetch active problems from Zabbix and create tickets in SARAH';

    public function handle()
    {
        $integration = ExternalIntegration::where('provider', 'zabbix')->where('is_active', true)->first();

        if (!$integration || !$integration->base_url) {
            $this->info('Zabbix integration is not active or missing base URL.');
            return;
        }

        $this->info('Fetching Zabbix alerts...');

        try {
            // For a real implementation, we would call the Zabbix API.
            // Example:
            // $response = Http::withToken($integration->api_token)->post($integration->base_url, [
            //     'jsonrpc' => '2.0',
            //     'method' => 'problem.get',
            //     'params' => ['recent' => true],
            //     'id' => 1
            // ]);
            
            // Simulating a dummy payload for demonstration
            $dummyAlerts = [
                [
                    'eventid' => '999' . rand(100, 999),
                    'name' => 'High CPU Utilization (> 90%)',
                    'host' => 'core-router-jkt-01',
                    'severity' => 'High',
                ]
            ];

            foreach ($dummyAlerts as $alert) {
                // Check if ticket already exists
                $exists = Ticket::where('external_alert_id', 'ZBX-' . $alert['eventid'])->exists();
                
                if (!$exists) {
                    $node = Node::where('name', $alert['host'])->first();
                    
                    $ticket = Ticket::create([
                        'ticket_code' => 'INC-' . date('Ym') . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                        'title' => $alert['name'] . ' on ' . $alert['host'],
                        'description' => "Automated alert from Zabbix. Event ID: " . $alert['eventid'],
                        'status' => 'new',
                        'priority' => 'P2',
                        'source' => 'zabbix',
                        'external_alert_id' => 'ZBX-' . $alert['eventid'],
                        'node_name' => $alert['host'],
                        'node_id' => $node ? $node->id : null,
                    ]);

                    TicketActivity::create([
                        'ticket_id' => $ticket->id,
                        'action' => 'status_change',
                        'meta' => ['description' => 'Ticket created via Zabbix Polling Job'],
                    ]);

                    $this->info("Created ticket {$ticket->ticket_code} for Zabbix Event {$alert['eventid']}");
                }
            }

            $this->info('Zabbix fetch completed.');

        } catch (\Exception $e) {
            Log::error('Zabbix Fetch Error: ' . $e->getMessage());
            $this->error('Failed to fetch from Zabbix: ' . $e->getMessage());
        }
    }
}
