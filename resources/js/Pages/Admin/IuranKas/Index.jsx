import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ iurans = { data: [] }, summary = {}, chartData = {}, rekapJenis = [], rekapBlok = [], jenisIurans = [], jenisList = [], filters = {} }) {
    const pageProps = usePage()?.props || {};
    const flash = pageProps.flash || {};
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'Semua');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [processingBulk, setProcessingBulk] = useState(false);
    const [chartMode, setChartMode] = useState('nominal'); // 'nominal' | 'count'
    const [rekapTab, setRekapTab] = useState('jenis'); // 'jenis' | 'blok'
    const [expandedGroupKeys, setExpandedGroupKeys] = useState([]);

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

    // Grouping data iuran per 1 Kepala Keluarga (Warga & Periode) agar tabel ringkas & tidak penuh
    const groupedIurans = useMemo(() => {
        if (!iurans || !iurans.data || iurans.data.length === 0) return [];

        const map = new Map();
        iurans.data.forEach((item) => {
            const key = `${item.warga_id}_${item.periode_bulan}_${item.periode_tahun}`;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    warga: item.warga,
                    warga_id: item.warga_id,
                    periode_bulan: item.periode_bulan,
                    periode_tahun: item.periode_tahun,
                    created_at: item.created_at,
                    items: [],
                });
            }
            map.get(key).items.push(item);
        });

        return Array.from(map.values()).map((group) => {
            const totalNominal = group.items.reduce((acc, curr) => acc + Number(curr.jumlah_bayar || 0), 0);
            const approvedCount = group.items.filter((i) => i.status_pembayaran === 'Approved').length;
            const pendingCount = group.items.filter((i) => i.status_pembayaran === 'Pending').length;
            const rejectedCount = group.items.filter((i) => i.status_pembayaran === 'Rejected').length;
            const totalItems = group.items.length;

            let overallStatus = 'Pending';
            if (approvedCount === totalItems) {
                overallStatus = 'Approved';
            } else if (approvedCount > 0) {
                overallStatus = 'Partial';
            } else if (rejectedCount === totalItems) {
                overallStatus = 'Rejected';
            }

            return {
                ...group,
                totalNominal,
                approvedCount,
                pendingCount,
                rejectedCount,
                totalItems,
                overallStatus,
            };
        });
    }, [iurans]);

    const toggleExpandGroup = (key) => {
        setExpandedGroupKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const expandAllGroups = () => {
        setExpandedGroupKeys(groupedIurans.map((g) => g.key));
    };

    const collapseAllGroups = () => {
        setExpandedGroupKeys([]);
    };

    const isGroupSelected = (group) => {
        const itemIds = group.items.map((i) => i.id);
        return itemIds.every((id) => selectedIds.includes(id));
    };

    const isGroupIndeterminate = (group) => {
        const itemIds = group.items.map((i) => i.id);
        const count = itemIds.filter((id) => selectedIds.includes(id)).length;
        return count > 0 && count < itemIds.length;
    };

    const toggleSelectGroup = (group) => {
        const itemIds = group.items.map((i) => i.id);
        if (isGroupSelected(group)) {
            setSelectedIds((prev) => prev.filter((id) => !itemIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...itemIds])));
        }
    };

    const handleApproveGroup = (group) => {
        const itemIds = group.items.map((i) => i.id);
        if (confirm(`Tandai seluruh iuran ${group.warga?.nama_lengkap} (Periode ${String(group.periode_bulan).padStart(2, '0')}/${group.periode_tahun}) sebagai LUNAS?`)) {
            router.post(
                route('admin.iuran.bulk-action'),
                {
                    action: 'approve',
                    ids: itemIds,
                },
                { preserveScroll: true }
            );
        }
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
    }, [iurans?.data]);

    const allIds = Array.isArray(iurans?.data) ? iurans.data.map((i) => i.id) : [];
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
    const [showJenisModal, setShowJenisModal] = useState(false);
    const [processingGenerate, setProcessingGenerate] = useState(false);

    const getDefaultKomponen = () => {
        if (!jenisIurans || jenisIurans.length === 0) {
            return [
                { checked: true, nama: 'Kebersihan (Sampah)', nominal: 35000 },
                { checked: true, nama: 'Duka Cita', nominal: 10000 },
                { checked: true, nama: 'Kas RT', nominal: 5000 },
            ];
        }
        return jenisIurans
            .filter((j) => j.is_active)
            .map((j) => ({
                checked: true,
                id: j.id,
                nama: j.nama_iuran,
                nominal: j.nominal_default,
            }));
    };

    const generateForm = useForm({
        periode_bulan: new Date().getMonth() + 1,
        periode_tahun: new Date().getFullYear(),
        komponen_iuran: getDefaultKomponen(),
    });

    const jenisForm = useForm({
        nama_iuran: '',
        nominal_default: 0,
        kategori: 'Umum',
        is_active: true,
    });

    useEffect(() => {
        if (jenisIurans) {
            generateForm.setData('komponen_iuran', getDefaultKomponen());
        }
    }, [jenisIurans]);

    const handleGenerate = (e) => {
        e.preventDefault();
        const activeKomponen = (generateForm.data.komponen_iuran || [])
            .filter((k) => k.checked)
            .map((k) => ({
                nama: k.nama,
                nominal: Number(k.nominal) || 0,
            }));

        if (activeKomponen.length === 0) {
            alert('Pilih minimal 1 komponen iuran yang akan digenerate!');
            return;
        }

        router.post(
            route('admin.iuran.generate'),
            {
                periode_bulan: generateForm.data.periode_bulan,
                periode_tahun: generateForm.data.periode_tahun,
                komponen_iuran: activeKomponen,
            },
            {
                onStart: () => setProcessingGenerate(true),
                onFinish: () => setProcessingGenerate(false),
                onSuccess: () => setShowGenerateModal(false),
            }
        );
    };

    const handleAddJenis = (e) => {
        e.preventDefault();
        jenisForm.post(route('admin.jenis-iuran.store'), {
            onSuccess: () => {
                jenisForm.reset();
            }
        });
    };

    const handleToggleActiveJenis = (j) => {
        router.put(route('admin.jenis-iuran.update', j.id), {
            nama_iuran: j.nama_iuran,
            nominal_default: j.nominal_default,
            kategori: j.kategori,
            is_active: !j.is_active,
            urutan: j.urutan,
        }, { preserveScroll: true });
    };

    const handleDeleteJenis = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus jenis iuran ini?')) {
            router.delete(route('admin.jenis-iuran.destroy', id), { preserveScroll: true });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('admin.iuran.destroy', id));
        }
    };

    const handleToggleLunas = (id, currentStatus) => {
        const actionText = currentStatus === 'Approved' 
            ? 'membatalkan status Lunas (ubah menjadi Pending)' 
            : 'menandai iuran ini sebagai Lunas (Approved)';
        if (confirm(`Apakah Anda yakin ingin ${actionText}?`)) {
            router.patch(route('admin.iuran.toggle-lunas', id), {}, { preserveScroll: true });
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

    const getGroupStatusBadge = (overallStatus, approvedCount, totalItems) => {
        if (overallStatus === 'Approved') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-xs">
                    <span>✓ Lunas ({approvedCount}/{totalItems})</span>
                </span>
            );
        }
        if (overallStatus === 'Partial') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1 shadow-xs">
                    <span>⚡ Sebagian ({approvedCount}/{totalItems})</span>
                </span>
            );
        }
        if (overallStatus === 'Rejected') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-xs">
                    <span>✕ Rejected ({approvedCount}/{totalItems})</span>
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800 border border-teal-200 inline-flex items-center gap-1 shadow-xs">
                <span>⏳ Pending ({approvedCount}/{totalItems})</span>
            </span>
        );
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
                    <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                        <button onClick={() => setShowJenisModal(true)} className="bg-amber-100 text-amber-900 px-3.5 py-2 rounded-xl hover:bg-amber-200 flex items-center gap-1.5 font-bold text-sm border border-amber-300 shadow-sm transition-all">
                            ⚙️ Pengaturan Iuran
                        </button>
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

                    {/* Header Controls for Table & Grouping */}
                    <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800">
                        <div className="flex items-center gap-2 font-bold">
                            <span className="text-cyan-400">📊 Riwayat Iuran Warga</span>
                            <span className="text-slate-400 font-normal">
                                &bull; Ringkas 1 Baris per KK ({groupedIurans.length} Keluarga)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={expandAllGroups}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                                <span>📂 Buka Semua Detail</span>
                            </button>
                            <button
                                type="button"
                                onClick={collapseAllGroups}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                                <span>📁 Tutup Semua Detail</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 text-white text-xs font-black uppercase tracking-wider">
                                    {/* Checkbox select all */}
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                        />
                                    </th>
                                    {/* No urut */}
                                    <th className="px-3 py-4 text-center w-12">No</th>
                                    <th className="px-4 py-4">KK / Kepala Keluarga</th>
                                    <th className="px-4 py-4">Blok Rumah</th>
                                    <th className="px-4 py-4">Periode</th>
                                    <th className="px-4 py-4">Total Tagihan</th>
                                    <th className="px-4 py-4 text-center">Status Lunas</th>
                                    <th className="px-4 py-4 text-right">Rincian & Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {groupedIurans.length > 0 ? (
                                    groupedIurans.map((group, index) => {
                                        const isExpanded = expandedGroupKeys.includes(group.key);
                                        const groupSelected = isGroupSelected(group);
                                        const groupIndeterminate = isGroupIndeterminate(group);
                                        const currentPage = iurans?.current_page || 1;
                                        const perPage = iurans?.per_page || 30;
                                        const rowNum = (currentPage - 1) * perPage + index + 1;
                                        const rumahBlok = group.warga?.keluarga?.rumah_blok;

                                        return (
                                            <Fragment key={group.key}>
                                                <tr
                                                    className={`hover:bg-cyan-50/50 transition-colors border-b border-gray-100 font-medium ${
                                                        isExpanded ? 'bg-cyan-50/30' : ''
                                                    }`}
                                                >
                                                    <td className="px-4 py-3.5 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={groupSelected}
                                                            ref={(el) => { if (el) el.indeterminate = groupIndeterminate; }}
                                                            onChange={() => toggleSelectGroup(group)}
                                                            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center text-gray-400 font-mono text-xs font-bold">
                                                        {rowNum}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-black text-gray-900 flex items-center gap-2">
                                                            <span>👤 {group.warga?.nama_lengkap}</span>
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                                {group.totalItems} Komponen
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 font-mono">
                                                            No. KK: {group.warga?.keluarga?.no_kk || 'Tanpa KK'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs font-extrabold text-gray-800">
                                                        {rumahBlok ? (
                                                            <span className="inline-flex items-center gap-1">
                                                                <span>🏠</span>
                                                                <span>Blok {rumahBlok.blok}-{rumahBlok.nomor_rumah}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 font-normal italic">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono font-black text-gray-800">
                                                        {String(group.periode_bulan).padStart(2, '0')}/{group.periode_tahun}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-black text-emerald-950 text-sm">
                                                            Rp {group.totalNominal.toLocaleString('id-ID')}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            Total Gabungan KK
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        {getGroupStatusBadge(group.overallStatus, group.approvedCount, group.totalItems)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {group.overallStatus !== 'Approved' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApproveGroup(group)}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black transition cursor-pointer"
                                                                    title="Tandai Semua Komponen Lunas"
                                                                >
                                                                    ✓ Approve Semua
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandGroup(group.key)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                                                                    isExpanded
                                                                        ? 'bg-slate-900 text-white'
                                                                        : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-900'
                                                                }`}
                                                            >
                                                                <span>{isExpanded ? '▲ Tutup Rincian' : '🔍 Detail Iuran'}</span>
                                                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${isExpanded ? 'bg-cyan-500 text-white' : 'bg-cyan-900 text-white'}`}>
                                                                    {group.totalItems}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* BARIS COLLAPSIBLE EXPANDED DETAILS */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                                        <td colSpan="8" className="p-4 pl-12">
                                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">📋</span>
                                                                        <div>
                                                                            <h4 className="text-xs font-black text-slate-900">
                                                                                Rincian Komponen Iuran: {group.warga?.nama_lengkap}
                                                                            </h4>
                                                                            <p className="text-[11px] text-slate-500 font-medium">
                                                                                Periode {String(group.periode_bulan).padStart(2, '0')}/{group.periode_tahun} &bull; No. KK: {group.warga?.keluarga?.no_kk || 'Tanpa KK'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                                                        Total Iuran: Rp {group.totalNominal.toLocaleString('id-ID')}
                                                                    </div>
                                                                </div>

                                                                {/* DAFTAR RINCIAN ITEM */}
                                                                <div className="divide-y divide-slate-100">
                                                                    {group.items.map((item) => {
                                                                        const itemSelected = selectedIds.includes(item.id);
                                                                        return (
                                                                            <div
                                                                                key={item.id}
                                                                                className={`py-2.5 px-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                                                                                    itemSelected ? 'bg-cyan-50/80 border border-cyan-200' : 'hover:bg-slate-50'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={itemSelected}
                                                                                        onChange={() => toggleSelect(item.id)}
                                                                                        className="w-3.5 h-3.5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                                                    />
                                                                                    <div>
                                                                                        <span className="font-extrabold text-slate-900 text-xs">
                                                                                            {item.jenis_iuran}
                                                                                        </span>
                                                                                        <span className="ml-2.5 font-mono font-black text-slate-700 text-xs">
                                                                                            Rp {Number(item.jumlah_bayar).toLocaleString('id-ID')}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadge(item.status_pembayaran)}`}>
                                                                                        {item.status_pembayaran}
                                                                                    </span>

                                                                                    <div className="flex items-center gap-1">
                                                                                        <Link
                                                                                            href={route('admin.iuran.show', item.id)}
                                                                                            className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                                                                                            title="Lihat Detail"
                                                                                        >
                                                                                            Lihat
                                                                                        </Link>
                                                                                        <Link
                                                                                            href={route('admin.iuran.edit', item.id)}
                                                                                            className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                                                            title="Edit Nominal"
                                                                                        >
                                                                                            Edit
                                                                                        </Link>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleToggleLunas(item.id, item.status_pembayaran)}
                                                                                            className={`px-2 py-1 text-[11px] font-black rounded-lg transition ${
                                                                                                item.status_pembayaran === 'Approved'
                                                                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                                            }`}
                                                                                        >
                                                                                            {item.status_pembayaran === 'Approved' ? 'Batalkan' : '✓ Approve'}
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleDelete(item.id)}
                                                                                            className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                                                            title="Hapus Iuran Ini"
                                                                                        >
                                                                                            ✕
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-400 italic">
                                            Belum ada data Iuran Kas yang sesuai dengan pencarian atau filter Anda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {iurans?.links && iurans.links.length > 3 && (
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

            {/* Modal Generate Iuran Massal Multi-Komponen */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-700 to-emerald-800 text-white">
                            <h3 className="text-lg font-bold">Generate Iuran Massal (Per KK)</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-900 text-xs leading-relaxed font-medium">
                                <p>Saat digenerate, <strong>1 KK akan mendapatkan beberapa tagihan iuran</strong> sesuai komponen yang dicentang di bawah ini. Nominal bisa di-adjust manual untuk periode ini.</p>
                            </div>

                            {/* Periode Bulan & Tahun */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Bulan</label>
                                    <input type="number" min="1" max="12" required className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 font-bold text-sm" value={generateForm.data.periode_bulan} onChange={e => generateForm.setData('periode_bulan', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Tahun</label>
                                    <input type="number" min="2000" required className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 font-bold text-sm" value={generateForm.data.periode_tahun} onChange={e => generateForm.setData('periode_tahun', e.target.value)} />
                                </div>
                            </div>

                            {/* Daftar Komponen yang Akan Digenerate */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Komponen Iuran & Nominal (Rp)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowGenerateModal(false);
                                            setShowJenisModal(true);
                                        }}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                                    >
                                        ⚙️ Pengaturan Komponen
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    Centang komponen yang akan digenerate dan sesuaikan nominal:
                                </p>

                                <div className="max-h-56 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2.5 bg-gray-50/50">
                                    {(generateForm.data.komponen_iuran || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={(e) => {
                                                        const copy = [...generateForm.data.komponen_iuran];
                                                        copy[idx].checked = e.target.checked;
                                                        generateForm.setData('komponen_iuran', copy);
                                                    }}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                                />
                                                <span className={`text-sm font-bold ${item.checked ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                                    {item.nama}
                                                </span>
                                            </label>
                                            <div className="w-36 flex items-center gap-1">
                                                <span className="text-xs font-bold text-gray-500">Rp</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    disabled={!item.checked}
                                                    value={item.nominal}
                                                    onChange={(e) => {
                                                        const copy = [...generateForm.data.komponen_iuran];
                                                        copy[idx].nominal = e.target.value;
                                                        generateForm.setData('komponen_iuran', copy);
                                                    }}
                                                    className="w-full text-right text-xs font-bold rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 py-1.5 px-2 disabled:bg-gray-100 disabled:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Akumulasi Banner */}
                            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between border border-emerald-700/40">
                                <div>
                                    <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Total Iuran Per KK</div>
                                    <div className="text-xs text-emerald-200/80">
                                        {(generateForm.data.komponen_iuran || []).filter(k => k.checked).length} Komponen Terpilih
                                    </div>
                                </div>
                                <div className="text-xl font-black tracking-tight text-emerald-300">
                                    {formatCurrency(
                                        (generateForm.data.komponen_iuran || [])
                                            .filter(k => k.checked)
                                            .reduce((sum, k) => sum + (Number(k.nominal) || 0), 0)
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                                <button type="button" onClick={() => setShowGenerateModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">Batal</button>
                                <button type="submit" disabled={processingGenerate} className="px-5 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50 text-sm font-bold shadow-md shadow-emerald-700/20">
                                    {processingGenerate ? 'Memproses...' : 'Generate Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Manajemen Jenis Iuran */}
            {showJenisModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                ⚙️ Manajemen Jenis & Nominal Iuran (Master Iuran)
                            </h3>
                            <button onClick={() => setShowJenisModal(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                            {/* Form Tambah Jenis Iuran Baru */}
                            <form onSubmit={handleAddJenis} className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
                                <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                                    + Tambah Jenis Iuran Baru
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nama Iuran</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="misal: Ronda / Keamanan"
                                            className="w-full rounded-lg border-gray-300 text-xs font-bold"
                                            value={jenisForm.data.nama_iuran}
                                            onChange={(e) => jenisForm.setData('nama_iuran', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nominal Default (Rp)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            placeholder="10000"
                                            className="w-full rounded-lg border-gray-300 text-xs font-bold"
                                            value={jenisForm.data.nominal_default}
                                            onChange={(e) => jenisForm.setData('nominal_default', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 text-xs font-bold"
                                            value={jenisForm.data.kategori}
                                            onChange={(e) => jenisForm.setData('kategori', e.target.value)}
                                        >
                                            <option value="Sampah">Sampah</option>
                                            <option value="Sukarela">Sukarela</option>
                                            <option value="Wajib">Wajib</option>
                                            <option value="Keamanan">Keamanan</option>
                                            <option value="Umum">Umum</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={jenisForm.processing}
                                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow"
                                    >
                                        {jenisForm.processing ? 'Menyimpan...' : '+ Tambah Komponen'}
                                    </button>
                                </div>
                            </form>

                            {/* Daftar Jenis Iuran */}
                            <div>
                                <div className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                                    Daftar Komponen Iuran Master
                                </div>
                                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                                <th className="py-2.5 px-3">Nama Iuran</th>
                                                <th className="py-2.5 px-3">Kategori</th>
                                                <th className="py-2.5 px-3 text-right">Nominal Default</th>
                                                <th className="py-2.5 px-3 text-center">Status</th>
                                                <th className="py-2.5 px-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs font-medium">
                                            {(jenisIurans || []).map((j) => (
                                                <tr key={j.id} className="hover:bg-gray-50/80">
                                                    <td className="py-2.5 px-3 font-bold text-gray-900">{j.nama_iuran}</td>
                                                    <td className="py-2.5 px-3">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-[10px]">
                                                            {j.kategori || 'Umum'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                                                        {formatCurrency(j.nominal_default)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActiveJenis(j)}
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                j.is_active
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-gray-200 text-gray-600'
                                                            }`}
                                                        >
                                                            {j.is_active ? '✅ Aktif' : '⏸ Nonaktif'}
                                                        </button>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteJenis(j.id)}
                                                            className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!jenisIurans || jenisIurans.length === 0) && (
                                                <tr>
                                                    <td colSpan="5" className="py-4 text-center text-gray-400">
                                                        Belum ada data master jenis iuran.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowJenisModal(false)}
                                className="px-5 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 text-xs font-bold"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
