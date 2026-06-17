<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('payment'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $payment = $this->route('payment');

        // Resolve the effective member/month/year for the uniqueness check:
        // use the incoming value if provided, otherwise fall back to the
        // current record value so partial updates don't false-positive.
        $memberId = $this->input('member_id', $payment->member_id);
        $month = $this->input('month', $payment->month);
        $year = $this->input('year', $payment->year);

        return [
            'member_id' => [
                'sometimes',
                'integer',
                'exists:members,id',
                Rule::unique('payments', 'member_id')
                    ->ignore($payment->id)
                    ->where(fn ($q) => $q
                        ->where('month', $month)
                        ->where('year', $year)
                    ),
            ],
            'amount' => ['sometimes', 'numeric', 'gt:0', 'decimal:0,2'],
            'payment_date' => ['sometimes', 'date'],
            'month' => [
                'sometimes',
                'integer',
                'min:1',
                'max:12',
                Rule::unique('payments', 'month')
                    ->ignore($payment->id)
                    ->where(fn ($q) => $q
                        ->where('member_id', $memberId)
                        ->where('year', $year)
                    ),
            ],
            'year' => ['sometimes', 'integer', 'min:2000', 'max:2100'],
            'payment_method' => ['nullable', 'string', 'max:30'],
            'status' => ['sometimes', Rule::in(['paid', 'late'])],
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
            'member_id.unique' => 'Un paiement existe déjà pour ce membre sur cette période.',
            'month.unique' => 'Un paiement existe déjà pour ce membre sur cette période.',
            'status.in' => 'Le statut doit être "paid" ou "late".',
        ];
    }
}
