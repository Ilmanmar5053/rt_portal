import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ pengaduan }) {
    const statusConfig = (status) => {
        switch (status) {
            case 'Diajukan': 
                return {
                    bg: 'bg-amber-500/10 text-amber-800 border-amber-300/40',
                    badge: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: '⏳'
                };
            case 'Diproses': 
                return {
                    bg: 'bg-blue-500/10 text-blue-800 border-blue-300/40',
                    badge: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: '🔄'
                };
            case 'Selesai': 
                return {
                    bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-300/40',
                    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    icon: '✅'
                };
            default: 
                return {
                    bg: 'bg-slate-500/10 text-slate-800 border-slate-300/40',
                    badge: 'bg-slate-100 text-slate-800 border-slate-200',
                    icon: '📋'
                };
        }
    };

    const status = statusConfig(pengaduan.status_progres);

    const form = useForm({
        komentar: '',
    });

    const submitComment = (e) => {
        e.preventDefault();
        if (!form.data.komentar.trim()) return;

        form.post(route('admin.pengaduan.comment', pengaduan.id), {
            onSuccess: () => form.reset('komentar'),
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center text-xl font-bold">
                            📢
                        </span>
                        <div>
                            <h2 className="text-lg font-black leading-tight text-slate-900 tracking-tight">
                                Detail & Thread Pengaduan Warga
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Tanggapi laporan warga secara realtime melalui thread komentar di bawah
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.pengaduan.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition"
                        >
                            <span>←</span>
                            <span>Kembali ke Daftar</span>
                        </Link>
                        <Link
                            href={route('admin.pengaduan.edit', pengaduan.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                        >
                            <span>✏️</span>
                            <span>Update Status</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Detail Pengaduan - ${pengaduan.judul}`} />

            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* Main Social Thread Card Container */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-7 relative overflow-hidden">
                    
                    {/* Thread Header: Pelapor Info */}
                    <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 flex-wrap">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                                {pengaduan.is_anonim ? '🔒' : (pengaduan.warga?.nama_lengkap?.charAt(0) || '👤')}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-black text-slate-900 text-base tracking-tight uppercase">
                                        {pengaduan.is_anonim ? 'Warga Anonim' : (pengaduan.warga?.nama_lengkap || 'Warga RT')}
                                    </h3>
                                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                                        Pelapor
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                                        📁 {pengaduan.kategori}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {!pengaduan.is_anonim && pengaduan.warga?.keluarga?.rumah_blok && (
                                        <span className="font-bold text-slate-700 mr-2">
                                            🏠 Blok {pengaduan.warga.keluarga.rumah_blok.blok} No. {pengaduan.warga.keluarga.rumah_blok.nomor_rumah}
                                        </span>
                                    )}
                                    <span>
                                        📅 {new Date(pengaduan.created_at).toLocaleString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${status.badge}`}>
                            {status.icon} {pengaduan.status_progres}
                        </span>
                    </div>

                    {/* ROOT POST CONTENT (THREAD HEADER) */}
                    <div className="pt-5 space-y-4">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                            {pengaduan.judul}
                        </h2>

                        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                            {pengaduan.deskripsi}
                        </div>

                        {/* Photo Attachments Grid */}
                        {pengaduan.foto_bukti && pengaduan.foto_bukti.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                                    📸 Bukti Foto Terlampir ({pengaduan.foto_bukti.length})
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {pengaduan.foto_bukti.map((foto, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`/storage/${foto}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-xs block"
                                        >
                                            <img
                                                src={`/storage/${foto}`}
                                                alt={`Bukti ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                                🔍 Perbesar
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ADMIN REPLY FORM (KOMENTAR SATU ARAH) */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 rounded-2xl shadow-xl space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-base shadow-inner">
                                    ✍️
                                </span>
                                <div>
                                    <h3 className="font-black text-sm text-white uppercase tracking-wider">
                                        Balas Thread Pengaduan (Official RT Reply)
                                    </h3>
                                    <p className="text-[11px] text-slate-300">
                                        Tanggapan Anda akan langsung memicu **Notifikasi Realtime** di layar Warga pelapor.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submitComment} className="space-y-3">
                                <textarea
                                    value={form.data.komentar}
                                    onChange={(e) => form.setData('komentar', e.target.value)}
                                    placeholder="Tulis tanggapan resmi dari Pengurus RT di sini... (misal: 'Terima kasih Pak Mizwar, petugas kebersihan hari ini sudah meluncur ke lokasi')."
                                    className="w-full rounded-xl border border-indigo-400/30 bg-white/10 text-white placeholder-slate-400 p-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium"
                                    rows={3}
                                    required
                                />
                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <span className="text-[10px] text-amber-300 font-semibold italic">
                                        ℹ️ Komentar satu arah: Warga hanya bisa membaca & melihat notifikasi.
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                                    >
                                        <span>🚀 Kirim Balasan & Notifikasi</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* VERTICAL THREAD CONNECTOR LINE & LOGS (BERANAK) */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                                💬
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                                Riwayat Thread Balasan Pengurus RT ({pengaduan.logs?.length || 0})
                            </h3>
                        </div>

                        {pengaduan.logs && pengaduan.logs.length > 0 ? (
                            <div className="relative pl-4 sm:pl-6 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-400 before:to-emerald-400 before:rounded-full">
                                {pengaduan.logs.map((log) => (
                                    <div key={log.id} className="relative pl-6 sm:pl-8 group">
                                        
                                        {/* Thread Node Dot Icon */}
                                        <div className="absolute -left-3.5 sm:-left-4.5 top-1.5 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-400 text-white flex items-center justify-center text-xs shadow-md z-10">
                                            👨‍💼
                                        </div>

                                        {/* Thread Chat Bubble Card */}
                                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-indigo-500/30 space-y-2">
                                            <div className="flex items-center justify-between gap-2 border-b border-indigo-400/20 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm text-amber-300">
                                                        {log.user ? log.user.name : 'Pengurus RT'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
                                                        Official RT
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-300 font-mono">
                                                    ⏱️ {new Date(log.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium whitespace-pre-wrap pt-1">
                                                {log.komentar}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                                <span className="text-2xl block">💬</span>
                                <p className="text-xs font-bold text-slate-600">
                                    Belum ada balasan thread dari Pengurus RT.
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    Gunakan form di atas untuk mengirimkan tanggapan resmi pertama.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}
