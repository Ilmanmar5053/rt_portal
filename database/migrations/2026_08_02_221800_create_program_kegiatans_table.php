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
        Schema::create('program_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_program');
            $table->string('kategori')->default('Program'); // Program, Kegiatan, Informasi, Lain-lain
            $table->string('status')->default('Direncanakan'); // Direncanakan, Sedang Berjalan, Selesai, Dibatalkan
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->string('waktu')->nullable(); // misal "08:00 WIB - Selesai"
            $table->string('lokasi');
            $table->string('pic_nama');
            $table->string('pic_kontak')->nullable(); // No. HP/WA PIC
            $table->decimal('estimasi_anggaran', 15, 2)->default(0);
            $table->decimal('realisasi_anggaran', 15, 2)->nullable()->default(0);
            $table->text('deskripsi')->nullable();
            $table->string('eflyer_path')->nullable(); // URL/path foto e-flyer
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_kegiatan');
    }
};
