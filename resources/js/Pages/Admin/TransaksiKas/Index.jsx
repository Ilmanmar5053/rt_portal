import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Index({ transaksis, summary, chartData, rekapPemasukan, rekapPengeluaran, filters, tahunList, kategoriPemasukan, kategoriPengeluaran }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [jenis, setJenis] = useState(filters.jenis || 'Semua');
    const [bulan, setBulan] = useState(filters.bulan || 'Semua');
    const [tahun, setTahun] = useState(filters.tahun || 'Semua');
    const [chartMode, setChartMode] = useState('nominal'); // 'nominal' | 'count'
    const [rekapTab, setRekapTab] = useState('pemasukan'); // 'pemasukan' | 'pengeluaran'

    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleFilter = (overrides = {}) => {
        router.get(route('admin.transaksi-kas.index'), {
            search: overrides.search ?? search,
            jenis: overrides.jenis ?? jenis,
            bulan: overrides.bulan ?? bulan,
            tahun: overrides.tahun ?? tahun,
        }, { preserveScroll: true });
    };

    useEffect(() => {
        if (!chartRef.current || !chartData) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const isNominal = chartMode === 'nominal';
        const labels = chartData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const pemasukanValues = isNominal ? chartData.pemasukan_nominal : chartData.pemasukan_count;
        const pengeluaranValues = isNominal ? chartData.pengeluaran_nominal : chartData.pengeluaran_count;

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: isNominal ? 'Pemasukan (Rp)' : 'Pemasukan (Transaksi)',
                        data: pemasukanValues,
                        borderColor: '#059669', // Emerald 600
                        backgroundColor: 'rgba(5, 150, 105, 0.15)',
                        borderWidth: 3,
                        pointStyle: 'circle',
                        pointRadius: 6,
                        pointHoverRadius: 9,
                        pointBackgroundColor: '#059669',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        tension: 0.35,
                        fill: true,
                    },
                    {
                        label: isNominal ? 'Pengeluaran (Rp)' : 'Pengeluaran (Transaksi)',
                        data: pengeluaranValues,
                        borderColor: '#e11d48', // Rose 600
                        backgroundColor: 'rgba(225, 29, 72, 0.1)',
                        borderWidth: 3,
                        pointStyle: 'circle',
                        pointRadius: 6,
                        pointHoverRadius: 9,
                        pointBackgroundColor: '#e11d48',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        tension: 0.35,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                family: 'inherit',
                                size: 12,
                                weight: '600',
                            },
                            padding: 16,
                        },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 10,
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (isNominal) {
                                        label += new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                        }).format(context.parsed.y);
                                    } else {
                                        label += context.parsed.y + ' Transaksi';
                                    }
                                }
                                return label;
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(243, 244, 246, 1)',
                        },
                        ticks: {
                            font: { size: 11 },
                            callback: function (value) {
                                if (isNominal) {
                                    if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + 'Jt';
                                    if (value >= 1000) return 'Rp ' + (value / 1000).toFixed(0) + 'Rb';
                                    return 'Rp ' + value;
                                }
                                return value;
                            },
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            font: { size: 11, weight: '600' },
                        },
                    },
                },
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData, chartMode]);

    const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return (
        <AdminLayout header={<h2 className="text-2xl font-bold text-gray-800">Arus Kas</h2>}>
            <Head title="Transaksi Arus Kas" />

            <div className="space-y-6">
                {/* Banner Informasi Sinkronisasi Kas RT */}
                <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <p className="font-extrabold text-emerald-300 text-sm">Sinkronisasi Otomatis Kas RT</p>
                            <p className="text-gray-300 font-medium mt-0.5">
                                <strong>Saldo Kas Saat Ini</strong> bersumber murni dari akumulasi <strong>Iuran komponen Kas RT (Approved)</strong> + Pemasukan/Pengeluaran Kas RT.
                                Komponen <em>Kebersihan</em> disalurkan ke Pengelola Sampah dan <em>Duka Cita</em> disalurkan ke DKM Masjid (tidak digabung ke Saldo Kas RT).
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap self-end sm:self-center">
                        <span className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-200 font-bold border border-white/15">
                            🧹 Kebersihan: {fmt(summary.total_kebersihan || 0)}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-200 font-bold border border-white/15">
                            🕌 Duka Cita: {fmt(summary.total_duka_cita || 0)}
                        </span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 flex-shrink-0 font-bold">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Pemasukan</p>
                            <p className="text-xl font-black text-emerald-900">{fmt(summary.total_pemasukan)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 font-bold shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-rose-800 font-bold uppercase tracking-wider">Total Pengeluaran</p>
                            <p className="text-xl font-black text-rose-900">{fmt(summary.total_pengeluaran)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-teal-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${summary.saldo_bersih >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-600'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-teal-800 font-bold uppercase tracking-wider">Saldo Bersih (Filter)</p>
                            <p className={`text-xl font-black ${summary.saldo_bersih >= 0 ? 'text-teal-900' : 'text-orange-600'}`}>{fmt(summary.saldo_bersih)}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-rose-900 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white flex-shrink-0 font-bold">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Saldo Kas Saat Ini</p>
                            <p className="text-xl font-black text-white">{fmt(summary.saldo_akhir)}</p>
                        </div>
                    </div>
                </div>

                {/* 2. & 3. Grafik Perbandingan Arus Kas Bulanan & Rekapitulasi Kas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kiri: Grafik Line Chart */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Grafik Perbandingan Arus Kas ({chartData?.year || 2026})
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Pemasukan vs Pengeluaran Kas RT tiap bulan
                                </p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                                <button
                                    type="button"
                                    onClick={() => setChartMode('nominal')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        chartMode === 'nominal'
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Nominal (Rp)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartMode('count')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        chartMode === 'count'
                                            ? 'bg-white text-emerald-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Jumlah Transaksi
                                </button>
                            </div>
                        </div>

                        <div className="h-[280px] w-full relative">
                            <canvas ref={chartRef}></canvas>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                                    <span className="font-semibold">Pemasukan (Masuk)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                                    <span className="font-semibold">Pengeluaran (Keluar)</span>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Line Chart • Point Mark
                            </span>
                        </div>
                    </div>

                    {/* Kanan: Rekapitulasi Arus Kas */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-1">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-900">Rekapitulasi Arus Kas</h3>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setRekapTab('pemasukan')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                            rekapTab === 'pemasukan'
                                                ? 'bg-white text-emerald-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Pemasukan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRekapTab('pengeluaran')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                            rekapTab === 'pengeluaran'
                                                ? 'bg-white text-emerald-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Pengeluaran
                                    </button>
                                </div>
                            </div>

                            {rekapTab === 'pemasukan' ? (
                                <div className="space-y-3">
                                    {rekapPemasukan && rekapPemasukan.length > 0 ? (
                                        rekapPemasukan.map((item, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:bg-emerald-50/40 transition-colors">
                                                <div>
                                                    <div className="text-xs font-bold text-gray-800">{item.kategori}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {item.total_transaksi} Transaksi Pemasukan
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-extrabold text-emerald-700">{formatCurrency(item.total_nominal)}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-6">Belum ada rekap pemasukan</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rekapPengeluaran && rekapPengeluaran.length > 0 ? (
                                        rekapPengeluaran.map((item, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:bg-rose-50/40 transition-colors">
                                                <div>
                                                    <div className="text-xs font-bold text-gray-800">{item.kategori}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {item.total_transaksi} Transaksi Pengeluaran
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-extrabold text-rose-700">{formatCurrency(item.total_nominal)}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-6">Belum ada rekap pengeluaran</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between items-center">
                            <span>Total Surplus/Defisit</span>
                            <span className={`font-bold ${summary.saldo_bersih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {formatCurrency(summary.saldo_bersih)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters + Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
                        <div className="flex flex-wrap gap-3 flex-1">
                            <input
                                type="text"
                                placeholder="Cari keterangan..."
                                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            />
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white" value={jenis}
                                onChange={(e) => { setJenis(e.target.value); handleFilter({ jenis: e.target.value }); }}>
                                <option value="Semua">Semua Jenis</option>
                                <option value="Pemasukan">Pemasukan</option>
                                <option value="Pengeluaran">Pengeluaran</option>
                            </select>
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white" value={bulan}
                                onChange={(e) => { setBulan(e.target.value); handleFilter({ bulan: e.target.value }); }}>
                                <option value="Semua">Semua Bulan</option>
                                {bulanNames.slice(1).map((b, i) => (
                                    <option key={i + 1} value={i + 1}>{b}</option>
                                ))}
                            </select>
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white" value={tahun}
                                onChange={(e) => { setTahun(e.target.value); handleFilter({ tahun: e.target.value }); }}>
                                <option value="Semua">Semua Tahun</option>
                                {tahunList.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <Link
                            href={route('admin.transaksi-kas.create')}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Catat Transaksi
                        </Link>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <h3 className="font-bold text-gray-800">Buku Kas — Riwayat Transaksi</h3>
                        <span className="ml-auto text-xs text-gray-500">{transaksis.total} transaksi</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Keterangan</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wide">Debet (Masuk)</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-red-600 uppercase tracking-wide">Kredit (Keluar)</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Saldo</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transaksis.data && transaksis.data.length > 0 ? (
                                    transaksis.data.map((item) => (
                                        <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${item.jenis === 'Pemasukan' ? 'border-l-4 border-l-emerald-300' : 'border-l-4 border-l-red-300'}`}>
                                            <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-medium text-gray-900">{item.keterangan}</div>
                                                {item.referensi && <div className="text-xs text-gray-400 mt-0.5">Ref: {item.referensi}</div>}
                                                {item.creator && <div className="text-xs text-gray-400">oleh {item.creator.name}</div>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.jenis === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {item.jenis === 'Pemasukan' ? (
                                                    <span className="text-emerald-600 font-semibold text-sm">+{fmt(item.jumlah)}</span>
                                                ) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {item.jenis === 'Pengeluaran' ? (
                                                    <span className="text-red-600 font-semibold text-sm">-{fmt(item.jumlah)}</span>
                                                ) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`text-sm font-bold ${item.saldo_setelah >= 0 ? 'text-gray-800' : 'text-red-700'}`}>
                                                    {fmt(item.saldo_setelah)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={route('admin.transaksi-kas.edit', item.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => { if (confirm(`Hapus transaksi "${item.keterangan}"?`)) router.delete(route('admin.transaksi-kas.destroy', item.id)); }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-16 text-center">
                                            <div className="text-4xl mb-3">📂</div>
                                            <p className="text-gray-500 font-medium">Belum ada transaksi</p>
                                            <Link href={route('admin.transaksi-kas.create')} className="mt-3 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                + Catat Transaksi Pertama
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transaksis.links && transaksis.total > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Menampilkan {transaksis.from}–{transaksis.to} dari {transaksis.total} transaksi
                            </p>
                            <div className="flex gap-1">
                                {transaksis.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${link.active ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
