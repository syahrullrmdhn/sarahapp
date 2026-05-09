<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalIntegration extends Model
{
    protected $fillable = [
        'provider',
        'base_url',
        'api_token',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'api_token' => 'encrypted',
    ];
}
