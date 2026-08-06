<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;
use Jenssegers\Agent\Agent;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Limit query frequency (Update every 30 seconds max)
            $lastActivity = $user->last_activity_at;
            $now = now();
            
            if (!$lastActivity || $now->diffInSeconds($lastActivity) > 30) {
                // Get module (route name or path)
                $module = Route::currentRouteName();
                if (!$module) {
                    $module = $request->path();
                }
                
                // Format browser string
                $browser = $request->header('User-Agent');
                if (class_exists(Agent::class)) {
                    $agent = new Agent();
                    $agent->setUserAgent($browser);
                    $browserStr = $agent->browser() . ' ' . $agent->version($agent->browser());
                    $osStr = $agent->platform() . ' ' . $agent->version($agent->platform());
                    $browser = $browserStr . ' on ' . $osStr;
                } else {
                    // Simple fallback if Agent package is not available
                    if (preg_match('/(Edg|OPR|Chrome|Safari|Firefox|MSIE|Trident)[ \/]([\w.]+)/i', $browser, $matches)) {
                        $browser = $matches[1] . ' ' . $matches[2];
                    } else {
                        $browser = substr($browser, 0, 50); // limit string length
                    }
                }
                
                $user->timestamps = false; // Don't update the `updated_at` column just for activity
                $user->forceFill([
                    'last_activity_at' => $now,
                    'last_ip_address' => $request->ip(),
                    'last_browser' => $browser,
                    'last_module' => $module,
                    'last_login_at' => $user->last_login_at ?? $now, // Set if null
                ])->save();
            }
        }

        return $next($request);
    }
}
