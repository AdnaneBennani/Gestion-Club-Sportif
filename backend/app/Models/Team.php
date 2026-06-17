<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'category'])]
class Team extends Model
{
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)->withTimestamps();
    }

    public function coaches(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class);
    }
}
