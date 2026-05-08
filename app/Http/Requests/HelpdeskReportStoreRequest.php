<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HelpdeskReportStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reporter_name' => ['required', 'string', 'max:120'],
            'reporter_contact' => ['nullable', 'string', 'max:120'],
            'channel' => ['nullable', Rule::in(['web', 'whatsapp', 'email'])],
            'title' => ['required', 'string', 'max:180'],
            'description' => ['required', 'string', 'max:10000'],
            'location' => ['nullable', 'string', 'max:180'],
            'impact_level' => ['nullable', 'string', 'max:64'],
            'node_name' => ['nullable', 'string', 'max:120'],
            'severity_input' => ['nullable', 'string', 'max:64'],
        ];
    }
}
