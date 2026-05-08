<?php

namespace App\Http\Requests;

use App\Domain\Tickets\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:10000'],
            'source' => ['nullable', 'string', 'max:32'],
            'external_alert_id' => ['nullable', 'string', 'max:128'],
            'node_name' => ['nullable', 'string', 'max:120'],
            'severity_input' => ['nullable', 'string', 'max:64'],
            'priority' => ['nullable', Rule::in(TicketPriority::all())],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'reporter_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
