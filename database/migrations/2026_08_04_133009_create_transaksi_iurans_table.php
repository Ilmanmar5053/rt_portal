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
        Schema::create('transaksi_iurans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_kwitansi')->unique();
            $table->string('kategori_penyerahan'); // 'pengelolaan_sampah', 'dana_duka', 'lainnya'
            $table->date('tanggal_penyerahan');
            $table->string('periode')->nullable(); // e.g. 'Agustus 2026'
            $table->decimal('jumlah_dana', 15, 2);
            $table->string('penerima_nama');
            $table->string('penerima_instansi');
            $table->string('penerima_jabatan')->nullable();
            $table->string('penyerah_nama');
            $table->string('penyerah_jabatan')->nullable();
            $table->string('metode_pembayaran')->default('Tunai'); // 'Tunai', 'Transfer Bank', 'QRIS'
            $table->text('catatan')->nullable();
            $table->string('bukti_transfer')->nullable();
            $table->string('status')->default('Diserahkan'); // 'Draft', 'Diserahkan', 'Diterima'
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_iurans');
    }
};
