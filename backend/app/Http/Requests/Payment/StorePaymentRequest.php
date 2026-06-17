<?php

namespace App\Http\Requests\Payment;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Payment::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'member_id' => [
                'required',
                'integer',
                'exists:members,id',
                // CDC §7.2 — one record per member per period (RF-15 A2)
                Rule::unique('payments', 'member_id')->where(
                    fn ($q) => $q
                        ->where('month', $this->input('month'))
                        ->where('year', $this->input('year'))
                ),
            ],
            'amount' => ['required', 'numeric', 'gt:0', 'decimal:0,2'],
            'payment_date' => ['required', 'date'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'payment_method' => ['nullable', 'string', 'max:30'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.gt' => 'Le montant doit être strictement positif.',
            'amount.decimal' => 'Le montant ne peut pas avoir plus de 2 décimales.',
            'member_id.exists' => 'Le membre sélectionné n\'existe pas.',
            'member_id.unique' => 'Un paiement existe déjà pour ce membre sur cette période.',
        ];
    }
}
