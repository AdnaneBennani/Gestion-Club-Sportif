<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['first_name', 'last_name', 'birth_date', 'phone', 'address'])]
class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    /**
     * RG-05: category derived dynamically from birth_date, never stored.
     *
     * Age brackets (adapt thresholds to club rules):
     *   < 7    → Poussin
     *   7–8    → Baby
     *   9–10   → Pupille
     *   11–12  → Benjamin
     *   13–14  → Minime
     *   15–17  → Cadet
     *   18–20  → Junior
     *   21+    → Sénior
     */
    protected function category(): Attribute
    {
        return Attribute::get(function () {
            $age = $this->birth_date->age;

            return match (true) {
                $age < 7 => 'Poussin',
                $age < 9 => 'Baby',
                $age < 11 => 'Pupille',
                $age < 13 => 'Benjamin',
                $age < 15 => 'Minime',
                $age < 18 => 'Cadet',
                $age < 21 => 'Junior',
                default => 'Sénior',
            };
        });
    }

    /** Full name helper used in API Resources and search. */
    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => "{$this->first_name} {$this->last_name}");
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)->withTimestamps();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
