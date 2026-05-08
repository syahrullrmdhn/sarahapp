<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_users(): void
    {
        $this->seed();

        $superAdmin = User::query()->where('email', 'superadmin@sarah.local')->firstOrFail();
        Sanctum::actingAs($superAdmin);

        $response = $this->getJson('/api/admin/users');

        $response->assertOk()->assertJsonStructure(['data']);
    }

    public function test_super_admin_can_create_user(): void
    {
        $this->seed();

        $superAdmin = User::query()->where('email', 'superadmin@sarah.local')->firstOrFail();
        Sanctum::actingAs($superAdmin);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'EOS Field 1',
            'email' => 'eos1@sarah.local',
            'password' => 'E0SFieldSecure!2026',
            'roles' => ['eos'],
            'is_active' => true,
        ]);

        $response->assertCreated()->assertJsonPath('email', 'eos1@sarah.local');
    }

    public function test_noc_staff_cannot_access_user_management(): void
    {
        $this->seed();

        $nocStaff = User::query()->where('email', 'nocstaff@sarah.local')->firstOrFail();
        Sanctum::actingAs($nocStaff);

        $response = $this->getJson('/api/admin/users');

        $response->assertForbidden();
    }
}
