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
        Schema::create('rumah_bloks', function (Blueprint $table) {
            $table->id();
            $table->string('blok', 10)->index();
            $table->string('nomor_rumah', 10)->index();
            $table->enum('status_hunian', ['Diisi', 'Kosong'])->default('Diisi');
            $table->timestamps();
            
            $table->unique(['blok', 'nomor_rumah']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rumah_bloks');
    }
};
