<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_permission_cannot_view_board(): void
    {
        $this->seed();

        $user = User::factory()->create();

        $role = Role::query()->create([
            'name' => 'No Access',
            'slug' => 'no-access',
            'description' => 'No access role',
        ]);

        $user->roles()->sync([$role->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tickets/board');

        $response->assertForbidden();
    }

    public function test_noc_staff_can_create_ticket(): void
    {
        $this->seed();

        $user = User::query()->where('email', 'nocstaff@sarah.local')->firstOrFail();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/tickets', [
            'title' => 'Server cloud down',
            'description' => 'Node cloud-k8s-jkt-01 unreachable',
            'node_name' => 'cloud-k8s-jkt-01',
            'severity_input' => 'critical',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('priority', 'P2');
    }
}
