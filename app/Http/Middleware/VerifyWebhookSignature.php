<?php

namespace App\Http\Middleware;

use App\Models\WebhookSource;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $sourceSlug = (string) $request->route('source');
        $signature = (string) $request->header('X-SARAH-Signature');

        $source = WebhookSource::query()
            ->where('slug', $sourceSlug)
            ->where('is_active', true)
            ->first();

        if (! $source) {
            return new JsonResponse(['message' => 'Unknown webhook source'], 404);
        }

        $expected = hash_hmac('sha256', $request->getContent(), $source->shared_secret);

        if (! hash_equals($expected, $signature)) {
            return new JsonResponse(['message' => 'Invalid webhook signature'], 401);
        }

        $request->attributes->set('webhook_source', $source);

        return $next($request);
    }
}
