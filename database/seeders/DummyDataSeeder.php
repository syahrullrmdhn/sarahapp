<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\ExternalIntegration;
use App\Models\HelpdeskReport;
use App\Models\Node;
use App\Models\NotificationLog;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketEosUpdate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Extra Users
        $staff1 = User::firstOrCreate(['email' => 'staff1@sarah.local'], [
            'name' => 'John Network',
            'password' => Hash::make('password'),
        ]);
        $staff2 = User::firstOrCreate(['email' => 'staff2@sarah.local'], [
            'name' => 'Jane Security',
            'password' => Hash::make('password'),
        ]);

        // Assign basic roles (Assuming role id 2 is NOC Staff)
        $staff1->roles()->syncWithoutDetaching([2]);
        $staff2->roles()->syncWithoutDetaching([2]);

        $admin = User::first(); // Assuming admin is first

        // 2. Nodes
        $nodes = Node::all();
        if ($nodes->isEmpty()) {
            $this->call(MonitoringSeeder::class);
            $nodes = Node::all();
        }

        // 3. External Integrations
        $integrations = ['zabbix', 'obs', 'grafana'];
        foreach ($integrations as $provider) {
            ExternalIntegration::firstOrCreate(['provider' => $provider], [
                'base_url' => "https://{$provider}.sarah.local/api",
                'api_token' => "dummy_token_{$provider}_" . Str::random(10),
                'is_active' => true,
            ]);
        }

        // 4. Tickets & Activities
        $statuses = ['open', 'acknowledged', 'resolved', 'closed'];
        $priorities = ['P1', 'P2', 'P3', 'P4'];
        
        for ($i = 1; $i <= 10; $i++) {
            $status = $statuses[array_rand($statuses)];
            $priority = $priorities[array_rand($priorities)];
            $node = $nodes->random();

            $ticket = Ticket::firstOrCreate(['ticket_code' => 'INC-' . date('Ym') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT)], [
                'title' => "High latency detected on {$node->name}",
                'description' => "Automated alert: Device {$node->name} is experiencing unusually high latency (> 200ms) for the last 5 minutes. Please investigate network routes.",
                'status' => $status,
                'priority' => $priority,
                'source' => 'zabbix',
                'node_name' => $node->name,
                'assignee_id' => ($status != 'open') ? $staff1->id : null,
            ]);

            // Add some activity
            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'user_id' => $admin->id,
                'action' => 'status_change',
                'meta' => ['description' => 'Ticket created automatically by system'],
            ]);

            if ($status != 'open') {
                TicketActivity::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $staff1->id,
                    'action' => 'status_change',
                    'meta' => ['description' => "Ticket acknowledged by {$staff1->name}"],
                ]);
            }

            // 5. EOS Updates for some tickets
            if ($i % 3 === 0) {
                TicketEosUpdate::create([
                    'ticket_id' => $ticket->id,
                    'eos_user_id' => $staff1->id,
                    'action_type' => 'update',
                    'message' => 'We are currently rerouting traffic to backup links. Latency is stabilizing.',
                ]);
            }
        }

        // 6. Helpdesk Reports
        for ($i = 1; $i <= 5; $i++) {
            HelpdeskReport::firstOrCreate(['title' => "Internet connection dropped in Area {$i}"], [
                'reporter_name' => "Customer {$i}",
                'reporter_contact' => "customer{$i}@example.com",
                'description' => 'Connection has been dropping intermittently since morning.',
                'location' => "Area {$i}",
                'status' => 'new',
            ]);
        }

        // 7. Audit Logs
        AuditLog::create(['user_id' => $admin->id, 'action' => 'login', 'auditable_type' => User::class, 'auditable_id' => $admin->id, 'ip_address' => '127.0.0.1']);
        AuditLog::create(['user_id' => $staff1->id, 'action' => 'ticket_assigned', 'auditable_type' => Ticket::class, 'auditable_id' => 1, 'ip_address' => '10.0.0.15']);
        AuditLog::create(['user_id' => $admin->id, 'action' => 'node_created', 'auditable_type' => Node::class, 'auditable_id' => 1, 'ip_address' => '127.0.0.1']);

        // 8. Notifications
        NotificationLog::create(['channel' => 'telegram', 'event' => 'created', 'message' => 'Ticket INC-202405-0001 created', 'status' => 'sent']);
        NotificationLog::create(['channel' => 'email', 'event' => 'resolved', 'message' => 'Ticket INC-202405-0002 has been resolved', 'status' => 'sent']);
        NotificationLog::create(['channel' => 'in_app', 'event' => 'assigned', 'message' => 'Ticket INC-202405-0003 assigned to John Network', 'status' => 'pending']);
    }
}
