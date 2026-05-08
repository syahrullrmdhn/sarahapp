<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $users = User::query()
            ->with('roles:id,name,slug')
            ->when($q !== '', function ($builder) use ($q): void {
                $builder->where(function ($inner) use ($q): void {
                    $inner->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->orderBy('name')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return response()->json($users);
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'timezone' => $validated['timezone'] ?? 'Asia/Jakarta',
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        $roleIds = Role::query()->whereIn('slug', $validated['roles'] ?? [])->pluck('id')->all();
        $user->roles()->sync($roleIds);

        return response()->json($user->load('roles:id,name,slug'), 201);
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $payload = [];
        foreach (['name', 'timezone', 'telegram_chat_id'] as $field) {
            if (array_key_exists($field, $validated)) {
                $payload[$field] = $validated[$field];
            }
        }

        if (array_key_exists('email', $validated)) {
            $payload['email'] = strtolower($validated['email']);
        }

        if (array_key_exists('is_active', $validated)) {
            $payload['is_active'] = (bool) $validated['is_active'];
        }

        if (array_key_exists('password', $validated)) {
            $payload['password'] = Hash::make($validated['password']);
        }

        if ($payload !== []) {
            $user->update($payload);
        }

        if (array_key_exists('roles', $validated)) {
            $roleIds = Role::query()->whereIn('slug', $validated['roles'])->pluck('id')->all();
            $user->roles()->sync($roleIds);
        }

        return response()->json($user->fresh()->load('roles:id,name,slug'));
    }
}
