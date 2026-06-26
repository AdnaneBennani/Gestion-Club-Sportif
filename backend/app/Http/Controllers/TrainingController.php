<?php

namespace App\Http\Controllers;

use App\Http\Requests\Training\StoreTrainingRequest;
use App\Http\Requests\Training\UpdateTrainingRequest;
use App\Http\Resources\TrainingResource;
use App\Models\Training;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TrainingController extends Controller
{
    /**
     * GET /api/v1/trainings
     *
     * Filters (optional, cumulative):
     *   team_id    int    exact match
     *   date_from  date   lower bound (inclusive)
     *   date_to    date   upper bound (inclusive)
     *   per_page   int    default 15, max 100
     *
     * Admin → all trainings.
     * Coach → only trainings for his team (RG-03).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Training::class);

        $query = Training::with('team');

        // RG-03: coaches are scoped to their own team
        if ($request->user()->isCoach()) {
            $query->where('team_id', $request->user()->team_id);
        }

        $query
            ->when($request->filled('team_id'), fn ($q) => $q->where('team_id', $request->integer('team_id')))
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('date', '>=', $request->input('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('date', '<=', $request->input('date_to')));

        $perPage = min((int) $request->query('per_page', 15), 100);

        return TrainingResource::collection($query->orderBy('date')->orderBy('time')->paginate($perPage));
    }

    /**
     * POST /api/v1/trainings
     *
     * RG-03: a coach can only create trainings for his own team.
     * The FormRequest authorize() calls the 'create' gate.
     * We additionally enforce that team_id matches the coach's team.
     */
    public function store(StoreTrainingRequest $request): JsonResponse
    {
        $data = $request->validated();

        // RG-03: override team_id for coaches — they cannot assign to another team
        if ($request->user()->isCoach()) {
            $data['team_id'] = $request->user()->team_id;
        }

        $training = Training::create($data);

        return (new TrainingResource($training->load('team')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/trainings/{training}
     */
    public function show(Training $training): TrainingResource
    {
        $this->authorize('view', $training);

        return new TrainingResource($training->load('team'));
    }

    /**
     * PUT /api/v1/trainings/{training}
     *
     * UpdateTrainingRequest authorize() calls the 'update' gate (RG-03).
     * Coach cannot re-assign a training to a different team.
     */
    public function update(UpdateTrainingRequest $request, Training $training): TrainingResource
    {
        $data = $request->validated();

        // RG-03: coaches cannot change the team_id
        if ($request->user()->isCoach()) {
            unset($data['team_id']);
        }

        $training->update($data);

        return new TrainingResource($training->load('team'));
    }

    /**
     * DELETE /api/v1/trainings/{training}
     */
    public function destroy(Training $training): Response
    {
        $this->authorize('delete', $training);

        $training->delete();

        return response()->noContent();
    }
}
