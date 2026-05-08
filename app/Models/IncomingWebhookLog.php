<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomingWebhookLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'source',
        'signature',
        'ip_address',
        'payload',
        'http_status',
        'message',
        'created_at',
    ];

    protected function casts(): array
    {
        return ['payload' => 'array', 'created_at' => 'datetime'];
    }
}
