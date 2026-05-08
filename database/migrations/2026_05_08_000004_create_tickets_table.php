<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('ticket_code')->unique();
            $table->string('title');
            $table->longText('description')->nullable();
            $table->string('source')->default('manual');
            $table->string('external_alert_id')->nullable()->index();
            $table->foreignId('node_id')->nullable()->constrained()->nullOnDelete();
            $table->string('node_name')->nullable()->index();
            $table->string('severity_input')->nullable();
            $table->string('priority', 2)->index();
            $table->string('status')->default('new')->index();
            $table->timestamp('sla_response_deadline_at')->nullable();
            $table->timestamp('sla_resolution_deadline_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
