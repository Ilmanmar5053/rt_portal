import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ iuran, wargas }) {
    const { data, setData, put, processing, errors } = useForm({
        warga_id: iuran.warga_id || '',
        jenis_iuran: iuran.jenis_iuran || 'Wajib',
        periode_bulan: iuran.periode_bulan || new Date().getMonth() + 1,
        periode_tahun: iuran.periode_tahun || new Date().getFullYear(),
        jumlah_bayar: iuran.jumlah_bayar || '',
        status_pembayaran: iuran.status_pembayaran || 'Pending',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.iuran.update', iuran.id));
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Data Iuran Kas</h2>}
        >
            <Head title="Edit Iuran Kas" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Warga Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Warga (Pembayar) *</label>
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
                                {/* Jenis Iuran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jenis Iuran *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.jenis_iuran}
                                        onChange={e => setData('jenis_iuran', e.target.value)}
                                        required
                                    >
                                        <option value="Wajib">Wajib (Bulanan)</option>
                                        <option value="Sukarela">Sukarela</option>
                                        <option value="Keamanan">Keamanan</option>
                                        <option value="Sampah">Kebersihan/Sampah</option>
                                    </select>
                                    {errors.jenis_iuran && <p className="mt-1 text-sm text-red-600">{errors.jenis_iuran}</p>}
                                </div>

                                {/* Status Pembayaran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Pembayaran *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.status_pembayaran}
                                        onChange={e => setData('status_pembayaran', e.target.value)}
                                        required
                                    >
                                        <option value="Pending">Pending (Belum Lunas)</option>
                                        <option value="Approved">Approved (Lunas)</option>
                                        <option value="Rejected">Rejected (Ditolak)</option>
                                    </select>
                                    {errors.status_pembayaran && <p className="mt-1 text-sm text-red-600">{errors.status_pembayaran}</p>}
                                </div>

                                {/* Periode Bulan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Periode Bulan *</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.periode_bulan}
                                        onChange={e => setData('periode_bulan', e.target.value)}
                                        required
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>Bulan ke-{month}</option>
                                        ))}
                                    </select>
                                    {errors.periode_bulan && <p className="mt-1 text-sm text-red-600">{errors.periode_bulan}</p>}
                                </div>

                                {/* Periode Tahun */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Periode Tahun *</label>
                                    <input
                                        type="number"
                                        min="2000"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.periode_tahun}
                                        onChange={e => setData('periode_tahun', e.target.value)}
                                        required
                                    />
                                    {errors.periode_tahun && <p className="mt-1 text-sm text-red-600">{errors.periode_tahun}</p>}
                                </div>

                                {/* Nominal */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Nominal Pembayaran (Rp) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Contoh: 50000"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.jumlah_bayar}
                                        onChange={e => setData('jumlah_bayar', e.target.value)}
                                        required
                                    />
                                    {errors.jumlah_bayar && <p className="mt-1 text-sm text-red-600">{errors.jumlah_bayar}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href={route('admin.iuran.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Perbarui Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
