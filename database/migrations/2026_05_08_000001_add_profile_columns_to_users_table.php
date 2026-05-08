<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('telegram_chat_id')->nullable()->unique()->after('email');
            $table->string('timezone')->default('Asia/Jakarta')->after('telegram_chat_id');
            $table->boolean('is_active')->default(true)->after('timezone');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['telegram_chat_id', 'timezone', 'is_active', 'last_login_at']);
        });
    }
};
