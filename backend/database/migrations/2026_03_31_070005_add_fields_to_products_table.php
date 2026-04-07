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
        Schema::table('products', function (Blueprint $table) {
            $table->string('model_number')->nullable()->after('sku');
            $table->string('size')->nullable()->after('model_number');
            $table->unsignedSmallInteger('height')->nullable()->after('size');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['model_number', 'size', 'height']);
        });
    }
};
