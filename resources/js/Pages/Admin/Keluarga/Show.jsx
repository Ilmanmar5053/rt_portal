import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ keluarga }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus data anggota keluarga ini?')) {
            router.delete(route('admin.warga.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AdminLayout header="Detail Kartu Keluarga (KK)">
            <Head title={`Detail KK - ${keluarga.no_kk}`} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">NO KK: {keluarga.no_kk}</h2>
                        <p className="text-sm text-gray-500 mt-1">Kepala Keluarga: {keluarga.kepala_keluarga ? keluarga.kepala_keluarga.nama_lengkap : 'Belum Ada'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.keluarga.edit', keluarga.id)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                            Edit KK
                        </Link>
                        <Link href={route('admin.keluarga.index')} className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informasi Alamat</h3>
                        <dl className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Alamat</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.alamat_lengkap}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">RT / RW</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.rt} / {keluarga.rw}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Kelurahan/Desa</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.kelurahan}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Kecamatan</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.kecamatan}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Kabupaten/Kota</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.kabupaten_kota}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Provinsi</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.provinsi}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Kode Pos</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{keluarga.kode_pos || '-'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                                <dt className="text-sm font-medium text-gray-500">Domisili RT Blok</dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    {keluarga.rumah_blok ? `Blok ${keluarga.rumah_blok.blok} No ${keluarga.rumah_blok.nomor_rumah}` : '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Dokumen Lampiran</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Scan Kartu Keluarga</p>
                                        <p className="text-xs text-gray-500">{keluarga.file_kk ? 'Tersedia' : 'Belum diunggah'}</p>
                                    </div>
                                </div>
                                {keluarga.file_kk ? (
                                    <div className="relative group inline-block">
                                        <a href={`/storage/${keluarga.file_kk}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">Lihat File</a>
                                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 bg-white p-2 rounded-lg shadow-xl border border-gray-200">
                                            <img src={`/storage/${keluarga.file_kk}`} alt="Preview KK" className="max-w-[400px] max-h-[400px] object-contain rounded-md bg-gray-50" />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Kosong</span>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">KTP Kepala Keluarga</p>
                                        <p className="text-xs text-gray-500">{keluarga.file_ktp_kepala ? 'Tersedia' : 'Belum diunggah'}</p>
                                    </div>
                                </div>
                                {keluarga.file_ktp_kepala ? (
                                    <div className="relative group inline-block">
                                        <a href={`/storage/${keluarga.file_ktp_kepala}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">Lihat File</a>
                                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 bg-white p-2 rounded-lg shadow-xl border border-gray-200">
                                            <img src={`/storage/${keluarga.file_ktp_kepala}`} alt="Preview KTP" className="max-w-[400px] max-h-[400px] object-contain rounded-md bg-gray-50" />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Kosong</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Daftar Anggota Keluarga ({keluarga.wargas?.length || 0})</h3>
                        <Link href={route('admin.warga.create')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Tambah Anggota</Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">NIK</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status Hubungan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pendidikan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pekerjaan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {keluarga.wargas && keluarga.wargas.length > 0 ? (
                                    keluarga.wargas.map((warga) => (
                                        <tr key={warga.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{warga.nik}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{warga.nama_lengkap}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${warga.status_hubungan_keluarga === 'Kepala Keluarga' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {warga.status_hubungan_keluarga}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{warga.pendidikan}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{warga.pekerjaan}</td>
                                            <td className="px-4 py-3 text-sm text-right space-x-3">
                                                <Link href={route('admin.warga.show', warga.id)} className="text-blue-600 hover:text-blue-900">Detail</Link>
                                                <button onClick={() => handleDelete(warga.id)} className="text-red-600 hover:text-red-900 font-medium">Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                                            Belum ada data anggota keluarga.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
