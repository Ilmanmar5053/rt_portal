import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ surats, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'Semua');
    const [jenisSurat, setJenisSurat] = useState(filters.jenis_surat || 'Semua');

    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.surat.index'),
            { search, status, jenis_surat: jenisSurat, sort_field: field, sort_direction: newDirection },
            { preserveState: true, replace: true }
        );
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.surat.index'),
            { search, status, jenis_surat: jenisSurat, sort_field: sortField, sort_direction: sortDirection },
            { preserveState: true, replace: true }
        );
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('admin.surat.destroy', id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Disetujui': return 'bg-green-100 text-green-800';
            case 'Pending RT': 
            case 'Pending RW': return 'bg-yellow-100 text-yellow-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Surat Pengantar</h2>}
        >
            <Head title="Surat Pengantar" />

            <div className="space-y-6">
                    
                    {flash?.success && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
                            {flash.success}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleFilter} className="flex gap-2 w-full sm:w-auto">
                            <select
                                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={jenisSurat}
                                onChange={(e) => {
                                    setJenisSurat(e.target.value);
                                    // Trigger form submit immediately for dropdowns
                                    setTimeout(() => document.getElementById('filter-btn').click(), 10);
                                }}
                            >
                                <option value="Semua">-- Semua Jenis Surat --</option>
                                <optgroup label="Kependudukan & Identitas">
                                    <option value="Surat Pengantar Pembuatan KTP & KK">KTP & KK</option>
                                    <option value="Surat Pengantar Pindah Datang / Pindah Keluar">Pindah Domisili</option>
                                    <option value="Surat Keterangan Domisili">Domisili</option>
                                </optgroup>
                                <optgroup label="Sosial & Kesejahteraan">
                                    <option value="Surat Keterangan Tidak Mampu (SKTM)">SKTM</option>
                                    <option value="Surat Pengantar Kematian">Kematian</option>
                                    <option value="Surat Pengantar Kelahiran">Kelahiran</option>
                                </optgroup>
                                <optgroup label="Ekonomi & Perizinan">
                                    <option value="Surat Keterangan Usaha (SKU)">Usaha (SKU)</option>
                                    <option value="Surat Izin Keramaian">Izin Keramaian</option>
                                </optgroup>
                                <optgroup label="Pernikahan & Keluarga">
                                    <option value="Surat Pengantar Nikah (NA)">Pengantar Nikah</option>
                                    <option value="Surat Keterangan Belum Menikah / Status Janda/Duda">Status Pernikahan</option>
                                </optgroup>
                                <optgroup label="Kepolisian & Hukum">
                                    <option value="Surat Pengantar Kelakuan Baik">Kelakuan Baik</option>
                                    <option value="Surat Pengantar Kehilangan">Kehilangan</option>
                                </optgroup>
                            </select>
                            <select
                                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setTimeout(() => document.getElementById('filter-btn').click(), 10);
                                }}
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="Draft">Draft</option>
                                <option value="Pending RT">Pending RT</option>
                                <option value="Pending RW">Pending RW</option>
                                <option value="Disetujui">Disetujui</option>
                                <option value="Ditolak">Ditolak</option>
                            </select>
                            <button id="filter-btn" type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Filter
                            </button>
                        </form>
                        <Link href={route('admin.surat.create')} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Buat Surat Baru
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="px-6 py-4 w-16 text-center">No</th>
                                        <th className="px-6 py-4">Warga</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('jenis_surat')}>
                                            Jenis Surat <SortIndicator field="jenis_surat" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('keperluan')}>
                                            Keperluan <SortIndicator field="keperluan" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('created_at')}>
                                            Tanggal Diajukan <SortIndicator field="created_at" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('status')}>
                                            Status <SortIndicator field="status" />
                                        </th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {surats.data.map((item, index) => {
                                        const d = new Date(item.created_at);
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const month = d.toLocaleString('id-ID', { month: 'short' });
                                        const year = d.getFullYear();
                                        const hour = String(d.getHours()).padStart(2, '0');
                                        const min = String(d.getMinutes()).padStart(2, '0');
                                        const sec = String(d.getSeconds()).padStart(2, '0');
                                        const formattedDate = `${day}/${month}/${year} ${hour}:${min}:${sec}`;

                                        return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-center font-medium text-gray-500">
                                                {(surats.current_page - 1) * surats.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.warga?.nama_lengkap}</td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">{item.jenis_surat}</td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{item.keperluan}</td>
                                            <td className="px-6 py-4 text-gray-600">{formattedDate}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link href={route('admin.surat.show', item.id)} className="text-gray-600 hover:text-gray-900" title="Cetak Surat">
                                                    🖨️
                                                </Link>
                                                <Link href={route('admin.surat.edit', item.id)} className="text-blue-600 hover:text-blue-900" title="Edit">
                                                    ✏️
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                    {surats.data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada permohonan surat ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Menampilkan {surats.from || 0} hingga {surats.to || 0} dari {surats.total} entri
                            </span>
                            <div className="flex gap-1">
                                {surats.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm border rounded-md ${
                                            link.active 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
            </div>
        </AdminLayout>
    );
}
