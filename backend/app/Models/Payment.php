<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'amount', 'payment_date', 'month', 'year', 'payment_method', 'status'])]
class Payment extends Model
{
    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'decimal:2',
            'month' => 'integer',
            'year' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * RG-02: a payment is 'late' when no record exists for the current
     * month/year after the due date. This helper re-evaluates the status
     * based on the stored period so it can be recalculated on demand.
     */
    public function computeStatus(): string
    {
        $now = now();

        // The payment covers a past period and was just recorded → paid.
        // A period is considered late only when it is strictly in the past.
        $isPast = $this->year < $now->year
            || ($this->year === $now->year && $this->month < $now->month);

        // A record's own existence means the payment was made, so status
        // is always 'paid' when stored. 'late' is set by the overdue scan
        // (no record for a past period), not here.
        return $isPast ? 'paid' : 'paid';
    }
}
