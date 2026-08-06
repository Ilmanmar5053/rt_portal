<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MonitoringController extends Controller
{
    /**
     * Get active users list for Dashboard Polling
     */
    public function getActiveUsers()
    {
        // Define 'active' as any user who has activity in the last 15 minutes
        $threshold = Carbon::now()->subMinutes(15);

        // Eager load warga.keluarga.rumahBlok to avoid N+1 problem
        $users = User::with('warga.keluarga.rumahBlok')
                    ->whereNotNull('last_activity_at')
                    ->where('last_activity_at', '>=', $threshold)
                    ->orderBy('last_activity_at', 'desc')
                    ->get()
                    ->map(function ($user) {
                        $now = Carbon::now();
                        $lastActivity = Carbon::parse($user->last_activity_at);
                        $loginTime = $user->last_login_at ? Carbon::parse($user->last_login_at) : $lastActivity;
                        
                        $idleSeconds = $now->diffInSeconds($lastActivity);
                        
                        $idleText = 'Aktif';
                        if ($idleSeconds > 60) {
                            $idleMinutes = floor($idleSeconds / 60);
                            $idleText = "Idle {$idleMinutes} Menit";
                        }

                        // Determine Location based on role and relations
                        $lokasi = 'Sistem Web (Pengurus)';
                        if (in_array($user->role, ['warga_kk', 'warga_anggota'])) {
                            if ($user->warga && $user->warga->keluarga && $user->warga->keluarga->rumahBlok) {
                                $blok = $user->warga->keluarga->rumahBlok->blok;
                                $nomor = $user->warga->keluarga->rumahBlok->nomor;
                                $lokasi = "Blok {$blok} No. {$nomor}";
                            } else {
                                $lokasi = 'Akses Warga (App)';
                            }
                        }

                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'role' => $user->role,
                            'lokasi' => $lokasi,
                            'ip_address' => $user->last_ip_address ?? 'Unknown',
                            'login_time' => $loginTime->format('H:i:s'),
                            'idle_text' => $idleText,
                            'is_idle' => $idleSeconds > 60,
                            'browser' => $user->last_browser ?? 'Unknown',
                            'module' => $user->last_module ?? 'N/A'
                        ];
                    });

        return response()->json([
            'count' => $users->count(),
            'users' => $users
        ]);
    }
}
