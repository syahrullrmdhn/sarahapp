<?php

namespace App\Http\Requests;

use App\Domain\Tickets\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketStatusUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(TicketStatus::all())],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
