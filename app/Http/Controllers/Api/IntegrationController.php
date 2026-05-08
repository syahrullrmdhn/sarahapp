<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookSource;
use Illuminate\Http\JsonResponse;

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
}
