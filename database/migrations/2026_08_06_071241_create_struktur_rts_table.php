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
        Schema::create('struktur_rts', function (Blueprint $table) {
            $table->id();
            $table->string('rt_nomor', 10);
            $table->foreignId('warga_id')->constrained('wargas')->onDelete('cascade');
            $table->string('jabatan', 50); // e.g. Ketua RT, Sekretaris, Bendahara, Seksi
            $table->date('periode_mulai')->nullable();
            $table->date('periode_selesai')->nullable();
            $table->string('foto_profil')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('struktur_rts');
    }
};
