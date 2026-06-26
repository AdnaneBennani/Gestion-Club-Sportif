<?php

namespace App\Policies;

use App\Models\Member;
use App\Models\User;

class MemberPolicy
{
    /**
     * Admins pass every policy check automatically.
     * This runs before any other method in the policy.
     */
    public function before(User $user): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null; // defer to individual methods for coaches
    }

    /**
     * Coaches can list members of their own team only.
     * Filtering is done in MemberController::index().
     */
    public function viewAny(User $user): bool
    {
        return $user->isCoach();
    }

    /**
     * Coaches can view a member only if that member belongs to their team.
     */
    public function view(User $user, Member $member): bool
    {
        return $user->isCoach()
            && $member->teams->contains('id', $user->team_id);
    }

    /** Only admins create members (before() handles it). */
    public function create(User $user): bool
    {
        return false;
    }

    /** Only admins update members. */
    public function update(User $user, Member $member): bool
    {
        return false;
    }

    /** Only admins soft-delete members. */
    public function delete(User $user, Member $member): bool
    {
        return false;
    }

    /** Restore and forceDelete are admin-only operations. */
    public function restore(User $user, Member $member): bool
    {
        return false;
    }

    public function forceDelete(User $user, Member $member): bool
    {
        return false;
    }
}
