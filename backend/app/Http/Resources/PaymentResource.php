<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member' => $this->whenLoaded('member', fn () => [
                'id' => $this->member->id,
                'full_name' => $this->member->full_name,
            ]),
            'amount' => (float) $this->amount,
            'payment_date' => $this->payment_date->toDateString(),
            'month' => $this->month,
            'year' => $this->year,
            'period' => sprintf('%02d/%d', $this->month, $this->year),
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
