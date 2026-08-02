import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdown(tanggalSelesai) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!tanggalSelesai) return;
        const end = new Date(tanggalSelesai).getTime();

        const tick = () => {
            const now = Date.now();
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
                return;
            }
            const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({ days, hours, minutes, seconds, expired: false });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [tanggalSelesai]);

    return timeLeft;
}

// ─── Countdown Badge ──────────────────────────────────────────────────────────
function CountdownBadge({ tanggalSelesai }) {
    const t = useCountdown(tanggalSelesai);
    if (!t) return null;

    if (t.expired) {
        return (
            <div className="w-full mt-1.5 px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold text-center">
                ⏱ Berakhir
            </div>
        );
    }

    return (
        <div className="w-full mt-1.5 rounded-lg bg-emerald-950/90 border border-emerald-600/40 px-2 py-1.5">
            <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider text-center mb-1">⏱ Sisa Waktu</div>
            <div className="flex items-center justify-center gap-1">
                {[
                    { v: t.days,    l: 'H' },
                    { v: t.hours,   l: 'J' },
                    { v: t.minutes, l: 'M' },
                    { v: t.seconds, l: 'D' },
                ].map(({ v, l }) => (
                    <div key={l} className="flex flex-col items-center">
                        <span className="bg-emerald-700 text-white font-black text-xs w-7 h-6 flex items-center justify-center rounded-md tabular-nums leading-none shadow">
                            {String(v).padStart(2, '0')}
                        </span>
                        <span className="text-emerald-400 text-[8px] font-bold mt-0.5">{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Status & Kategori helpers ────────────────────────────────────────────────
const statusBadgeConfig = {
    'Sedang Berjalan': { cls: 'bg-emerald-500 text-white',         dot: true  },
    'Direncanakan':    { cls: 'bg-blue-100 text-blue-800 border border-blue-200',    dot: false },
    'Selesai':         { cls: 'bg-purple-100 text-purple-800 border border-purple-200', dot: false },
    'Dibatalkan':      { cls: 'bg-rose-100 text-rose-800 border border-rose-200',    dot: false },
};

function StatusBadge({ status }) {
    const cfg = statusBadgeConfig[status] || { cls: 'bg-gray-100 text-gray-700', dot: false };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${cfg.cls}`}>
            {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {status}
        </span>
    );
}

const kategoriBadge = {
    'Program':   'bg-emerald-600/90 text-white',
    'Kegiatan':  'bg-teal-600/90 text-white',
    'Informasi': 'bg-amber-500/90 text-white',
    'Lain-lain': 'bg-rose-600/90 text-white',
};

// ─── Compact Program Card ─────────────────────────────────────────────────────
function ProgramCard({ program, formatCurrency, handleDelete }) {
    const isBerjalan = program.status === 'Sedang Berjalan';

    return (
        <div className={`
            group relative bg-white rounded-2xl overflow-hidden flex flex-col
            border-2 transition-all duration-300 ease-out cursor-pointer
            hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.025]
            ${isBerjalan
                ? 'border-emerald-400 shadow-md shadow-emerald-100'
                : 'border-gray-100 shadow-sm hover:border-emerald-200'}
        `}>

            {/* ── Image / Header ── */}
            <div className="relative h-36 overflow-hidden flex-shrink-0">
                {program.eflyer_path ? (
                    <img
                        src={program.eflyer_path}
                        alt={program.nama_program}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className={`
                        absolute inset-0 flex flex-col items-center justify-center p-3 text-white text-center
                        ${isBerjalan
                            ? 'bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-800'
                            : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'
                        }
                    `}>
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl mb-1 shadow-lg border border-white/20 transition-transform duration-300 group-hover:scale-110">
                            🎪
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-200">RT 05 / RW 08</span>
                        <h4 className="text-xs font-black leading-tight mt-1 text-white line-clamp-2">
                            {program.nama_program}
                        </h4>
                    </div>
                )}

                {/* Kategori badge */}
                <div className="absolute top-2 left-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md shadow ${kategoriBadge[program.kategori] || 'bg-rose-600/90 text-white'}`}>
                        {program.kategori}
                    </span>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                    <StatusBadge status={program.status} />
                </div>

                {/* Sedang berjalan glow border */}
                {isBerjalan && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/40 rounded-t-2xl" />
                )}
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col flex-1 px-3 pt-2.5 pb-1">

                {/* Title */}
                <h3 className="text-sm font-black text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight min-h-[2.5rem]">
                    {program.nama_program}
                </h3>

                {/* Countdown for ongoing events */}
                {isBerjalan && (
                    <CountdownBadge tanggalSelesai={program.tanggal_selesai} />
                )}

                {/* Meta info */}
                <div className="mt-2 space-y-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] flex-shrink-0">📅</span>
                        <span className="truncate font-medium text-gray-700">
                            {program.tanggal_mulai}
                            {program.tanggal_selesai ? ` — ${program.tanggal_selesai}` : ''}
                        </span>
                    </div>

                    {program.waktu && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] flex-shrink-0">⏰</span>
                            <span className="truncate">{program.waktu}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] flex-shrink-0">📍</span>
                        <span className="truncate">{program.lokasi}</span>
                    </div>
                </div>

                {/* PIC + Budget */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[10px]">👤</span>
                        <span className="text-[10px] font-semibold text-gray-600 truncate">{program.pic_nama}</span>
                    </div>
                    {program.pic_kontak && (
                        <a
                            href={`https://wa.me/${program.pic_kontak.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition"
                        >
                            💬 WA
                        </a>
                    )}
                </div>

                {/* Budget */}
                <div className="mt-1.5 mb-2 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                    <span className="text-[9px] text-gray-400 font-medium">Anggaran</span>
                    <span className="text-[10px] font-extrabold text-emerald-700">{formatCurrency(program.estimasi_anggaran)}</span>
                </div>
            </div>

            {/* ── Footer Actions ── */}
            <div className="px-3 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center gap-1.5">
                <Link
                    href={route('admin.program-kegiatan.show', program.id)}
                    className="flex-1 text-center py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition"
                >
                    Detail
                </Link>
                <Link
                    href={route('admin.program-kegiatan.edit', program.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-sm transition"
                >
                    Edit
                </Link>
                <button
                    type="button"
                    onClick={() => handleDelete(program.id, program.nama_program)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-sm transition"
                >
                    Hapus
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index({ programs, summary, filters, kategoriList, statusList }) {
    const [search, setSearch]   = useState(filters.search   || '');
    const [kategori, setKategori] = useState(filters.kategori || 'Semua');
    const [status, setStatus]   = useState(filters.status   || 'Semua');

    const handleFilter = (ns, nk, nst) => {
        router.get(
            route('admin.program-kegiatan.index'),
            { search: ns, kategori: nk, status: nst },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchChange  = (e) => { setSearch(e.target.value);    handleFilter(e.target.value, kategori, status); };
    const handleKategoriChange= (e) => { setKategori(e.target.value);  handleFilter(search, e.target.value, status); };
    const handleStatusChange  = (e) => { setStatus(e.target.value);    handleFilter(search, kategori, e.target.value); };

    const formatCurrency = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
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
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Program &amp; Kegiatan RT</h2>
                        <p className="text-sm text-gray-600 mt-1">Kelola jadwal program, kegiatan warga, dan publikasi e-Flyer secara terpadu.</p>
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

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Program',    value: summary.total_program,    color: 'emerald', icon: '🗓️', textColor: 'text-gray-900' },
                    { label: 'Direncanakan',     value: summary.direncanakan,     color: 'blue',    icon: '⏳', textColor: 'text-gray-900' },
                    { label: 'Sedang Berjalan',  value: summary.sedang_berjalan,  color: 'emerald', icon: '🚀', textColor: 'text-emerald-900', bold: true },
                    { label: 'Total Anggaran',   value: formatCurrency(summary.total_anggaran), color: 'rose', icon: '💰', textColor: 'text-rose-900', isText: true },
                ].map(({ label, value, color, icon, textColor, bold, isText }) => (
                    <div key={label} className={`card-residential p-4 bg-gradient-to-br from-white to-${color}-50/40 border border-${color}-100 overflow-hidden`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-wider text-${color}-700`}>{label}</p>
                                <h3 className={`${isText ? 'text-lg' : 'text-3xl'} font-black mt-1 ${textColor} ${bold ? 'text-emerald-800' : ''}`}>{value}</h3>
                            </div>
                            <div className={`w-11 h-11 rounded-2xl bg-${color}-100 flex items-center justify-center text-xl shadow-inner`}>{icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filter Bar ── */}
            <div className="card-residential p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cari Program / Lokasi</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Cari nama program, PIC, atau tempat..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Filter Kategori</label>
                        <select value={kategori} onChange={handleKategoriChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                            <option value="Semua">Semua Kategori</option>
                            {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Filter Status</label>
                        <select value={status} onChange={handleStatusChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                            <option value="Semua">Semua Status</option>
                            {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Info row ── */}
            {programs.total > 0 && (
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                    <span>
                        Menampilkan <strong className="text-gray-800">{programs.from}–{programs.to}</strong> dari <strong className="text-gray-800">{programs.total}</strong> program
                    </span>
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold px-3 py-1 rounded-full">
                        Halaman {programs.current_page} / {programs.last_page}
                    </span>
                </div>
            )}

            {/* ── Card Grid — 5 columns ── */}
            {programs.data.length === 0 ? (
                <div className="card-residential p-16 text-center text-gray-500">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-lg font-bold text-gray-700">Belum ada program yang ditemukan</p>
                    <p className="text-sm mt-1">Silakan coba kata kunci lain atau buat program baru.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {programs.data.map((program) => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            formatCurrency={formatCurrency}
                            handleDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {programs.links && programs.links.length > 3 && (
                <div className="flex justify-center mt-8">
                    <div className="inline-flex rounded-xl shadow-sm bg-white p-1 border border-gray-200 gap-0.5">
                        {programs.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
                                        : link.url
                                            ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                            : 'text-gray-300 cursor-not-allowed'
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
