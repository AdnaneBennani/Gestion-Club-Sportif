<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    /**
     * GET /api/v1/users
     *
     * Filters (all optional):
     *   per_page  int     default 15, max 100
     *
     * Admin-only access.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $query = User::with('team')->latest('created_at');

        $perPage = min((int) request()->query('per_page', 15), 100);

        return UserResource::collection($query->paginate($perPage));
    }

    /**
     * POST /api/v1/users
     *
     * Admin-only.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        return (new UserResource($user->load('team')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/users/{user}
     */
    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        return new UserResource($user->load('team'));
    }

    /**
     * PUT /api/v1/users/{user}
     *
     * Admin-only.
     */
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $user->update($data);

        return new UserResource($user->load('team'));
    }

    /**
     * DELETE /api/v1/users/{user}
     */
    public function destroy(User $user): Response
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->noContent();
    }
}
