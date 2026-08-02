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
        Schema::table('profil_rts', function (Blueprint $table) {
            $table->string('ttd_ketua_path')->nullable()->after('logo_path');
            $table->string('ttd_sekretaris_path')->nullable()->after('ttd_ketua_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_rts', function (Blueprint $table) {
            $table->dropColumn(['ttd_ketua_path', 'ttd_sekretaris_path']);
        });
    }
};
