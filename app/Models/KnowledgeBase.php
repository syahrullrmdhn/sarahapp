<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeBase extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'knowledge_base';

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'category',
        'tags',
        'is_published',
        'view_count',
        'usage_count',
        'rating',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
        'view_count' => 'integer',
        'usage_count' => 'integer',
        'rating' => 'decimal:2',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'ilike', "%{$term}%")
              ->orWhere('summary', 'ilike', "%{$term}%")
              ->orWhere('content', 'ilike', "%{$term}%");
        });
    }

    public function incrementView(): void
    {
        $this->increment('view_count');
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}