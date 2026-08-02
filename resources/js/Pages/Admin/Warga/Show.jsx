import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Show({ warga }) {
    const { flash } = usePage().props;

    const handleGenerateAccount = (warga) => {
        const pesan = warga.user_id
            ? `Akun dari warga ini sudah terdaftar.\n\nNama: ${warga.nama_lengkap}\nNIK: ${warga.nik}\n\nJika lupa password, gunakan password general yaitu NIK warga ini. Apakah Anda ingin mereset/mengonfirmasi kredensial login sekarang?`
            : `Apakah Anda ingin membuat & mengaktifkan Akun Login otomatis untuk Kepala Keluarga ini?\n\nNama: ${warga.nama_lengkap}\nNIK: ${warga.nik}\n\nSistem akan membuatkan Username (email) dan Password (NIK) secara langsung dengan hak akses khusus Warga.`;
            
        if (confirm(pesan)) {
            router.post(route('admin.warga.generate-account', warga.id), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout header="Detail Anggota Warga">
            <Head title={`Detail Warga - ${warga.nama_lengkap}`} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                {flash?.success && (
                    <div className="p-4 mb-6 text-sm font-medium text-emerald-900 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.message && (
                    <div className="p-4 mb-6 text-sm font-medium text-blue-900 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{flash.message}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 mb-6 text-sm font-medium text-red-900 rounded-2xl bg-red-50 border border-red-200 shadow-sm flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{warga.nama_lengkap}</h2>
                        <p className="text-sm text-gray-500 mt-1">NIK: {warga.nik}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {warga.status_hubungan_keluarga === 'Kepala Keluarga' && (
                            <button
                                onClick={() => handleGenerateAccount(warga)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm inline-flex items-center gap-1.5 ${
                                    warga.user_id 
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300' 
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                {warga.user_id ? 'Regenerate Akun Login' : 'Generate Akun Login'}
                            </button>
                        )}
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
