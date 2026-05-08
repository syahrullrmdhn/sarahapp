<?php

namespace Database\Seeders;

use App\Models\Node;
use App\Models\WebhookSource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MonitoringSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            ['name' => 'Zabbix', 'slug' => 'zabbix'],
            ['name' => 'Grafana', 'slug' => 'grafana'],
            ['name' => 'Observium', 'slug' => 'observium'],
        ];

        foreach ($sources as $source) {
            WebhookSource::query()->updateOrCreate(
                ['slug' => $source['slug']],
                [
                    'name' => $source['name'],
                    'shared_secret' => hash('sha256', 'sarah-'.$source['slug'].'-'.Str::random(32)),
                    'is_active' => true,
                ],
            );
        }

        $nodes = [
            ['name' => 'core-router-jkt-01', 'location' => 'Jakarta', 'type' => 'network-core', 'criticality_level' => 5],
            ['name' => 'cloud-k8s-jkt-01', 'location' => 'Jakarta', 'type' => 'kubernetes', 'criticality_level' => 4],
            ['name' => 'edge-cache-bdg-01', 'location' => 'Bandung', 'type' => 'edge-cache', 'criticality_level' => 3],
        ];

        foreach ($nodes as $node) {
            Node::query()->updateOrCreate(
                ['name' => $node['name']],
                $node,
            );
        }
    }
}
