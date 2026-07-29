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
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role', 50);
            $table->string('module', 50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['role', 'module']);
        });

        // Add bendahara and sekretaris to users table role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'rw', 'rt', 'bendahara', 'sekretaris', 'warga_kk', 'warga_anggota') NOT NULL DEFAULT 'warga_anggota'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        // Revert enum change is complex and might lose data if bendahara/sekretaris exists, so we leave it or revert to original
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'rw', 'rt', 'warga_kk', 'warga_anggota') NOT NULL DEFAULT 'warga_anggota'");
    }
};
