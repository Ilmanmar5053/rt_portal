import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function FloatingProgramBanner({ activePrograms = [] }) {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Cek apakah banner harus otomatis muncul saat pertama kali web diakses
    useEffect(() => {
        if (activePrograms && activePrograms.length > 0) {
            const hiddenToday = sessionStorage.getItem('hide_rt_banner_today');
            if (!hiddenToday) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, 700);
                return () => clearTimeout(timer);
            }
        }
    }, [activePrograms]);

    // Slideshow otomatis 5 detik (kecuali saat pause / di-hover)
    useEffect(() => {
        if (!isOpen || !activePrograms || activePrograms.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activePrograms.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isOpen, activePrograms, isPaused]);

    if (!activePrograms || activePrograms.length === 0) return null;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activePrograms.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + activePrograms.length) % activePrograms.length);
    };

    const handleDotClick = (idx) => {
        setCurrentIndex(idx);
    };

    const handleClose = (hideToday = false) => {
        if (hideToday) {
            sessionStorage.setItem('hide_rt_banner_today', 'true');
        }
        setIsOpen(false);
    };

    const getKategoriEmoji = (kat) => {
        switch (kat) {
            case 'Program': return '🗓️';
            case 'Kegiatan': return '🎉';
            case 'Informasi': return '📢';
            default: return '✨';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Sedang Berjalan': return 'bg-emerald-500 text-white shadow-emerald-500/40';
            case 'Direncanakan': return 'bg-amber-500 text-white shadow-amber-500/40';
            case 'Selesai': return 'bg-blue-500 text-white shadow-blue-500/40';
            default: return 'bg-gray-500 text-white';
        }
    };

    const isAdmin = ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'].includes(auth?.user?.role);
    const targetRoute = auth?.user
        ? (isAdmin ? route('admin.program-kegiatan.index') : route('warga.program-kegiatan.index'))
        : route('login');

    // Menentukan posisi setiap kartu (center, left, right, atau hidden)
    const getCardPosition = (idx, current, total) => {
        if (total === 1) return 'center';
        if (idx === current) return 'center';
        const nextIdx = (current + 1) % total;
        const prevIdx = (current - 1 + total) % total;

        if (idx === nextIdx) return 'right';
        if (idx === prevIdx) return 'left';
        return 'hidden';
    };

    // Styling 3D Coverflow untuk antrean kanan & kiri, serta pusat
    const getCardStyle = (pos) => {
        switch (pos) {
            case 'center':
                return {
                    transform: 'translate(-50%, -50%) scale(1)',
                    zIndex: 30,
                    opacity: 1,
                    filter: 'blur(0px)',
                    pointerEvents: 'auto',
                };
            case 'right':
                return {
                    transform: 'translate(22%, -50%) scale(0.82)',
                    zIndex: 15,
                    opacity: 0.55,
                    filter: 'blur(2.5px)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                };
            case 'left':
                return {
                    transform: 'translate(-122%, -50%) scale(0.82)',
                    zIndex: 15,
                    opacity: 0.55,
                    filter: 'blur(2.5px)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                };
            default:
                return {
                    transform: 'translate(-50%, -50%) scale(0.6)',
                    zIndex: 0,
                    opacity: 0,
                    filter: 'blur(12px)',
                    pointerEvents: 'none',
                };
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progressFill {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress-bar {
                    animation: progressFill 5s linear infinite;
                }
            `}} />

            {/* Tombol Floating di Pojok Kanan Bawah untuk membuka ulang banner kapan saja */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-700 to-rose-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20"
                        title="Lihat Lini Berita & Kegiatan RT Berlangsung"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
                        </span>
                        <span className="text-xs font-black tracking-tight">
                            📢 Kegiatan RT ({activePrograms.length})
                        </span>
                    </button>
                </div>
            )}

            {/* Modal Floating 3D Carousel Coverflow (Antri di sisi Kanan dan Kiri, geser smooth ke Tengah) */}
            {isOpen && (
                <div
                    onClick={() => handleClose(false)}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden cursor-pointer select-none"
                    title="Klik area blur untuk menutup dan kembali ke menu utama/login"
                >
                    {/* Tombol X Tutup Bersih di Pojok Kanan Atas */}
                    <div className="absolute top-6 right-6 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose(false);
                            }}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center text-lg font-black border border-white/20 shadow-2xl transition-all hover:scale-110 cursor-pointer"
                            title="Tutup & Kembali ke Beranda / Menu Login"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Area Panggung 3D Coverflow (Kiri - Tengah - Kanan) */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-5xl h-[440px] sm:h-[490px] flex items-center justify-center my-auto select-none cursor-default"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {activePrograms.map((program, idx) => {
                            const position = getCardPosition(idx, currentIndex, activePrograms.length);
                            const style = getCardStyle(position);
                            const isCenter = position === 'center';

                            return (
                                <div
                                    key={program.id}
                                    style={style}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (position === 'right') handleNext();
                                        else if (position === 'left') handlePrev();
                                        else if (isCenter) {
                                            handleClose(false);
                                            window.location.href = targetRoute;
                                        }
                                    }}
                                    className={`absolute top-1/2 left-1/2 w-[290px] sm:w-[340px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border transition-all duration-700 ease-out bg-gray-950 ${
                                        isCenter
                                            ? 'border-white/30 shadow-emerald-500/10 cursor-pointer'
                                            : 'border-white/15 hover:border-white/30'
                                    }`}
                                    title={isCenter ? 'Klik untuk lihat detail kegiatan' : ''}
                                >
                                    {/* Progress Bar 5 Detik di Atas Kartu Utama (Center) */}
                                    {isCenter && activePrograms.length > 1 && !isPaused && (
                                        <div className="absolute top-0 inset-x-0 z-30 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-rose-400 animate-progress-bar"></div>
                                    )}

                                    {/* Gambar Foto / Poster Kegiatan 4:5 Portrait */}
                                    {program.eflyer_path ? (
                                        <img
                                            src={program.eflyer_path}
                                            alt={program.nama_program}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-teal-800 to-rose-950 flex flex-col items-center justify-center p-6 text-center text-white">
                                            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl mb-4 shadow-inner border border-white/15">
                                                {getKategoriEmoji(program.kategori)}
                                            </div>
                                            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 border border-white/10">
                                                {program.kategori}
                                            </span>
                                            <h3 className="font-black text-lg mt-3 leading-snug line-clamp-3 px-2">
                                                {program.nama_program}
                                            </h3>
                                            <p className="text-[11px] text-emerald-200/80 mt-2 line-clamp-2 px-4">
                                                {program.deskripsi || 'Kegiatan rutin kewargaan perumahan.'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Keterangan Kegiatan Dibawahnya (HANYA MUNCUL DI KARTU TENGAH AGAR RAPI) */}
                                    {isCenter && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-16 pb-6 px-5 text-white flex flex-col justify-end animate-in fade-in duration-500 pointer-events-none">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm ${getStatusStyle(program.status)}`}>
                                                    {program.status === 'Sedang Berjalan' ? '🔥 BERLANGSUNG' : program.status}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/10">
                                                    {getKategoriEmoji(program.kategori)} {program.kategori}
                                                </span>
                                            </div>

                                            <h4 className="font-black text-base sm:text-lg leading-tight line-clamp-2 text-white">
                                                {program.nama_program}
                                            </h4>

                                            <p className="text-[11px] text-gray-300 mt-1 line-clamp-1 font-medium">
                                                📅 {new Date(program.tanggal_mulai).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })} • 📍 {program.lokasi || 'Lingkungan Perumahan'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Label "Klik giliran" untuk kartu kiri/kanan */}
                                    {position === 'left' && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 shadow-md">
                                                ❮ Sebelumnya
                                            </span>
                                        </div>
                                    )}
                                    {position === 'right' && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 shadow-md">
                                                Berikutnya ❯
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
