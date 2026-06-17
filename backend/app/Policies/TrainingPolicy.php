<?php

namespace App\Policies;

use App\Models\Training;
use App\Models\User;

class TrainingPolicy
{
    // Admin bypass: all gates return true for admins
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    // Coaches can list trainings (filtered to their team in controller)
    public function viewAny(User $user): bool
    {
        return true;
    }

    // RG-03: coach can only view trainings belonging to his team
    public function view(User $user, Training $training): bool
    {
        return $user->team_id === $training->team_id;
    }

    // RG-03: coach can only create trainings for his own team
    public function create(User $user): bool
    {
        return $user->isCoach();
    }

    // RG-03: coach can only update trainings of his team
    public function update(User $user, Training $training): bool
    {
        return $user->team_id === $training->team_id;
    }

    // RG-03: coach can only delete trainings of his team
    public function delete(User $user, Training $training): bool
    {
        return $user->team_id === $training->team_id;
    }
}
