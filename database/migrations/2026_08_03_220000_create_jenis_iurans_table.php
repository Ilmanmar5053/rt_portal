<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jenis_iurans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_iuran')->unique();
            $table->decimal('nominal_default', 12, 2)->default(0);
            $table->string('kategori')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // Insert default jenis iurans requested by user
        DB::table('jenis_iurans')->insert([
            [
                'nama_iuran' => 'Kebersihan (Sampah)',
                'nominal_default' => 35000.00,
                'kategori' => 'Sampah',
                'is_active' => true,
                'urutan' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_iuran' => 'Duka Cita',
                'nominal_default' => 10000.00,
                'kategori' => 'Sukarela',
                'is_active' => true,
                'urutan' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_iuran' => 'Kas RT',
                'nominal_default' => 5000.00,
                'kategori' => 'Wajib',
                'is_active' => true,
                'urutan' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_iuran' => 'Keamanan',
                'nominal_default' => 15000.00,
                'kategori' => 'Keamanan',
                'is_active' => false,
                'urutan' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_iurans');
    }
};
