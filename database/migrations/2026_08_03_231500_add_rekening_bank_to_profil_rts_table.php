<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profil_rts', function (Blueprint $table) {
            if (!Schema::hasColumn('profil_rts', 'rekening_bank')) {
                $table->text('rekening_bank')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('profil_rts', function (Blueprint $table) {
            if (Schema::hasColumn('profil_rts', 'rekening_bank')) {
                $table->dropColumn('rekening_bank');
            }
        });
    }
};
