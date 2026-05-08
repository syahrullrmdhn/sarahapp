<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View Dashboard', 'slug' => 'dashboard.view'],
            ['name' => 'View Tickets', 'slug' => 'tickets.view'],
            ['name' => 'Create Tickets', 'slug' => 'tickets.create'],
            ['name' => 'Update Tickets', 'slug' => 'tickets.update'],
            ['name' => 'Assign Tickets', 'slug' => 'tickets.assign'],
            ['name' => 'Close Tickets', 'slug' => 'tickets.close'],
            ['name' => 'Manage Broadcast', 'slug' => 'broadcast.manage'],
            ['name' => 'Manage Infrastructure', 'slug' => 'infrastructure.manage'],
            ['name' => 'Manage Users', 'slug' => 'users.manage'],
            ['name' => 'View Audit Logs', 'slug' => 'audit.view'],
            ['name' => 'Create EOS Updates', 'slug' => 'eos.update.create'],
            ['name' => 'Create Helpdesk Reports', 'slug' => 'helpdesk.report.create'],
            ['name' => 'View Helpdesk Reports', 'slug' => 'helpdesk.report.view'],
            ['name' => 'View Operation Reports', 'slug' => 'reports.view'],
            ['name' => 'View Notification Logs', 'slug' => 'notifications.view'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['slug' => $permission['slug']],
                [
                    'name' => $permission['name'],
                    'description' => $permission['name'],
                ],
            );
        }

        $roles = [
            'super-admin' => [
                'name' => 'Super Admin',
                'permissions' => array_column($permissions, 'slug'),
            ],
            'noc-lead' => [
                'name' => 'NOC Lead',
                'permissions' => [
                    'dashboard.view',
                    'tickets.view',
                    'tickets.create',
                    'tickets.update',
                    'tickets.assign',
                    'tickets.close',
                    'broadcast.manage',
                    'audit.view',
                    'helpdesk.report.view',
                    'reports.view',
                    'notifications.view',
                ],
            ],
            'noc-staff' => [
                'name' => 'NOC Staff',
                'permissions' => [
                    'dashboard.view',
                    'tickets.view',
                    'tickets.create',
                    'tickets.update',
                    'tickets.assign',
                    'helpdesk.report.view',
                    'reports.view',
                ],
            ],
            'eos' => [
                'name' => 'Engineer On Site',
                'permissions' => ['dashboard.view', 'tickets.view', 'tickets.update', 'eos.update.create'],
            ],
            'paragonian' => [
                'name' => 'Paragonian User',
                'permissions' => ['tickets.create', 'tickets.view', 'helpdesk.report.create'],
            ],
        ];

        foreach ($roles as $slug => $data) {
            $role = Role::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $data['name'],
                    'description' => $data['name'],
                ],
            );

            $permissionIds = Permission::query()->whereIn('slug', $data['permissions'])->pluck('id')->all();
            $role->permissions()->sync($permissionIds);
        }

        $users = [
            [
                'name' => 'SARAH Super Admin',
                'email' => 'superadmin@sarah.local',
                'password' => 'S4rahSecure!2026',
                'role' => 'super-admin',
            ],
            [
                'name' => 'NOC Lead',
                'email' => 'noclead@sarah.local',
                'password' => 'N0cLeadSecure!2026',
                'role' => 'noc-lead',
            ],
            [
                'name' => 'NOC Staff',
                'email' => 'nocstaff@sarah.local',
                'password' => 'N0cStaffSecure!2026',
                'role' => 'noc-staff',
            ],
            [
                'name' => 'EOS Team A',
                'email' => 'eos@sarah.local',
                'password' => 'E0SSecure!2026',
                'role' => 'eos',
            ],
        ];

        foreach ($users as $item) {
            $user = User::query()->updateOrCreate(
                ['email' => $item['email']],
                [
                    'name' => $item['name'],
                    'password' => Hash::make($item['password']),
                    'is_active' => true,
                ],
            );

            $roleId = Role::query()->where('slug', $item['role'])->value('id');
            if ($roleId) {
                $user->roles()->syncWithoutDetaching([$roleId]);
            }
        }
    }
}
