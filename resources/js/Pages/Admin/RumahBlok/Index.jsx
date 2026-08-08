import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Index({ rumahBloks, filters }) {
    const { data, setData } = useForm({
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

    // Bulk Generator Modal State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const bulkForm = useForm({
        blok: 'A',
        nomor_awal: 1,
        nomor_akhir: 50,
        status_hunian: 'Kosong',
        mode: 'skip',
        keterangan: '',
    });

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

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        bulkForm.post(route('admin.rumah.generate-bulk'), {
            onSuccess: () => {
                setIsBulkModalOpen(false);
                bulkForm.reset();
            },
        });
    };

    const totalEstimate = Math.max(
        0,
        (parseInt(bulkForm.data.nomor_akhir) || 0) - (parseInt(bulkForm.data.nomor_awal) || 0) + 1
    );

    return (
        <AdminLayout header="Data Master Rumah">
            <Head title="Data Rumah" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                
                {/* Header Action Bar */}
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
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors cursor-pointer">
                            Cari
                        </button>
                    </form>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        {/* BULK GENERATOR BUTTON */}
                        <button
                            type="button"
                            onClick={() => setIsBulkModalOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-700/20 transition-all inline-flex items-center gap-2 text-xs sm:text-sm cursor-pointer hover:scale-105"
                        >
                            <span>⚡</span>
                            <span>Generate Massal</span>
                        </button>

                        <Link 
                            href={route('admin.rumah.create')} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all inline-flex items-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer hover:scale-105"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            <span>Tambah Rumah</span>
                        </Link>
                    </div>
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
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="Semua">Semua</option>
                                        <option value="Diisi">Diisi</option>
                                        <option value="Kosong">Kosong</option>
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
                                        className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Terapkan
                                    </button>
                                </td>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rumahBloks.data.length > 0 ? (
                                rumahBloks.data.map((rumah, index) => (
                                    <tr key={rumah.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                            {(rumahBloks.current_page - 1) * rumahBloks.per_page + index + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-900">
                                            {rumah.blok}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-900">
                                            {rumah.nomor_rumah}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                            {rumah.keluargas && rumah.keluargas.length > 0 && rumah.keluargas[0].alamat_lengkap ? (
                                                rumah.keluargas[0].alamat_lengkap
                                            ) : (
                                                <span className="text-gray-400 italic">Belum diatur</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                rumah.status_hunian === 'Diisi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {rumah.status_hunian}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-semibold">
                                            {rumah.keluargas_count} KK
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <button
                                                onClick={() => openPenghuniModal(rumah)}
                                                className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors border border-blue-200 cursor-pointer"
                                            >
                                                <span>👨‍👩‍👧‍👦</span>
                                                <span>Lihat</span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium space-x-2">
                                            <Link
                                                href={route('admin.rumah.edit', rumah.id)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 inline-block"
                                                title="Edit Data Rumah"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </Link>
                                            <Link
                                                href={route('admin.rumah.destroy', rumah.id)}
                                                method="delete"
                                                as="button"
                                                className="text-rose-600 hover:text-rose-900 p-1 inline-block cursor-pointer"
                                                title="Hapus Data Rumah"
                                                onClick={(e) => {
                                                    if (!confirm('Apakah Anda yakin ingin menghapus data rumah ini?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500 font-medium">
                                        Tidak ada data rumah ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {rumahBloks.links && rumahBloks.links.length > 3 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Menampilkan {rumahBloks.from || 0} - {rumahBloks.to || 0} dari {rumahBloks.total} data
                        </span>
                        <div className="flex gap-1">
                            {rumahBloks.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white font-bold'
                                            : link.url
                                            ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL BULK GENERATOR DATA MASTER RUMAH */}
            <Transition show={isBulkModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[9999]" onClose={() => setIsBulkModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-100 space-y-5">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg shadow-inner">
                                                ⚡
                                            </span>
                                            <div>
                                                <Dialog.Title as="h3" className="text-base font-black text-gray-900 leading-snug">
                                                    Bulk Generator Data Master Rumah
                                                </Dialog.Title>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Buat urutan Blok & Nomor Rumah secara otomatis & massal
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsBulkModalOpen(false)}
                                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs transition cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Modal Form */}
                                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                                        
                                        {/* Nama Blok */}
                                        <div>
                                            <InputLabel htmlFor="bulk_blok" value="Nama Blok Rumah *" />
                                            <div className="relative mt-1">
                                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                                    🏢
                                                </span>
                                                <TextInput
                                                    id="bulk_blok"
                                                    type="text"
                                                    className="pl-10 block w-full uppercase font-black text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                    value={bulkForm.data.blok}
                                                    onChange={(e) => bulkForm.setData('blok', e.target.value.toUpperCase())}
                                                    placeholder="Cth: A, B, AA, B1, C2"
                                                    required
                                                />
                                            </div>
                                            <InputError message={bulkForm.errors.blok} className="mt-1" />
                                        </div>

                                        {/* Range Nomor Rumah (Awal & Akhir) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <InputLabel htmlFor="nomor_awal" value="Nomor Awal *" />
                                                <TextInput
                                                    id="nomor_awal"
                                                    type="number"
                                                    min="1"
                                                    max="9999"
                                                    className="mt-1 block w-full font-bold text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                    value={bulkForm.data.nomor_awal}
                                                    onChange={(e) => bulkForm.setData('nomor_awal', e.target.value)}
                                                    required
                                                />
                                                <InputError message={bulkForm.errors.nomor_awal} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="nomor_akhir" value="Nomor Akhir *" />
                                                <TextInput
                                                    id="nomor_akhir"
                                                    type="number"
                                                    min="1"
                                                    max="9999"
                                                    className="mt-1 block w-full font-bold text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                    value={bulkForm.data.nomor_akhir}
                                                    onChange={(e) => bulkForm.setData('nomor_akhir', e.target.value)}
                                                    required
                                                />
                                                <InputError message={bulkForm.errors.nomor_akhir} className="mt-1" />
                                            </div>
                                        </div>

                                        {/* Dynamic Live Estimation Banner */}
                                        <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-semibold space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">📊</span>
                                                <span className="font-extrabold text-emerald-900">
                                                    Estimasi Hasil: {totalEstimate} Unit Rumah Baru
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-emerald-800 leading-snug">
                                                Akan me-generate: <strong>Blok {bulkForm.data.blok || 'A'} No. {bulkForm.data.nomor_awal || 1}</strong> sampai <strong>Blok {bulkForm.data.blok || 'A'} No. {bulkForm.data.nomor_akhir || 50}</strong>
                                            </p>
                                        </div>

                                        {/* Status Hunian & Mode Handling */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <InputLabel htmlFor="bulk_status" value="Status Hunian Default *" />
                                                <select
                                                    id="bulk_status"
                                                    className="mt-1 block w-full font-bold text-xs sm:text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                    value={bulkForm.data.status_hunian}
                                                    onChange={(e) => bulkForm.setData('status_hunian', e.target.value)}
                                                >
                                                    <option value="Kosong">🟢 Kosong (Default)</option>
                                                    <option value="Diisi">🏠 Diisi</option>
                                                </select>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="bulk_mode" value="Handling Jika Sudah Ada *" />
                                                <select
                                                    id="bulk_mode"
                                                    className="mt-1 block w-full font-bold text-xs sm:text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                    value={bulkForm.data.mode}
                                                    onChange={(e) => bulkForm.setData('mode', e.target.value)}
                                                >
                                                    <option value="skip">⏭️ Lewati (Abaikan Duplikat)</option>
                                                    <option value="update">🔄 Timpa / Update Data</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsBulkModalOpen(false)}
                                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={bulkForm.processing || totalEstimate <= 0}
                                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                <span>⚡ Generate {totalEstimate} Unit Sekarang</span>
                                            </button>
                                        </div>

                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* PENGHUNI MODAL (LIST DAFTAR KK) */}
            {selectedRumah && (
                <Transition show={showModal} as={Fragment}>
                    <Dialog as="div" className="relative z-[9999]" onClose={closeModal}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-200"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-150"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                                                    🏠
                                                </span>
                                                <div>
                                                    <Dialog.Title as="h3" className="text-base font-black text-gray-900 leading-snug">
                                                        Daftar Penghuni Rumah — Blok {selectedRumah.blok} No. {selectedRumah.nomor_rumah}
                                                    </Dialog.Title>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Status Hunian: <span className="font-bold text-emerald-700">{selectedRumah.status_hunian}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={closeModal}
                                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs transition cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {selectedRumah.keluargas && selectedRumah.keluargas.length > 0 ? (
                                                selectedRumah.keluargas.map((kk) => (
                                                    <div key={kk.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                                                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                                                                    Kartu Keluarga
                                                                </span>
                                                                <span className="font-mono text-xs font-bold text-gray-800">
                                                                    KK: {kk.no_kk}
                                                                </span>
                                                            </div>
                                                            <Link
                                                                href={route('admin.keluarga.show', kk.id)}
                                                                className="text-[11px] font-bold text-blue-600 hover:underline"
                                                            >
                                                                Detail KK →
                                                            </Link>
                                                        </div>

                                                        <div className="space-y-1 text-xs text-gray-700">
                                                            <p>
                                                                👤 <strong>Kepala Keluarga:</strong>{' '}
                                                                {kk.kepala_keluarga_nama || (kk.kepala_keluarga ? kk.kepala_keluarga.nama_lengkap : 'Belum diatur')}
                                                            </p>
                                                            <p>
                                                                👨‍👩‍👧‍👦 <strong>Jumlah Anggota:</strong>{' '}
                                                                {kk.wargas ? kk.wargas.length : 0} Orang
                                                            </p>
                                                            {kk.wargas && kk.wargas.length > 0 && (
                                                                <div className="pt-2 border-t border-gray-200/60">
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                        Daftar Anggota Keluarga:
                                                                    </span>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {kk.wargas.map(w => (
                                                                            <span key={w.id} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] font-semibold text-gray-800 shadow-2xs">
                                                                                {w.nama_lengkap} ({w.status_hubungan_keluarga})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center space-y-1">
                                                    <span className="text-2xl block">🟢</span>
                                                    <p className="text-xs font-bold text-gray-600">Rumah ini belum terdaftar memiliki penghuni KK.</p>
                                                    <p className="text-[11px] text-gray-400">Gunakan menu Tambah KK untuk mendaftarkan penghuni di alamat ini.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={closeModal}
                                                className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition cursor-pointer"
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </AdminLayout>
    );
}
