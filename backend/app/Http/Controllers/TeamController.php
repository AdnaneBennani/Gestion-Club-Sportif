<?php

namespace App\Http\Controllers;

use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\SyncMembersRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\MemberResource;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class TeamController extends Controller
{
    /**
     * GET /api/v1/teams
     *
     * Admin → all teams with members_count.
     * Coach → only their assigned team.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Team::class);

        $teams = $request->user()->isAdmin()
            ? Team::withCount('members')->with('coaches')->latest()->get()
            : Team::withCount('members')->with('coaches')
                ->where('id', $request->user()->team_id)
                ->get();

        return TeamResource::collection($teams);
    }

    /**
     * POST /api/v1/teams
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $team = Team::create($request->validated());

        return (new TeamResource($team->loadCount('members')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/teams/{team}
     */
    public function show(Request $request, Team $team): TeamResource
    {
        $this->authorize('view', $team);

        return new TeamResource($team->loadCount('members')->load('members', 'coaches'));
    }

    /**
     * PUT /api/v1/teams/{team}
     */
    public function update(UpdateTeamRequest $request, Team $team): TeamResource
    {
        $team->update($request->validated());

        return new TeamResource($team->loadCount('members'));
    }

    /**
     * DELETE /api/v1/teams/{team}
     *
     * RG-04: deletion blocked if the team still has members or trainings.
     */
    public function destroy(Team $team): Response
    {
        $this->authorize('delete', $team);

        if ($team->members()->exists() || $team->trainings()->exists()) {
            throw ValidationException::withMessages([
                'team' => ['Impossible de supprimer une équipe qui contient encore des membres ou des séances.'],
            ]);
        }

        $team->delete();

        return response()->noContent();
    }

    /**
     * POST /api/v1/teams/{team}/members          → attach (RF-07)
     * DELETE /api/v1/teams/{team}/members        → detach all
     *
     * Payload:
     *   { "member_ids": [1, 2, 3] }
     *
     * POST   → attaches the given members without removing existing ones.
     * DELETE → detaches the given members from the team.
     */
    public function syncMembers(SyncMembersRequest $request, Team $team): JsonResponse
    {
        $ids = $request->validated('member_ids');

        match ($request->method()) {
            'POST' => $team->members()->syncWithoutDetaching($ids),
            'DELETE' => $team->members()->detach($ids),
            default => null,
        };

        $team->load('members')->loadCount('members');

        return (new TeamResource($team))->response();
    }

    /**
     * GET /api/v1/teams/{team}/members
     *
     * List members of a team — filtered to own team for coaches (RG-03).
     */
    public function listMembers(Request $request, Team $team): AnonymousResourceCollection
    {
        $this->authorize('view', $team);

        $members = $team->members()
            ->when(
                $search = $request->string('search')->trim()->value(),
                fn ($q) => $q->where(function ($q) use ($search) {
                    $q->where('last_name', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                })
            )
            ->latest('members.created_at')
            ->paginate(min((int) $request->query('per_page', 15), 100));

        return MemberResource::collection($members);
    }
}
