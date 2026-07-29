import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ pengaduans, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'Semua');

    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.pengaduan.index'),
            { search, status, sort_field: field, sort_direction: newDirection },
            { preserveState: true, replace: true }
        );
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('admin.pengaduan.index'),
            { search, status, sort_field: sortField, sort_direction: sortDirection },
            { preserveState: true, replace: true }
        );
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('admin.pengaduan.destroy', id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100 text-green-800';
            case 'Diproses': return 'bg-yellow-100 text-yellow-800';
            case 'Diajukan': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Pengaduan Warga</h2>}
        >
            <Head title="Pengaduan Warga" />

            <div className="space-y-6">
                    
                    {flash?.success && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
                            {flash.success}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleFilter} className="flex gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Cari subjek / warga..."
                                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select
                                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="Diajukan">Diajukan</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Filter
                            </button>
                        </form>
                        <Link href={route('admin.pengaduan.create')} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Tambah Data
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="px-6 py-4">Warga</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('judul')}>
                                            Subjek <SortIndicator field="judul" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('kategori')}>
                                            Kategori <SortIndicator field="kategori" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('created_at')}>
                                            Tanggal <SortIndicator field="created_at" />
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group" onClick={() => handleSort('status_progres')}>
                                            Status <SortIndicator field="status_progres" />
                                        </th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {pengaduans.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {item.is_anonim ? 'Anonim' : item.warga?.nama_lengkap}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">{item.judul}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.kategori}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status_progres)}`}>
                                                    {item.status_progres}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link href={route('admin.pengaduan.show', item.id)} className="text-gray-600 hover:text-gray-900" title="Lihat Preview">
                                                    👁️
                                                </Link>
                                                <Link href={route('admin.pengaduan.edit', item.id)} className="text-blue-600 hover:text-blue-900" title="Edit">
                                                    ✏️
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pengaduans.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada pengaduan ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Menampilkan {pengaduans.from || 0} hingga {pengaduans.to || 0} dari {pengaduans.total} entri
                            </span>
                            <div className="flex gap-1">
                                {pengaduans.links.map((link, idx) => (
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
