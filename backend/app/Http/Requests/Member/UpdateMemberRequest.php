<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('member'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'required', 'string', 'min:2', 'max:60'],
            'last_name' => ['sometimes', 'required', 'string', 'min:2', 'max:60'],
            'birth_date' => ['sometimes', 'required', 'date', 'before:today'],
            'phone' => ['sometimes', 'required', 'string', 'regex:/^[0-9]{8,15}$/'],
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
