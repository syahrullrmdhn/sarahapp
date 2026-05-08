<?php

use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\TelegramWebhookController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:api');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::post('/webhooks/{source}', [WebhookController::class, 'ingest'])
    ->middleware(['throttle:webhooks', 'webhook.signature']);

Route::post('/integrations/telegram/webhook', [TelegramWebhookController::class, 'handle'])
    ->middleware('throttle:telegram');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function (): void {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])
        ->middleware('permission:dashboard.view');
    Route::get('/integrations', [IntegrationController::class, 'index'])
        ->middleware('permission:dashboard.view');

    Route::get('/tickets/board', [TicketController::class, 'board'])
        ->middleware('permission:tickets.view');
    Route::get('/tickets', [TicketController::class, 'index'])
        ->middleware('permission:tickets.view');
    Route::post('/tickets', [TicketController::class, 'store'])
        ->middleware('permission:tickets.create');
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])
        ->middleware('permission:tickets.view');
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus'])
        ->middleware('permission:tickets.update');
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign'])
        ->middleware('permission:tickets.assign');

    Route::get('/admin/users', [UserManagementController::class, 'index'])
        ->middleware('permission:users.manage');
    Route::post('/admin/users', [UserManagementController::class, 'store'])
        ->middleware('permission:users.manage');
    Route::patch('/admin/users/{user}', [UserManagementController::class, 'update'])
        ->middleware('permission:users.manage');
    Route::get('/admin/roles', [RoleController::class, 'index'])
        ->middleware('permission:users.manage');
    Route::get('/admin/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('permission:audit.view');
});
