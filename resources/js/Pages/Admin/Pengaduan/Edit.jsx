import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit({ pengaduan, wargas }) {
    const { data, setData, put, processing, errors } = useForm({
        warga_id: pengaduan.warga_id || '',
        judul: pengaduan.judul || '',
        deskripsi: pengaduan.deskripsi || '',
        kategori: pengaduan.kategori || 'Fasilitas',
        is_anonim: pengaduan.is_anonim ? true : false,
        status_progres: pengaduan.status_progres || 'Diajukan',
        komentar: '' // untuk admin membalas pengaduan
    });

    const { auth } = usePage().props;
    const isAdmin = ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'].includes(auth.user.role);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.pengaduan.update', pengaduan.id));
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Pengaduan Warga</h2>}
        >
            <Head title="Edit Pengaduan" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Warga Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pelapor *</label>
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
                                {/* Judul Pengaduan */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Subjek / Judul Pengaduan *</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Lampu Jalan Mati di Blok A"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.judul}
                                        onChange={e => setData('judul', e.target.value)}
                                        required
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
                                </div>

                                {/* Kategori */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.kategori}
                                        onChange={e => setData('kategori', e.target.value)}
                                        required
                                    >
                                        <option value="Keamanan">Keamanan</option>
                                        <option value="Fasilitas">Fasilitas Umum</option>
                                        <option value="Kebersihan">Kebersihan</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    {errors.kategori && <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>}
                                </div>

                                {/* Status Progres */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Progres *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.status_progres}
                                        onChange={e => setData('status_progres', e.target.value)}
                                        required
                                    >
                                        <option value="Diajukan">Diajukan (Baru)</option>
                                        <option value="Diproses">Diproses (Sedang Ditangani)</option>
                                        <option value="Selesai">Selesai (Sudah Tuntas)</option>
                                    </select>
                                    {errors.status_progres && <p className="mt-1 text-sm text-red-600">{errors.status_progres}</p>}
                                </div>

                                {/* Deskripsi */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Detail Laporan *</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Jelaskan detail laporan secara lengkap..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.deskripsi}
                                        onChange={e => setData('deskripsi', e.target.value)}
                                        required
                                    />
                                    {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
                                </div>

                                {/* Opsi Anonim */}
                                <div className="md:col-span-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_anonim"
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        checked={data.is_anonim}
                                        onChange={e => setData('is_anonim', e.target.checked)}
                                    />
                                    <label htmlFor="is_anonim" className="ml-2 block text-sm text-gray-900">
                                        Sembunyikan nama pelapor (Laporan Anonim)
                                    </label>
                                </div>

                                {/* Komentar admin (hanya untuk role admin/staff) */}
                                {isAdmin && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Komentar Admin / Balasan</label>
                                        <textarea
                                            rows="3"
                                            placeholder="Tulis balasan atau catatan untuk pengaduan ini..."
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.komentar}
                                            onChange={e => setData('komentar', e.target.value)}
                                        />
                                        {errors.komentar && <p className="mt-1 text-sm text-red-600">{errors.komentar}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href={route('admin.pengaduan.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Perbarui Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
