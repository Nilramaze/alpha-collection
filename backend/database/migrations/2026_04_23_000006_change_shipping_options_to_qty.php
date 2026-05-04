<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Neue Integer-Spalten hinzufügen
        Schema::table('shipping_options', function (Blueprint $table) {
            $table->unsignedInteger('min_order_qty')->default(0)->after('image_url');
            $table->unsignedInteger('max_order_qty')->nullable()->after('min_order_qty');
        });

        // Alte Spalten entfernen
        Schema::table('shipping_options', function (Blueprint $table) {
            $table->dropColumn(['min_order_value', 'max_order_value']);
        });
    }

    public function down(): void
    {
        Schema::table('shipping_options', function (Blueprint $table) {
            $table->decimal('min_order_value', 10, 2)->default(0)->after('image_url');
            $table->decimal('max_order_value', 10, 2)->nullable()->after('min_order_value');
        });

        Schema::table('shipping_options', function (Blueprint $table) {
            $table->dropColumn(['min_order_qty', 'max_order_qty']);
        });
    }
};
