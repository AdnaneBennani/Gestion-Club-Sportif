<?php

namespace App\Http\Requests\Training;

use App\Models\Training;
use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Training::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'location' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'team_id' => ['required', 'integer', 'exists:teams,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est obligatoire.',
            'title.max' => 'Le titre ne peut pas dépasser 120 caractères.',
            'date.required' => 'La date est obligatoire.',
            'date.date' => 'La date est invalide.',
            'time.required' => 'L\'heure est obligatoire.',
            'time.date_format' => 'L\'heure doit être au format HH:MM.',
            'location.required' => 'Le lieu est obligatoire.',
            'location.max' => 'Le lieu ne peut pas dépasser 120 caractères.',
            'team_id.required' => 'L\'équipe est obligatoire.',
            'team_id.exists' => 'L\'équipe sélectionnée n\'existe pas.',
        ];
    }
}
