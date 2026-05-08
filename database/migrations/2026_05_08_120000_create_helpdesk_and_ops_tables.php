<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_reports', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reporter_name');
            $table->string('reporter_contact')->nullable();
            $table->string('channel')->default('web')->index(); // web, whatsapp, email
            $table->string('title');
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('impact_level')->nullable();
            $table->foreignId('ticket_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('new')->index(); // new, converted, closed
            $table->timestamp('reported_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('ticket_eos_updates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('eos_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_type')->default('update'); // update, onsite, fix_applied, verification
            $table->text('message');
            $table->string('attachment_url')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('notification_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('channel')->index(); // telegram, email, in_app
            $table->string('target')->nullable();
            $table->foreignId('ticket_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event')->index(); // escalated, assigned, resolved
            $table->text('message');
            $table->string('status')->default('pending')->index(); // pending, sent, failed
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('sent_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('ticket_eos_updates');
        Schema::dropIfExists('helpdesk_reports');
    }
};
