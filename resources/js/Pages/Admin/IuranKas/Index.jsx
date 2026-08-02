import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function Index({ iurans, summary, chartData, rekapJenis, rekapBlok, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'Semua');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [processingBulk, setProcessingBulk] = useState(false);
    const [chartMode, setChartMode] = useState('nominal'); // 'nominal' | 'count'
    const [rekapTab, setRekapTab] = useState('jenis'); // 'jenis' | 'blok'

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

    useEffect(() => {
        if (!chartRef.current || !chartData) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const isNominal = chartMode === 'nominal';
        const labels = chartData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const lunasValues = isNominal ? chartData.lunas_nominal : chartData.lunas_count;
        const belumValues = isNominal ? chartData.belum_lunas_nominal : chartData.belum_lunas_count;

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: isNominal ? 'Iuran Lunas (Rp)' : 'Iuran Lunas (Transaksi)',
                        data: lunasValues,
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
                        label: isNominal ? 'Belum Lunas / Pending (Rp)' : 'Belum Lunas / Pending (Transaksi)',
                        data: belumValues,
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

    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';

    // Reset selection on data change
    useEffect(() => {
        setSelectedIds([]);
    }, [iurans.data]);

    const allIds = iurans.data.map((i) => i.id);
    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

    const toggleSelectAll = () => {
        setSelectedIds(isAllSelected ? [] : [...allIds]);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.iuran.index'), { search, status, sort_field: field, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.iuran.index'), { search, status, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true, replace: true });
    };

    const handleBulkAction = () => {
        if (!bulkAction || selectedIds.length === 0) return;

        const labels = { approve: 'Tandai Lunas', reject: 'Tandai Rejected', delete: 'Hapus' };
        if (!confirm(`Lakukan aksi "${labels[bulkAction]}" pada ${selectedIds.length} data yang dipilih?`)) return;

        setProcessingBulk(true);
        router.post(route('admin.iuran.bulk-action'), {
            action: bulkAction,
            ids: selectedIds,
        }, {
            onSuccess: () => {
                setSelectedIds([]);
                setBulkAction('');
                setProcessingBulk(false);
            },
            onError: () => setProcessingBulk(false),
        });
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const generateForm = useForm({
        jenis_iuran: 'Wajib',
        periode_bulan: new Date().getMonth() + 1,
        periode_tahun: new Date().getFullYear(),
        jumlah_bayar: 100000,
    });

    const handleGenerate = (e) => {
        e.preventDefault();
        generateForm.post(route('admin.iuran.generate'), {
            onSuccess: () => setShowGenerateModal(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('admin.iuran.destroy', id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
            case 'Pending': return 'bg-teal-100 text-teal-800 border-teal-200 font-bold';
            case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 font-bold';
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Iuran Kas</h2>}>
            <Head title="Iuran Kas" />

            <div className="space-y-5">
                {flash?.success && (
                    <div className="p-4 text-sm text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 font-bold">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        {flash.success}
                    </div>
                )}

                {/* 1. Dashboard Cards Summary (Berdasarkan Filter) */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Total Nominal Iuran */}
                        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Total Nominal Iuran</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-gray-900 tracking-tight">
                                {formatCurrency(summary.total_nominal)}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                <span>Dari {summary.total_data || 0} transaksi terpilih</span>
                            </div>
                        </div>

                        {/* Card 2: Iuran Lunas (Approved) */}
                        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Iuran Lunas (Approved)</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-emerald-900 tracking-tight">
                                {formatCurrency(summary.nominal_lunas)}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs font-bold text-gray-600">
                                <span>{summary.warga_lunas || 0} KK Lunas</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">{summary.total_data_lunas || 0} Transaksi</span>
                            </div>
                        </div>

                        {/* Card 3: Belum Lunas (Pending / Rejected) */}
                        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Belum Lunas / Tertunda</span>
                                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-rose-900 tracking-tight">
                                {formatCurrency(summary.nominal_belum_lunas)}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs font-bold text-gray-600">
                                <span>{summary.warga_belum_lunas || 0} KK Belum</span>
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold">{summary.total_data_belum_lunas || 0} Transaksi</span>
                            </div>
                        </div>

                        {/* Card 4: Tingkat Pembayaran */}
                        <div className="bg-white rounded-2xl p-5 border border-teal-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">Tingkat Lunas</span>
                                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-teal-900 tracking-tight">
                                {((summary.total_data > 0 ? (summary.total_data_lunas / summary.total_data) * 100 : 0)).toFixed(1)}%
                            </div>
                            <div className="mt-2.5 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-600 to-teal-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(summary.total_data > 0 ? (summary.total_data_lunas / summary.total_data) * 100 : 0)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. & 3. Grafik Perbandingan Bulanan & Rekapitulasi Iuran */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kiri: Grafik Line Chart */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Grafik Perbandingan Iuran Kas ({chartData?.year || 2026})
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Penerimaan iuran Lunas vs Belum Lunas tiap bulan
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
                                    <span className="font-semibold">Lunas (Approved)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                                    <span className="font-semibold">Belum Lunas (Pending/Rejected)</span>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Line Chart • Point Mark
                            </span>
                        </div>
                    </div>

                    {/* Kanan: Rekapitulasi Kas Relevan */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-1">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-900">Rekapitulasi Kas RT</h3>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setRekapTab('jenis')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                            rekapTab === 'jenis'
                                                ? 'bg-white text-emerald-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Per Jenis
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRekapTab('blok')}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                            rekapTab === 'blok'
                                                ? 'bg-white text-emerald-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Per Blok
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content: Per Jenis */}
                            {rekapTab === 'jenis' && (
                                <div className="space-y-4">
                                    {rekapJenis?.map((item, idx) => {
                                        const percentage = item.total_transaksi > 0 ? Math.round((item.lunas_transaksi / item.total_transaksi) * 100) : 0;
                                        return (
                                            <div key={idx} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-emerald-200 transition-colors">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-extrabold text-gray-800">Iuran {item.jenis}</span>
                                                    <span className="text-xs font-extrabold text-emerald-800">
                                                        {formatCurrency(item.total_nominal)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                    <span>{item.lunas_transaksi} dari {item.total_transaksi} lunas</span>
                                                    <span className="font-bold text-gray-700">{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Tab Content: Per Blok */}
                            {rekapTab === 'blok' && (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">
                                        Top 5 Blok dengan kontribusi kas Lunas tertinggi:
                                    </p>
                                    {rekapBlok?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-emerald-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                                                    idx === 0 ? 'bg-emerald-600 text-white shadow-sm' :
                                                    idx === 1 ? 'bg-emerald-100 text-emerald-800' :
                                                    'bg-gray-200 text-gray-700'
                                                }`}>
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-extrabold text-gray-900">{item.blok}</div>
                                                    <div className="text-[11px] text-gray-500">{item.lunas_transaksi} dr {item.total_transaksi} lunas</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-emerald-800">
                                                    {formatCurrency(item.total_nominal)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Status Kas RT</span>
                                <span className="text-emerald-700 font-bold">● Terintegrasi Warga</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Actions bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="flex gap-2 w-full sm:w-auto flex-wrap">
                        <input
                            type="text"
                            placeholder="Cari KK / Kepala Keluarga / Blok..."
                            className="border border-gray-200 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 flex-1 min-w-[180px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="border border-gray-200 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 bg-white"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setTimeout(() => document.getElementById('filter-btn-iuran').click(), 10);
                            }}
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <button id="filter-btn-iuran" type="submit" className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 text-sm font-bold shadow-sm">
                            Filter
                        </button>
                    </form>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => setShowGenerateModal(true)} className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg hover:bg-teal-200 flex items-center gap-2 font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            Generate Iuran (Per KK)
                        </button>
                        <Link href={route('admin.iuran.create')} className="bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-800 hover:from-emerald-800 hover:to-rose-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-emerald-700/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Tambah Data
                        </Link>
                    </div>
                </div>

                {/* Table & Bulk action section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {selectedIds.length > 0 && (
                        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">
                                    {selectedIds.length}
                                </span>
                                <span className="text-sm font-semibold text-blue-900">data terpilih</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="text-xs border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1.5 px-3"
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                >
                                    <option value="">-- Pilih Aksi Massal --</option>
                                    <option value="approve">Tandai Lunas (Approved)</option>
                                    <option value="reject">Tandai Rejected</option>
                                    <option value="delete">Hapus Terpilih</option>
                                </select>
                                <button
                                    type="button"
                                    disabled={!bulkAction || processingBulk}
                                    onClick={handleBulkAction}
                                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
                                >
                                    {processingBulk ? 'Memproses...' : 'Terapkan'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {/* Checkbox select all */}
                                    <th className="px-4 py-4 w-12">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    {/* No urut */}
                                    <th className="px-3 py-4 text-center w-12">No</th>
                                    <th className="px-4 py-4">KK / Kepala Keluarga</th>
                                    <th className="px-4 py-4">Blok</th>
                                    <th className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('jenis_iuran')}>
                                        Jenis Iuran <SortIndicator field="jenis_iuran" />
                                    </th>
                                    <th className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('periode_tahun')}>
                                        Periode <SortIndicator field="periode_tahun" />
                                    </th>
                                    <th className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('jumlah_bayar')}>
                                        Nominal <SortIndicator field="jumlah_bayar" />
                                    </th>
                                    <th className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('status_pembayaran')}>
                                        Status <SortIndicator field="status_pembayaran" />
                                    </th>
                                    <th className="px-4 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {iurans.data.map((iuran, index) => {
                                    const isSelected = selectedIds.includes(iuran.id);
                                    const rowNum = (iurans.current_page - 1) * iurans.per_page + index + 1;
                                    return (
                                        <tr
                                            key={iuran.id}
                                            className={`hover:bg-blue-50/40 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(iuran.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-center text-gray-400 font-mono text-xs">
                                                {rowNum}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900">{iuran.warga?.nama_lengkap}</div>
                                                <div className="text-[11px] text-gray-500 font-mono">
                                                    KK: {iuran.warga?.keluarga?.no_kk || 'Tanpa KK'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {iuran.warga?.keluarga?.rumah_blok
                                                    ? `Blok ${iuran.warga.keluarga.rumah_blok.blok}-${iuran.warga.keluarga.rumah_blok.nomor_rumah}`
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{iuran.jenis_iuran}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {String(iuran.periode_bulan).padStart(2, '0')}/{iuran.periode_tahun}
                                            </td>
                                            <td className="px-4 py-3 text-gray-800 font-semibold">
                                                Rp {Number(iuran.jumlah_bayar).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(iuran.status_pembayaran)}`}>
                                                    {iuran.status_pembayaran === 'Approved' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                                                    {iuran.status_pembayaran === 'Pending' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
                                                    {iuran.status_pembayaran === 'Rejected' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                                                    {iuran.status_pembayaran}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('admin.iuran.show', iuran.id)} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" title="Lihat">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </Link>
                                                    <Link href={route('admin.iuran.edit', iuran.id)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleLunas(iuran.id, iuran.status_pembayaran)}
                                                        className={`p-1.5 rounded-lg transition-colors ${iuran.status_pembayaran === 'Approved' ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'}`}
                                                        title={iuran.status_pembayaran === 'Approved' ? 'Batalkan Lunas' : 'Tandai Lunas'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(iuran.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {iurans.data.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                            Belum ada data Iuran Kas yang sesuai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {iurans.links && iurans.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Menampilkan {iurans.from || 0} - {iurans.to || 0} dari {iurans.total || 0} data
                            </span>
                            <div className="flex gap-1">
                                {iurans.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                            link.active
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Generate Iuran */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Generate Iuran Massal (Per KK)</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-800">Fitur ini akan membuat tagihan iuran berstatus "Pending" untuk setiap Kartu Keluarga (KK) / Rumah yang belum memiliki tagihan pada periode yang dipilih (1 KK = 1 Tagihan).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Iuran</label>
                                <select className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={generateForm.data.jenis_iuran} onChange={e => generateForm.setData('jenis_iuran', e.target.value)}>
                                    <option value="Wajib">Iuran Wajib / Kas</option>
                                    <option value="Sampah">Iuran Sampah</option>
                                    <option value="Keamanan">Iuran Keamanan</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                                    <input type="number" min="1" max="12" required className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={generateForm.data.periode_bulan} onChange={e => generateForm.setData('periode_bulan', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                                    <input type="number" min="2000" required className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={generateForm.data.periode_tahun} onChange={e => generateForm.setData('periode_tahun', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Default (Rp)</label>
                                <input type="number" required min="0" step="any" className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={generateForm.data.jumlah_bayar} onChange={e => generateForm.setData('jumlah_bayar', e.target.value)} />
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                                <button type="button" onClick={() => setShowGenerateModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">Batal</button>
                                <button type="submit" disabled={generateForm.processing} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold">
                                    {generateForm.processing ? 'Memproses...' : 'Generate Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
