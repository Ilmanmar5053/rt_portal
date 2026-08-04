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
        Schema::create('bantuan_sosials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_id')->nullable()->constrained('wargas')->nullOnDelete();
            $table->foreignId('keluarga_id')->nullable()->constrained('keluargas')->nullOnDelete();
            $table->string('nik', 20)->nullable();
            $table->string('no_kk', 20)->nullable();
            $table->string('nama_penerima', 150);
            $table->string('sumber_dana', 100); // 'Dana Desa', 'Dana Daerah', 'Dana Pusat'
            $table->string('jenis_bantuan', 150);
            $table->string('status_penyaluran', 50)->default('Usulan / Pendataan');
            $table->integer('periode_tahun')->default(2026);
            $table->string('periode_bulan', 50)->default('Tahunan');
            $table->string('bentuk_bantuan', 150)->nullable();
            $table->decimal('nominal_tunai', 15, 2)->default(0);
            $table->text('keterangan_ekonomi')->nullable();
            $table->text('foto_bukti')->nullable();
            $table->date('tanggal_penyaluran')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bantuan_sosials');
    }
};
