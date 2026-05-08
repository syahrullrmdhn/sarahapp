<?php

namespace App\Http\Requests;

use App\Models\WebhookSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WebhookSourceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var WebhookSource $source */
        $source = $this->route('source');

        return [
            'name' => ['sometimes', 'string', 'max:120'],
            // Allow slug change but keep it strict; callers should treat this as a breaking change.
            'slug' => ['sometimes', 'string', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('webhook_sources', 'slug')->ignore($source->id)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

