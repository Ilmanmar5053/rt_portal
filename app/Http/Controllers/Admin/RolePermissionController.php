<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    // All available modules with their display names and allowed actions
    const MODULES = [
        'data_rumah'        => ['name' => 'Data Rumah',          'icon' => 'home'],
        'data_keluarga'     => ['name' => 'Data Keluarga',       'icon' => 'users'],
        'data_warga'        => ['name' => 'Data Warga',          'icon' => 'user'],
        'iuran_kas'         => ['name' => 'Iuran Kas',           'icon' => 'cash'],
        'transaksi_kas'     => ['name' => 'Arus Kas',            'icon' => 'chart'],
        'program_kegiatan'  => ['name' => 'Program & Kegiatan',  'icon' => 'calendar'],
        'pengaduan'         => ['name' => 'Pengaduan',           'icon' => 'chat'],
        'surat_pengantar'   => ['name' => 'Surat Pengantar',     'icon' => 'document'],
    ];

    const ACTIONS = [
        'access'  => ['label' => 'Lihat / Akses',    'desc' => 'Dapat melihat menu dan data'],
        'manage'  => ['label' => 'Kelola (CRUD)',     'desc' => 'Dapat tambah, edit, dan hapus data'],
        'approve' => ['label' => 'Setujui / Proses',  'desc' => 'Dapat menyetujui atau memproses data'],
    ];

    const ROLES = [
        'superadmin'   => ['label' => 'Administrator',   'color' => 'yellow'],
        'rw'           => ['label' => 'Ketua RW',        'color' => 'blue'],
        'rt'           => ['label' => 'Ketua RT',        'color' => 'indigo'],
        'bendahara'    => ['label' => 'Bendahara',       'color' => 'green'],
        'sekretaris'   => ['label' => 'Sekretaris',      'color' => 'purple'],
        'warga_kk'     => ['label' => 'Warga (KK)',      'color' => 'rose'],
        'warga_anggota'=> ['label' => 'Warga (Anggota)', 'color' => 'gray'],
    ];

    // Actions that warga roles can NEVER have
    const WARGA_ROLES = ['warga_kk', 'warga_anggota'];

    public function index()
    {
        $allPermissions = RolePermission::all();

        // Build 3D matrix: [role][module][action] = bool
        $matrix = [];
        foreach (self::ROLES as $roleKey => $roleInfo) {
            $matrix[$roleKey] = [];
            foreach (self::MODULES as $modKey => $modInfo) {
                $matrix[$roleKey][$modKey] = [];
                foreach (self::ACTIONS as $actionKey => $actionInfo) {
                    if ($roleKey === 'superadmin') {
                        // Superadmin ALWAYS has all access — locked
                        $matrix[$roleKey][$modKey][$actionKey] = true;
                        continue;
                    }

                    // Warga roles can never manage or approve
                    if (in_array($roleKey, self::WARGA_ROLES) && $actionKey !== 'access') {
                        $matrix[$roleKey][$modKey][$actionKey] = false;
                        continue;
                    }

                    $p = $allPermissions
                        ->where('role', $roleKey)
                        ->where('module', $modKey)
                        ->where('action', $actionKey)
                        ->first();

                    // Default: access=true for non-warga non-superadmin, manage/approve=false
                    $default = ($actionKey === 'access') ? true : false;
                    $matrix[$roleKey][$modKey][$actionKey] = $p ? $p->is_active : $default;
                }
            }
        }

        return Inertia::render('Admin/Permissions/Index', [
            'matrix'  => $matrix,
            'roles'   => self::ROLES,
            'modules' => self::MODULES,
            'actions' => self::ACTIONS,
        ]);
    }

    /**
     * Single permission update (legacy, kept for compatibility)
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'role'      => 'required|string',
            'module'    => 'required|string',
            'action'    => 'required|string|in:access,manage,approve',
            'is_active' => 'required|boolean',
        ]);

        // Superadmin cannot be modified
        if ($validated['role'] === 'superadmin') {
            return back()->withErrors(['error' => 'Hak akses Administrator tidak dapat diubah.']);
        }

        // Warga cannot manage or approve
        if (in_array($validated['role'], self::WARGA_ROLES) && $validated['action'] !== 'access') {
            return back()->withErrors(['error' => 'Role warga tidak dapat memiliki akses kelola atau setujui.']);
        }

        RolePermission::updateOrCreate(
            ['role' => $validated['role'], 'module' => $validated['module'], 'action' => $validated['action']],
            ['is_active' => $validated['is_active']]
        );

        return back()->with('success', 'Hak akses berhasil diperbarui.');
    }

    /**
     * Bulk update all permissions for a role at once
     */
    public function updateBulk(Request $request)
    {
        $validated = $request->validate([
            'role'        => 'required|string',
            'permissions' => 'required|array',
            'permissions.*.module'    => 'required|string',
            'permissions.*.action'    => 'required|string|in:access,manage,approve',
            'permissions.*.is_active' => 'required|boolean',
        ]);

        $role = $validated['role'];

        // Superadmin cannot be modified
        if ($role === 'superadmin') {
            return back()->withErrors(['error' => 'Hak akses Administrator tidak dapat diubah.']);
        }

        foreach ($validated['permissions'] as $perm) {
            // Skip manage/approve for warga roles
            if (in_array($role, self::WARGA_ROLES) && $perm['action'] !== 'access') {
                continue;
            }

            RolePermission::updateOrCreate(
                ['role' => $role, 'module' => $perm['module'], 'action' => $perm['action']],
                ['is_active' => $perm['is_active']]
            );
        }

        $roleLabel = self::ROLES[$role]['label'] ?? $role;
        return back()->with('success', "Hak akses untuk role \"{$roleLabel}\" berhasil disimpan.");
    }
}
