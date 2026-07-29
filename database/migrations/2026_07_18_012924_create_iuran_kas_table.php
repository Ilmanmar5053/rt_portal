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
        Schema::create('iuran_kas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_id')->constrained('wargas')->cascadeOnDelete();
            
            $table->string('jenis_iuran');
            $table->unsignedTinyInteger('periode_bulan');
            $table->unsignedSmallInteger('periode_tahun');
            $table->decimal('jumlah_bayar', 10, 2);
            $table->enum('status_pembayaran', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->string('bukti_transfer')->nullable();
            $table->timestamps();
            
            $table->unique(['warga_id', 'jenis_iuran', 'periode_bulan', 'periode_tahun'], 'iuran_unik_periode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iuran_kas');
    }
};
