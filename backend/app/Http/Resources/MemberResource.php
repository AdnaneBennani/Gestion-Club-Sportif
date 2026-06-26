<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'birth_date' => $this->birth_date->toDateString(),
            'category' => $this->category,
            'phone' => $this->phone,
            'address' => $this->address,
            'teams' => $this->whenLoaded('teams', fn () => $this->teams->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'category' => $t->category,
            ])),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
