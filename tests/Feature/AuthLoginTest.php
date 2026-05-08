<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_receive_token(): void
    {
        $this->seed();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'superadmin@sarah.local',
            'password' => 'S4rahSecure!2026',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'token_type',
                'user' => ['id', 'name', 'email', 'roles', 'permissions'],
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $this->seed();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'superadmin@sarah.local',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }
}
