<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['admin', 'coach'])],
            'team_id' => ['required_if:role,coach', 'nullable', 'integer', 'exists:teams,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est requis.',
            'name.min' => 'Le nom doit contenir au moins 2 caractères.',
            'email.required' => 'L\'email est requis.',
            'email.email' => 'L\'email n\'est pas valide.',
            'email.unique' => 'Un utilisateur avec cet email existe déjà.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'role.required' => 'Le rôle est requis.',
            'role.in' => 'Le rôle doit être admin ou coach.',
            'team_id.required_if' => 'Une équipe est requise pour les entraîneurs.',
            'team_id.exists' => 'L\'équipe sélectionnée n\'existe pas.',
        ];
    }
}
