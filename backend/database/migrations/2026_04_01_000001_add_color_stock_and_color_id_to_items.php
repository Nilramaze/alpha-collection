<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lagerbestand pro Farbe
        Schema::table('product_colors', function (Blueprint $table) {
            $table->integer('stock_quantity')->default(0)->after('name');
        });

        // Warenkorb: Farb-Referenz hinzufügen, alten Unique-Index ersetzen
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique(['cart_id', 'product_id']);
            $table->foreignId('product_color_id')
                ->nullable()
                ->after('product_id')
                ->constrained('product_colors')
                ->nullOnDelete();
            $table->unique(['cart_id', 'product_id', 'product_color_id']);
        });

        // Bestellpositionen: Farb-Referenz hinzufügen
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('product_color_id')
                ->nullable()
                ->after('product_id')
                ->constrained('product_colors')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_color_id']);
            $table->dropColumn('product_color_id');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique(['cart_id', 'product_id', 'product_color_id']);
            $table->dropForeign(['product_color_id']);
            $table->dropColumn('product_color_id');
            $table->unique(['cart_id', 'product_id']);
        });

        Schema::table('product_colors', function (Blueprint $table) {
            $table->dropColumn('stock_quantity');
        });
    }
};
