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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('user_name');
            $table->string('user_role')->default('warga');
            $table->string('action'); // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, SCROLL
            $table->string('module'); // Data Warga, Data KK, Surat Pengantar, Iuran Kas, etc.
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('module');
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
