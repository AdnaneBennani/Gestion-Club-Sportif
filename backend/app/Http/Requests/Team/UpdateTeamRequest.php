<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('team'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $teamId = $this->route('team')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:80', "unique:teams,name,{$teamId}"],
            'category' => ['sometimes', 'required', 'string', 'min:2', 'max:40'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'Une équipe avec ce nom existe déjà.',
        ];
    }
}
