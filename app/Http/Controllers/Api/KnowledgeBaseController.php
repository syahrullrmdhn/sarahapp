<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeBase;
use App\Models\Role;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class KnowledgeBaseController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): JsonResponse
    {
        $query = KnowledgeBase::query()->published();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $articles = $query->with(['creator:id,name', 'updater:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(min(max((int) $request->query('per_page', 15), 1), 100));

        return response()->json([
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = [
            'network' => 'Jaringan',
            'server' => 'Server',
            'application' => 'Aplikasi',
            'security' => 'Keamanan',
            'monitoring' => 'Monitoring',
            'troubleshooting' => 'Troubleshooting',
            'general' => 'Umum',
        ];

        return response()->json(['data' => $categories]);
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $articles = KnowledgeBase::query()
            ->published()
            ->search($validated['query'])
            ->with(['creator:id,name', 'updater:id,name'])
            ->orderBy('usage_count', 'desc')
            ->orderBy('rating', 'desc')
            ->limit(10)
            ->get();

        foreach ($articles as $article) {
            $article->incrementUsage();
        }

        return response()->json(['data' => $articles]);
    }

    public function show(string $id): JsonResponse
    {
        $article = KnowledgeBase::query()
            ->published()
            ->with(['creator:id,name', 'updater:id,name'])
            ->findOrFail($id);

        $article->incrementView();

        return response()->json(['data' => $article]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string|max:500',
            'content' => 'required|string',
            'category' => 'required|string|in:network,server,application,security,monitoring,troubleshooting,general',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_published' => 'boolean',
        ]);

        $article = KnowledgeBase::create([
            ...$validated,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        $this->auditLogger->log($article, 'created', [], [
            'title' => $article->title,
            'category' => $article->category,
            'is_published' => $article->is_published,
        ]);

        return response()->json(['data' => $article->load('creator:id,name', 'updater:id,name')], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $article = KnowledgeBase::query()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'summary' => 'sometimes|required|string|max:500',
            'content' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|in:network,server,application,security,monitoring,troubleshooting,general',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_published' => 'boolean',
            'rating' => 'nullable|numeric|min:1|max:5',
        ]);

        $article->update([
            ...$validated,
            'updated_by' => Auth::id(),
        ]);

        return response()->json(['data' => $article->load('creator:id,name', 'updater:id,name')]);
    }

    public function destroy(string $id): JsonResponse
    {
        $article = KnowledgeBase::query()->findOrFail($id);
        $article->delete();

        return response()->json(['message' => 'Article deleted successfully']);
    }
}