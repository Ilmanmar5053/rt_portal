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
        Schema::create('wargas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('keluarga_id')->nullable()->constrained('keluargas')->nullOnDelete();
            
            $table->string('nik', 20)->unique();
            $table->string('nama_lengkap');
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan']);
            $table->string('agama', 50);
            $table->string('pendidikan', 100);
            $table->string('pekerjaan', 100);
            $table->enum('status_perkawinan', ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']);
            $table->enum('status_hubungan_keluarga', ['Kepala Keluarga', 'Istri', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Lainnya']);
            $table->enum('kewarganegaraan', ['WNI', 'WNA'])->default('WNI');
            $table->string('nama_ayah');
            $table->string('nama_ibu');
            
            $table->string('no_hp', 20)->nullable();
            $table->enum('status_hidup', ['Hidup', 'Meninggal'])->default('Hidup');
            $table->timestamps();
        });
        
        // Add foreign key constraint to keluargas.kepala_keluarga_id after wargas is created
        Schema::table('keluargas', function (Blueprint $table) {
            $table->foreign('kepala_keluarga_id')->references('id')->on('wargas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('keluargas', function (Blueprint $table) {
            $table->dropForeign(['kepala_keluarga_id']);
        });
        Schema::dropIfExists('wargas');
    }
};
