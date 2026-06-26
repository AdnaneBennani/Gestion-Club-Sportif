<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
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
     * Coaches can list payments but only for members of their team.
     * Filtering is enforced server-side in PaymentController::index().
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Coach can view a payment only if the member belongs to their team.
     */
    public function view(User $user, Payment $payment): bool
    {
        if (! $user->isCoach()) {
            return false;
        }

        return $payment->member->teams->contains('id', $user->team_id);
    }

    /** Only admins create payments (before() handles it). */
    public function create(User $user): bool
    {
        return false;
    }

    /** Only admins update payments. */
    public function update(User $user, Payment $payment): bool
    {
        return false;
    }

    /** Only admins delete payments. */
    public function delete(User $user, Payment $payment): bool
    {
        return false;
    }

    public function restore(User $user, Payment $payment): bool
    {
        return false;
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }
}
