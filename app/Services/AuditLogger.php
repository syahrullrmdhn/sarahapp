<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuditLogger
{
    public function log(Model $model, string $action, array $oldValues = [], array $newValues = []): void
    {
        AuditLog::query()->create([
            'user_id' => Auth::id(),
            'auditable_type' => Str::of($model::class)->afterLast('\\')->toString(),
            'auditable_id' => $model->getKey(),
            'action' => $action,
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => request()?->ip(),
            'user_agent' => Str::limit((string) request()?->userAgent(), 255, ''),
        ]);
    }
}
