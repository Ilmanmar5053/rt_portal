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
        Schema::create('pengaduans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_id')->nullable()->constrained('wargas')->nullOnDelete();
            $table->string('judul');
            $table->text('deskripsi');
            $table->string('kategori')->index();
            $table->enum('status_progres', ['Diajukan', 'Diproses', 'Selesai'])->default('Diajukan');
            $table->string('foto_bukti')->nullable();
            $table->boolean('is_anonim')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaduans');
    }
};
