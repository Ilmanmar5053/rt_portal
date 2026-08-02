import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';

const tabs = [
    { key: 'warga', label: 'Warga', icon: '👤' },
    { key: 'keluarga', label: 'Keluarga', icon: '👨‍👩‍👧‍👦' },
    { key: 'rumah', label: 'Rumah', icon: '🏡' },
    { key: 'iuran', label: 'Iuran Kas', icon: '💰' },
    { key: 'pengaduan', label: 'Pengaduan', icon: '📢' },
    { key: 'surat', label: 'Surat Pengantar', icon: '📄' },
    { key: 'transaksi', label: 'Arus Kas', icon: '📊' },
    { key: 'users', label: 'User', icon: '👥' },
];

const columnDefinitions = {
    warga: [
        { key: 'nik', label: 'NIK', value: (item) => item.nik || '—' },
        { key: 'nama_lengkap', label: 'Nama Lengkap', value: (item) => item.nama_lengkap || '—' },
        { key: 'no_kk', label: 'No KK', value: (item) => item.keluarga?.no_kk || '—' },
        { key: 'status_hubungan_keluarga', label: 'Status Keluarga', value: (item) => item.status_hubungan_keluarga || '—' },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin', value: (item) => item.jenis_kelamin || '—' },
        { key: 'tempat_lahir', label: 'Tempat Lahir', value: (item) => item.tempat_lahir || '—' },
        { key: 'tanggal_lahir', label: 'Tanggal Lahir', value: (item) => item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString('id-ID') : '—' },
        { key: 'alamat', label: 'Alamat', value: (item) => item.alamat || '—' },
    ],
    keluarga: [
        { key: 'no_kk', label: 'No KK', value: (item) => item.no_kk || '—' },
        { key: 'rt_rw', label: 'RT / RW', value: (item) => (item.rt || item.rw) ? `${item.rt ?? '—'}/${item.rw ?? '—'}` : '—' },
        { key: 'alamat_lengkap', label: 'Alamat', value: (item) => item.alamat_lengkap || '—' },
        { key: 'blok', label: 'Blok', value: (item) => item.rumah_blok?.blok || '—' },
        { key: 'nomor_rumah', label: 'Nomor Rumah', value: (item) => item.rumah_blok?.nomor_rumah || '—' },
        { key: 'kepala_keluarga', label: 'Kepala Keluarga', value: (item) => item.kepala_keluarga?.nama_lengkap || '—' },
        { key: 'jumlah_anggota', label: 'Jumlah Anggota', value: (item) => item.wargas?.length ?? item.wargas_count ?? '—' },
    ],
    rumah: [
        { key: 'blok', label: 'Blok', value: (item) => item.blok || '—' },
        { key: 'nomor_rumah', label: 'Nomor Rumah', value: (item) => item.nomor_rumah || '—' },
        { key: 'status_hunian', label: 'Status Hunian', value: (item) => item.status_hunian || '—' },
        { key: 'jumlah_keluarga', label: 'Jumlah KK', value: (item) => item.keluargas_count ?? item.keluargas?.length ?? '—' },
    ],
    iuran: [
        { key: 'nama_lengkap', label: 'KK / Kepala Keluarga', value: (item) => item.warga?.nama_lengkap || '—' },
        { key: 'no_kk', label: 'No KK', value: (item) => item.warga?.keluarga?.no_kk || '—' },
        { key: 'jenis_iuran', label: 'Jenis Iuran', value: (item) => item.jenis_iuran || '—' },
        { key: 'periode', label: 'Periode', value: (item) => `${item.periode_bulan ?? '—'}/${item.periode_tahun ?? '—'}` },
        { key: 'jumlah_bayar', label: 'Jumlah Bayar', value: (item) => item.jumlah_bayar ? formatNumber(item.jumlah_bayar) : '—' },
        { key: 'status_pembayaran', label: 'Status', value: (item) => item.status_pembayaran || '—' },
    ],
    pengaduan: [
        { key: 'judul', label: 'Judul', value: (item) => item.judul || '—' },
        { key: 'warga', label: 'Pelapor', value: (item) => item.warga?.nama_lengkap || '—' },
        { key: 'status_progres', label: 'Status', value: (item) => item.status_progres || '—' },
        { key: 'created_at', label: 'Tanggal', value: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '—' },
        { key: 'isi_laporan', label: 'Isi Laporan', value: (item) => item.isi_laporan || '—' },
    ],
    surat: [
        { key: 'jenis_surat', label: 'Jenis Surat', value: (item) => item.jenis_surat || '—' },
        { key: 'warga', label: 'Pemohon', value: (item) => item.warga?.nama_lengkap || '—' },
        { key: 'no_kk', label: 'No KK', value: (item) => item.warga?.keluarga?.no_kk || '—' },
        { key: 'status', label: 'Status', value: (item) => item.status || '—' },
        { key: 'created_at', label: 'Tanggal', value: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '—' },
    ],
    transaksi: [
        { key: 'tanggal', label: 'Tanggal', value: (item) => item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '—' },
        { key: 'keterangan', label: 'Keterangan', value: (item) => item.keterangan || '—' },
        { key: 'kategori', label: 'Kategori', value: (item) => item.kategori || '—' },
        { key: 'jenis', label: 'Jenis', value: (item) => item.jenis || '—' },
        { key: 'jumlah', label: 'Jumlah', value: (item) => item.jumlah ? formatNumber(item.jumlah) : '—' },
        { key: 'referensi', label: 'Referensi', value: (item) => item.referensi || '—' },
        { key: 'creator', label: 'Dibuat Oleh', value: (item) => item.creator?.name || '—' },
    ],
    users: [
        { key: 'name', label: 'Nama', value: (item) => item.name || '—' },
        { key: 'email', label: 'Email', value: (item) => item.email || '—' },
        { key: 'role', label: 'Role', value: (item) => item.role || '—' },
        { key: 'nik', label: 'NIK', value: (item) => item.warga?.nik || '—' },
        { key: 'warga', label: 'Warga', value: (item) => item.warga?.nama_lengkap || '—' },
    ],
};

const defaultVisibleColumns = Object.fromEntries(
    Object.entries(columnDefinitions).map(([key, columns]) => [
        key,
        Object.fromEntries(columns.map((column) => [column.key, true])),
    ])
);

function formatNumber(value) {
    return value !== undefined && value !== null ? Number(value).toLocaleString('id-ID') : '—';
}

export default function Index({ activeTab, reports, exportRows, filters, reportCounts }) {
    const [search, setSearch] = useState(filters.search || '');
    const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
    const [showColumnPicker, setShowColumnPicker] = useState(false);

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
    const columns = columnDefinitions[currentTab.key] || [];
    const visibleColumnSettings = visibleColumns[currentTab.key] || {};
    const currentData = reports?.data || [];
    const exportData = exportRows || [];
    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'asc';

    const currentPage = reports?.current_page ?? reports?.meta?.current_page ?? 1;
    const perPage = reports?.per_page ?? reports?.meta?.per_page ?? currentData.length;
    const rowStart = (currentPage - 1) * perPage;

    const handleSearch = debounce((value) => {
        router.get(
            route('admin.laporan.index'),
            { tab: currentTab.key, search: value, sort_field: sortField, sort_direction: sortDirection },
            { preserveState: true, replace: true }
        );
    }, 400);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        handleSearch(event.target.value);
    };

    const handleTabChange = (tabKey) => {
        if (tabKey === currentTab.key) {
            return;
        }

        router.get(route('admin.laporan.index'), { tab: tabKey, search, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true });
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.laporan.index'),
            { tab: currentTab.key, search, sort_field: field, sort_direction: newDirection },
            { preserveState: true, replace: true }
        );
    };

    const toggleColumn = (key) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [currentTab.key]: {
                ...prev[currentTab.key],
                [key]: !prev[currentTab.key][key],
            },
        }));
    };

    const exportToXlsx = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(
            sortedExportData.map((row) => {
                const entry = {};
                columns.forEach((column) => {
                    if (visibleColumnSettings[column.key]) {
                        entry[column.label] = column.value(row);
                    }
                });
                return entry;
            })
        );

        XLSX.utils.book_append_sheet(workbook, worksheet, currentTab.label);
        XLSX.writeFile(workbook, `${currentTab.label} - ${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const sortColumn = columns.find((column) => column.key === sortField);
    const compareValues = (a, b) => {
        if (a === null || a === undefined) {
            return b === null || b === undefined ? 0 : 1;
        }
        if (b === null || b === undefined) {
            return -1;
        }

        const normalizedA = typeof a === 'string' ? a.toLowerCase() : a;
        const normalizedB = typeof b === 'string' ? b.toLowerCase() : b;

        if (normalizedA < normalizedB) return -1;
        if (normalizedA > normalizedB) return 1;
        return 0;
    };

    const sortedData = useMemo(() => {
        if (!sortColumn) return currentData;
        return [...currentData].sort((a, b) => {
            const valueA = sortColumn.value(a);
            const valueB = sortColumn.value(b);
            const comparison = compareValues(valueA, valueB);
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [currentData, sortColumn, sortDirection]);

    const sortedExportData = useMemo(() => {
        if (!sortColumn) return exportData;
        return [...exportData].sort((a, b) => {
            const valueA = sortColumn.value(a);
            const valueB = sortColumn.value(b);
            const comparison = compareValues(valueA, valueB);
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [exportData, sortColumn, sortDirection]);

    const renderedColumns = columns.filter((column) => visibleColumnSettings[column.key]);

    return (
        <AdminLayout header={<h2 className="text-2xl font-semibold text-gray-900">Laporan {currentTab.label}</h2>}>
            <Head title={`Laporan ${currentTab.label}`} />

            <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">Semua laporan utama tersedia di satu modul dengan pencarian dan ekspor XLSX.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setShowColumnPicker(!showColumnPicker)}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                {showColumnPicker ? 'Tutup kolom' : 'Atur kolom'}
                            </button>
                            <button
                                type="button"
                                onClick={exportToXlsx}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
                            >
                                Unduh XLSX
                            </button>
                        </div>
                    </div>

                    {showColumnPicker && (
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {columns.map((column) => (
                                <label key={column.key} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={visibleColumnSettings[column.key] ?? true}
                                        onChange={() => toggleColumn(column.key)}
                                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    {column.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-wrap gap-3 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${tab.key === currentTab.key ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/90 px-2 text-xs font-medium text-gray-700 shadow-sm">
                                    {reportCounts[tab.key] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-medium text-gray-700">Cari</label>
                            <div className="relative mt-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearchChange}
                                    placeholder="Cari data..."
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Klik judul kolom untuk mengurutkan data secara A-Z atau Z-A.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={exportToXlsx}
                                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
                            >
                                Export current filter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-4 text-left font-semibold text-gray-700">No</th>
                                    {renderedColumns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="whitespace-nowrap px-4 py-4 text-left font-semibold text-gray-700 select-none transition-colors hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSort(column.key)}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                {column.label}
                                                <SortIndicator field={column.key} />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {sortedData.length > 0 ? (
                                    sortedData.map((item, index) => (
                                        <tr key={item.id ?? item.nik ?? item.name ?? `${currentTab.key}-${index}`}
                                            className="odd:bg-white even:bg-slate-50 hover:bg-slate-100"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-gray-500 text-right font-medium">
                                                {rowStart + index + 1}
                                            </td>
                                            {renderedColumns.map((column) => (
                                                <td key={column.key} className="whitespace-nowrap px-4 py-4 text-gray-600">
                                                    {column.value(item)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={renderedColumns.length + 1} className="px-4 py-16 text-center text-gray-500">
                                            Tidak ada data untuk ditampilkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {reports?.links && reports.links.length > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                {reports.links.map((link, index) => (
                                    <Link
                                        key={`${index}-${link.label}`}
                                        href={link.url ?? '#'}
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${link.active ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
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
