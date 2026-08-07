import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Show({ keluarga }) {
    const [copied, setCopied] = useState(false);
    const [previewModal, setPreviewModal] = useState(null);
    const [selectedWargaDetail, setSelectedWargaDetail] = useState(null);
    const [hoverWargaDetail, setHoverWargaDetail] = useState(null);
    const hoverTimerRef = useRef(null);

    const handleMouseEnterDetail = (warga) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setHoverWargaDetail(warga);
        // Auto hide hover popup after 10 seconds
        hoverTimerRef.current = setTimeout(() => {
            setHoverWargaDetail(null);
        }, 10000);
    };

    const handleMouseLeaveDetail = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
            setHoverWargaDetail(null);
        }, 3000);
    };

    const activeDetail = selectedWargaDetail || hoverWargaDetail;

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center text-xl font-bold">
                            📜
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black leading-tight text-slate-900 tracking-tight">
                                    Detail Kartu Keluarga (KK)
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                    Terverifikasi RT
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Informasi resmi Kartu Keluarga & Daftar Anggota Warga terdaftar
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.keluarga.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition"
                        >
                            <span>←</span>
                            <span>Kembali ke Daftar</span>
                        </Link>
                        <Link
                            href={route('admin.keluarga.edit', keluarga.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                        >
                            <span>✏️</span>
                            <span>Edit KK</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Detail KK - ${keluarga.no_kk}`} />

            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* 1. Header Banner Kartu Keluarga */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono font-black text-xs border border-amber-400/30 flex items-center gap-1.5">
                                    <span>🇮🇩</span>
                                    <span>KARTU KELUARGA REPUBLIK INDONESIA</span>
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-bold">
                                    {keluarga.wargas?.length || 0} Anggota Terdaftar
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-white">
                                    {keluarga.no_kk}
                                </h1>
                                <button
                                    onClick={handleCopyKK}
                                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs transition border border-white/10 flex items-center gap-1"
                                    title="Salin Nomor KK"
                                >
                                    <span>{copied ? '✓ Tersalin!' : '📋 Salin'}</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                                <span>👤 Kepala Keluarga:</span>
                                <span className="text-amber-300 font-black text-sm uppercase">
                                    {keluarga.kepala_keluarga?.nama_lengkap || keluarga.kepala_keluarga_nama || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats Cards */}
                        <div className="grid grid-cols-2 gap-3 shrink-0">
                            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Blok / No. Rumah</span>
                                <span className="text-base font-black text-amber-300">
                                    {keluarga.rumah_blok?.blok || '3B'} - {keluarga.rumah_blok?.nomor_rumah || '21'}
                                </span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Wilayah RT / RW</span>
                                <span className="text-base font-black text-emerald-400">
                                    RT {keluarga.rt || '005'} / RW {keluarga.rw || '008'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Grid Identitas Lengkap & Alamat Domisili */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Informasi Kepala Keluarga */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-black">
                                👑
                            </span>
                            <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">
                                Identitas Pemegang Kepala Keluarga
                            </h3>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Nama Lengkap</span>
                                <span className="font-extrabold text-gray-900 uppercase">
                                    {keluarga.kepala_keluarga?.nama_lengkap || keluarga.kepala_keluarga_nama || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">NIK Kepala Keluarga</span>
                                <span className="font-mono font-bold text-gray-900">
                                    {keluarga.kepala_keluarga?.nik || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Nomor Handphone (WA)</span>
                                <span className="font-bold text-emerald-700">
                                    {keluarga.kepala_keluarga?.no_hp || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-semibold">Status Tempat Tinggal</span>
                                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                    Domisili Asli KK
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Alamat & Wilayah Administrative */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-black">
                                📍
                            </span>
                            <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">
                                Alamat & Wilayah Domisili
                            </h3>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Alamat Jalan / Perumahan</span>
                                <span className="font-bold text-gray-900 text-right max-w-[220px]">
                                    {keluarga.alamat_lengkap || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Desa / Kelurahan</span>
                                <span className="font-bold text-gray-900">{keluarga.kelurahan || 'Pontang'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Kecamatan</span>
                                <span className="font-bold text-gray-900">{keluarga.kecamatan || 'Pontang'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-semibold">Kabupaten / Kota</span>
                                <span className="font-bold text-gray-900">{keluarga.kabupaten_kota || 'Kabupaten Serang'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-semibold">Provinsi & Kode Pos</span>
                                <span className="font-bold text-gray-900">{keluarga.provinsi || 'Banten'} ({keluarga.kode_pos || '42135'})</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 3. Daftar Anggota Keluarga Section */}
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
                                    Arahkan mouse atau klik <b>Detail</b> untuk menampilkan pop-up ringkas informasi warga.
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
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedWargaDetail(warga)}
                                                        onMouseEnter={() => handleMouseEnterDetail(warga)}
                                                        onMouseLeave={handleMouseLeaveDetail}
                                                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all hover:scale-105 cursor-pointer"
                                                        title="Klik atau tahan mouse untuk Pratinjau Detail Warga (10 Detik)"
                                                    >
                                                        <span>👁️</span>
                                                        <span>Detail</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(warga.id)}
                                                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all hover:scale-105 cursor-pointer"
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

            {/* MINIMALIST POPUP SHOW WARGA DETAIL MODAL */}
            {activeDetail && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                        
                        {/* Header Minimalis Popup */}
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl backdrop-blur-md shadow-inner">
                                    👤
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-200 text-[10px] font-black uppercase tracking-wider border border-indigo-300/30">
                                            Detail Warga Minimalis
                                        </span>
                                        {hoverWargaDetail && !selectedWargaDetail && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black animate-pulse">
                                                ⏱️ Pratinjau (10 Detik)
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-base tracking-wide text-white uppercase">
                                        {activeDetail.nama_lengkap}
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedWargaDetail(null);
                                    setHoverWargaDetail(null);
                                }}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body Detail Minimalis */}
                        <div className="p-5 space-y-4 text-xs">
                            
                            {/* Card Header NIK & Hubungan */}
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NIK 16 Digit Warga</span>
                                    <span className="font-mono font-black text-sm text-slate-900">{activeDetail.nik}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-tight ${getStatusBadge(activeDetail.status_hubungan_keluarga)}`}>
                                    {activeDetail.status_hubungan_keluarga}
                                </span>
                            </div>

                            {/* Grid Informasi Warga */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Jenis Kelamin</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.jenis_kelamin || 'Laki-laki'}</span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Tempat, Tgl Lahir</span>
                                    <span className="font-extrabold text-gray-900">
                                        {activeDetail.tempat_lahir || 'SERANG'}, {activeDetail.tanggal_lahir || '-'}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Pendidikan</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.pendidikan || '-'}</span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Pekerjaan</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.pekerjaan || '-'}</span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Agama</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.agama || 'Islam'}</span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Status Perkawinan</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.status_perkawinan || '-'}</span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Nama Ayah</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.nama_ayah || '-'}</span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Nama Ibu</span>
                                    <span className="font-extrabold text-gray-900">{activeDetail.nama_ibu || '-'}</span>
                                </div>
                            </div>

                            {/* Footer Status Contact */}
                            <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-[11px] text-gray-500 font-semibold">
                                <div>📱 No. HP: <span className="font-bold text-gray-900">{activeDetail.no_hp || '-'}</span></div>
                                <div>🟢 Status: <span className="font-bold text-emerald-700">{activeDetail.status_hidup || 'Hidup'}</span></div>
                            </div>
                        </div>

                        {/* Footer Modal Action */}
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                            <p className="text-[11px] text-slate-500 font-medium">
                                💡 {hoverWargaDetail && !selectedWargaDetail ? 'Pratinjau hover otomatis tertutup dalam 10s' : 'Pop-up minimalis detail warga'}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedWargaDetail(null);
                                    setHoverWargaDetail(null);
                                }}
                                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-sm transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
