<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookSource extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'shared_secret', 'is_active'];

    protected function casts(): array
    {
        return [
            // Store secrets encrypted at rest; decrypted transparently when used for HMAC verification.
            'shared_secret' => 'encrypted',
            'is_active' => 'boolean',
        ];
    }
}
