<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class SyncMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('syncMembers', $this->route('team'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Accepts either a single member_id or an array of member_ids.
            'member_ids' => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'exists:members,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'member_ids.required' => 'Vous devez fournir au moins un identifiant de membre.',
            'member_ids.*.exists' => 'Un ou plusieurs membres n\'existent pas.',
        ];
    }
}
