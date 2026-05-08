<?php

namespace App\Http\Requests;

use App\Domain\Tickets\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EosUpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action_type' => ['nullable', Rule::in(['update', 'onsite', 'fix_applied', 'verification'])],
            'message' => ['required', 'string', 'max:5000'],
            'attachment_url' => ['nullable', 'url', 'max:500'],
            'status' => ['nullable', Rule::in(TicketStatus::all())],
        ];
    }
}
