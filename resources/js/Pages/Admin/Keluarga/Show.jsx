import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ keluarga }) {
    const [copied, setCopied] = useState(false);
    const [previewModal, setPreviewModal] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus data anggota keluarga ini?')) {
            router.delete(route('admin.warga.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const handleCopyKK = () => {
        navigator.clipboard.writeText(keluarga.no_kk);
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

    const urutanHubungan = [
        'Kepala Keluarga',
        'Istri',
        'Anak',
        'Menantu',
        'Cucu',
        'Orang Tua',
        'Mertua',
        'Famili Lain',
        'Lainnya'
    ];

    const sortWargasByHubungan = (list) => {
        if (!list || !Array.isArray(list)) return [];
        return [...list].sort((a, b) => {
            const idxA = urutanHubungan.indexOf(a.status_hubungan_keluarga);
            const idxB = urutanHubungan.indexOf(b.status_hubungan_keluarga);
            const orderA = idxA !== -1 ? idxA : 99;
            const orderB = idxB !== -1 ? idxB : 99;
            if (orderA !== orderB) return orderA - orderB;
            return (a.tanggal_lahir || '').localeCompare(b.tanggal_lahir || '');
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <h2 className="text-lg font-black leading-tight text-gray-800 tracking-tight">
                        Detail Kartu Keluarga (KK)
                    </h2>
                </div>
            }
        >
            <Head title={`Detail KK - ${keluarga.no_kk}`} />

            {/* Modal Lightbox untuk Preview Dokumen Lampiran KK / KTP */}
            {previewModal && (
                <div
                    onClick={() => setPreviewModal(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-4 flex flex-col"
                    >
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                            <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                                <span>📄</span>
                                <span>{previewModal.title}</span>
                            </h3>
                            <button
                                onClick={() => setPreviewModal(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-gray-50 rounded-2xl p-2 border border-gray-100">
                            <img
                                src={`/storage/${previewModal.url}`}
                                alt={previewModal.title}
                                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Container Compact & Presisi (max-w-4xl agar tidak terlalu lebar & lebih fokus) */}
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* 1. Hero Header Card (Gradient, Iconic & Berwarna) */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-black uppercase tracking-wider border border-white/20">
                                📋 DATA KARTU KELUARGA
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wide">
                                NO KK: {keluarga.no_kk}
                            </h2>
                            <button
                                onClick={handleCopyKK}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/20"
                                title="Salin Nomor KK"
                            >
                                <span>{copied ? '✓ Tersalin!' : '📋 Salin'}</span>
                            </button>
                        </div>
                        <p className="text-sm font-extrabold text-emerald-100 flex items-center gap-1.5">
                            <span>👑 Kepala Keluarga:</span>
                            <span className="text-white underline decoration-emerald-300 decoration-2 underline-offset-2">
                                {keluarga.kepala_keluarga
                                    ? keluarga.kepala_keluarga.nama_lengkap
                                    : keluarga.kepala_keluarga_nama
                                        ? <span>{keluarga.kepala_keluarga_nama}</span>
                                        : 'Belum Ada / Kosong'}
                            </span>
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
                        <Link
                            href={route('admin.keluarga.edit', keluarga.id)}
                            className="inline-flex items-center gap-1.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 text-xs"
                        >
                            <span>✏️</span>
                            <span>Edit KK</span>
                        </Link>
                        <Link
                            href={route('admin.keluarga.index')}
                            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-extrabold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs"
                        >
                            <span>⬅️</span>
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Grid 2 Kolom: Informasi Alamat & Dokumen Lampiran */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Kartu Informasi Alamat & Wilayah */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black">
                                    📍
                                </span>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Informasi Alamat & Domisili
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {/* Alamat Lengkap */}
                                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                                        Alamat Lengkap
                                    </span>
                                    <p className="text-sm font-black text-gray-900 mt-0.5 leading-snug">
                                        {keluarga.alamat_lengkap || '-'}
                                    </p>
                                </div>

                                {/* RT/RW & Domisili Blok */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/60">
                                        <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">
                                            RT / RW
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5">
                                            RT {keluarga.rt} / RW {keluarga.rw}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200/60">
                                        <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider">
                                            Domisili Blok RT
                                        </span>
                                        <p className="text-sm font-black text-gray-900 mt-0.5">
                                            {keluarga.rumah_blok ? `Blok ${keluarga.rumah_blok.blok} No. ${keluarga.rumah_blok.nomor_rumah}` : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Detail Wilayah */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">🗺️ Kel/Desa:</span>
                                        <span className="font-black text-gray-800">{keluarga.kelurahan || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">🏢 Kecamatan:</span>
                                        <span className="font-black text-gray-800">{keluarga.kecamatan || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">🏙️ Kab/Kota:</span>
                                        <span className="font-black text-gray-800">{keluarga.kabupaten_kota || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-bold">🌐 Provinsi:</span>
                                        <span className="font-black text-gray-800">{keluarga.provinsi || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <span className="text-gray-400 font-bold">📮 Kode Pos:</span>
                                        <span className="font-black text-gray-800">{keluarga.kode_pos || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Dokumen Lampiran KK & KTP */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-black">
                                    🗂️
                                </span>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Dokumen Lampiran KK & KTP
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Lampiran Scan KK */}
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-blue-100/80 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-blue-500/20">
                                            📄
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold text-gray-900">Scan Kartu Keluarga</p>
                                            <p className="text-[11px] text-gray-500 font-medium">
                                                {keluarga.file_kk ? '✓ Dokumen Terverifikasi' : '⚠️ Belum diunggah'}
                                            </p>
                                        </div>
                                    </div>
                                    {keluarga.file_kk ? (
                                        <button
                                            onClick={() => setPreviewModal({ title: 'Scan Kartu Keluarga', url: keluarga.file_kk })}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-105"
                                        >
                                            <span>👁️</span>
                                            <span>Lihat File</span>
                                        </button>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600 font-bold text-xs italic">
                                            Kosong
                                        </span>
                                    )}
                                </div>

                                {/* Lampiran KTP Kepala Keluarga */}
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-indigo-100/80 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-600/20">
                                            🪪
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold text-gray-900">KTP Kepala Keluarga</p>
                                            <p className="text-[11px] text-gray-500 font-medium">
                                                {keluarga.file_ktp_kepala ? '✓ Dokumen Terverifikasi' : '⚠️ Belum diunggah'}
                                            </p>
                                        </div>
                                    </div>
                                    {keluarga.file_ktp_kepala ? (
                                        <button
                                            onClick={() => setPreviewModal({ title: 'KTP Kepala Keluarga', url: keluarga.file_ktp_kepala })}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-105"
                                        >
                                            <span>👁️</span>
                                            <span>Lihat File</span>
                                        </button>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600 font-bold text-xs italic">
                                            Kosong
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Note Lampiran */}
                        <p className="text-[11px] text-gray-400 font-medium italic mt-4 pt-3 border-t border-gray-100">
                            💡 Klik tombol "Lihat File" untuk membuka pratinjau dokumen tanpa mengunduh.
                        </p>
                    </div>

                </div>

                {/* 3. Daftar Anggota Keluarga Section (Numbered, Colorful & Iconic Table) */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-black">
                                👥
                            </span>
                            <div>
                                <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
                                    Daftar Anggota Keluarga ({keluarga.wargas?.length || 0})
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Semua warga yang terdaftar dalam nomor Kartu Keluarga ini
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('admin.warga.create', { keluarga_id: keluarga.id })}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                        >
                            <span>+</span>
                            <span>Tambah Anggota</span>
                        </Link>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="px-3.5 py-3 text-center text-[10px] font-black uppercase tracking-wider w-10">No</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider">NIK</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider">Nama Lengkap</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider">Status Hubungan</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider">Pendidikan</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider">Pekerjaan</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {keluarga.wargas && keluarga.wargas.length > 0 ? (
                                    sortWargasByHubungan(keluarga.wargas).map((warga, idx) => (
                                        <tr key={warga.id} className="hover:bg-slate-50/70 transition-colors group">
                                            <td className="px-3.5 py-3 text-center text-xs font-bold text-gray-500">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono font-bold text-gray-700">
                                                {warga.nik}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-black text-gray-900">
                                                {warga.nama_lengkap}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-tight ${getStatusBadge(warga.status_hubungan_keluarga)}`}>
                                                    {warga.status_hubungan_keluarga}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 font-bold text-[11px]">
                                                    🎓 {warga.pendidikan || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                                                <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-[11px]">
                                                    💼 {warga.pekerjaan || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={route('admin.warga.show', warga.id)}
                                                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all hover:scale-105"
                                                        title="Lihat Detail Warga"
                                                    >
                                                        <span>👁️</span>
                                                        <span>Detail</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(warga.id)}
                                                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all hover:scale-105"
                                                        title="Hapus Anggota"
                                                    >
                                                        <span>🗑️</span>
                                                        <span>Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-400 italic">
                                            Belum ada data anggota keluarga dalam KK ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
