import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ iurans, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'Semua');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [processingBulk, setProcessingBulk] = useState(false);

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
            case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Iuran Kas</h2>}>
            <Head title="Iuran Kas" />

            <div className="space-y-5">
                {flash?.success && (
                    <div className="p-4 text-sm text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        {flash.success}
                    </div>
                )}

                {/* Filter & Actions bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="flex gap-2 w-full sm:w-auto flex-wrap">
                        <input
                            type="text"
                            placeholder="Cari nama warga..."
                            className="border border-gray-200 rounded-lg shadow-sm focus:border-blue-400 focus:ring-blue-400 text-sm px-3 py-2 flex-1 min-w-[180px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="border border-gray-200 rounded-lg shadow-sm focus:border-blue-400 focus:ring-blue-400 text-sm px-3 py-2 bg-white"
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
                        <button id="filter-btn-iuran" type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                            Filter
                        </button>
                    </form>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => setShowGenerateModal(true)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 font-medium text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            Generate Iuran
                        </button>
                        <Link href={route('admin.iuran.create')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Tambah Data
                        </Link>
                    </div>
                </div>

                {/* Bulk Action Bar — muncul kalau ada yang dipilih */}
                {selectedIds.length > 0 && (
                    <div className="bg-blue-600 text-white rounded-xl px-5 py-3 flex flex-wrap items-center gap-3 shadow-lg animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-medium">data dipilih</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto flex-wrap">
                            <select
                                className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-gray-800"
                                value={bulkAction}
                                onChange={(e) => setBulkAction(e.target.value)}
                            >
                                <option value="">— Pilih Aksi —</option>
                                <option value="approve">✓ Tandai Lunas (Approved)</option>
                                <option value="reject">✗ Tandai Rejected</option>
                                <option value="delete">🗑 Hapus Data</option>
                            </select>
                            <button
                                onClick={handleBulkAction}
                                disabled={!bulkAction || processingBulk}
                                className="bg-white text-blue-700 font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50 transition-all"
                            >
                                {processingBulk ? 'Memproses...' : 'Jalankan'}
                            </button>
                            <button onClick={() => setSelectedIds([])} className="text-white/80 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10">
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100">
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
                                    <th className="px-4 py-4">Warga</th>
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
                                            <td className="px-4 py-3 font-medium text-gray-900">{iuran.warga?.nama_lengkap}</td>
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
                                                    <Link
                                                        href={route('admin.iuran.toggle-lunas', iuran.id)}
                                                        method="patch"
                                                        as="button"
                                                        preserveScroll
                                                        className={`p-1.5 rounded-lg transition-colors font-bold ${iuran.status_pembayaran === 'Approved' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                        title={iuran.status_pembayaran === 'Approved' ? 'Batalkan Lunas' : 'Tandai Lunas'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    </Link>
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
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="text-4xl mb-2">📋</div>
                                            <p className="text-gray-500">Tidak ada data iuran ditemukan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-gray-500">
                            {selectedIds.length > 0
                                ? <span className="text-blue-600 font-medium">{selectedIds.length} dipilih · </span>
                                : null}
                            Menampilkan {iurans.from || 0}–{iurans.to || 0} dari {iurans.total} entri
                        </div>
                        <div className="flex gap-1">
                            {iurans.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 text-sm rounded-lg ${link.active ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Generate Iuran */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Generate Iuran Bulanan Massal</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-800">Fitur ini akan membuat tagihan iuran berstatus "Pending" untuk semua warga yang belum memiliki tagihan pada periode yang dipilih.</p>
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
