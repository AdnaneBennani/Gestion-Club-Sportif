<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', Rule::in(['admin', 'coach'])],
            'team_id' => ['required_if:role,coach', 'nullable', 'integer', 'exists:teams,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.min' => 'Le nom doit contenir au moins 2 caractères.',
            'email.email' => 'L\'email n\'est pas valide.',
            'email.unique' => 'Un utilisateur avec cet email existe déjà.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'role.in' => 'Le rôle doit être admin ou coach.',
            'team_id.required_if' => 'Une équipe est requise pour les entraîneurs.',
            'team_id.exists' => 'L\'équipe sélectionnée n\'existe pas.',
        ];
    }
}
