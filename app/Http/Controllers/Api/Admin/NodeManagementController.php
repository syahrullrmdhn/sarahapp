<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\NodeStoreRequest;
use App\Http\Requests\NodeUpdateRequest;
use App\Models\Node;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NodeManagementController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $nodes = Node::query()
            ->when($q !== '', function ($builder) use ($q): void {
                $builder->where(function ($inner) use ($q): void {
                    $inner->where('name', 'like', "%{$q}%")
                        ->orWhere('location', 'like', "%{$q}%")
                        ->orWhere('type', 'like', "%{$q}%");
                });
            })
            ->orderBy('criticality_level')
            ->orderBy('name')
            ->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return response()->json($nodes);
    }

    public function store(NodeStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $node = Node::query()->create([
            'name' => $validated['name'],
            'location' => $validated['location'] ?? null,
            'type' => $validated['type'] ?? null,
            'criticality_level' => (int) ($validated['criticality_level'] ?? 3),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        $this->auditLogger->log($node, 'created', [], $node->only(['name', 'location', 'type', 'criticality_level', 'is_active']));

        return response()->json($node, 201);
    }

    public function update(NodeUpdateRequest $request, Node $node): JsonResponse
    {
        $validated = $request->validated();

        $old = $node->only(['name', 'location', 'type', 'criticality_level', 'is_active']);

        $node->update($validated);

        $fresh = $node->fresh();
        $new = $fresh->only(['name', 'location', 'type', 'criticality_level', 'is_active']);

        $this->auditLogger->log($fresh, 'updated', $old, $new);

        return response()->json($fresh);
    }
}

