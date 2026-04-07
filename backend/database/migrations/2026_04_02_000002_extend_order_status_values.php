<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
                'eingegangen','bearbeitet','versendet','bezahlt','geschlossen','storniert'
            ) NOT NULL DEFAULT 'eingegangen'");
        }
        // SQLite has no ENUM enforcement — no-op
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
                'eingegangen','bearbeitet','versendet','bezahlt'
            ) NOT NULL DEFAULT 'eingegangen'");
        }
    }
};
