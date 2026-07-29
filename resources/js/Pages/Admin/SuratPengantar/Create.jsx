import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ wargas }) {
    const { data, setData, post, processing, errors } = useForm({
        warga_id: '',
        jenis_surat: 'Surat Keterangan Domisili',
        keperluan: '',
        keterangan_tambahan: '',
        status: 'Pending RT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.surat.store'));
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Buat Surat Pengantar Baru</h2>}
        >
            <Head title="Buat Surat Pengantar" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Warga Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pemohon (Warga) *</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.warga_id}
                                    onChange={e => setData('warga_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Warga --</option>
                                    {wargas.map(w => (
                                        <option key={w.id} value={w.id}>{w.nama_lengkap} (KK: {w.keluarga?.no_kk || 'Tanpa KK'})</option>
                                    ))}
                                </select>
                                {errors.warga_id && <p className="mt-1 text-sm text-red-600">{errors.warga_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Jenis Surat */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jenis Surat (AI Template) *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.jenis_surat}
                                        onChange={e => setData('jenis_surat', e.target.value)}
                                        required
                                    >
                                        <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                                        <option value="Surat Pindah">Surat Pengantar Pindah</option>
                                        <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu (SKTM)</option>
                                        <option value="Surat Keterangan Usaha">Surat Keterangan Usaha (SKU)</option>
                                        <option value="Lainnya">Lainnya...</option>
                                    </select>
                                    {errors.jenis_surat && <p className="mt-1 text-sm text-red-600">{errors.jenis_surat}</p>}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Awal *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        required
                                    >
                                        <option value="Pending RT">Pending RT</option>
                                        <option value="Pending RW">Pending RW (Disetujui RT)</option>
                                        <option value="Disetujui">Disetujui (Siap Cetak)</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>

                                {/* Keperluan */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Keperluan Pembuatan Surat *</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Pembuatan KTP Baru / Syarat Beasiswa"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.keperluan}
                                        onChange={e => setData('keperluan', e.target.value)}
                                        required
                                    />
                                    {errors.keperluan && <p className="mt-1 text-sm text-red-600">{errors.keperluan}</p>}
                                </div>

                                {/* Keterangan Tambahan */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Keterangan Tambahan (Opsional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Catatan tambahan untuk dimasukkan ke dalam surat (jika ada)..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.keterangan_tambahan}
                                        onChange={e => setData('keterangan_tambahan', e.target.value)}
                                    />
                                    {errors.keterangan_tambahan && <p className="mt-1 text-sm text-red-600">{errors.keterangan_tambahan}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href={route('admin.surat.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Buat Surat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
