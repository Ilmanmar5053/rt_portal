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
        Schema::create('keluargas', function (Blueprint $table) {
            $table->id();
            $table->string('no_kk', 20)->unique();
            $table->foreignId('rumah_blok_id')->nullable()->constrained('rumah_bloks')->nullOnDelete();
            
            // Cannot constrained 'wargas' here if 'wargas' is created after. We will add the foreign key constraint later or just leave it as integer.
            $table->unsignedBigInteger('kepala_keluarga_id')->nullable(); 
            
            $table->string('alamat_lengkap');
            $table->string('rt', 3)->default('005');
            $table->string('rw', 3)->default('008');
            $table->string('kelurahan', 100);
            $table->string('kecamatan', 100);
            $table->string('kabupaten_kota', 100);
            $table->string('provinsi', 100);
            $table->string('kode_pos', 10)->nullable();
            
            $table->string('file_kk')->nullable();
            $table->string('file_ktp_kepala')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keluargas');
    }
};
