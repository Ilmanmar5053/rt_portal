import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link } from '@inertiajs/react';

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

    return (
        <WargaLayout header="Detail Pengaduan">
            <Head title={`Pengaduan - ${pengaduan.judul}`} />

            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                
                {/* Navigation Header */}
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={route('warga.pengaduan.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition"
                    >
                        <span>←</span>
                        <span>Kembali ke Daftar Pengaduan</span>
                    </Link>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${status.badge}`}>
                        {status.icon} {pengaduan.status_progres}
                    </span>
                </div>

                {/* Main Social Thread Container */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-7 relative overflow-hidden">
                    
                    {/* Thread Header: Pelapor Info */}
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                            {pengaduan.is_anonim ? '🔒' : (pengaduan.warga?.nama_lengkap?.charAt(0) || '👤')}
                        </div>
                        <div className="flex-1 min-w-0">
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
                                📅 {new Date(pengaduan.created_at).toLocaleString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
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

                    {/* VERTICAL THREAD CONNECTOR LINE & LOGS (BERANAK) */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                                💬
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                                Riwayat Tanggapan Pengurus RT ({pengaduan.logs?.length || 0})
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
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                                <span className="text-3xl block">⏳</span>
                                <p className="text-xs font-bold text-slate-600">
                                    Pengaduan Anda telah terdaftar & menunggu tanggapan resmi dari Pengurus RT.
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    Anda akan mendapatkan notifikasi popup realtime secara otomatis saat Admin mengirim tanggapan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ONE-WAY COMMUNICATION NOTICE FOR WARGA */}
                    <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs font-semibold">
                        <span className="text-xl">ℹ️</span>
                        <div>
                            <span className="font-black block uppercase text-[10px] text-amber-700 tracking-wider">
                                Tanggapan Resmi Satu Arah (One-Way Communication)
                            </span>
                            <span>
                                Kolom tanggapan dikelola secara eksklusif oleh Pengurus RT. Warga tidak perlu membalas komentar dan dapat memantau progres langsung melalui thread ini.
                            </span>
                        </div>
                    </div>

                </div>

            </div>
        </WargaLayout>
    );
}
