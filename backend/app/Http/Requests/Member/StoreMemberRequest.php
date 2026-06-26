<?php

namespace App\Http\Requests\Member;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Member::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:60'],
            'last_name' => ['required', 'string', 'min:2', 'max:60'],
            'birth_date' => ['required', 'date', 'before:today'],
            'phone' => ['required', 'string', 'regex:/^[0-9]{8,15}$/'],
            'address' => ['nullable', 'string', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'birth_date.before' => 'La date de naissance doit être antérieure à aujourd\'hui.',
            'phone.regex' => 'Le téléphone doit contenir entre 8 et 15 chiffres.',
        ];
    }
}
