<?php

namespace App\Http\Controllers;

use App\Http\Requests\Member\StoreMemberRequest;
use App\Http\Requests\Member\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class MemberController extends Controller
{
    /**
     * GET /api/v1/members
     *
     * Admin  → all members, optional search by name or phone.
     * Coach  → only members belonging to their team.
     *
     * Query params:
     *   search   string  filters on last_name, first_name, or phone
     *   per_page int     items per page (default 15, max 100)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Member::class);

        $query = $request->user()->isAdmin()
            ? Member::query()
            : Member::whereHas('teams', fn ($q) => $q->where('teams.id', $request->user()->team_id));

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        return MemberResource::collection(
            $query->with('teams')->latest()->paginate($perPage)
        );
    }

    /**
     * POST /api/v1/members
     */
    public function store(StoreMemberRequest $request): JsonResponse
    {
        $member = Member::create($request->validated());

        return (new MemberResource($member->load('teams')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/members/{member}
     */
    public function show(Member $member): MemberResource
    {
        $this->authorize('view', $member);

        return new MemberResource($member->load('teams'));
    }

    /**
     * PUT /api/v1/members/{member}
     */
    public function update(UpdateMemberRequest $request, Member $member): MemberResource
    {
        $member->update($request->validated());

        return new MemberResource($member->load('teams'));
    }

    /**
     * DELETE /api/v1/members/{member}  — soft delete (CDC §7.2)
     */
    public function destroy(Member $member): Response
    {
        $this->authorize('delete', $member);

        $member->delete();

        return response()->noContent();
    }
}
