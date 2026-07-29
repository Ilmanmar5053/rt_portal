import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { debounce } from 'lodash';

export default function Index({ wargas, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        nik: filters.nik || '',
        nama: filters.nama || '',
        kk: filters.kk || '',
        status: filters.status || 'Semua',
        ttl: filters.ttl || '',
    });

    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        get(route('admin.warga.index'), { ...data, sort_field: field, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    const handleSearch = debounce((value) => {
        setData('search', value);
        get(route('admin.warga.index'), { ...data, search: value, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true, replace: true });
    }, 500);

    const onSearchChange = (e) => {
        handleSearch(e.target.value);
    };

    const handleFilter = (e) => {
        e.preventDefault();
        get(route('admin.warga.index'), { ...data, sort_field: sortField, sort_direction: sortDirection }, { preserveState: true, replace: true });
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data anggota keluarga ini?')) {
            router.delete(route('admin.warga.destroy', id));
        }
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Data Anggota Warga
                </h2>
            }
        >
            <Head title="Data Warga" />

            <div>
                <div className="overflow-hidden bg-white/80 backdrop-blur-xl shadow-sm sm:rounded-2xl border border-gray-100 mb-6">
                    <div className="p-6 text-gray-900">
                            
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <Link 
                                    href={route('admin.warga.create')} 
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/30 font-medium"
                                >
                                    + Tambah Anggota
                                </Link>
                                
                                <div className="w-full sm:w-1/3 relative">
                                    <input 
                                        type="text" 
                                        value={data.search}
                                        onChange={onSearchChange}
                                        placeholder="Cari NIK, Nama, atau No KK..." 
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                                    />
                                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">No</th>
                                            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nik')}>
                                                NIK <SortIndicator field="nik" />
                                            </th>
                                            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nama_lengkap')}>
                                                Nama Lengkap <SortIndicator field="nama_lengkap" />
                                            </th>
                                            <th className="px-4 py-3 font-semibold">Keluarga (No KK)</th>
                                            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status_hubungan_keluarga')}>
                                                Status Keluarga <SortIndicator field="status_hubungan_keluarga" />
                                            </th>
                                            <th className="px-4 py-3 font-semibold">TTL / Jenis Kelamin</th>
                                            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                        </tr>
                                        <tr className="bg-white text-sm text-gray-600">
                                            <td className="px-4 py-2"></td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.nik}
                                                    onChange={(e) => setData('nik', e.target.value)}
                                                    placeholder="Filter NIK"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.nama}
                                                    onChange={(e) => setData('nama', e.target.value)}
                                                    placeholder="Filter Nama"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.kk}
                                                    onChange={(e) => setData('kk', e.target.value)}
                                                    placeholder="Filter KK"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="Semua">Semua</option>
                                                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                                                    <option value="Istri">Istri</option>
                                                    <option value="Anak">Anak</option>
                                                    <option value="Famili Lain">Famili Lain</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={data.ttl}
                                                    onChange={(e) => setData('ttl', e.target.value)}
                                                    placeholder="Filter TTL / Jenis Kelamin"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={handleFilter}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                                >
                                                    Terapkan
                                                </button>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {wargas.data.length > 0 ? wargas.data.map((warga, index) => (
                                            <tr key={warga.id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {wargas.from ? wargas.from + index : index + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {warga.nik}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {warga.nama_lengkap}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {warga.keluarga ? (
                                                        <Link href={route('admin.keluarga.show', warga.keluarga.id)} className="text-blue-600 hover:underline text-sm">
                                                            {warga.keluarga.no_kk}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-red-500 text-xs italic">Tanpa KK</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${warga.status_hubungan_keluarga === 'Kepala Keluarga' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {warga.status_hubungan_keluarga}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    <div>{warga.tempat_lahir}, {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID')}</div>
                                                    <div className="mt-0.5">{warga.jenis_kelamin}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="inline-flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('admin.warga.show', warga.id)}
                                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                                                            title="Detail"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('admin.warga.edit', warga.id)}
                                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(warga.id)}
                                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-800 transition"
                                                            title="Hapus"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                                                    Belum ada data warga ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {wargas.links && wargas.links.length > 3 && (
                                <div className="mt-6 flex justify-end">
                                    <div className="inline-flex shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                        {wargas.links.map((link, k) => (
                                            <Link
                                                key={k}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                </div>
            </div>
        </AdminLayout>
    );
}
