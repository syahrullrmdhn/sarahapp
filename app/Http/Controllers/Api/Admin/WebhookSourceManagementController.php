<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\WebhookSourceStoreRequest;
use App\Http\Requests\WebhookSourceUpdateRequest;
use App\Models\WebhookSource;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebhookSourceManagementController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $sources = WebhookSource::query()
            ->when($q !== '', function ($builder) use ($q): void {
                $builder->where(function ($inner) use ($q): void {
                    $inner->where('name', 'like', "%{$q}%")
                        ->orWhere('slug', 'like', "%{$q}%");
                });
            })
            ->orderBy('name')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        // Never leak shared_secret in list responses.
        $sources->getCollection()->transform(function (WebhookSource $source) {
            return $source->only(['id', 'name', 'slug', 'is_active', 'created_at', 'updated_at']);
        });

        return response()->json($sources);
    }

    public function store(WebhookSourceStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $secret = (string) ($validated['shared_secret'] ?? '');

        if ($secret === '') {
            // URL-safe secret; used for HMAC SHA256 signature verification.
            $secret = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        }

        $source = WebhookSource::query()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'shared_secret' => $secret,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        $this->auditLogger->log(
            $source,
            'created',
            [],
            [
                'name' => $source->name,
                'slug' => $source->slug,
                'is_active' => $source->is_active,
                'shared_secret' => '[redacted]',
            ],
        );

        // Return secret ONCE for operator to copy. Do not store it in client state beyond that.
        return response()->json([
            'source' => $source->only(['id', 'name', 'slug', 'is_active', 'created_at', 'updated_at']),
            'shared_secret' => $secret,
        ], 201);
    }

    public function update(WebhookSourceUpdateRequest $request, WebhookSource $source): JsonResponse
    {
        $validated = $request->validated();

        $old = $source->only(['name', 'slug', 'is_active']);

        $source->update($validated);

        $fresh = $source->fresh();
        $new = $fresh->only(['name', 'slug', 'is_active']);

        $this->auditLogger->log($fresh, 'updated', $old, $new);

        return response()->json($fresh->only(['id', 'name', 'slug', 'is_active', 'created_at', 'updated_at']));
    }

    public function rotateSecret(WebhookSource $source): JsonResponse
    {
        $secret = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');

        $source->update(['shared_secret' => $secret]);

        $this->auditLogger->log(
            $source,
            'secret_rotated',
            [],
            [
                'shared_secret' => '[redacted]',
            ],
        );

        return response()->json([
            'source' => $source->fresh()->only(['id', 'name', 'slug', 'is_active', 'created_at', 'updated_at']),
            'shared_secret' => $secret,
        ]);
    }
}

