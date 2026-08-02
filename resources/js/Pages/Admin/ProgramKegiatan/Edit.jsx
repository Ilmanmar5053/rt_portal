import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ program, kategoriList, statusList }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        nama_program: program.nama_program || '',
        kategori: program.kategori || 'Program',
        status: program.status || 'Direncanakan',
        tanggal_mulai: program.tanggal_mulai ? program.tanggal_mulai.substring(0, 10) : '',
        tanggal_selesai: program.tanggal_selesai ? program.tanggal_selesai.substring(0, 10) : '',
        waktu: program.waktu || '',
        lokasi: program.lokasi || '',
        pic_nama: program.pic_nama || '',
        pic_kontak: program.pic_kontak || '',
        estimasi_anggaran: program.estimasi_anggaran || '',
        realisasi_anggaran: program.realisasi_anggaran || '',
        deskripsi: program.deskripsi || '',
        eflyer: null,
    });

    const [preview, setPreview] = useState(program.eflyer_path || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('eflyer', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(program.eflyer_path || null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.program-kegiatan.update', program.id), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            Edit Program & Kegiatan
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Perbarui informasi atau ganti e-flyer untuk agenda "{program.nama_program}".
                        </p>
                    </div>
                    <Link
                        href={route('admin.program-kegiatan.index')}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        ← Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${program.nama_program} - Admin`} />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="card-residential p-6 sm:p-8 space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-black text-gray-900">Informasi Program</h3>
                        <p className="text-xs text-gray-500">Detail dasar mengenai program atau acara yang akan dilaksanakan.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Nama Program / Kegiatan *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.nama_program}
                                onChange={(e) => setData('nama_program', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.nama_program && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.nama_program}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Kategori *
                            </label>
                            <select
                                value={data.kategori}
                                onChange={(e) => setData('kategori', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            >
                                {kategoriList.map((kat) => (
                                    <option key={kat} value={kat}>{kat}</option>
                                ))}
                            </select>
                            {errors.kategori && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.kategori}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Status Pelaksanaan *
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            >
                                {statusList.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                            {errors.status && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.status}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Tanggal Mulai *
                            </label>
                            <input
                                type="date"
                                required
                                value={data.tanggal_mulai}
                                onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.tanggal_mulai && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.tanggal_mulai}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Tanggal Selesai (Opsional)
                            </label>
                            <input
                                type="date"
                                value={data.tanggal_selesai}
                                onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.tanggal_selesai && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.tanggal_selesai}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Waktu Acara (Opsional)
                            </label>
                            <input
                                type="text"
                                value={data.waktu}
                                onChange={(e) => setData('waktu', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.waktu && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.waktu}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Tempat / Lokasi Acara *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.lokasi}
                                onChange={(e) => setData('lokasi', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.lokasi && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.lokasi}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-black text-gray-900">Penanggung Jawab & Anggaran</h3>
                        <p className="text-xs text-gray-500">Kontak PIC dan perkiraan biaya pelaksanaan program.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                PIC Penanggung Jawab *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.pic_nama}
                                onChange={(e) => setData('pic_nama', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.pic_nama && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.pic_nama}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                No. HP / WA PIC (Opsional)
                            </label>
                            <input
                                type="text"
                                value={data.pic_kontak}
                                onChange={(e) => setData('pic_kontak', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.pic_kontak && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.pic_kontak}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Estimasi Anggaran (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.estimasi_anggaran}
                                onChange={(e) => setData('estimasi_anggaran', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.estimasi_anggaran && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.estimasi_anggaran}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Realisasi Anggaran (Rp - Opsional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.realisasi_anggaran}
                                onChange={(e) => setData('realisasi_anggaran', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.realisasi_anggaran && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.realisasi_anggaran}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-black text-gray-900">Deskripsi & e-Flyer / Foto Poster</h3>
                        <p className="text-xs text-gray-500">Unggah file baru jika ingin mengganti e-flyer yang sudah ada.</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Deskripsi & Rincian Program (Opsional)
                            </label>
                            <textarea
                                rows={4}
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.deskripsi && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.deskripsi}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Ganti e-Flyer / Poster (Maks. 2MB, JPG/PNG - Kosongkan jika tidak diganti)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-xl"
                            />
                            {errors.eflyer && (
                                <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.eflyer}</p>
                            )}

                            {preview && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200 inline-block">
                                    <p className="text-xs font-bold text-gray-600 mb-2">Pratinjau e-Flyer Saat Ini:</p>
                                    <img src={preview} alt="Pratinjau e-Flyer" className="max-h-64 rounded-xl object-contain shadow-md" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                        <Link
                            href={route('admin.program-kegiatan.index')}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md hover:shadow-lg disabled:opacity-50 transition"
                        >
                            {processing ? 'Menyimpan...' : 'Perbarui Program'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
