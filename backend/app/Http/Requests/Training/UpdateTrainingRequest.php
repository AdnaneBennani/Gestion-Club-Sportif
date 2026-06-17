<?php

namespace App\Http\Requests\Training;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('training'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:120'],
            'date' => ['sometimes', 'date'],
            'time' => ['sometimes', 'date_format:H:i'],
            'location' => ['sometimes', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'team_id' => ['sometimes', 'integer', 'exists:teams,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Le titre ne peut pas dépasser 120 caractères.',
            'date.date' => 'La date est invalide.',
            'time.date_format' => 'L\'heure doit être au format HH:MM.',
            'location.max' => 'Le lieu ne peut pas dépasser 120 caractères.',
            'team_id.exists' => 'L\'équipe sélectionnée n\'existe pas.',
        ];
    }
}
