import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function NotificationBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            // silent catch
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 4000); // Poll every 4 seconds
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = async (notif) => {
        setIsOpen(false);
        if (!notif.is_read) {
            axios.post(`/notifications/mark-read/${notif.id}`).catch(() => {});
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        }

        if (notif.url) {
            router.visit(notif.url);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none flex items-center justify-center"
                title="Bilah Notifikasi"
            >
                <span className="text-xl">🔔</span>

                {/* Badge Unread Count */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Bar Dropdown Drawer Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[99999] animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🔔</span>
                            <div>
                                <h4 className="font-black text-xs text-white uppercase tracking-wider">
                                    Bilah Notifikasi
                                </h4>
                                <p className="text-[10px] text-emerald-300 font-semibold">
                                    {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-bold text-amber-300 hover:text-white underline transition cursor-pointer"
                            >
                                Tandai Dibaca
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                                        !notif.is_read ? 'bg-emerald-50/70 hover:bg-emerald-100/70' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-sm shrink-0 mt-0.5">
                                        {notif.type === 'pengaduan_baru' ? '📢' : notif.type === 'tanggapan_pengaduan' ? '💬' : '🔔'}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <h5 className={`text-xs truncate ${!notif.is_read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                {notif.title}
                                            </h5>
                                            {!notif.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 font-medium leading-snug">
                                            {notif.message}
                                        </p>
                                        <span className="text-[9.5px] font-bold text-slate-400 mt-1 block">
                                            ⏱️ {formatTimeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center space-y-1">
                                <span className="text-2xl block">🔕</span>
                                <p className="text-xs font-bold text-slate-600">Belum ada notifikasi baru</p>
                                <p className="text-[10px] text-slate-400">Notifikasi pengaduan & tanggapan RT akan muncul di sini</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>Portal RT Digital</span>
                        <span className="text-slate-400">Klik item untuk membuka halaman</span>
                    </div>

                </div>
            )}
        </div>
    );
}
