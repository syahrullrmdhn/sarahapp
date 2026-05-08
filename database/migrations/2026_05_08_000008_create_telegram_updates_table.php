<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telegram_updates', function (Blueprint $table): void {
            $table->id();
            $table->string('update_id')->unique();
            $table->string('chat_id')->nullable()->index();
            $table->string('username')->nullable();
            $table->text('message_text')->nullable();
            $table->json('payload');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telegram_updates');
    }
};
