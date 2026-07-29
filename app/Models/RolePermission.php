<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasFactory;

    protected $fillable = ['role', 'module', 'action', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Check if a role has access (can see the menu) for a module.
     */
    public static function checkAccess($role, $module): bool
    {
        return self::checkAction($role, $module, 'access');
    }

    /**
     * Check if a role can manage (create/edit/delete) in a module.
     * Warga roles NEVER have manage permission.
     */
    public static function checkManage($role, $module): bool
    {
        if (in_array($role, ['warga_kk', 'warga_anggota'])) {
            return false;
        }
        return self::checkAction($role, $module, 'manage');
    }

    /**
     * Check if a role can approve/process in a module.
     */
    public static function checkApprove($role, $module): bool
    {
        if (in_array($role, ['warga_kk', 'warga_anggota'])) {
            return false;
        }
        return self::checkAction($role, $module, 'approve');
    }

    /**
     * Generic action check.
     */
    public static function checkAction($role, $module, $action): bool
    {
        $permission = self::where('role', $role)
            ->where('module', $module)
            ->where('action', $action)
            ->first();

        if ($permission) {
            return $permission->is_active;
        }

        // Default: superadmin always has all, others default true for access, false for manage/approve if not set
        if ($role === 'superadmin') {
            return true;
        }

        return $action === 'access'; // default: access=true, manage/approve=false if not configured
    }

    /**
     * Get all permissions for a role as a structured array.
     * Returns: ['module' => ['access' => bool, 'manage' => bool, 'approve' => bool]]
     */
    public static function getPermissionsForRole($role): array
    {
        $records = self::where('role', $role)->get();
        $modules = ['data_rumah', 'data_keluarga', 'data_warga', 'iuran_kas', 'pengaduan', 'surat_pengantar'];
        $isWarga = in_array($role, ['warga_kk', 'warga_anggota']);
        $isSuperadmin = $role === 'superadmin';

        $result = [];
        foreach ($modules as $module) {
            $access = $records->where('module', $module)->where('action', 'access')->first();
            $manage = $records->where('module', $module)->where('action', 'manage')->first();
            $approve = $records->where('module', $module)->where('action', 'approve')->first();

            $result[$module] = [
                'access'  => $isSuperadmin ? true : ($access ? $access->is_active : true),
                'manage'  => $isWarga ? false : ($isSuperadmin ? true : ($manage ? $manage->is_active : false)),
                'approve' => $isWarga ? false : ($isSuperadmin ? true : ($approve ? $approve->is_active : false)),
            ];
        }

        return $result;
    }
}
