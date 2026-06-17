<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 8, 2);
            $table->date('payment_date');
            $table->unsignedTinyInteger('month');  // 1–12
            $table->unsignedSmallInteger('year');
            $table->string('payment_method', 30)->nullable();
            $table->enum('status', ['paid', 'late'])->default('paid');
            $table->timestamps();

            // RF-16 / CDC §7.2 — one payment per member per month/year
            $table->unique(['member_id', 'month', 'year'], 'payments_member_period_unique');

            $table->index('member_id');
            $table->index(['month', 'year']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
