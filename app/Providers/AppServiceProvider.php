<?php

namespace App\Providers;

use App\Models\Ticket;
use App\Observers\TicketObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Ticket::observe(TicketObserver::class);

        RateLimiter::for('api', function (Request $request): array {
            return [
                Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()),
            ];
        });

        RateLimiter::for('webhooks', function (Request $request): array {
            return [
                Limit::perMinute(30)->by($request->ip()),
            ];
        });

        RateLimiter::for('telegram', function (Request $request): array {
            return [
                Limit::perMinute(40)->by($request->ip()),
            ];
        });
    }
}
