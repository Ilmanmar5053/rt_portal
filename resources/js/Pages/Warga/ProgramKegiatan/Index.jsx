import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import WargaLayout from '@/Layouts/WargaLayout';
import { getNamaRt } from '@/Utils/profilHelper';

// ─── Countdown Hook
function useCountdown(tanggalSelesai, tanggalMulai) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const targetDate = tanggalSelesai || tanggalMulai;
        if (!targetDate) return;

        const d = new Date(targetDate);
        if (!isNaN(d.getTime())) {
            d.setHours(23, 59, 59, 999);
        }
        const end = d.getTime();

        const tick = () => {
            const now = Date.now();
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
                return;
            }
            setTimeLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [tanggalSelesai, tanggalMulai]);

    return timeLeft;
}

function CountdownBadge({ tanggalSelesai, tanggalMulai, status }) {
    const t = useCountdown(tanggalSelesai, tanggalMulai);
    if (!t) return null;
    if (t.expired || status === 'Selesai') {
        return (
            <div className="mt-1.5 px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold text-center">
                ⏱ Berakhir / Selesai
            </div>
        );
    }
    return (
        <div className="mt-1.5 rounded-lg bg-emerald-950/90 border border-emerald-600/40 px-2 py-1.5">
            <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider text-center mb-1">⏱ Sisa Waktu</div>
            <div className="flex items-center justify-center gap-1">
                {[{v:t.d,l:'H'},{v:t.h,l:'J'},{v:t.m,l:'M'},{v:t.s,l:'D'}].map(({v,l})=>(
                    <div key={l} className="flex flex-col items-center">
                        <span className="bg-emerald-700 text-white font-black text-xs w-7 h-6 flex items-center justify-center rounded-md tabular-nums shadow">{String(v).padStart(2,'0')}</span>
                        <span className="text-emerald-400 text-[8px] font-bold mt-0.5">{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Index({ programs, filters, kategoriList, statusList }) {
    const { profil } = usePage().props;
    const namaRt = getNamaRt(profil);
    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || 'Semua');
    const [status, setStatus] = useState(filters.status || 'Semua');

    const handleFilter = (newSearch, newKategori, newStatus) => {
        router.get(
            route('warga.program-kegiatan.index'),
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

    const formatDate = (raw) => {
        if (!raw) return null;
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        const dd   = String(d.getDate()).padStart(2, '0');
        const mm   = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const HH   = String(d.getHours()).padStart(2, '0');
        const MM   = String(d.getMinutes()).padStart(2, '0');
        const SS   = String(d.getSeconds()).padStart(2, '0');
        return `${dd}-${mm}-${yyyy} | ${HH}:${MM}:${SS}`;
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

    return (
        <WargaLayout
            header={
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        Program & Kegiatan Warga {namaRt}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Informasi lengkap agenda, acara lingkungan, serta program kerja pengurus RT untuk seluruh warga.
                    </p>
                </div>
            }
        >
            <Head title="Program & Kegiatan - Warga" />

            {/* Welcome atmospheric banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-rose-900 rounded-3xl p-6 sm:p-7 shadow-lg shadow-emerald-900/10 text-white relative overflow-hidden mb-8">
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-bold mb-3 border border-white/20">
                        <span>✨ Transparansi & Publikasi RT</span>
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                        Mari Bergotong Royong & Ikuti Kegiatan Lingkungan Kita
                    </h3>
                    <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                        Pengurus RT senantiasa berupaya merencanakan kegiatan sosial, keamanan, dan kebersihan yang bermanfaat. Pantau jadwal dan hubungi penanggung jawab (PIC) jika Anda ingin berkontribusi!
                    </p>
                </div>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
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

            {/* Card-Card Style Grid — 5 per row */}
            {programs.data.length === 0 ? (
                <div className="card-residential p-12 text-center text-gray-500">
                    <div className="text-5xl mb-3">💭</div>
                    <p className="text-lg font-bold text-gray-700">Belum ada kegiatan yang sesuai</p>
                    <p className="text-sm mt-1">Silakan coba kata kunci atau filter status yang lain.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {programs.data.map((program) => {
                        const isBerjalan = program.status === 'Sedang Berjalan';
                        return (
                        <div
                            key={program.id}
                            className={`group bg-white rounded-2xl overflow-hidden flex flex-col border-2 transition-all duration-300 ease-out
                                hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.025] cursor-pointer
                                ${isBerjalan ? 'border-emerald-400 shadow-md shadow-emerald-100' : 'border-gray-100 shadow-sm hover:border-emerald-200'}`}
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
                                                {namaRt}
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

                                    {/* Countdown for all active/planned events */}
                                    {program.status !== 'Dibatalkan' && (
                                        <CountdownBadge tanggalSelesai={program.tanggal_selesai} tanggalMulai={program.tanggal_mulai} status={program.status} />
                                    )}

                                    {/* Date & Time */}
                                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                📅
                                            </span>
                                            <span className="font-medium text-gray-800">
                                                {formatDate(program.tanggal_mulai)}
                                                {program.tanggal_selesai ? (
                                                    <>
                                                        <br />
                                                        <span className="text-gray-400">→</span> {formatDate(program.tanggal_selesai)}
                                                    </>
                                                ) : null}
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
                                                    💬 Hubungi PIC
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
                            <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100">
                                <Link
                                    href={route('warga.program-kegiatan.show', program.id)}
                                    className="w-full block text-center py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-sm transition"
                                >
                                    Lihat Detail & e-Flyer →
                                </Link>
                            </div>
                        </div>
                        );
                    })}
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
        </WargaLayout>
    );
}
