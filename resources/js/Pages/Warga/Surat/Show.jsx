import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ surat }) {
    const statusConfig = (status) => {
        switch (status) {
            case 'Pending RT': 
                return {
                    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
                    text: 'text-amber-800',
                    badge: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: '⏳'
                };
            case 'Pending RW': 
                return {
                    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
                    text: 'text-orange-800',
                    badge: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: '⏰'
                };
            case 'Disetujui': 
                return {
                    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
                    text: 'text-emerald-800',
                    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    icon: '✅'
                };
            case 'Ditolak': 
                return {
                    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
                    text: 'text-red-800',
                    badge: 'bg-red-100 text-red-800 border-red-200',
                    icon: '❌'
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

    const status = statusConfig(surat.status);
    
    const suratIcons = {
        'Surat Keterangan Domisili': '🏠',
        'Surat Pengantar KTP': '🆔',
        'Surat Pengantar SKCK': '👮',
        'Surat Keterangan Usaha': '💼',
        'Surat Keterangan Tidak Mampu': '📄',
        'Lainnya': '📝'
    };

    return (
        <WargaLayout header="Detail Surat Pengantar">
            <Head title="Detail Surat" />
            
            <div className="max-w-3xl mx-auto space-y-4">
                {/* Header Card with Status */}
                <div className={`${status.bg} rounded-xl shadow-md border border-gray-200/50 overflow-hidden`}>
                    <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{status.icon}</span>
                                    <h1 className={`text-lg sm:text-xl font-bold ${status.text}`}>
                                        {surat.jenis_surat}
                                    </h1>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.badge} border shadow-sm whitespace-nowrap`}>
                                {surat.status}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Jenis Surat */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                                        {suratIcons[surat.jenis_surat] || '📝'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-600 mb-0.5">Jenis Surat</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{surat.jenis_surat}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tanggal Pengajuan */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                                        📅
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-600 mb-0.5">Tanggal Pengajuan</p>
                                        <p className="text-xs font-bold text-gray-900">
                                            {new Date(surat.created_at).toLocaleDateString('id-ID', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Keperluan Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📝</span>
                            <h2 className="text-base font-bold text-white">Keperluan Surat</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap shadow-sm">
                            {surat.keperluan}
                        </div>
                    </div>
                </div>

                {/* Keterangan Tambahan Card */}
                {surat.keterangan_tambahan && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📋</span>
                                <h2 className="text-base font-bold text-white">Keterangan Tambahan</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap shadow-sm">
                                {surat.keterangan_tambahan}
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="flex justify-center pt-2">
                    <Link 
                        href={route('warga.surat.index')} 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
                    >
                        <span>←</span>
                        <span>Kembali ke Daftar Surat</span>
                    </Link>
                </div>
            </div>
        </WargaLayout>
    );
}
