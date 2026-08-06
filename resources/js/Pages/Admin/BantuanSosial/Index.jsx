import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { debounce } from 'lodash';

export default function Index({ bansos, stats = {}, chartData = [], wargas = [], filters = {} }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusItem, setStatusItem] = useState(null);

    // Show/Hide Columns State
    const [visibleCols, setVisibleCols] = useState({
        no: true,
        penerima: true,
        kk: true,
        sumber: true,
        jenis: true,
        periode: true,
        bentuk: true,
        status: true,
        aksi: true,
    });
    const [showColMenu, setShowColMenu] = useState(false);

    const toggleCol = (colKey) => {
        setVisibleCols(prev => ({ ...prev, [colKey]: !prev[colKey] }));
    };

    // Filter Form
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || '',
        sumber_dana: filters.sumber_dana || 'Semua',
        status: filters.status || 'Semua',
        tahun: filters.tahun || new Date().getFullYear(),
    });

    const handleSearch = debounce((val) => {
        setFilterData('search', val);
        router.get(
            route('admin.bansos.index'),
            { ...filterData, search: val },
            { preserveState: true, replace: true }
        );
    }, 400);

    const handleFilterChange = (key, value) => {
        setFilterData(key, value);
        router.get(
            route('admin.bansos.index'),
            { ...filterData, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    // Modal Form for Add/Edit
    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        warga_id: '',
        keluarga_id: '',
        nik: '',
        no_kk: '',
        nama_penerima: '',
        sumber_dana: 'Dana Desa',
        jenis_bantuan: 'BLT Dana Desa',
        status_penyaluran: 'Usulan / Pendataan',
        periode_tahun: new Date().getFullYear(),
        periode_bulan: 'Tahunan',
        bentuk_bantuan: '',
        nominal_tunai: '',
        keterangan_ekonomi: '',
        tanggal_penyaluran: '',
    });

    // Options for Jenis Bantuan based on Sumber Dana
    const jenisBantuanOptions = {
        'Dana Desa': [
            'BLT Dana Desa',
            'PMT Kasus Stunting & Kesehatan',
            'Bantuan Ketahanan Pangan Desa',
        ],
        'Dana Daerah': [
            'Bansos APBD (Jaring Pengaman Sosial)',
            'Beasiswa Daerah / KIP-D',
            'Bantuan Usaha UMKM / KUB',
            'Bantuan RTLH / Bedah Rumah',
        ],
        'Dana Pusat': [
            'PKH (Program Keluarga Harapan)',
            'BPNT / Bansos Sembako',
            'Bantuan Pangan Beras (10-30 Kg)',
            'PBI-JK (BPJS Kesehatan Gratis)',
        ],
    };

    const handleOpenCreate = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        clearErrors();
        setFormData({
            warga_id: item.warga_id || '',
            keluarga_id: item.keluarga_id || '',
            nik: item.nik || '',
            no_kk: item.no_kk || '',
            nama_penerima: item.nama_penerima || '',
            sumber_dana: item.sumber_dana || 'Dana Desa',
            jenis_bantuan: item.jenis_bantuan || '',
            status_penyaluran: item.status_penyaluran || 'Usulan / Pendataan',
            periode_tahun: item.periode_tahun || new Date().getFullYear(),
            periode_bulan: item.periode_bulan || 'Tahunan',
            bentuk_bantuan: item.bentuk_bantuan || '',
            nominal_tunai: item.nominal_tunai || '',
            keterangan_ekonomi: item.keterangan_ekonomi || '',
            tanggal_penyaluran: item.tanggal_penyaluran || '',
        });
        setIsModalOpen(true);
    };

    const handleWargaSelect = (e) => {
        const id = e.target.value;
        const w = wargas.find(item => item.id === parseInt(id));
        if (w) {
            setFormData(prev => ({
                ...prev,
                warga_id: w.id,
                keluarga_id: w.keluarga_id || '',
                nik: w.nik || '',
                no_kk: w.no_kk || '',
                nama_penerima: w.nama_lengkap,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                warga_id: '',
                keluarga_id: '',
                nik: '',
                no_kk: '',
                nama_penerima: '',
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('admin.bansos.update', editingItem.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admin.bansos.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data Bantuan Sosial ini?')) {
            router.delete(route('admin.bansos.destroy', id));
        }
    };

    // Quick Status Update Modal
    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: statusProcessing } = useForm({
        status_penyaluran: '',
        tanggal_penyaluran: '',
    });

    const handleOpenStatus = (item) => {
        setStatusItem(item);
        setStatusData({
            status_penyaluran: item.status_penyaluran,
            tanggal_penyaluran: item.tanggal_penyaluran || new Date().toISOString().split('T')[0],
        });
        setIsStatusModalOpen(true);
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        patchStatus(route('admin.bansos.update-status', statusItem.id), {
            onSuccess: () => setIsStatusModalOpen(false),
        });
    };

    const formatCurrency = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Usulan / Pendataan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
                        <span>📝 Usulan RT</span>
                    </span>
                );
            case 'Verifikasi Musdes':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold border border-blue-300">
                        <span>🏛️ Verifikasi Musdes</span>
                    </span>
                );
            case 'Terdaftar Resmi':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold border border-indigo-300">
                        <span>📑 Terdaftar Resmi</span>
                    </span>
                );
            case 'Disalurkan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300 shadow-sm">
                        <span>🎁 Disalurkan</span>
                    </span>
                );
            case 'Nonaktif / Ditolak':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-300">
                        <span>❌ Ditolak / Nonaktif</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-extrabold border border-gray-300">
                        {status}
                    </span>
                );
        }
    };

    // Calculate max value for chart scaling
    const maxChartValue = useMemo(() => {
        if (!chartData || chartData.length === 0) return 10;
        const maxVal = Math.max(...chartData.map(d => d.total || 0));
        return maxVal > 0 ? maxVal : 10;
    }, [chartData]);

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-800 leading-tight flex items-center gap-2">
                            <span>🎁 Manajemen Bantuan Sosial (Bansos)</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Pendataan dan transparansi penyaluran bantuan dari Desa, Daerah (Kab/Kota), dan Pusat
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-800 text-white rounded-xl hover:from-emerald-800 hover:to-rose-900 transition-all font-bold shadow-md shadow-emerald-700/20 text-sm flex items-center gap-2 self-start sm:self-auto"
                    >
                        <span>+ Tambah Penerima Bansos</span>
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Bantuan Sosial" />

            {flash?.message && (
                <div className="p-4 mb-6 text-sm font-bold text-emerald-900 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <span>{flash.message}</span>
                </div>
            )}

            {/* ── 5 DASHBOARD CARDS STATISTIK BANSOS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* 1. Total Penerima */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-lg border border-emerald-600/40 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Total KPM Terdata</span>
                        <span className="text-2xl">🎁</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl font-black text-white">{stats.total_penerima || 0}</div>
                        <p className="text-[11px] text-emerald-100 mt-0.5">Keluarga / Warga Penerima</p>
                    </div>
                </div>

                {/* 2. Bantuan Dana Desa */}
                <div className="rounded-2xl bg-gradient-to-br from-teal-800 via-emerald-800 to-cyan-900 text-white p-5 shadow-lg border border-teal-600/40 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">Sumber Dana Desa</span>
                        <span className="text-2xl">🏛️</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl font-black text-white">{stats.bantuan_desa || 0}</div>
                        <p className="text-[11px] text-teal-100 mt-0.5">BLT Desa, PMT, Pangan</p>
                    </div>
                </div>

                {/* 3. Bantuan Daerah */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-800 via-indigo-800 to-blue-900 text-white p-5 shadow-lg border border-blue-600/40 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Sumber Daerah</span>
                        <span className="text-2xl">🏢</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl font-black text-white">{stats.bantuan_daerah || 0}</div>
                        <p className="text-[11px] text-blue-100 mt-0.5">APBD, Beasiswa KIP-D, RTLH</p>
                    </div>
                </div>

                {/* 4. Bantuan Pusat */}
                <div className="rounded-2xl bg-gradient-to-br from-rose-800 via-red-800 to-rose-900 text-white p-5 shadow-lg border border-rose-600/40 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Sumber APBN Pusat</span>
                        <span className="text-2xl">🇮🇩</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl font-black text-white">{stats.bantuan_pusat || 0}</div>
                        <p className="text-[11px] text-rose-100 mt-0.5">PKH, BPNT, Beras, BPJS</p>
                    </div>
                </div>

                {/* 5. Total Penyaluran Tunai */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900 text-white p-5 shadow-lg border border-amber-600/40 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Total Penyaluran Tunai</span>
                        <span className="text-2xl">💰</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-white truncate">{formatCurrency(stats.total_tunai || 0)}</div>
                        <p className="text-[11px] text-amber-100 mt-0.5">Akumulasi dana tunai disalurkan</p>
                    </div>
                </div>
            </div>

            {/* ── GRAFIK INTERAKTIF PENYALURAN BANSOS (3 SUMBER DANA) ── */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <span>📊 Grafik Penyaluran Bantuan Sosial RT (Tahun {filterData.tahun})</span>
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                            Perbandingan jumlah penerima manfaat dari Pemerintah Desa, Daerah, dan Pusat
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold">
                        <span className="inline-flex items-center gap-1.5 text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Dana Desa
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Dana Daerah
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Dana Pusat
                        </span>
                    </div>
                </div>

                {/* SVG Bar / Line Comparison */}
                <div className="h-64 w-full relative">
                    <div className="grid grid-cols-12 gap-2 h-full items-end pb-8 pt-4">
                        {chartData.map((d, idx) => {
                            const heightDesa = Math.round((d.desa / maxChartValue) * 100);
                            const heightDaerah = Math.round((d.daerah / maxChartValue) * 100);
                            const heightPusat = Math.round((d.pusat / maxChartValue) * 100);

                            return (
                                <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] rounded-lg py-1.5 px-2.5 pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                        <div className="font-bold border-b border-gray-700 pb-0.5 mb-0.5">{d.bulan}</div>
                                        <div>Desa: {d.desa} | Daerah: {d.daerah} | Pusat: {d.pusat}</div>
                                        <div className="font-bold text-amber-300">Total: {d.total} KPM</div>
                                    </div>

                                    {/* Multi-bars */}
                                    <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                                        <div
                                            style={{ height: `${Math.max(heightDesa, 5)}%` }}
                                            className="w-1/3 bg-gradient-to-t from-teal-700 to-emerald-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                                        ></div>
                                        <div
                                            style={{ height: `${Math.max(heightDaerah, 5)}%` }}
                                            className="w-1/3 bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                                        ></div>
                                        <div
                                            style={{ height: `${Math.max(heightPusat, 5)}%` }}
                                            className="w-1/3 bg-gradient-to-t from-rose-700 to-red-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                                        ></div>
                                    </div>

                                    <span className="text-[11px] font-extrabold text-gray-600 mt-2">{d.bulan}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── FILTER & DATA TABEL BANSOS ── */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                {/* Toolbar: Search, Filters & Show/Hide Columns */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-row xl:items-center gap-3 w-full">
                        {/* Search Input */}
                        <div className="relative w-full xl:w-72 shrink-0">
                            <input
                                type="text"
                                defaultValue={filterData.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Cari NIK, Nama, No KK..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm font-medium transition-all hover:border-emerald-300"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>

                        {/* Filter Sumber Dana */}
                        <select
                            value={filterData.sumber_dana}
                            onChange={(e) => handleFilterChange('sumber_dana', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm font-semibold text-gray-700 transition-all cursor-pointer hover:border-emerald-300 xl:w-auto shrink-0"
                        >
                            <option value="Semua">Semua Sumber Dana</option>
                            <option value="Dana Desa">1. Dana Desa</option>
                            <option value="Dana Daerah">2. Dana Daerah (Kab/Kota)</option>
                            <option value="Dana Pusat">3. Dana Pusat (APBN)</option>
                        </select>

                        {/* Filter Status Penyaluran */}
                        <select
                            value={filterData.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm font-semibold text-gray-700 transition-all cursor-pointer hover:border-emerald-300 xl:w-auto shrink-0"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Usulan / Pendataan">Usulan / Pendataan</option>
                            <option value="Verifikasi Musdes">Verifikasi Musdes</option>
                            <option value="Terdaftar Resmi">Terdaftar Resmi</option>
                            <option value="Disalurkan">Disalurkan</option>
                            <option value="Nonaktif / Ditolak">Nonaktif / Ditolak</option>
                        </select>

                        {/* Filter Tahun */}
                        <select
                            value={filterData.tahun}
                            onChange={(e) => handleFilterChange('tahun', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm font-semibold text-gray-700 transition-all cursor-pointer hover:border-emerald-300 xl:w-auto shrink-0"
                        >
                            <option value="Semua">Semua Tahun</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    {/* Show/Hide Column Menu Toggle */}
                    <div className="relative self-end lg:self-auto">
                        <button
                            type="button"
                            onClick={() => setShowColMenu(!showColMenu)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <span>👁️ Kolom Tabel</span>
                            <span>{showColMenu ? '▲' : '▼'}</span>
                        </button>

                        {showColMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-30">
                                <div className="text-xs font-black text-gray-700 mb-2 px-1">Tampilkan Kolom:</div>
                                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                                    {[
                                        { key: 'no', label: 'No' },
                                        { key: 'penerima', label: 'Nama Penerima & NIK' },
                                        { key: 'kk', label: 'No. Kartu Keluarga' },
                                        { key: 'sumber', label: 'Sumber Dana' },
                                        { key: 'jenis', label: 'Jenis Bantuan' },
                                        { key: 'periode', label: 'Periode (Tahun/Bulan)' },
                                        { key: 'bentuk', label: 'Bentuk / Nominal' },
                                        { key: 'status', label: 'Status & Alur' },
                                        { key: 'aksi', label: 'Aksi' },
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-lg cursor-pointer text-xs font-semibold text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={visibleCols[item.key]}
                                                onChange={() => toggleCol(item.key)}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y border-gray-100">
                            <tr>
                                {visibleCols.no && <th className="px-4 py-3 font-extrabold">No</th>}
                                {visibleCols.penerima && <th className="px-4 py-3 font-extrabold">Nama Penerima / NIK</th>}
                                {visibleCols.kk && <th className="px-4 py-3 font-extrabold">No. KK</th>}
                                {visibleCols.sumber && <th className="px-4 py-3 font-extrabold">Sumber Dana</th>}
                                {visibleCols.jenis && <th className="px-4 py-3 font-extrabold">Jenis Bantuan</th>}
                                {visibleCols.periode && <th className="px-4 py-3 font-extrabold">Periode</th>}
                                {visibleCols.bentuk && <th className="px-4 py-3 font-extrabold">Bentuk / Nominal</th>}
                                {visibleCols.status && <th className="px-4 py-3 font-extrabold">Status Alur</th>}
                                {visibleCols.aksi && <th className="px-4 py-3 font-extrabold text-right">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bansos.data.length > 0 ? (
                                bansos.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                                        {visibleCols.no && (
                                            <td className="px-4 py-3.5 font-bold text-gray-500">
                                                {(bansos.current_page - 1) * bansos.per_page + index + 1}
                                            </td>
                                        )}
                                        {visibleCols.penerima && (
                                            <td className="px-4 py-3.5">
                                                <div className="font-extrabold text-gray-900">{item.nama_penerima}</div>
                                                <div className="text-xs font-semibold text-gray-400 mt-0.5">
                                                    NIK: {item.nik || '-'}
                                                </div>
                                            </td>
                                        )}
                                        {visibleCols.kk && (
                                            <td className="px-4 py-3.5 font-semibold text-gray-700">
                                                {item.no_kk || '-'}
                                            </td>
                                        )}
                                        {visibleCols.sumber && (
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                                    item.sumber_dana === 'Dana Desa' ? 'bg-teal-100 text-teal-800' :
                                                    item.sumber_dana === 'Dana Daerah' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {item.sumber_dana === 'Dana Desa' && '🏛️'}
                                                    {item.sumber_dana === 'Dana Daerah' && '🏢'}
                                                    {item.sumber_dana === 'Dana Pusat' && '🇮🇩'}
                                                    {item.sumber_dana}
                                                </span>
                                            </td>
                                        )}
                                        {visibleCols.jenis && (
                                            <td className="px-4 py-3.5 font-bold text-gray-800">
                                                {item.jenis_bantuan}
                                            </td>
                                        )}
                                        {visibleCols.periode && (
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-gray-900">{item.periode_tahun}</div>
                                                <div className="text-xs text-gray-500">{item.periode_bulan}</div>
                                            </td>
                                        )}
                                        {visibleCols.bentuk && (
                                            <td className="px-4 py-3.5">
                                                <div className="font-extrabold text-emerald-700">
                                                    {item.bentuk_bantuan || (item.nominal_tunai > 0 ? formatCurrency(item.nominal_tunai) : '-')}
                                                </div>
                                                {item.nominal_tunai > 0 && item.bentuk_bantuan && (
                                                    <div className="text-xs font-semibold text-gray-500">
                                                        ({formatCurrency(item.nominal_tunai)})
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                        {visibleCols.status && (
                                            <td className="px-4 py-3.5">
                                                {getStatusBadge(item.status_penyaluran)}
                                                {item.tanggal_penyaluran && (
                                                    <div className="text-[10px] font-bold text-gray-400 mt-1">
                                                        Tgl: {item.tanggal_penyaluran}
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                        {visibleCols.aksi && (
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenStatus(item)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 text-xs font-bold transition-colors"
                                                        title="Ubah Status Alur"
                                                    >
                                                        🔄 Alur
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 text-xs font-bold transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 text-xs font-bold transition-colors"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400 font-bold">
                                        📭 Belum ada data penerima Bantuan Sosial terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {bansos.links && bansos.links.length > 3 && (
                    <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-100 text-sm">
                        <div className="text-gray-500 font-medium">
                            Menampilkan <span className="font-bold">{bansos.from || 0}</span> - <span className="font-bold">{bansos.to || 0}</span> dari <span className="font-bold">{bansos.total}</span> data
                        </div>
                        <div className="flex gap-1">
                            {bansos.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                                        link.active
                                            ? 'bg-emerald-700 text-white shadow-sm'
                                            : link.url
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL ADD/EDIT PENERIMA BANSOS ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-rose-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black">
                                    {editingItem ? '✏️ Edit Data Bantuan Sosial' : '🎁 Tambah Penerima Bantuan Sosial'}
                                </h3>
                                <p className="text-xs text-emerald-100 mt-0.5">
                                    Pilih warga terdaftar dan tentukan sumber serta jenis bantuan sosial
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* Warga Selector */}
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                    Pilih Warga Terdaftar (Otomatis Isi NIK & KK)
                                </label>
                                <select
                                    value={formData.warga_id}
                                    onChange={handleWargaSelect}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                                >
                                    <option value="">-- Pilih Warga dari Database RT --</option>
                                    {wargas.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.nama_lengkap} (NIK: {w.nik || '-'} | KK: {w.no_kk || '-'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Manual NIK, KK, Nama (in case not in database) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Nama Penerima *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama_penerima}
                                        onChange={(e) => setFormData('nama_penerima', e.target.value)}
                                        placeholder="Nama Lengkap"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        NIK Penerima
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nik}
                                        onChange={(e) => setFormData('nik', e.target.value)}
                                        placeholder="3201..."
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        No. Kartu Keluarga
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.no_kk}
                                        onChange={(e) => setFormData('no_kk', e.target.value)}
                                        placeholder="3201..."
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Sumber Dana & Jenis Bantuan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Sumber Dana *
                                    </label>
                                    <select
                                        value={formData.sumber_dana}
                                        onChange={(e) => {
                                            const sumber = e.target.value;
                                            const opts = jenisBantuanOptions[sumber] || [];
                                            setFormData(prev => ({
                                                ...prev,
                                                sumber_dana: sumber,
                                                jenis_bantuan: opts[0] || '',
                                            }));
                                        }}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800"
                                    >
                                        <option value="Dana Desa">1. Dana Desa (Pemerintah Desa)</option>
                                        <option value="Dana Daerah">2. Dana Daerah (Kabupaten / Kota)</option>
                                        <option value="Dana Pusat">3. Dana Pusat (APBN / Kemensos)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Jenis Bantuan *
                                    </label>
                                    <select
                                        value={formData.jenis_bantuan}
                                        onChange={(e) => setFormData('jenis_bantuan', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800"
                                    >
                                        {(jenisBantuanOptions[formData.sumber_dana] || []).map((opt, idx) => (
                                            <option key={idx} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Periode Tahun & Bulan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Periode Tahun *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.periode_tahun}
                                        onChange={(e) => setFormData('periode_tahun', e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Periode Bulan / Keterangan *
                                    </label>
                                    <select
                                        value={formData.periode_bulan}
                                        onChange={(e) => setFormData('periode_bulan', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                                    >
                                        <option value="Tahunan">Tahunan / Sepanjang Tahun</option>
                                        <option value="Januari">Januari</option>
                                        <option value="Februari">Februari</option>
                                        <option value="Maret">Maret</option>
                                        <option value="April">April</option>
                                        <option value="Mei">Mei</option>
                                        <option value="Juni">Juni</option>
                                        <option value="Juli">Juli</option>
                                        <option value="Agustus">Agustus</option>
                                        <option value="September">September</option>
                                        <option value="Oktober">Oktober</option>
                                        <option value="November">November</option>
                                        <option value="Desember">Desember</option>
                                        <option value="Triwulan 1">Triwulan 1</option>
                                        <option value="Triwulan 2">Triwulan 2</option>
                                        <option value="Triwulan 3">Triwulan 3</option>
                                        <option value="Triwulan 4">Triwulan 4</option>
                                    </select>
                                </div>
                            </div>

                            {/* Bentuk Bantuan & Nominal Tunai */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Bentuk / Wujud Bantuan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.bentuk_bantuan}
                                        onChange={(e) => setFormData('bentuk_bantuan', e.target.value)}
                                        placeholder="Contoh: Beras 10 Kg, Tunai Rp 300.000, PMT Gizi"
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Nominal Tunai (Rp - Untuk Grafik)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.nominal_tunai}
                                        onChange={(e) => setFormData('nominal_tunai', e.target.value)}
                                        placeholder="300000"
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-bold"
                                    />
                                </div>
                            </div>

                            {/* Status Alur & Tanggal Penyaluran */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Status Alur Pengusulan *
                                    </label>
                                    <select
                                        value={formData.status_penyaluran}
                                        onChange={(e) => setFormData('status_penyaluran', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 font-bold"
                                    >
                                        <option value="Usulan / Pendataan">1. Usulan / Pendataan RT</option>
                                        <option value="Verifikasi Musdes">2. Verifikasi Musdes / Muskel</option>
                                        <option value="Terdaftar Resmi">3. Terdaftar Resmi (DTSEN / SIKS-NG)</option>
                                        <option value="Disalurkan">4. Disalurkan</option>
                                        <option value="Nonaktif / Ditolak">5. Nonaktif / Ditolak</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                        Tanggal Penyaluran
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.tanggal_penyaluran}
                                        onChange={(e) => setFormData('tanggal_penyaluran', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Keterangan Sosial Ekonomi */}
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                    Keterangan Sosial & Ekonomi / SKTM
                                </label>
                                <textarea
                                    value={formData.keterangan_ekonomi}
                                    onChange={(e) => setFormData('keterangan_ekonomi', e.target.value)}
                                    rows={2}
                                    placeholder="Contoh: Memiliki SKTM No..., Kondisi rumah dinding bambu, pekerjaan buruh harian"
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-rose-800 text-white rounded-xl font-bold text-sm hover:from-emerald-800 hover:to-rose-900 transition-all shadow-md shadow-emerald-700/20"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL QUICK STATUS UPDATE (ALUR PENGUSULAN) ── */}
            {isStatusModalOpen && statusItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 bg-gradient-to-r from-blue-800 to-indigo-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-black">🔄 Perbarui Status Alur Pengusulan</h3>
                                <p className="text-xs text-blue-100 mt-0.5">{statusItem.nama_penerima}</p>
                            </div>
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                    Pilih Status Alur Terbaru
                                </label>
                                <select
                                    value={statusData.status_penyaluran}
                                    onChange={(e) => setStatusData('status_penyaluran', e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-bold"
                                >
                                    <option value="Usulan / Pendataan">1. Usulan / Pendataan RT</option>
                                    <option value="Verifikasi Musdes">2. Verifikasi Musdes / Muskel</option>
                                    <option value="Terdaftar Resmi">3. Terdaftar Resmi (DTSEN / SIKS-NG)</option>
                                    <option value="Disalurkan">4. Disalurkan</option>
                                    <option value="Nonaktif / Ditolak">5. Nonaktif / Ditolak</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
                                    Tanggal Penyaluran / Penetapan
                                </label>
                                <input
                                    type="date"
                                    value={statusData.tanggal_penyaluran}
                                    onChange={(e) => setStatusData('tanggal_penyaluran', e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusProcessing}
                                    className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold text-xs hover:bg-blue-800 shadow-sm"
                                >
                                    {statusProcessing ? 'Menyimpan...' : 'Perbarui Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
