<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record an activity log entry
     */
    public static function log(
        string $action,
        string $module,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null
    ): ActivityLog {
        $user = Auth::user();
        
        $logUserId = $userId ?? ($user ? $user->id : null);
        $logUserName = $user ? $user->name : 'Sistem / Tamu';
        $logUserRole = $user ? ($user->role ?? 'warga') : 'guest';

        return ActivityLog::create([
            'user_id' => $logUserId,
            'user_name' => $logUserName,
            'user_role' => strtoupper($logUserRole),
            'action' => strtoupper($action),
            'module' => $module,
            'description' => $description,
            'ip_address' => Request::ip() ?? '127.0.0.1',
            'user_agent' => Request::header('User-Agent') ?? 'Unknown Browser',
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'url' => Request::fullUrl(),
        ]);
    }
}
