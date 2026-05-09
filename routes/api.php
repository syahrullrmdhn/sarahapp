<?php

use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\NodeManagementController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\WebhookSourceManagementController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HelpdeskReportController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\KnowledgeBaseController;
use App\Http\Controllers\Api\NotificationLogController;
use App\Http\Controllers\Api\OperationsReportController;
use App\Http\Controllers\Api\TelegramWebhookController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketEosUpdateController;
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
Route::post('/helpdesk/reports', [HelpdeskReportController::class, 'store'])
    ->middleware('throttle:api');

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
    Route::get('/tickets/{ticket}/eos-updates', [TicketEosUpdateController::class, 'index'])
        ->middleware('permission:tickets.view');
    Route::post('/tickets/{ticket}/eos-updates', [TicketEosUpdateController::class, 'store'])
        ->middleware('permission:eos.update.create');

	    Route::get('/admin/users', [UserManagementController::class, 'index'])
	        ->middleware('permission:users.manage');
	    Route::post('/admin/users', [UserManagementController::class, 'store'])
	        ->middleware('permission:users.manage');
	    Route::post('/admin/users/invite', [UserManagementController::class, 'invite'])
	        ->middleware('permission:users.manage');
    Route::post('/admin/users/{user}/resend-invitation', [UserManagementController::class, 'resendInvitation'])
        ->middleware('permission:users.manage');
    Route::patch('/admin/users/{user}', [UserManagementController::class, 'update'])
        ->middleware('permission:users.manage');
    Route::get('/admin/roles', [RoleController::class, 'index'])
        ->middleware('permission:users.manage');
    Route::get('/admin/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('permission:audit.view');

    Route::get('/admin/nodes', [NodeManagementController::class, 'index'])
        ->middleware('permission:nodes.manage');
    Route::post('/admin/nodes', [NodeManagementController::class, 'store'])
        ->middleware('permission:nodes.manage');
    Route::patch('/admin/nodes/{node}', [NodeManagementController::class, 'update'])
        ->middleware('permission:nodes.manage');

    Route::get('/admin/webhook-sources', [WebhookSourceManagementController::class, 'index'])
        ->middleware('permission:integrations.manage');
    Route::post('/admin/webhook-sources', [WebhookSourceManagementController::class, 'store'])
        ->middleware('permission:integrations.manage');
    Route::patch('/admin/webhook-sources/{source}', [WebhookSourceManagementController::class, 'update'])
        ->middleware('permission:integrations.manage');
    Route::post('/admin/webhook-sources/{source}/rotate-secret', [WebhookSourceManagementController::class, 'rotateSecret'])
        ->middleware('permission:integrations.manage');

    Route::get('/admin/external-integrations', [IntegrationController::class, 'externalIntegrations'])
        ->middleware('permission:integrations.manage');
    Route::put('/admin/external-integrations/{provider}', [IntegrationController::class, 'updateExternalIntegration'])
        ->middleware('permission:integrations.manage');

    Route::get('/helpdesk/reports', [HelpdeskReportController::class, 'index'])
        ->middleware('permission:helpdesk.report.view');
    Route::get('/reports/operations', [OperationsReportController::class, 'summary'])
        ->middleware('permission:reports.view');
    Route::get('/notifications', [NotificationLogController::class, 'index'])
        ->middleware('permission:notifications.view');

    Route::get('/knowledge-base', [KnowledgeBaseController::class, 'index'])
        ->middleware('permission:knowledge-view');
    Route::get('/knowledge-base/categories', [KnowledgeBaseController::class, 'categories'])
        ->middleware('permission:knowledge-view');
    Route::get('/knowledge-base/search', [KnowledgeBaseController::class, 'search'])
        ->middleware('permission:knowledge-view');
    Route::get('/knowledge-base/{article}', [KnowledgeBaseController::class, 'show'])
        ->middleware('permission:knowledge-view');
    Route::post('/knowledge-base', [KnowledgeBaseController::class, 'store'])
        ->middleware('permission:knowledge-create');
    Route::patch('/knowledge-base/{article}', [KnowledgeBaseController::class, 'update'])
        ->middleware('permission:knowledge-update');
    Route::delete('/knowledge-base/{article}', [KnowledgeBaseController::class, 'destroy'])
        ->middleware('permission:knowledge-delete');
});
