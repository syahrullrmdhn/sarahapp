<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\UserInvitation;

class UserManagementController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

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

        $roleIds = Role::query()
            ->whereIn('slug', $validated['roles'] ?? [])
            ->pluck('id')
            ->all();
        $user->roles()->sync($roleIds);

        $this->auditLogger->log($user, 'created', [], [
            'name' => $user->name,
            'email' => $user->email,
            'timezone' => $user->timezone,
            'is_active' => $user->is_active,
            'roles' => $validated['roles'] ?? [],
        ]);

        return response()->json($user->load('roles:id,name,slug'), 201);
    }

    public function invite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'timezone' => 'nullable|string',
            'telegram_chat_id' => 'nullable|string',
            'is_active' => 'boolean',
            'roles' => 'array',
            'roles.*' => 'string',
        ]);

        $invitationToken = Str::random(64);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make(Str::random(32)), // Temporary password
            'timezone' => $validated['timezone'] ?? 'Asia/Jakarta',
            'telegram_chat_id' => $validated['telegram_chat_id'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'invitation_token' => $invitationToken,
            'invitation_expires_at' => now()->addHours(48),
        ]);

        $roleIds = Role::query()->whereIn('slug', $validated['roles'] ?? [])->pluck('id')->all();
        $user->roles()->sync($roleIds);

        Mail::to($user->email)->send(new UserInvitation($user, $invitationToken));

        $this->auditLogger->log($user, 'invited', [], [
            'name' => $user->name,
            'email' => $user->email,
            'timezone' => $user->timezone,
            'is_active' => $user->is_active,
            'roles' => $validated['roles'] ?? [],
        ]);

        return response()->json($user->load('roles:id,name,slug'), 201);
    }

    public function resendInvitation(Request $request, User $user): JsonResponse
    {
        if (!$user->invitation_token || $user->invitation_expires_at->isPast()) {
            return response()->json(['message' => 'Invalid or expired invitation'], 422);
        }

        Mail::to($user->email)->send(new UserInvitation($user, $user->invitation_token));

        return response()->json(['message' => 'Invitation resent successfully']);
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();
        $old = $user->only(['name', 'email', 'timezone', 'telegram_chat_id', 'is_active']);

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

        $fresh = $user->fresh()->load('roles:id,name,slug');
        $new = $fresh->only(['name', 'email', 'timezone', 'telegram_chat_id', 'is_active']);
        $new['roles'] = $fresh->roles->pluck('slug')->all();

        $this->auditLogger->log($fresh, 'updated', $old, $new);

        return response()->json($fresh);
    }
}
