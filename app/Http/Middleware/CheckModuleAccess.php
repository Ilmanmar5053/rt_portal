<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\RolePermission;
use Inertia\Inertia;

class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * Usage via route middleware:
     *   module.access:modul_name,access   → cek hak akses (lihat menu) [default]
     *   module.access:modul_name,manage   → cek hak kelola (tambah/edit/hapus)
     *   module.access:modul_name,approve  → cek hak setujui/proses
     */
    public function handle(Request $request, Closure $next, string $module, string $action = 'access'): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $hasPermission = match ($action) {
            'manage'  => RolePermission::checkManage($user->role, $module),
            'approve' => RolePermission::checkApprove($user->role, $module),
            default   => RolePermission::checkAccess($user->role, $module),
        };

        if (!$hasPermission) {
            $messages = [
                'access'  => 'Modul ini tidak dapat diakses oleh peran Anda.',
                'manage'  => 'Anda tidak memiliki izin untuk mengelola data di modul ini.',
                'approve' => 'Anda tidak memiliki izin untuk menyetujui atau memproses di modul ini.',
            ];
            $message = $messages[$action] ?? $messages['access'];

            if ($request->header('X-Inertia')) {
                return Inertia::render('Error', [
                    'status' => 403,
                    'message' => $message,
                ])->toResponse($request)->setStatusCode(403);
            }

            abort(403, $message);
        }

        return $next($request);
    }
}
