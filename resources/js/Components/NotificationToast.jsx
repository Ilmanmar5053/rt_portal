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
            gain1.gain.setValueAtTime(0.25, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.5);
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

                    const newToast = {
                        ...n,
                        duration: 12000,
                    };

                    playChimeSound();

                    setToasts(prev => [newToast, ...prev]);

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
        const interval = setInterval(fetchNotifications, 4000);
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
        <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className="pointer-events-auto w-80 sm:w-84 bg-emerald-600/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-emerald-400/50 overflow-hidden animate-in slide-in-from-right-5 duration-200 relative group"
                >
                    {/* Inner Compact Content */}
                    <div className="p-3.5 space-y-2">
                        {/* Header Row */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-sm shadow-inner shrink-0">
                                    {toast.type === 'pengaduan_baru' ? '📢' : '💬'}
                                </span>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-emerald-100 tracking-wider block leading-none">
                                        {toast.type === 'pengaduan_baru' ? 'Pengaduan Baru' : 'Tanggapan RT'}
                                    </span>
                                    <span className="text-[9px] text-emerald-200/80 font-medium">
                                        Baru saja
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => dismissToast(toast.id)}
                                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-100 hover:text-white text-[11px] font-bold transition shrink-0 cursor-pointer"
                                title="Tutup Notifikasi"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Title & Message */}
                        <div>
                            <h5 className="font-extrabold text-xs text-white leading-tight truncate">
                                {toast.title}
                            </h5>
                            <p className="text-[11px] text-emerald-50 font-medium leading-snug line-clamp-2 mt-0.5">
                                {toast.message}
                            </p>
                        </div>

                        {/* Compact Action Button */}
                        <div className="flex justify-end pt-0.5">
                            <button
                                type="button"
                                onClick={() => handleToastClick(toast)}
                                className="px-3 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-950 font-black text-[10px] shadow-xs transition hover:scale-105 cursor-pointer flex items-center gap-1"
                            >
                                <span>Buka</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>

                    {/* 12-Second Progress Bar Countdown Animation */}
                    <div className="w-full bg-black/10 h-1 overflow-hidden">
                        <div 
                            className="h-full bg-white"
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
