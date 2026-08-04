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
        Schema::table('keluargas', function (Blueprint $table) {
            // Kolom nama kepala keluarga manual (fallback jika belum ada warga terdaftar)
            $table->string('kepala_keluarga_nama')->nullable()->after('kepala_keluarga_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('keluargas', function (Blueprint $table) {
            $table->dropColumn('kepala_keluarga_nama');
        });
    }
};
