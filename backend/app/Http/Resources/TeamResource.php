<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'members_count' => $this->whenCounted('members'),
            'members' => MemberResource::collection($this->whenLoaded('members')),
            'coaches' => $this->whenLoaded('coaches', fn () => $this->coaches->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
            ])),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
