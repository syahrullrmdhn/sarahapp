<?php

namespace App\Models;

use App\Domain\Tickets\TicketStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'ticket_code',
        'title',
        'description',
        'source',
        'external_alert_id',
        'node_id',
        'node_name',
        'severity_input',
        'priority',
        'status',
        'sla_response_deadline_at',
        'sla_resolution_deadline_at',
        'acknowledged_at',
        'resolved_at',
        'closed_at',
        'escalated_at',
        'reporter_id',
        'assignee_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sla_response_deadline_at' => 'datetime',
            'sla_resolution_deadline_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
            'escalated_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket): void {
            if (! $ticket->uuid) {
                $ticket->uuid = (string) Str::uuid();
            }

            if (! $ticket->ticket_code) {
                $ticket->ticket_code = sprintf('SARAH-%s', now()->format('ymdHis').random_int(100, 999));
            }

            if (! $ticket->status) {
                $ticket->status = TicketStatus::NEW;
            }
        });
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(Node::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TicketActivity::class);
    }

    public function eosUpdates(): HasMany
    {
        return $this->hasMany(TicketEosUpdate::class);
    }

    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }
}
