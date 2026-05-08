<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NodeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'unique:nodes,name'],
            'location' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string', 'max:64'],
            'criticality_level' => ['nullable', 'integer', 'min:1', 'max:5'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}

