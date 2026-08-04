import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ warga }) {
    const { flash } = usePage().props;
    const [copied, setCopied] = useState(false);

    const handleGenerateAccount = (warga) => {
        const pesan = warga.user_id
            ? `Akun dari warga ini sudah terdaftar.\n\nNama: ${warga.nama_lengkap}\nNIK: ${warga.nik}\n\nJika lupa password, gunakan password general yaitu NIK warga ini. Apakah Anda ingin mereset/mengonfirmasi kredensial login sekarang?`
            : `Apakah Anda ingin membuat & mengaktifkan Akun Login otomatis untuk Kepala Keluarga ini?\n\nNama: ${warga.nama_lengkap}\nNIK: ${warga.nik}\n\nSistem akan membuatkan Username (email) dan Password (NIK) secara langsung dengan hak akses khusus Warga.`;
            
        if (confirm(pesan)) {
            router.post(route('admin.warga.generate-account', warga.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleCopyNIK = () => {
        navigator.clipboard.writeText(warga.nik);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Kepala Keluarga':
                return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-sm';
            case 'Istri':
                return 'bg-rose-100 text-rose-800 border border-rose-200 font-extrabold';
            case 'Anak':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold';
            default:
                return 'bg-amber-100 text-amber-800 border border-amber-200 font-extrabold';
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <h2 className="text-lg font-black leading-tight text-gray-800 tracking-tight">
                        Detail Anggota Warga
                    </h2>
                </div>
            }
        >
            <Head title={`Detail Warga - ${warga.nama_lengkap}`} />

            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 text-sm font-bold text-emerald-900 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center gap-3">
                        <span className="text-lg">✓</span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.message && (
                    <div className="p-4 text-sm font-bold text-blue-900 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm flex items-center gap-3">
                        <span className="text-lg">ℹ️</span>
                        <span>{flash.message}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 text-sm font-bold text-red-900 rounded-2xl bg-red-50 border border-red-200 shadow-sm flex items-center gap-3">
                        <span className="text-lg">⚠️</span>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* 1. Hero Header Banner Card */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-black uppercase tracking-wider border border-white/20">
                                👤 DATA INDIVIDU WARGA
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-tight ${getStatusBadge(warga.status_hubungan_keluarga)}`}>
                                {warga.status_hubungan_keluarga}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-wide">
                            {warga.nama_lengkap}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-mono font-bold text-indigo-100">
                                NIK: {warga.nik}
                            </span>
                            <button
                                onClick={handleCopyNIK}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/20"
                                title="Salin NIK"
                            >
                                <span>{copied ? '✓ Tersalin!' : '📋 Salin'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-2 flex-shrink-0">
                        {warga.status_hubungan_keluarga === 'Kepala Keluarga' && (
                            <button
                                onClick={() => handleGenerateAccount(warga)}
                                className={`px-3.5 py-2 rounded-xl font-black transition-all text-xs inline-flex items-center gap-1.5 shadow-md ${
                                    warga.user_id 
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-400' 
                                        : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 hover:from-emerald-300 hover:to-teal-400'
                                }`}
                            >
                                <span>🔑</span>
                                <span>{warga.user_id ? 'Regenerate Akun' : 'Generate Akun Login'}</span>
                            </button>
                        )}
                        <Link
                            href={route('admin.warga.edit', warga.id)}
                            className="inline-flex items-center gap-1.5 bg-white text-indigo-900 hover:bg-indigo-50 font-black px-4 py-2 rounded-xl shadow-md transition-all hover:scale-105 text-xs"
                        >
                            <span>✏️</span>
                            <span>Edit Warga</span>
                        </Link>
                        <Link
                            href={route('admin.warga.index')}
                            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-extrabold px-4 py-2 rounded-xl border border-white/20 transition-all text-xs"
                        >
                            <span>⬅️</span>
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Grid 2 Kolom: Informasi Pribadi & Keluarga/Kontak */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Kartu Informasi Pribadi */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-black">
                                    🪪
                                </span>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Informasi Pribadi & Identitas
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {/* Tempat & Tgl Lahir */}
                                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/60">
                                    <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider">
                                        Tempat & Tanggal Lahir
                                    </span>
                                    <p className="text-sm font-black text-gray-900 mt-0.5">
                                        🎂 {warga.tempat_lahir || '-'}, {warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </p>
                                </div>

                                {/* Jenis Kelamin & Agama */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60">
                                        <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider">
                                            Jenis Kelamin
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5">
                                            {warga.jenis_kelamin === 'Laki-laki' ? '👨 Laki-laki' : '👩 Perempuan'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200/60">
                                        <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider">
                                            Agama
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5">
                                            📿 {warga.agama || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Pendidikan & Pekerjaan */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                                        <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                                            Pendidikan Terakhir
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5">
                                            🎓 {warga.pendidikan || '-'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/60">
                                        <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">
                                            Pekerjaan
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5">
                                            💼 {warga.pekerjaan || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Perkawinan & Warganegara */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">💍 Perkawinan:</span>
                                        <span className="font-black text-gray-800">{warga.status_perkawinan || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">🇮🇩 Warganegara:</span>
                                        <span className="font-black text-gray-800">{warga.kewarganegaraan || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Keluarga, Kontak & Status */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-black">
                                    👨‍👩‍👧‍👦
                                </span>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Keluarga, Kontak & Status
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {/* Nomor Kartu Keluarga */}
                                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider">
                                            Nomor Kartu Keluarga (KK)
                                        </span>
                                        <p className="text-sm font-mono font-black text-gray-900 mt-0.5">
                                            {warga.keluarga ? (
                                                <Link href={route('admin.keluarga.show', warga.keluarga.id)} className="text-indigo-600 hover:underline">
                                                    {warga.keluarga.no_kk}
                                                </Link>
                                            ) : '-'}
                                        </p>
                                    </div>
                                    {warga.keluarga && (
                                        <Link
                                            href={route('admin.keluarga.show', warga.keluarga.id)}
                                            className="px-2.5 py-1 rounded-lg bg-white text-indigo-700 font-extrabold text-xs shadow-sm border border-purple-200 hover:scale-105 transition-all"
                                        >
                                            👁️ Lihat KK
                                        </Link>
                                    )}
                                </div>

                                {/* Orang Tua */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/60">
                                        <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                                            Nama Ayah
                                        </span>
                                        <p className="text-sm font-black text-gray-800 mt-0.5">
                                            👨 {warga.nama_ayah || '-'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/60">
                                        <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                                            Nama Ibu
                                        </span>
                                        <p className="text-sm font-black text-gray-800 mt-0.5">
                                            👩 {warga.nama_ibu || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Nomor HP / WA */}
                                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                                            Nomor HP / WhatsApp
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5 font-mono">
                                            📱 {warga.no_hp || 'Belum dicantumkan'}
                                        </p>
                                    </div>
                                    {warga.no_hp && (
                                        <a
                                            href={`https://wa.me/${warga.no_hp.replace(/^0/, '62')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-sm hover:scale-105 transition-all"
                                        >
                                            💬 Chat WA
                                        </a>
                                    )}
                                </div>

                                {/* Status Hidup */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-xs font-extrabold text-gray-500">Status Hidup Warga:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm ${
                                        warga.status_hidup === 'Hidup'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${warga.status_hidup === 'Hidup' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                        <span>{warga.status_hidup || 'Hidup'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
