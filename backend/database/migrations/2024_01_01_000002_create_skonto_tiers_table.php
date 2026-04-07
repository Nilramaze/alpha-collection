<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skonto_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skonto_group_id')->constrained()->cascadeOnDelete();
            $table->decimal('min_order_value', 10, 2);
            $table->decimal('discount_percent', 5, 2);
            $table->timestamps();

            $table->index(['skonto_group_id', 'min_order_value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skonto_tiers');
    }
};
