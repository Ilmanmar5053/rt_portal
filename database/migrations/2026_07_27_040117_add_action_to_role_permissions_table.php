<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Drop unique constraint on [role, module]
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropUnique(['role', 'module']);
        });

        // Step 2: Add action column
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->string('action', 20)->default('access')->after('module');
            $table->unique(['role', 'module', 'action']);
        });

        // Step 3: Seed manage & approve permissions for admin roles based on existing access permissions
        $adminRoles = ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'];
        $modules = ['data_rumah', 'data_keluarga', 'data_warga', 'iuran_kas', 'pengaduan', 'surat_pengantar'];
        
        // Approve-capable modules per role
        $approveModules = [
            'superadmin' => ['pengaduan', 'surat_pengantar', 'iuran_kas'],
            'rw'         => ['pengaduan', 'surat_pengantar', 'iuran_kas'],
            'rt'         => ['pengaduan', 'surat_pengantar', 'iuran_kas'],
            'bendahara'  => ['iuran_kas'],
            'sekretaris' => ['surat_pengantar'],
        ];

        foreach ($adminRoles as $role) {
            foreach ($modules as $module) {
                // manage permission
                DB::table('role_permissions')->insertOrIgnore([
                    'role' => $role,
                    'module' => $module,
                    'action' => 'manage',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // approve permission (only for roles that need it)
                $canApprove = isset($approveModules[$role]) && in_array($module, $approveModules[$role]);
                DB::table('role_permissions')->insertOrIgnore([
                    'role' => $role,
                    'module' => $module,
                    'action' => 'approve',
                    'is_active' => $canApprove,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Warga roles: manage & approve always false
        $wargaRoles = ['warga_kk', 'warga_anggota'];
        foreach ($wargaRoles as $role) {
            foreach ($modules as $module) {
                DB::table('role_permissions')->insertOrIgnore([
                    'role' => $role,
                    'module' => $module,
                    'action' => 'manage',
                    'is_active' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('role_permissions')->insertOrIgnore([
                    'role' => $role,
                    'module' => $module,
                    'action' => 'approve',
                    'is_active' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropUnique(['role', 'module', 'action']);
        });

        // Delete non-access records
        DB::table('role_permissions')->whereIn('action', ['manage', 'approve'])->delete();

        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropColumn('action');
            $table->unique(['role', 'module']);
        });
    }
};
