import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';

export default function Index({ keluargas, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        no_kk: filters.no_kk || '',
        kepala: filters.kepala || '',
        alamat: filters.alamat || '',
        jumlah_anggota: filters.jumlah_anggota || '',
        sort_field: filters.sort_field || 'no_kk',
        sort_direction: filters.sort_direction || 'asc',
    });

    const sortField = data.sort_field || filters.sort_field || 'no_kk';
    const sortDirection = data.sort_direction || filters.sort_direction || 'asc';

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.keluarga.index'), { ...data, sort_field: field, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.keluarga.index'), data, { preserveState: true, replace: true });
    };

    const handleFilter = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.keluarga.index'), data, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout header="Data Keluarga (KK)">
            <Head title="Data Keluarga" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-1/2 md:w-1/3 flex">
                        <TextInput
                            type="text"
                            name="search"
                            value={data.search}
                            className="block w-full rounded-r-none"
                            placeholder="Cari No KK / Nama Kepala..."
                            onChange={(e) => setData('search', e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors">
                            Cari
                        </button>
                    </form>

                    <Link href={route('admin.keluarga.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah KK
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('no_kk')}>
                                    No KK <SortIndicator field="no_kk" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nama_lengkap')}>
                                    Kepala Keluarga <SortIndicator field="nama_lengkap" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('alamat_lengkap')}>
                                    Alamat & Blok <SortIndicator field="alamat_lengkap" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('wargas_count')}>
                                    Jml Anggota <SortIndicator field="wargas_count" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            <tr className="bg-white text-sm text-gray-600">
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="no_kk"
                                        value={data.no_kk}
                                        placeholder="Filter No KK"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('no_kk', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="kepala"
                                        value={data.kepala}
                                        placeholder="Filter Kepala"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('kepala', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="alamat"
                                        value={data.alamat}
                                        placeholder="Filter Alamat"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="jumlah_anggota"
                                        value={data.jumlah_anggota}
                                        placeholder="Filter Jumlah"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('jumlah_anggota', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        type="button"
                                        onClick={handleFilter}
                                        className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 text-sm font-bold shadow-sm"
                                    >
                                        Terapkan
                                    </button>
                                </td>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {keluargas.data.length > 0 ? (
                                keluargas.data.map((kk, index) => (
                                    <tr key={kk.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {keluargas.from ? keluargas.from + index : index + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{kk.no_kk}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {kk.kepala_keluarga ? kk.kepala_keluarga.nama_lengkap : <span className="text-red-500 italic">Belum Ada</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">
                                                {kk.rumah_blok ? `Blok ${kk.rumah_blok.blok} No ${kk.rumah_blok.nomor_rumah}` : '-'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{kk.alamat_lengkap}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {kk.wargas ? kk.wargas.length : 0} Orang
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="inline-flex items-center justify-end gap-1">
                                                <Link
                                                    href={route('admin.keluarga.show', kk.id)}
                                                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition"
                                                    title="Detail"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={route('admin.keluarga.edit', kk.id)}
                                                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 transition"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={route('admin.keluarga.destroy', kk.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition"
                                                    title="Hapus"
                                                    onClick={(e) => {
                                                        if (!confirm('Apakah Anda yakin ingin menghapus KK ini beserta semua dokumennya? Data Warga anggotanya tidak akan ikut terhapus namun kehilangan relasi KK.')) e.preventDefault();
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                                        Tidak ada data Keluarga yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Simplified version) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Menampilkan {keluargas.from || 0} sampai {keluargas.to || 0} dari {keluargas.total} data
                    </span>
                    <div className="flex space-x-1">
                        {keluargas.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded-md text-sm ${link.active ? 'bg-blue-600 text-white font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
