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
        Schema::table('profil_rts', function (Blueprint $table) {
            $table->text('map_image_path')->nullable()->after('alamat');
        });

        Schema::table('rumah_bloks', function (Blueprint $table) {
            $table->string('coord_x')->nullable()->after('status_hunian');
            $table->string('coord_y')->nullable()->after('coord_x');
            $table->string('pin_label')->nullable()->after('coord_y');
            $table->string('pin_color')->nullable()->after('pin_label');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_rts', function (Blueprint $table) {
            $table->dropColumn('map_image_path');
        });

        Schema::table('rumah_bloks', function (Blueprint $table) {
            $table->dropColumn(['coord_x', 'coord_y', 'pin_label', 'pin_color']);
        });
    }
};
