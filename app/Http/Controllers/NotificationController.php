<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function unread(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['notifications' => []]);
        }

        $query = Notifikasi::where('is_read', false)->latest();

        if (in_array($user->role, ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'])) {
            $query->where(function ($q) use ($user) {
                $q->where('target_role', 'admin')
                  ->orWhere('user_id', $user->id);
            });
        } else {
            $query->where('user_id', $user->id)
                  ->where('target_role', 'warga');
        }

        // Optional: filter since timestamp
        if ($request->has('since') && !empty($request->since)) {
            $query->where('created_at', '>', $request->since);
        }

        $notifications = $query->take(10)->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notifikasi::find($id);
        if ($notification) {
            $notification->update(['is_read' => true]);
        }
        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        $user = auth()->user();
        if (!$user) return response()->json(['success' => false]);

        $query = Notifikasi::where('is_read', false);

        if (in_array($user->role, ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'])) {
            $query->where(function ($q) use ($user) {
                $q->where('target_role', 'admin')
                  ->orWhere('user_id', $user->id);
            });
        } else {
            $query->where('user_id', $user->id)
                  ->where('target_role', 'warga');
        }

        $query->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
