<?php

namespace App\Http\Controllers;

use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    /**
     * GET /api/v1/payments
     *
     * Filters (all optional, cumulative):
     *   member_id  int     exact match
     *   month      int     1–12
     *   year       int
     *   status     string  paid|late
     *   per_page   int     default 15, max 100
     *
     * Admin → all payments.
     * Coach → only payments for members of their team.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Payment::class);

        $query = Payment::with('member');

        // Scope to coach's team
        if ($request->user()->isCoach()) {
            $query->whereHas('member.teams', fn ($q) => $q->where('teams.id', $request->user()->team_id));
        }

        $query
            ->when($request->filled('member_id'), fn ($q) => $q->where('member_id', $request->integer('member_id')))
            ->when($request->filled('month'), fn ($q) => $q->where('month', $request->integer('month')))
            ->when($request->filled('year'), fn ($q) => $q->where('year', $request->integer('year')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')));

        $perPage = min((int) $request->query('per_page', 15), 100);

        return PaymentResource::collection($query->latest()->paginate($perPage));
    }

    /**
     * POST /api/v1/payments  (RF-14)
     *
     * Status is always 'paid' on creation: the record's existence means
     * the payment was made. 'late' is assigned by the overdue scan
     * (GET /api/v1/payments/overdue), not on store.
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = 'paid';

        $payment = Payment::create($data);

        return (new PaymentResource($payment->load('member')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/payments/{payment}
     */
    public function show(Payment $payment): PaymentResource
    {
        $this->authorize('view', $payment);

        return new PaymentResource($payment->load('member'));
    }

    /**
     * PUT /api/v1/payments/{payment}
     */
    public function update(UpdatePaymentRequest $request, Payment $payment): PaymentResource
    {
        $payment->update($request->validated());

        return new PaymentResource($payment->load('member'));
    }

    /**
     * DELETE /api/v1/payments/{payment}
     */
    public function destroy(Payment $payment): Response
    {
        $this->authorize('delete', $payment);

        $payment->delete();

        return response()->noContent();
    }

    /**
     * GET /api/v1/payments/overdue  (RF-15 + RF-16)
     *
     * Returns every member who has NO payment record for the current
     * month/year — i.e. the running month's cotisation is missing.
     *
     * RG-02: a payment is 'late' when no record exists for the current
     * period past the due-date (here: any moment within the current month
     * counts as overdue once we are past day 1).
     *
     * The response attaches a virtual 'overdue_since' string and the
     * member's last recorded payment for context.
     */
    public function overdue(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $now = now();
        $month = $now->month;
        $year = $now->year;

        // Members who have no payment for the current period
        $memberQuery = Member::whereDoesntHave(
            'payments',
            fn ($q) => $q->where('month', $month)->where('year', $year)
        );

        // Coaches only see their team's members
        if ($request->user()->isCoach()) {
            $memberQuery->whereHas(
                'teams',
                fn ($q) => $q->where('teams.id', $request->user()->team_id)
            );
        }

        $members = $memberQuery
            ->with(['payments' => fn ($q) => $q->latest('payment_date')->limit(1)])
            ->get()
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'full_name' => $m->full_name,
                'phone' => $m->phone,
                'overdue_period' => sprintf('%02d/%d', $month, $year),
                'last_payment_date' => $m->payments->first()?->payment_date?->toDateString(),
            ]);

        return response()->json([
            'overdue_count' => $members->count(),
            'month' => $month,
            'year' => $year,
            'data' => $members,
        ]);
    }

    /**
     * GET /api/v1/members/{member}/payments  (RF-17)
     *
     * History of a specific member's payments, newest first.
     */
    public function memberHistory(Request $request, Member $member): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Payment::class);

        // Coaches can only access members of their own team
        if ($request->user()->isCoach()) {
            abort_unless(
                $member->teams->contains('id', $request->user()->team_id),
                403,
                'Accès refusé à ce membre.'
            );
        }

        $payments = $member->payments()
            ->latest('payment_date')
            ->paginate(min((int) $request->query('per_page', 24), 120));

        return PaymentResource::collection($payments);
    }
}
