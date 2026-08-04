import React, { useState, useMemo } from 'react';
import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import PaymentModal from '@/Components/PaymentModal';
import { getNamaRt } from '@/Utils/profilHelper';

export default function Index({ iurans, filters, warga }) {
    const { profil } = usePage().props;
    const namaRt = getNamaRt(profil);
    const [expandedPeriods, setExpandedPeriods] = useState({});
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, tagihanInfo: null });

    const bulanNamesFull = [
        '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const getJenisIcon = (nama) => {
        const lower = (nama || '').toLowerCase();
        if (lower.includes('sampah') || lower.includes('kebersihan')) return '🧹';
        if (lower.includes('duka') || lower.includes('cita')) return '🕊️';
        if (lower.includes('kas') || lower.includes('rt')) return '🏛️';
        if (lower.includes('keamanan') || lower.includes('ronda')) return '🛡️';
        if (lower.includes('wajib')) return '📋';
        return '💰';
    };

    const statusColor = (status) => {
        switch (status) {
            case 'Approved': 
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold';
            case 'Pending': 
                return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold';
            case 'Rejected': 
                return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold';
            default: 
                return 'bg-gray-100 text-gray-800 font-bold';
        }
    };

    const getGroupStatus = (items) => {
        if (items.every((i) => i.status_pembayaran === 'Approved')) {
            return { 
                label: 'Approved (Lunas)', 
                color: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold' 
            };
        }
        if (items.some((i) => i.status_pembayaran === 'Rejected')) {
            return { 
                label: 'Rejected (Perlu Perhatian)', 
                color: 'bg-rose-100 text-rose-800 border border-rose-200 font-bold' 
            };
        }
        return { 
            label: 'Pending (Belum Lunas)', 
            color: 'bg-amber-100 text-amber-800 border border-amber-200 font-bold' 
        };
    };

    // Grouping data berdasarkan Periode (Tahun - Bulan)
    const groupedPeriods = useMemo(() => {
        if (!iurans || !iurans.data || !Array.isArray(iurans.data) || iurans.data.length === 0) return [];

        const groups = {};
        iurans.data.forEach((item) => {
            const key = `${item.periode_tahun}-${item.periode_bulan}`;
            if (!groups[key]) {
                groups[key] = {
                    key,
                    tahun: item.periode_tahun,
                    bulan: item.periode_bulan,
                    items: [],
                    totalAmount: 0,
                };
            }
            groups[key].items.push(item);
            groups[key].totalAmount += Number(item.jumlah_bayar) || 0;
        });

        return Object.values(groups).sort((a, b) => {
            if (b.tahun !== a.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
        });
    }, [iurans]);

    const togglePeriod = (key) => {
        setExpandedPeriods((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleAllPeriods = () => {
        const allExpanded = groupedPeriods.length > 0 && groupedPeriods.every(g => expandedPeriods[g.key]);
        const nextState = {};
        if (!allExpanded) {
            groupedPeriods.forEach(g => { nextState[g.key] = true; });
        }
        setExpandedPeriods(nextState);
    };

    return (
        <WargaLayout header="Riwayat Iuran Kas Keluarga (Per KK)">
            <Head title="Iuran Keluarga (KK)" />

            {/* Banner Info Ringkas */}
            <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                            <span>💡</span> Mode Ringkas (Collapse / Expand)
                        </span>
                        <h3 className="text-xl font-extrabold tracking-tight">
                            Tagihan Iuran Kas Bulanan Per KK
                        </h3>
                        <p className="text-sm text-emerald-100 mt-1 max-w-xl">
                            Untuk menghemat ruang, setiap periode bulan diringkas menjadi 1 baris. Klik tombol <span className="font-bold underline">Show All (Lihat Komponen)</span> untuk membuka detail tagihan per komponen.
                        </p>
                    </div>
                    {groupedPeriods.length > 0 && (
                        <button
                            onClick={toggleAllPeriods}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-extrabold shadow-md transition-all shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                            {groupedPeriods.every(g => expandedPeriods[g.key]) ? 'Tutup Semua Periode' : 'Buka Semua (Show All)'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabel Utama Riwayat Iuran */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-5 py-4 text-center text-xs font-extrabold text-gray-500 uppercase tracking-wider w-14">
                                    No.
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                                    Periode Bulan
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                                    Komponen Iuran
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                                    Total Tagihan
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                                    Status Keseluruhan
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider w-40">
                                    Aksi / Rincian
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {groupedPeriods.length > 0 ? (
                                groupedPeriods.map((group, index) => {
                                    const isExpanded = !!expandedPeriods[group.key];
                                    const statusGroup = getGroupStatus(group.items);

                                    return (
                                        <React.Fragment key={group.key}>
                                            {/* Baris Utama Periode Bulan (Ringkas 1 Baris) */}
                                            <tr 
                                                className={`hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                                                    isExpanded ? 'bg-emerald-50/30 font-semibold' : ''
                                                }`}
                                                onClick={() => togglePeriod(group.key)}
                                            >
                                                {/* No. Urut */}
                                                <td className="px-5 py-4 text-center text-sm font-extrabold text-gray-500">
                                                    {index + 1}
                                                </td>

                                                {/* Periode */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
                                                            📅
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-extrabold text-gray-900">
                                                                {bulanNamesFull[group.bulan]} {group.tahun}
                                                            </div>
                                                            <div className="text-[11px] font-bold text-gray-400">
                                                                Periode ke-{group.bulan} Tahun {group.tahun}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Komponen */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs">
                                                            {group.items.length} Komponen
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {group.items.map((item, idx) => (
                                                                <span 
                                                                    key={idx} 
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-medium"
                                                                >
                                                                    <span>{getJenisIcon(item.jenis_iuran)}</span>
                                                                    <span>{item.jenis_iuran}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Total Tagihan */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-black text-emerald-700">
                                                        Rp {group.totalAmount.toLocaleString('id-ID')}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 font-medium">
                                                        Akumulasi bulan ini
                                                    </div>
                                                </td>

                                                {/* Status Keseluruhan */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs ${statusGroup.color}`}>
                                                        {statusGroup.label}
                                                    </span>
                                                </td>

                                                {/* Tombol Collapse / Expand */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePeriod(group.key)}
                                                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                                                                isExpanded
                                                                    ? 'bg-gray-800 text-white hover:bg-gray-900'
                                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                            }`}
                                                        >
                                                            <span>{isExpanded ? 'Tutup Detail' : 'Show All'}</span>
                                                            <svg 
                                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>

                                                        {statusGroup.label !== 'Approved' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPaymentModal({
                                                                    isOpen: true,
                                                                    tagihanInfo: {
                                                                        periode: `${bulanNamesFull[group.bulan]} ${group.tahun}`,
                                                                        total: group.totalAmount
                                                                    }
                                                                })}
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                                                                title="Lihat Info Pembayaran / Rekening"
                                                            >
                                                                <span>💳</span>
                                                                <span>Pembayaran</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Baris Rincian Komponen (Muncul Saat Expanded / Show All) */}
                                            {isExpanded && (
                                                <tr className="bg-emerald-50/20 border-b border-emerald-100/50">
                                                    <td colSpan="6" className="px-6 py-5">
                                                        <div className="bg-white rounded-xl border border-emerald-200/70 p-4 shadow-inner">
                                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                                                    <span>📑</span>
                                                                    <span>Rincian Tagihan Periode {bulanNamesFull[group.bulan]} {group.tahun}</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-emerald-700">
                                                                    Total: Rp {group.totalAmount.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                {group.items.map((item) => (
                                                                    <div 
                                                                        key={item.id} 
                                                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-emerald-50/40 border border-gray-200/70 transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-2.5">
                                                                            <span className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-base shrink-0">
                                                                                {getJenisIcon(item.jenis_iuran)}
                                                                            </span>
                                                                            <div>
                                                                                <div className="text-xs font-extrabold text-gray-800">
                                                                                    {item.jenis_iuran}
                                                                                </div>
                                                                                <div className="text-[11px] font-bold text-emerald-700">
                                                                                    Rp {Number(item.jumlah_bayar).toLocaleString('id-ID')}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] ${statusColor(item.status_pembayaran)}`}>
                                                                                {item.status_pembayaran}
                                                                            </span>
                                                                            {item.status_pembayaran !== 'Approved' && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setPaymentModal({
                                                                                        isOpen: true,
                                                                                        tagihanInfo: {
                                                                                            periode: `${item.jenis_iuran} (${bulanNamesFull[group.bulan]} ${group.tahun})`,
                                                                                            total: item.jumlah_bayar
                                                                                        }
                                                                                    })}
                                                                                    className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1 transition-all"
                                                                                >
                                                                                    <span>💳</span>
                                                                                    <span>Bayar</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        Belum ada riwayat iuran kas untuk keluarga Anda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Informasi Pagination & Status */}
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/40">
                    <span className="text-xs font-medium text-gray-500">
                        Menampilkan {groupedPeriods.length} periode bulan ({iurans.total || 0} total komponen iuran)
                    </span>
                    {iurans.links && iurans.links.length > 3 && (
                        <div className="flex space-x-1">
                            {iurans.links.map((link, i) => (
                                <Link 
                                    key={i} 
                                    href={link.url || '#'} 
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                        link.active 
                                            ? 'bg-emerald-700 text-white font-extrabold shadow-sm' 
                                            : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold border border-gray-200/80'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`} 
                                    dangerouslySetInnerHTML={{ __html: link.label }} 
                                    preserveScroll 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, tagihanInfo: null })}
                profil={profil}
                tagihanInfo={paymentModal.tagihanInfo}
                namaRt={namaRt}
            />
        </WargaLayout>
    );
}
