<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    /**
     * Admins bypass every check.
     */
    public function before(User $user): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Coaches can list teams (controller returns only their own team).
     */
    public function viewAny(User $user): bool
    {
        return $user->isCoach();
    }

    /**
     * Coach can view a team only if it is their assigned team (RG-03).
     */
    public function view(User $user, Team $team): bool
    {
        return $user->isCoach() && $user->team_id === $team->id;
    }

    /** Admin-only — before() handles it. */
    public function create(User $user): bool
    {
        return false;
    }

    /** Admin-only. */
    public function update(User $user, Team $team): bool
    {
        return false;
    }

    /**
     * Admin-only — RG-04: deletion also guarded at controller level
     * (blocked if team still has members or trainings).
     */
    public function delete(User $user, Team $team): bool
    {
        return false;
    }

    /** Admin + Coach (for their own team) — member assignment. */
    public function syncMembers(User $user, Team $team): bool
    {
        return $user->isCoach() && $user->team_id === $team->id;
    }

    public function restore(User $user, Team $team): bool
    {
        return false;
    }

    public function forceDelete(User $user, Team $team): bool
    {
        return false;
    }
}
