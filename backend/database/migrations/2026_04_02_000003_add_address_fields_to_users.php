<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Delivery address
            $table->string('delivery_company')->nullable()->after('skonto_group_id');
            $table->string('delivery_street')->nullable()->after('delivery_company');
            $table->string('delivery_zip', 20)->nullable()->after('delivery_street');
            $table->string('delivery_city')->nullable()->after('delivery_zip');
            $table->string('delivery_country')->nullable()->default('Deutschland')->after('delivery_city');

            // Billing address (only used when billing_same_as_delivery = false)
            $table->boolean('billing_same_as_delivery')->default(true)->after('delivery_country');
            $table->string('billing_company')->nullable()->after('billing_same_as_delivery');
            $table->string('billing_street')->nullable()->after('billing_company');
            $table->string('billing_zip', 20)->nullable()->after('billing_street');
            $table->string('billing_city')->nullable()->after('billing_zip');
            $table->string('billing_country')->nullable()->after('billing_city');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_company', 'delivery_street', 'delivery_zip', 'delivery_city', 'delivery_country',
                'billing_same_as_delivery',
                'billing_company', 'billing_street', 'billing_zip', 'billing_city', 'billing_country',
            ]);
        });
    }
};
