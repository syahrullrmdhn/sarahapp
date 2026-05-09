<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExternalIntegration;
use App\Models\WebhookSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function index(): JsonResponse
    {
        $sources = WebhookSource::query()
            ->orderBy('name')
            ->get(['name', 'slug', 'is_active', 'created_at']);

        return response()->json([
            'webhook_sources' => $sources,
            'telegram' => [
                'webhook_url' => url('/api/integrations/telegram/webhook'),
                'secret_header' => 'X-Telegram-Bot-Api-Secret-Token',
            ],
        ]);
    }

    public function externalIntegrations(): JsonResponse
    {
        $integrations = ExternalIntegration::all();
        
        // Don't send the raw token to the frontend if it's already set, 
        // just send a placeholder or boolean indicating it exists.
        $mapped = $integrations->map(function ($integration) {
            return [
                'provider' => $integration->provider,
                'base_url' => $integration->base_url,
                'has_token' => !empty($integration->api_token),
                'is_active' => $integration->is_active,
            ];
        });

        return response()->json([
            'data' => $mapped,
        ]);
    }

    public function updateExternalIntegration(Request $request, string $provider): JsonResponse
    {
        $validated = $request->validate([
            'base_url' => 'nullable|url',
            'api_token' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $integration = ExternalIntegration::firstOrNew(['provider' => $provider]);
        
        if (array_key_exists('base_url', $validated)) {
            $integration->base_url = $validated['base_url'];
        }
        
        if (!empty($validated['api_token'])) {
            // Only update token if it's provided (not empty). 
            // If they want to clear it, they can pass an empty string, but usually we just update if provided.
            $integration->api_token = $validated['api_token'];
        }

        if (array_key_exists('is_active', $validated)) {
            $integration->is_active = $validated['is_active'];
        }

        $integration->save();

        return response()->json([
            'message' => 'Integration updated successfully',
            'data' => [
                'provider' => $integration->provider,
                'base_url' => $integration->base_url,
                'has_token' => !empty($integration->api_token),
                'is_active' => $integration->is_active,
            ]
        ]);
    }
}
