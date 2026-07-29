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
        Schema::create('profil_rts', function (Blueprint $table) {
            $table->id();
            $table->string('nama_rt')->default('RT 01 / RW 01');
            $table->text('alamat')->nullable();
            $table->string('nomor_wa')->nullable();
            $table->string('logo_path')->nullable();
            $table->json('pengurus')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil_rts');
    }
};
