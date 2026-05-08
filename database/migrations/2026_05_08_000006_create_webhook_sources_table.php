<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_sources', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('shared_secret');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('incoming_webhook_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('source')->index();
            $table->string('signature')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->json('payload');
            $table->integer('http_status');
            $table->text('message')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incoming_webhook_logs');
        Schema::dropIfExists('webhook_sources');
    }
};
