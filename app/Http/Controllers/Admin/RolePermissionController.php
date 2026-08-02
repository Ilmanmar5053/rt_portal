<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    public function index()
    {
        $permissions = RolePermission::all();
        
        $roles = ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris', 'warga_kk', 'warga_anggota'];
        $modules = [
            'data_rumah' => 'Data Rumah',
            'data_keluarga' => 'Data Keluarga',
            'data_warga' => 'Data Warga',
            'iuran_kas' => 'Iuran Kas',
            'transaksi_kas' => 'Arus Kas',
            'program_kegiatan' => 'Program & Kegiatan',
            'pengaduan' => 'Pengaduan',
            'surat_pengantar' => 'Surat Pengantar',
        ];

        // Format matrix: [module => [role => is_active]]
        $matrix = [];
        foreach ($modules as $modKey => $modName) {
            $matrix[$modKey] = [
                'name' => $modName,
                'roles' => []
            ];
            foreach ($roles as $role) {
                $p = $permissions->where('module', $modKey)->where('role', $role)->first();
                $matrix[$modKey]['roles'][$role] = $p ? $p->is_active : true; // Default true if not set
            }
        }

        return Inertia::render('Admin/Permissions/Index', [
            'matrix' => $matrix,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'module' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $permission = RolePermission::firstOrCreate(
            ['role' => $validated['role'], 'module' => $validated['module']],
            ['is_active' => true] // initial state before update
        );

        $permission->is_active = $validated['is_active'];
        $permission->save();

        return redirect()->back()->with('success', 'Hak akses berhasil diperbarui.');
    }
}
