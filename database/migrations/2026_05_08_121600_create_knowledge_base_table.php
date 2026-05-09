<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('content');
            $table->string('category')->default('general');
            $table->json('tags')->nullable();
            $table->boolean('is_published')->default(false);
            $table->integer('view_count')->default(0);
            $table->integer('usage_count')->default(0);
            $table->decimal('rating', 3, 2)->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_published']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_base');
    }
};