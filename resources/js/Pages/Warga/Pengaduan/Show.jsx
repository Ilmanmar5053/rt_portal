import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ pengaduan }) {
    const statusConfig = (status) => {
        switch (status) {
            case 'Diajukan': 
                return {
                    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
                    text: 'text-amber-800',
                    badge: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: '⏳'
                };
            case 'Diproses': 
                return {
                    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                    text: 'text-blue-800',
                    badge: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: '🔄'
                };
            case 'Selesai': 
                return {
                    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
                    text: 'text-emerald-800',
                    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    icon: '✅'
                };
            default: 
                return {
                    bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
                    text: 'text-gray-800',
                    badge: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: '📋'
                };
        }
    };

    const status = statusConfig(pengaduan.status_progres);
    
    const categoryIcons = {
        'Kebersihan': '🧹',
        'Keamanan': '🔒',
        'Infrastruktur': '🏗️',
        'Lingkungan': '🌳',
        'Lainnya': '📌'
    };

    return (
        <WargaLayout header="Detail Pengaduan">
            <Head title="Detail Pengaduan" />

            <div className="max-w-3xl mx-auto space-y-4">
                {/* Header Card with Status */}
                <div className={`${status.bg} rounded-xl shadow-md border border-gray-200/50 overflow-hidden`}>
                    <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{status.icon}</span>
                                    <h1 className={`text-lg sm:text-xl font-bold ${status.text}`}>
                                        {pengaduan.judul}
                                    </h1>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.badge} border shadow-sm whitespace-nowrap`}>
                                {pengaduan.status_progres}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Kategori */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                                        {categoryIcons[pengaduan.kategori] || '📋'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-600 mb-0.5">Kategori</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{pengaduan.kategori}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tanggal */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                                        📅
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-600 mb-0.5">Tanggal</p>
                                        <p className="text-xs font-bold text-gray-900">
                                            {new Date(pengaduan.created_at).toLocaleString('id-ID', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Anonim */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-10 h-10 rounded-lg ${pengaduan.is_anonim ? 'bg-gradient-to-br from-slate-100 to-gray-100' : 'bg-gradient-to-br from-teal-100 to-emerald-100'} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
                                        {pengaduan.is_anonim ? '🔒' : '👤'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-600 mb-0.5">Anonim</p>
                                        <p className="text-sm font-bold text-gray-900">{pengaduan.is_anonim ? 'Ya' : 'Tidak'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deskripsi Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📝</span>
                            <h2 className="text-base font-bold text-white">Deskripsi Pengaduan</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap shadow-sm">
                            {pengaduan.deskripsi}
                        </div>
                    </div>
                </div>

                {/* Foto Bukti Card */}
                {pengaduan.foto_bukti && pengaduan.foto_bukti.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📷</span>
                                <h2 className="text-base font-bold text-white">Bukti Foto</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {pengaduan.foto_bukti.map((foto, index) => (
                                    <div key={`${foto}-${index}`} className="group relative overflow-hidden rounded-lg border border-gray-200 shadow hover:shadow-md transition-all duration-300">
                                        <img
                                            src={`/storage/${foto}`}
                                            alt={`Bukti pengaduan ${index + 1}`}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                            <span className="text-white text-xs font-medium p-2">Bukti {index + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Riwayat Catatan Admin Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">💬</span>
                            <h2 className="text-base font-bold text-white">Riwayat Catatan/Admin</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        {pengaduan.logs && pengaduan.logs.length > 0 ? (
                            <div className="space-y-3">
                                {pengaduan.logs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100 shadow-sm">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg shadow flex-shrink-0 border-2 border-white">
                                            👨‍💼
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="font-bold text-sm text-indigo-900">{log.user ? log.user.name : 'Admin'}</span>
                                                <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                    {new Date(log.created_at).toLocaleString('id-ID', { 
                                                        day: 'numeric', 
                                                        month: 'short', 
                                                        year: 'numeric', 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-sm text-gray-800 leading-relaxed shadow-sm border border-indigo-100">
                                                {log.komentar}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
                                    <span className="text-2xl">💭</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Belum ada catatan dari admin.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-center pt-2">
                    <Link 
                        href={route('warga.pengaduan.index')} 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
                    >
                        <span>←</span>
                        <span>Kembali ke Daftar Pengaduan</span>
                    </Link>
                </div>
            </div>
        </WargaLayout>
    );
}
