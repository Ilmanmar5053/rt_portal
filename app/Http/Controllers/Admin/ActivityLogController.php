<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    /**
     * Display grouped activity logs with filtering & sorting.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'time'); // 'name', 'time', 'count', 'module'
        $sortOrder = $request->input('sort_order', 'desc'); // 'asc' or 'desc'

        $query = ActivityLog::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('user_role', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Get raw logs ordered by date
        $allLogs = $query->orderBy('created_at', 'desc')->get();

        // Group logs by user_id and DATE(created_at)
        $grouped = $allLogs->groupBy(function ($item) {
            $date = $item->created_at ? $item->created_at->format('Y-m-d') : 'unknown';
            $userKey = $item->user_id ? "user_{$item->user_id}" : "name_{$item->user_name}";
            return "{$userKey}_{$date}";
        });

        $groupedData = $grouped->map(function ($logs, $groupKey) {
            $latest = $logs->first();
            return [
                'group_key' => $groupKey,
                'user_id' => $latest->user_id,
                'user_name' => $latest->user_name,
                'user_role' => $latest->user_role,
                'ip_address' => $latest->ip_address,
                'user_agent' => $latest->user_agent,
                'last_module' => $latest->module,
                'last_action' => $latest->action,
                'last_description' => $latest->description,
                'last_activity_at' => $latest->created_at ? $latest->created_at->format('Y-m-d H:i:s') : null,
                'last_activity_formatted' => $latest->created_at ? $latest->created_at->format('d/M/Y H:i:s') : '-',
                'total_activities' => $logs->count(),
                'logs' => $logs->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'user_name' => $log->user_name,
                        'user_role' => $log->user_role,
                        'action' => $log->action,
                        'module' => $log->module,
                        'description' => $log->description,
                        'ip_address' => $log->ip_address,
                        'user_agent' => $log->user_agent,
                        'old_values' => $log->old_values,
                        'new_values' => $log->new_values,
                        'url' => $log->url,
                        'created_at' => $log->created_at ? $log->created_at->format('d/M/Y H:i:s') : '-',
                        'raw_created_at' => $log->created_at ? $log->created_at->toIso8601String() : null,
                    ];
                })->values(),
            ];
        })->values();

        // Apply Sorting on Grouped Data
        if ($sortBy === 'name') {
            $groupedData = $sortOrder === 'asc' 
                ? $groupedData->sortBy('user_name', SORT_NATURAL | SORT_FLAG_CASE) 
                : $groupedData->sortByDesc('user_name', SORT_NATURAL | SORT_FLAG_CASE);
        } elseif ($sortBy === 'module') {
            $groupedData = $sortOrder === 'asc' 
                ? $groupedData->sortBy('last_module', SORT_NATURAL | SORT_FLAG_CASE) 
                : $groupedData->sortByDesc('last_module', SORT_NATURAL | SORT_FLAG_CASE);
        } elseif ($sortBy === 'count') {
            $groupedData = $sortOrder === 'asc' 
                ? $groupedData->sortBy('total_activities') 
                : $groupedData->sortByDesc('total_activities');
        } else { // 'time'
            $groupedData = $sortOrder === 'asc' 
                ? $groupedData->sortBy('last_activity_at') 
                : $groupedData->sortByDesc('last_activity_at');
        }

        $groupedData = $groupedData->values();

        // Pagination manual on collection (10 per page)
        $perPage = 10;
        $page = (int) $request->input('page', 1);
        $total = $groupedData->count();
        $paginatedItems = $groupedData->slice(($page - 1) * $perPage, $perPage)->values();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logsData' => [
                'data' => $paginatedItems,
                'current_page' => $page,
                'last_page' => (int) ceil($total / $perPage) ?: 1,
                'per_page' => $perPage,
                'total' => $total,
            ],
            'filters' => [
                'search' => $search ?? '',
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Store activity log from client frontend.
     */
    public function storeLog(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|max:50',
            'module' => 'required|string|max:100',
            'description' => 'required|string',
            'old_values' => 'nullable|array',
            'new_values' => 'nullable|array',
        ]);

        AuditLogService::log(
            $validated['action'],
            $validated['module'],
            $validated['description'],
            $validated['old_values'] ?? null,
            $validated['new_values'] ?? null
        );

        return response()->json(['status' => 'success']);
    }
}
