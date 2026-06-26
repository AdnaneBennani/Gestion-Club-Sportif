<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Public auth routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Authenticated routes ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // v1 — Business modules
    Route::prefix('v1')->group(function () {

        // M0 — Users (admin: full CRUD)
        Route::apiResource('users', UserController::class);

        // M1 — Members (admin: full CRUD | coach: index + show filtered to own team)
        Route::apiResource('members', MemberController::class);

        // M2 — Teams (admin: full CRUD + sync | coach: index + show own team)
        Route::apiResource('teams', TeamController::class);

        // Team → member assignment (RF-07 & RF-08)
        //   POST   /teams/{team}/members  { member_ids: [...] }  → attach
        //   DELETE /teams/{team}/members  { member_ids: [...] }  → detach
        Route::post('teams/{team}/members', [TeamController::class, 'syncMembers']);
        Route::delete('teams/{team}/members', [TeamController::class, 'syncMembers']);

        // Team composition (RF-09) — coach-accessible
        Route::get('teams/{team}/members', [TeamController::class, 'listMembers']);

        // M4 — Payments
        //   RF-14 : POST   /payments              → record a payment
        //   RF-15 : status auto-set to 'paid' on store; 'late' via /overdue
        //   RF-16 : GET    /payments/overdue       → members missing current-month payment
        //   RF-17 : GET    /members/{member}/payments → history per member
        Route::get('payments/overdue', [PaymentController::class, 'overdue']);
        Route::apiResource('payments', PaymentController::class);
        Route::get('members/{member}/payments', [PaymentController::class, 'memberHistory']);

        // M3 — Trainings (RG-03: coach scoped to own team)
        Route::apiResource('trainings', TrainingController::class);

        // M6 — Dashboard KPIs (admin: global | coach: team-scoped)
        Route::get('dashboard', [DashboardController::class, 'index']);

    });
});
