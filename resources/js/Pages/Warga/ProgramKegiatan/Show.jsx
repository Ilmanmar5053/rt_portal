import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import WargaLayout from '@/Layouts/WargaLayout';
import { getNamaRt } from '@/Utils/profilHelper';

export default function Show({ program }) {
    const { profil } = usePage().props;
    const namaRt = getNamaRt(profil);
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
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-bold bg-emerald-500 text-white shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                        Sedang Berjalan
                    </span>
                );
            case 'Direncanakan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Direncanakan
                    </span>
                );
            case 'Selesai':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Selesai
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-200">
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Link
                            href={route('warga.program-kegiatan.index')}
                            className="text-xs font-bold text-emerald-700 hover:underline mb-1 inline-block"
                        >
                            ← Kembali ke Daftar Program
                        </Link>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            Detail Program & Kegiatan Warga
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`${program.nama_program} - Warga`} />

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: e-Flyer / Poster */}
                <div className="lg:col-span-1">
                    <div className="card-residential overflow-hidden p-4 bg-white border border-gray-200/80">
                        <h3 className="text-xs font-extrabold uppercase text-gray-500 mb-3 tracking-wider">
                            e-Flyer / Poster Program
                        </h3>
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-950 aspect-[4/5] flex items-center justify-center">
                            {program.eflyer_path ? (
                                <img
                                    src={program.eflyer_path}
                                    alt={program.nama_program}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-6 text-white">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl mx-auto mb-3 border border-white/20">
                                        🎪
                                    </div>
                                    <p className="text-xs text-emerald-200 font-semibold uppercase tracking-widest">
                                        {namaRt}
                                    </p>
                                    <h4 className="text-sm font-black mt-2 text-white">
                                        {program.nama_program}
                                    </h4>
                                    <p className="text-xs text-emerald-300 mt-2">
                                        Belum ada poster khusus
                                    </p>
                                </div>
                            )}
                        </div>

                        {program.eflyer_path && (
                            <a
                                href={program.eflyer_path}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 w-full block text-center py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition"
                            >
                                📥 Lihat e-Flyer Ukuran Penuh
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Complete Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-residential p-6 sm:p-8 bg-white space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${getKategoriBadge(program.kategori)}`}>
                                    {program.kategori}
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                                    {program.nama_program}
                                </h1>
                            </div>
                            <div>{getStatusBadge(program.status)}</div>
                        </div>

                        {/* Date, Time, Location Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Tanggal</p>
                                <p className="text-sm font-extrabold text-gray-900 mt-1">
                                    {program.tanggal_mulai}
                                    {program.tanggal_selesai ? ` - ${program.tanggal_selesai}` : ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Waktu</p>
                                <p className="text-sm font-extrabold text-gray-900 mt-1">
                                    {program.waktu || 'Tidak ditentukan'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Lokasi</p>
                                <p className="text-sm font-extrabold text-gray-900 mt-1">
                                    {program.lokasi}
                                </p>
                            </div>
                        </div>

                        {/* PIC & Budget Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 pt-5">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">PIC Penanggung Jawab</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                                            👤
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">{program.pic_nama}</p>
                                            <p className="text-xs text-gray-500">{program.pic_kontak || 'Tanpa no. WA'}</p>
                                        </div>
                                    </div>
                                    {program.pic_kontak && (
                                        <a
                                            href={`https://wa.me/${program.pic_kontak.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm transition"
                                        >
                                            💬 Chat PIC
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Anggaran Program</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Estimasi Biaya:</span>
                                        <span className="font-extrabold text-emerald-700">{formatCurrency(program.estimasi_anggaran)}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        *Anggaran dikelola secara transparan oleh bendahara dan pengurus RT.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t border-gray-100 pt-5">
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-700 mb-2">
                                Deskripsi & Rincian Kegiatan
                            </h4>
                            {program.deskripsi ? (
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {program.deskripsi}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    Belum ada deskripsi mendetail untuk kegiatan ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </WargaLayout>
    );
}
