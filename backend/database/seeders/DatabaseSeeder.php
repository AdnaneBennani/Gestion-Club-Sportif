<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Team;
use App\Models\Training;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Équipes ────────────────────────────────────────────────────────

        $senior = Team::firstOrCreate(['name' => 'Équipe Seniors'], ['category' => 'Senior']);
        $junior = Team::firstOrCreate(['name' => 'Équipe Juniors'], ['category' => 'Junior']);
        $cadet = Team::firstOrCreate(['name' => 'Équipe Cadets'], ['category' => 'Cadet']);

        // ── 2. Utilisateurs ───────────────────────────────────────────────────

        $admin = User::firstOrCreate(
            ['email' => 'admin@club.com'],
            [
                'name' => 'Admin Club',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'team_id' => null,
            ]
        );

        $coachSenior = User::firstOrCreate(
            ['email' => 'coach.senior@club.com'],
            [
                'name' => 'Coach Senior',
                'password' => Hash::make('password'),
                'role' => 'coach',
                'team_id' => $senior->id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'coach.junior@club.com'],
            [
                'name' => 'Coach Junior',
                'password' => Hash::make('password'),
                'role' => 'coach',
                'team_id' => $junior->id,
            ]
        );

        // ── 3. Membres ────────────────────────────────────────────────────────

        $membersData = [
            ['first_name' => 'Youssef',  'last_name' => 'Amrani',   'birth_date' => '2000-03-15', 'phone' => '0661000001'],
            ['first_name' => 'Sara',     'last_name' => 'Khaldi',   'birth_date' => '1998-07-22', 'phone' => '0661000002'],
            ['first_name' => 'Amine',    'last_name' => 'Benali',   'birth_date' => '2001-11-08', 'phone' => '0661000003'],
            ['first_name' => 'Nadia',    'last_name' => 'Tazi',     'birth_date' => '1999-05-30', 'phone' => '0661000004'],
            ['first_name' => 'Karim',    'last_name' => 'Fassi',    'birth_date' => '2003-01-19', 'phone' => '0661000005'],
            ['first_name' => 'Leila',    'last_name' => 'Moussaoui', 'birth_date' => '2005-09-14', 'phone' => '0661000006'],
            ['first_name' => 'Omar',     'last_name' => 'Raji',     'birth_date' => '2004-06-03', 'phone' => '0661000007'],
            ['first_name' => 'Fatima',   'last_name' => 'Hajji',    'birth_date' => '2002-12-25', 'phone' => '0661000008'],
        ];

        $members = collect($membersData)->map(
            fn ($d) => Member::firstOrCreate(['phone' => $d['phone']], $d)
        );

        // Affecter les 4 premiers à Seniors, les 4 suivants aux Juniors
        $seniorMembers = $members->take(4);
        $juniorMembers = $members->skip(4);

        foreach ($seniorMembers as $m) {
            $m->teams()->syncWithoutDetaching([$senior->id]);
        }
        foreach ($juniorMembers as $m) {
            $m->teams()->syncWithoutDetaching([$junior->id]);
        }

        // ── 4. Paiements ──────────────────────────────────────────────────────

        $now = now();
        $month = $now->month;
        $year = $now->year;

        foreach ($seniorMembers as $member) {
            // Paiement du mois courant pour les 3 premiers
            if ($member->id !== $seniorMembers->last()->id) {
                Payment::firstOrCreate(
                    ['member_id' => $member->id, 'month' => $month, 'year' => $year],
                    [
                        'amount' => 150.00,
                        'payment_date' => $now->toDateString(),
                        'payment_method' => 'Espèces',
                        'status' => 'paid',
                    ]
                );
            }
            // Paiement du mois précédent pour tous
            $prev = $now->copy()->subMonth();
            Payment::firstOrCreate(
                ['member_id' => $member->id, 'month' => $prev->month, 'year' => $prev->year],
                [
                    'amount' => 150.00,
                    'payment_date' => $prev->toDateString(),
                    'payment_method' => 'Virement',
                    'status' => 'paid',
                ]
            );
        }

        // Un paiement en retard pour illustrer le dashboard
        $lateM = $juniorMembers->first();
        Payment::firstOrCreate(
            ['member_id' => $lateM->id, 'month' => $month, 'year' => $year],
            [
                'amount' => 120.00,
                'payment_date' => $now->toDateString(),
                'status' => 'late',
            ]
        );

        // ── 5. Entraînements ──────────────────────────────────────────────────

        $trainings = [
            [
                'title' => 'Entraînement cardio',
                'date' => $now->copy()->addDays(2)->toDateString(),
                'time' => '18:30:00',
                'location' => 'Gymnase Central',
                'team_id' => $senior->id,
            ],
            [
                'title' => 'Travail technique',
                'date' => $now->copy()->addDays(5)->toDateString(),
                'time' => '17:00:00',
                'location' => 'Salle A',
                'description' => 'Focus passes et dribbles',
                'team_id' => $senior->id,
            ],
            [
                'title' => 'Préparation physique',
                'date' => $now->copy()->addDays(3)->toDateString(),
                'time' => '16:00:00',
                'location' => 'Terrain extérieur',
                'team_id' => $junior->id,
            ],
        ];

        foreach ($trainings as $t) {
            Training::firstOrCreate(
                ['title' => $t['title'], 'team_id' => $t['team_id']],
                $t
            );
        }

        $this->command->info('');
        $this->command->info('✓ Base de données initialisée avec succès.');
        $this->command->info('');
        $this->command->table(
            ['Rôle', 'Email', 'Mot de passe'],
            [
                ['Admin',        'admin@club.com',        'password'],
                ['Coach Senior', 'coach.senior@club.com', 'password'],
                ['Coach Junior', 'coach.junior@club.com', 'password'],
            ]
        );
    }
}
