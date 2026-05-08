<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class HelpdeskReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'reporter_name',
        'reporter_contact',
        'channel',
        'title',
        'description',
        'location',
        'impact_level',
        'ticket_id',
        'status',
        'reported_at',
    ];

    protected function casts(): array
    {
        return [
            'reported_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (HelpdeskReport $report): void {
            if (! $report->uuid) {
                $report->uuid = (string) Str::uuid();
            }
        });
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }
}
