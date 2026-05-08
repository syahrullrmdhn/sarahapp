<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelegramUpdate;
use App\Models\User;
use App\Services\TelegramCommandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function __construct(private readonly TelegramCommandService $telegramCommandService) {}

    public function handle(Request $request): JsonResponse
    {
        $secret = (string) config('services.telegram.webhook_secret');

        if ($secret !== '') {
            $header = (string) $request->header('X-Telegram-Bot-Api-Secret-Token');
            if (! hash_equals($secret, $header)) {
                return response()->json(['ok' => false, 'message' => 'Unauthorized'], 401);
            }
        }

        $payload = $request->json()->all() ?: $request->all();
        $updateId = (string) ($payload['update_id'] ?? '');

        if ($updateId === '') {
            return response()->json(['ok' => false, 'message' => 'Invalid update'], 422);
        }

        if (TelegramUpdate::query()->where('update_id', $updateId)->exists()) {
            return response()->json(['ok' => true, 'message' => 'Duplicate update ignored']);
        }

        $messageText = (string) data_get($payload, 'message.text', '');
        $chatId = (string) data_get($payload, 'message.chat.id', '');
        $username = (string) data_get($payload, 'message.from.username', '');

        TelegramUpdate::query()->create([
            'update_id' => $updateId,
            'chat_id' => $chatId !== '' ? $chatId : null,
            'username' => $username !== '' ? $username : null,
            'message_text' => $messageText !== '' ? $messageText : null,
            'payload' => $payload,
        ]);

        $actor = $chatId !== ''
            ? User::query()->where('telegram_chat_id', $chatId)->first()
            : null;

        $result = $this->telegramCommandService->handleCommand($messageText, $actor);

        return response()->json([
            'ok' => true,
            'handled' => $result['handled'] ?? false,
            'message' => $result['message'] ?? 'accepted',
        ]);
    }
}
