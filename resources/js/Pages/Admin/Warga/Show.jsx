import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ warga }) {
    return (
        <AdminLayout header="Detail Anggota Warga">
            <Head title={`Detail Warga - ${warga.nama_lengkap}`} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{warga.nama_lengkap}</h2>
                        <p className="text-sm text-gray-500 mt-1">NIK: {warga.nik}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.warga.edit', warga.id)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                            Edit Warga
                        </Link>
                        <Link href={route('admin.warga.index')} className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informasi Pribadi</h3>
                        <dl className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Tempat, Tgl Lahir</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.tempat_lahir}, {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID')}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Jenis Kelamin</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.jenis_kelamin}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Agama</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.agama}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Pendidikan</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.pendidikan}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Pekerjaan</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.pekerjaan}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Status Perkawinan</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.status_perkawinan}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Kewarganegaraan</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.kewarganegaraan}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Keluarga & Kontak</h3>
                        <dl className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">No Kartu Keluarga</dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    {warga.keluarga ? (
                                        <Link href={route('admin.keluarga.show', warga.keluarga.id)} className="text-blue-600 hover:underline">
                                            {warga.keluarga.no_kk}
                                        </Link>
                                    ) : '-'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Status Keluarga</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.status_hubungan_keluarga}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Nama Ayah</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.nama_ayah}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Nama Ibu</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.nama_ibu}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <dt className="text-sm font-medium text-gray-500">Nomor HP</dt>
                                <dd className="text-sm text-gray-900 col-span-2">{warga.no_hp || '-'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">Status Hidup</dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${warga.status_hidup === 'Hidup' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {warga.status_hidup}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
