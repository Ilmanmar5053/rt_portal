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
        Schema::create('surat_pengantars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_id')->constrained('wargas')->cascadeOnDelete();
            
            $table->string('jenis_surat')->index();
            $table->text('keperluan');
            $table->enum('status', ['Draft', 'Pending RT', 'Pending RW', 'Disetujui', 'Ditolak'])->default('Draft');
            $table->string('nomor_surat')->nullable()->unique();
            $table->string('qr_code_uuid')->nullable()->unique();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_pengantars');
    }
};
