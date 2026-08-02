import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Index({ rumahBloks, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        blok: filters.blok || '',
        nomor_rumah: filters.nomor_rumah || '',
        alamat: filters.alamat || '',
        status: filters.status || 'Semua',
        jumlah_keluarga: filters.jumlah_keluarga || '',
        sort_field: filters.sort_field || 'blok',
        sort_direction: filters.sort_direction || 'asc',
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedRumah, setSelectedRumah] = useState(null);

    const sortField = data.sort_field || filters.sort_field || 'blok';
    const sortDirection = data.sort_direction || filters.sort_direction || 'asc';

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.rumah.index'), { ...data, sort_field: field, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.rumah.index'), data, { preserveState: true, replace: true });
    };

    const handleFilter = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.rumah.index'), data, { preserveState: true, replace: true });
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setData('status', value);
        router.get(route('admin.rumah.index'), { ...data, status: value }, { preserveState: true, replace: true });
    };

    const openPenghuniModal = (rumah) => {
        setSelectedRumah(rumah);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRumah(null);
    };

    return (
        <AdminLayout header="Data Master Rumah">
            <Head title="Data Rumah" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-1/2 md:w-1/3 flex">
                        <TextInput
                            type="text"
                            name="search"
                            value={data.search}
                            className="block w-full rounded-r-none"
                            placeholder="Cari Blok / Nomor..."
                            onChange={(e) => setData('search', e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors">
                            Cari
                        </button>
                    </form>

                    <Link href={route('admin.rumah.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Rumah
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('blok')}>
                                    Blok <SortIndicator field="blok" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nomor_rumah')}>
                                    Nomor <SortIndicator field="nomor_rumah" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat/Jalan</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status_hunian')}>
                                    Status Hunian <SortIndicator field="status_hunian" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('keluargas_count')}>
                                    Jml KK Menghuni <SortIndicator field="keluargas_count" />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Penghuni</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            <tr className="bg-white text-sm text-gray-600">
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="blok"
                                        value={data.blok}
                                        placeholder="Filter Blok"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('blok', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="nomor_rumah"
                                        value={data.nomor_rumah}
                                        placeholder="Filter Nomor"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('nomor_rumah', e.target.value)}
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
                                    <select
                                        name="status"
                                        value={data.status}
                                        onChange={handleStatusChange}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    >
                                        <option value="Semua">Semua</option>
                                        <option value="Kosong">Kosong</option>
                                        <option value="Diisi">Diisi</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <TextInput
                                        type="text"
                                        name="jumlah_keluarga"
                                        value={data.jumlah_keluarga}
                                        placeholder="Filter Jumlah"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        onChange={(e) => setData('jumlah_keluarga', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                    />
                                </td>
                                <td className="px-4 py-2"></td>
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
                            {rumahBloks.data.length > 0 ? (
                                rumahBloks.data.map((rumah, index) => (
                                    <tr key={rumah.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {rumahBloks.from ? rumahBloks.from + index : index + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{rumah.blok}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{rumah.nomor_rumah}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 line-clamp-1 max-w-[220px]">
                                                {rumah.keluargas && rumah.keluargas.length > 0 ? rumah.keluargas[0].alamat_lengkap : '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${rumah.status_hunian === 'Kosong' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {rumah.status_hunian}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {rumah.keluargas_count} KK
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {rumah.keluargas_count > 0 ? (
                                                <button
                                                    onClick={() => openPenghuniModal(rumah)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                    Lihat
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Tidak ada penghuni</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('admin.rumah.edit', rumah.id)}
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 transition"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={route('admin.rumah.destroy', rumah.id)}
                                                method="delete"
                                                as="button"
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition"
                                                title="Hapus"
                                                onClick={(e) => {
                                                    if (!confirm('Apakah Anda yakin ingin menghapus data rumah ini?')) e.preventDefault();
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                                        Tidak ada data Rumah yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Menampilkan {rumahBloks.from || 0} sampai {rumahBloks.to || 0} dari {rumahBloks.total} data
                    </span>
                    <div className="flex space-x-1">
                        {rumahBloks.links.map((link, index) => (
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

            {/* Modal Lihat Penghuni */}
            {showModal && selectedRumah && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden z-10">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">Daftar Penghuni Rumah</h3>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Blok {selectedRumah.blok} No. {selectedRumah.nomor_rumah}
                                    </p>
                                </div>
                                <button onClick={closeModal} className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {selectedRumah.keluargas && selectedRumah.keluargas.length > 0 ? (
                                selectedRumah.keluargas.map((kk, index) => (
                                    <div key={kk.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        {/* KK Header */}
                                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">No. KK</p>
                                                        <p className="text-sm font-bold text-gray-900">{kk.no_kk}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Kepala Keluarga</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {kk.kepala_keluarga ? kk.kepala_keluarga.nama_lengkap : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Anggota Keluarga */}
                                        <div className="divide-y divide-gray-100">
                                            {kk.wargas && kk.wargas.length > 0 ? (
                                                kk.wargas.map((warga) => (
                                                    <div key={warga.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                {warga.nama_lengkap ? warga.nama_lengkap.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{warga.nama_lengkap}</p>
                                                                <p className="text-xs text-gray-500">{warga.nik || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            warga.status_hubungan_keluarga === 'Kepala Keluarga' ? 'bg-blue-100 text-blue-800' :
                                                            warga.status_hubungan_keluarga === 'Istri' ? 'bg-pink-100 text-pink-800' :
                                                            warga.status_hubungan_keluarga === 'Anak' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {warga.status_hubungan_keluarga || '-'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-5 py-4 text-center text-sm text-gray-400 italic">
                                                    Belum ada data anggota warga terdaftar di KK ini.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>
                                    <p>Tidak ada data KK yang terdaftar di rumah ini.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
