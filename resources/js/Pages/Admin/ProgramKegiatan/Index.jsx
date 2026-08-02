import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ programs, summary, filters, kategoriList, statusList }) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || 'Semua');
    const [status, setStatus] = useState(filters.status || 'Semua');

    const handleFilter = (newSearch, newKategori, newStatus) => {
        router.get(
            route('admin.program-kegiatan.index'),
            {
                search: newSearch,
                kategori: newKategori,
                status: newStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        handleFilter(e.target.value, kategori, status);
    };

    const handleKategoriChange = (e) => {
        setKategori(e.target.value);
        handleFilter(search, e.target.value, status);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        handleFilter(search, kategori, e.target.value);
    };

    const formatCurrency = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'Sedang Berjalan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        Sedang Berjalan
                    </span>
                );
            case 'Direncanakan':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        Direncanakan
                    </span>
                );
            case 'Selesai':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        Selesai
                    </span>
                );
            case 'Dibatalkan':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        Dibatalkan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {st}
                    </span>
                );
        }
    };

    const getKategoriBadge = (kat) => {
        switch (kat) {
            case 'Program':
                return 'bg-emerald-600/90 text-white border border-emerald-400/30';
            case 'Kegiatan':
                return 'bg-teal-600/90 text-white border border-teal-400/30';
            case 'Informasi':
                return 'bg-amber-500/90 text-white border border-amber-300/30';
            default:
                return 'bg-rose-600/90 text-white border border-rose-400/30';
        }
    };

    const handleDelete = (id, nama) => {
        if (confirm(`Apakah Anda yakin ingin menghapus program "${nama}"?`)) {
            router.delete(route('admin.program-kegiatan.destroy', id));
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            Program & Kegiatan RT
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola jadwal program, kegiatan warga, dan publikasi e-Flyer secara terpadu.
                        </p>
                    </div>
                    <Link
                        href={route('admin.program-kegiatan.create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md hover:shadow-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Buat Program Baru
                    </Link>
                </div>
            }
        >
            <Head title="Program & Kegiatan - Admin" />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="card-residential overflow-hidden bg-gradient-to-br from-white to-emerald-50/40 p-5 border border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Program</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{summary.total_program}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-inner">
                            🗓️
                        </div>
                    </div>
                </div>

                <div className="card-residential overflow-hidden bg-gradient-to-br from-white to-blue-50/40 p-5 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Direncanakan</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{summary.direncanakan}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shadow-inner">
                            ⏳
                        </div>
                    </div>
                </div>

                <div className="card-residential overflow-hidden bg-gradient-to-br from-white to-emerald-50/40 p-5 border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sedang Berjalan</p>
                            <h3 className="text-3xl font-black text-emerald-900 mt-1">{summary.sedang_berjalan}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md">
                            🚀
                        </div>
                    </div>
                </div>

                <div className="card-residential overflow-hidden bg-gradient-to-br from-white to-rose-50/40 p-5 border border-rose-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Total Anggaran</p>
                            <h3 className="text-2xl font-black text-rose-900 mt-1">{formatCurrency(summary.total_anggaran)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shadow-inner">
                            💰
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card-residential p-5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cari Program / Lokasi</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Cari nama program, PIC, atau tempat..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filter Kategori</label>
                        <select
                            value={kategori}
                            onChange={handleKategoriChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition"
                        >
                            <option value="Semua">Semua Kategori</option>
                            {kategoriList.map((kat) => (
                                <option key={kat} value={kat}>{kat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filter Status</label>
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition"
                        >
                            <option value="Semua">Semua Status</option>
                            {statusList.map((st) => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Card-Card Style Grid */}
            {programs.data.length === 0 ? (
                <div className="card-residential p-12 text-center text-gray-500">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-lg font-bold text-gray-700">Belum ada program yang ditemukan</p>
                    <p className="text-sm mt-1">Silakan coba kata kunci lain atau buat program baru dengan tombol di atas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.data.map((program) => (
                        <div
                            key={program.id}
                            className="card-residential overflow-hidden flex flex-col justify-between bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                        >
                            {/* Card Header (Image / Illustration) */}
                            <div>
                                <div className="relative h-48 w-full bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 overflow-hidden">
                                    {program.eflyer_path ? (
                                        <img
                                            src={program.eflyer_path}
                                            alt={program.nama_program}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl mb-2 shadow-lg border border-white/20">
                                                🎪
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                                                RT 05 / RW 08
                                            </span>
                                            <h4 className="text-base font-black leading-snug mt-1 text-white line-clamp-2">
                                                {program.nama_program}
                                            </h4>
                                        </div>
                                    )}

                                    {/* Glassmorphism Overlays for Kategori & Status */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${getKategoriBadge(program.kategori)}`}>
                                            {program.kategori}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(program.status)}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5">
                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                        {program.nama_program}
                                    </h3>

                                    {/* Date & Time */}
                                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                📅
                                            </span>
                                            <span className="font-medium text-gray-800">
                                                {program.tanggal_mulai}
                                                {program.tanggal_selesai ? ` - ${program.tanggal_selesai}` : ''}
                                            </span>
                                        </div>

                                        {program.waktu && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                    ⏰
                                                </span>
                                                <span>{program.waktu}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                                                📍
                                            </span>
                                            <span className="truncate">{program.lokasi}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                                    👤
                                                </span>
                                                <span className="font-semibold">{program.pic_nama}</span>
                                            </div>

                                            {program.pic_kontak && (
                                                <a
                                                    href={`https://wa.me/${program.pic_kontak.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                                                >
                                                    💬 WA
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Budget Badge */}
                                    <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-200/60">
                                        <span className="text-xs text-gray-500 font-medium">Estimasi Anggaran:</span>
                                        <span className="text-xs font-extrabold text-emerald-700">
                                            {formatCurrency(program.estimasi_anggaran)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                                <Link
                                    href={route('admin.program-kegiatan.show', program.id)}
                                    className="flex-1 text-center py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                                >
                                    Detail
                                </Link>
                                <Link
                                    href={route('admin.program-kegiatan.edit', program.id)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(program.id, program.nama_program)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {programs.links && programs.links.length > 3 && (
                <div className="flex justify-center mt-8">
                    <div className="inline-flex rounded-xl shadow-sm bg-white p-1 border border-gray-200">
                        {programs.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
                                        : link.url
                                        ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
