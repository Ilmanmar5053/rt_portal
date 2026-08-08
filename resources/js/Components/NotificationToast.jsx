import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function NotificationToast({ role = 'warga' }) {
    const [toasts, setToasts] = useState([]);
    const seenIdsRef = useRef(new Set());

    // Play subtle bell chime audio using Web Audio API
    const playChimeSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            // Oscillator 1 (High bell)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
            gain1.gain.setValueAtTime(0.3, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.6);

            // Oscillator 2 (Chime harmony)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
            gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.1);
            osc2.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('Audio chime error:', e);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications/unread');
            const newNotifs = res.data.notifications || [];

            newNotifs.forEach(n => {
                if (!seenIdsRef.current.has(n.id)) {
                    seenIdsRef.current.add(n.id);

                    // Add toast with timer
                    const newToast = {
                        ...n,
                        duration: 12000, // 12 seconds
                        timerId: null
                    };

                    playChimeSound();

                    setToasts(prev => [newToast, ...prev]);

                    // Auto dismiss after 12 seconds
                    setTimeout(() => {
                        dismissToast(n.id);
                    }, 12000);
                }
            });
        } catch (err) {
            // silent catch
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 4000); // Poll every 4s
        return () => clearInterval(interval);
    }, []);

    const dismissToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        axios.post(`/notifications/mark-read/${id}`).catch(() => {});
    };

    const handleToastClick = (toast) => {
        dismissToast(toast.id);
        if (toast.url) {
            router.visit(toast.url);
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none p-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className="pointer-events-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl shadow-2xl border-2 border-indigo-400/40 overflow-hidden animate-in slide-in-from-top-5 duration-300 relative group"
                >
                    {/* Header Top Bar */}
                    <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <span className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-xl shadow-inner shrink-0 animate-bounce">
                                {toast.type === 'pengaduan_baru' ? '🚨' : '💬'}
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-300/30">
                                        {toast.type === 'pengaduan_baru' ? 'Pengaduan Baru' : 'Tanggapan RT'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        Baru saja
                                    </span>
                                </div>
                                <h4 className="font-black text-sm text-white mt-1 leading-snug">
                                    {toast.title}
                                </h4>
                                <p className="text-xs text-slate-300 font-medium mt-1 line-clamp-2">
                                    {toast.message}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white text-xs font-bold transition shrink-0 cursor-pointer"
                            title="Tutup Notifikasi"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Action Button Footer */}
                    <div className="px-4 pb-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleToastClick(toast)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                        >
                            <span>Buka Pengaduan</span>
                            <span>→</span>
                        </button>
                    </div>

                    {/* 12-Second Progress Bar Countdown Animation */}
                    <div className="w-full bg-white/10 h-1 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 animate-pulse"
                            style={{
                                animation: 'shrinkProgress 12s linear forwards'
                            }}
                        />
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes shrinkProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
