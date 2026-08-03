import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { debounce } from 'lodash';

export default function Index({ wargas, filters, stats = {} }) {
    const totalWargaCount = stats.total_warga || 0;
    const pctLaki = totalWargaCount > 0 ? Math.round(((stats.laki_laki || 0) / totalWargaCount) * 100) : 0;
    const pctPerempuan = totalWargaCount > 0 ? Math.round(((stats.perempuan || 0) / totalWargaCount) * 100) : 0;

    const { flash } = usePage().props;
    const { data, setData, get } = useForm({
        search: filters.search || '',
        nik: filters.nik || '',
        nama: filters.nama || '',
        kk: filters.kk || '',
        status: filters.status || 'Semua',
        ttl: filters.ttl || '',
    });

    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.warga.index'), { ...data, sort_field: field, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    const handleSearch = debounce((value) => {
        setData('search', value);
        router.get(route('admin.warga.index'), { ...data, search: value, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true, replace: true });
    }, 500);

    const onSearchChange = (e) => {
        handleSearch(e.target.value);
    };

    const handleFilter = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.warga.index'), { ...data, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setData('status', value);
        router.get(route('admin.warga.index'), { ...data, status: value, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true, replace: true });
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-emerald-700 font-bold">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data anggota keluarga ini?')) {
            router.delete(route('admin.warga.destroy', id));
        }
    };

    const handleGenerateAccount = (warga) => {
        if (warga.user_id) {
            if (confirm(`Kepala keluarga "${warga.nama_lengkap}" sudah memiliki akun login (Email: ${warga.user?.email || '-'}). Apakah Anda ingin mereset/mengganti email login untuk akun ini?`)) {
                router.post(route('admin.warga.generate-account', warga.id));
            }
        } else {
            if (confirm(`Buatkan akun login warga untuk "${warga.nama_lengkap}"? (Hanya untuk Kepala Keluarga)`)) {
                router.post(route('admin.warga.generate-account', warga.id));
            }
        }
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                    Data Warga / Anggota Keluarga
                </h2>
            }
        >
            <Head title="Data Warga" />

            {flash?.message && (
                <div className="p-4 mb-4 text-sm font-bold text-emerald-900 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{flash.message}</span>
                </div>
            )}
            {flash?.error && (
                <div className="p-4 mb-4 text-sm font-bold text-rose-900 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex items-center gap-3">
                    <svg className="w-5 h-5 text-rose-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{flash.error}</span>
                </div>
            )}

            {/* ── DASHBOARD STATISTIK WARGA & RENTANG USIA ── */}
            <div className="mb-8 space-y-5">
                {/* Row 1: Total Warga, Laki-laki, Perempuan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Total Warga */}
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-lg border border-emerald-600/40 relative overflow-hidden flex items-center justify-between">
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-200 text-xs font-bold border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Total Penduduk
                            </span>
                            <div className="text-3xl font-black text-white mt-2 tracking-tight">
                                {totalWargaCount} <span className="text-sm font-bold text-emerald-200 uppercase">Jiwa</span>
                            </div>
                            <p className="text-xs text-emerald-100/90 mt-1">
                                Seluruh anggota keluarga terdaftar di RT
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 shadow-inner">
                            👨‍👩‍👧‍👦
                        </div>
                    </div>

                    {/* Warga Laki-laki */}
                    <div className="rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 p-5 shadow-sm border border-blue-200/80 hover:shadow-md transition-all flex items-center justify-between">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                                Laki-laki
                            </span>
                            <div className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                                {stats.laki_laki || 0} <span className="text-sm font-bold text-gray-500 uppercase">Jiwa</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pctLaki}%` }}></div>
                                </div>
                                <span className="text-xs font-extrabold text-blue-700">{pctLaki}% total</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl border border-blue-200 shadow-inner">
                            👨
                        </div>
                    </div>

                    {/* Warga Perempuan */}
                    <div className="rounded-2xl bg-gradient-to-br from-white via-rose-50/40 to-pink-50/60 p-5 shadow-sm border border-rose-200/80 hover:shadow-md transition-all flex items-center justify-between">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                                Perempuan
                            </span>
                            <div className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                                {stats.perempuan || 0} <span className="text-sm font-bold text-gray-500 uppercase">Jiwa</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${pctPerempuan}%` }}></div>
                                </div>
                                <span className="text-xs font-extrabold text-rose-700">{pctPerempuan}% total</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-3xl border border-rose-200 shadow-inner">
                            👩
                        </div>
                    </div>
                </div>

                {/* Row 2: Sebaran Kelompok Usia Warga */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3.5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-sm border border-amber-200">
                                🎂
                            </span>
                            <div>
                                <h3 className="text-base font-black text-gray-900 tracking-tight">
                                    Sebaran Kelompok Usia Warga
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Dihitung otomatis berdasarkan tanggal lahir masing-masing warga terdaftar
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                            <span>🎉 6 Rentang Usia Terdata</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {stats.rentang_usia && Object.entries(stats.rentang_usia).map(([key, item]) => {
                            const pct = totalWargaCount > 0 ? Math.round((item.count / totalWargaCount) * 100) : 0;
                            return (
                                <div
                                    key={key}
                                    className={`rounded-2xl p-4 bg-gradient-to-br ${item.cardBg} border ${item.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center text-2xl shadow-inner border border-white/70`}>
                                                {item.icon}
                                            </span>
                                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${item.bg} ${item.text} border ${item.border}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                        <div className="mt-3.5">
                                            <h4 className="text-xs font-black text-gray-900 tracking-tight">{item.label}</h4>
                                            <p className="text-[10px] font-bold text-gray-500 truncate mt-0.5">{item.sub}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-2.5 border-t border-gray-200/60 flex items-baseline justify-between">
                                        <span className="text-xl font-black text-gray-900">{item.count}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Jiwa</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div>
                <div className="overflow-hidden bg-white/80 backdrop-blur-xl shadow-sm sm:rounded-2xl border border-gray-100 mb-6">
                    <div className="p-6 text-gray-900">
                            
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <Link 
                                    href={route('admin.warga.create')} 
                                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-800 text-white rounded-xl hover:from-emerald-800 hover:to-rose-900 transition-all shadow-md shadow-emerald-700/20 font-bold"
                                >
                                    + Tambah Anggota
                                </Link>
                                
                                <div className="w-full sm:w-1/3 relative">
                                    <input 
                                        type="text" 
                                        value={data.search}
                                        onChange={onSearchChange}
                                        placeholder="Cari NIK, Nama, atau No KK..." 
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50/50"
                                    />
                                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">No</th>
                                            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nik')}>
                                                NIK <SortIndicator field="nik" />
                                            </th>
                                            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nama_lengkap')}>
                                                Nama Lengkap <SortIndicator field="nama_lengkap" />
                                            </th>
                                            <th className="px-4 py-3 font-semibold">Keluarga (No KK)</th>
                                            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status_hubungan_keluarga')}>
                                                Status Keluarga <SortIndicator field="status_hubungan_keluarga" />
                                            </th>
                                            <th className="px-4 py-3 font-semibold">TTL / Jenis Kelamin</th>
                                            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                        </tr>
                                        <tr className="bg-white text-sm text-gray-600">
                                            <td className="px-4 py-2"></td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.nik}
                                                    onChange={(e) => setData('nik', e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                                    placeholder="Filter NIK"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.nama}
                                                    onChange={(e) => setData('nama', e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                                    placeholder="Filter Nama"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.kk}
                                                    onChange={(e) => setData('kk', e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                                    placeholder="Filter KK"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={data.status}
                                                    onChange={handleStatusChange}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="Semua">Semua</option>
                                                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                                                    <option value="Istri">Istri</option>
                                                    <option value="Anak">Anak</option>
                                                    <option value="Menantu">Menantu</option>
                                                    <option value="Cucu">Cucu</option>
                                                    <option value="Orang Tua">Orang Tua</option>
                                                    <option value="Mertua">Mertua</option>
                                                    <option value="Famili Lain">Famili Lain</option>
                                                    <option value="Lainnya">Lainnya</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.ttl}
                                                    onChange={(e) => setData('ttl', e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                                    placeholder="Filter TTL / Jenis Kelamin"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={handleFilter}
                                                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 text-sm font-bold shadow-sm"
                                                >
                                                    Terapkan
                                                </button>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {wargas.data.length > 0 ? wargas.data.map((warga, index) => (
                                            <tr key={warga.id} className="hover:bg-emerald-50/40 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {wargas.from ? wargas.from + index : index + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {warga.nik}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-800">
                                                    {warga.nama_lengkap}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {warga.keluarga ? (
                                                        <Link href={route('admin.keluarga.show', warga.keluarga.id)} className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline text-sm">
                                                            {warga.keluarga.no_kk}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-rose-600 text-xs italic font-semibold">Tanpa KK</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${warga.status_hubungan_keluarga === 'Kepala Keluarga' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-teal-100 text-teal-800 border-teal-200'}`}>
                                                        {warga.status_hubungan_keluarga}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    <div>{warga.tempat_lahir}, {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID')}</div>
                                                    <div className="mt-0.5">{warga.jenis_kelamin}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="inline-flex items-center justify-end gap-1">
                                                        {warga.status_hubungan_keluarga === 'Kepala Keluarga' && (
                                                            <button
                                                                onClick={() => handleGenerateAccount(warga)}
                                                                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition ${
                                                                    warga.user_id 
                                                                        ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200' 
                                                                        : 'text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                                title={warga.user_id ? "Akun Login Sudah Aktif (Klik untuk Generate Ulang/Reset Password)" : "Generate Akun Login Warga (Kepala Keluarga)"}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={route('admin.warga.show', warga.id)}
                                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                                                            title="Detail"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('admin.warga.edit', warga.id)}
                                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(warga.id)}
                                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-800 transition"
                                                            title="Hapus"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                                                    Belum ada data warga ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {wargas.links && wargas.links.length > 3 && (
                                <div className="mt-6 flex justify-end">
                                    <div className="inline-flex shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                        {wargas.links.map((link, k) => (
                                            <Link
                                                key={k}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-emerald-700 text-white font-bold' : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                </div>
            </div>
        </AdminLayout>
    );
}
