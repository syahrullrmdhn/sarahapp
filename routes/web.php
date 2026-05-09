<?php

use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AuthController::class, 'login']);
    Route::get('accept-invitation/{token}', [InvitationController::class, 'accept'])->name('invitation.accept');
    Route::post('accept-invitation/{token}', [InvitationController::class, 'complete'])->name('invitation.complete');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::prefix('admin/tickets')->name('admin.tickets.')->group(function () {
        Route::get('/', [TicketController::class, 'index'])->name('index');
        Route::get('/create', [TicketController::class, 'create'])->name('create');
    });

    Route::view('/admin/helpdesk', 'admin.helpdesk.index')->name('admin.helpdesk.index');
    Route::view('/admin/eos', 'admin.eos.index')->name('admin.eos.index');
    Route::view('/admin/reports', 'admin.reports.index')->name('admin.reports.index');
    Route::view('/admin/notifications', 'admin.notifications.index')->name('admin.notifications.index');
    Route::view('/admin/users', 'admin.users.index')->name('admin.users.index');
    Route::view('/admin/audit', 'admin.audit.index')->name('admin.audit.index');
    Route::view('/admin/integrations', 'admin.integrations.index')->name('admin.integrations.index');
    Route::view('/admin/nodes', 'admin.nodes.index')->name('admin.nodes.index');
});

Route::redirect('/dashboard', '/admin/dashboard')->name('dashboard');

Route::get('/', function () {
    return view('app');
})->name('home');
