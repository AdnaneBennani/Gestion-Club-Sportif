<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Team;
use App\Models\Training;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/dashboard
     *
     * Admin  → global stats across the entire club.
     * Coach  → stats scoped to his team only.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = now();

        if ($user->isAdmin()) {
            return response()->json($this->adminStats($now));
        }

        return response()->json($this->coachStats($user, $now));
    }

    // -------------------------------------------------------------------------
    // Admin: club-wide KPIs
    // -------------------------------------------------------------------------

    private function adminStats(Carbon $now): array
    {
        $month = $now->month;
        $year = $now->year;

        // total_members: non-soft-deleted rows
        $totalMembers = Member::count();

        // total_teams
        $totalTeams = Team::count();

        // monthly_revenue: SUM of paid payments for the current month/year
        $monthlyRevenue = Payment::where('status', 'paid')
            ->where('month', $month)
            ->where('year', $year)
            ->sum('amount');

        // late_payments_count: payments explicitly marked late
        $latePaymentsCount = Payment::where('status', 'late')->count();

        // upcoming_trainings: trainings scheduled from today onward
        $upcomingTrainings = Training::whereDate('date', '>=', $now->toDateString())->count();

        return [
            'scope' => 'global',
            'period' => sprintf('%02d/%d', $month, $year),
            'total_members' => $totalMembers,
            'total_teams' => $totalTeams,
            'monthly_revenue' => (float) $monthlyRevenue,
            'late_payments_count' => $latePaymentsCount,
            'upcoming_trainings' => $upcomingTrainings,
        ];
    }

    // -------------------------------------------------------------------------
    // Coach: stats scoped to his team
    // -------------------------------------------------------------------------

    private function coachStats(User $user, Carbon $now): array
    {
        $teamId = $user->team_id;

        // Members belonging to the coach's team
        $totalMembers = Member::whereHas(
            'teams',
            fn ($q) => $q->where('teams.id', $teamId)
        )->count();

        // upcoming trainings for this team only
        $upcomingTrainings = Training::where('team_id', $teamId)
            ->whereDate('date', '>=', $now->toDateString())
            ->count();

        return [
            'scope' => 'team',
            'team_id' => $teamId,
            'period' => sprintf('%02d/%d', $now->month, $now->year),
            'total_members' => $totalMembers,
            'upcoming_trainings' => $upcomingTrainings,
        ];
    }
}
