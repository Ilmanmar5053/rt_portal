import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Edit({ transaksi, kategoriPemasukan, kategoriPengeluaran }) {
    const { data, setData, put, processing, errors } = useForm({
        tanggal: transaksi.tanggal,
        jenis: transaksi.jenis,
        kategori: transaksi.kategori,
        keterangan: transaksi.keterangan,
        jumlah: transaksi.jumlah,
        referensi: transaksi.referensi || '',
    });

    const kategoriList = data.jenis === 'Pemasukan' ? kategoriPemasukan : kategoriPengeluaran;

    const handleJenisChange = (newJenis) => {
        const defaultKat = newJenis === 'Pemasukan' ? kategoriPemasukan[0] : kategoriPengeluaran[0];
        setData({ ...data, jenis: newJenis, kategori: defaultKat });
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.transaksi-kas.update', transaksi.id));
    };

    return (
        <AdminLayout header={<h2 className="text-2xl font-bold text-gray-800">Edit Transaksi</h2>}>
            <Head title="Edit Transaksi" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Mengubah transaksi akan menghitung ulang semua saldo secara otomatis.
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex">
                        <button type="button" onClick={() => handleJenisChange('Pemasukan')}
                            className={`flex-1 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${data.jenis === 'Pemasukan' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                            Pemasukan (Debet)
                        </button>
                        <button type="button" onClick={() => handleJenisChange('Pengeluaran')}
                            className={`flex-1 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${data.jenis === 'Pengeluaran' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                            Pengeluaran (Kredit)
                        </button>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal *</label>
                                <input type="date" className={`block w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none ${errors.tanggal ? 'border-red-400' : 'border-gray-200'}`}
                                    value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} required />
                                {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori *</label>
                                <select className={`block w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white ${errors.kategori ? 'border-red-400' : 'border-gray-200'}`}
                                    value={data.kategori} onChange={(e) => setData('kategori', e.target.value)}>
                                    {kategoriList.map((k) => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan *</label>
                            <textarea className={`block w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none ${errors.keterangan ? 'border-red-400' : 'border-gray-200'}`}
                                rows="3" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} required />
                            {errors.keterangan && <p className="text-red-500 text-xs mt-1">{errors.keterangan}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rp</span>
                                    <input type="number" min="1" step="any" className={`block w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none ${errors.jumlah ? 'border-red-400' : 'border-gray-200'}`}
                                        value={data.jumlah} onChange={(e) => setData('jumlah', e.target.value)} required />
                                </div>
                                {data.jumlah && <p className="text-xs text-gray-500 mt-1">{fmt(data.jumlah)}</p>}
                                {errors.jumlah && <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Referensi <span className="font-normal text-gray-400">(opsional)</span></label>
                                <input type="text" className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                                    placeholder="No. kwitansi, transfer, dll." value={data.referensi} onChange={(e) => setData('referensi', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            <Link href={route('admin.transaksi-kas.index')} className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium">Batal</Link>
                            <button type="submit" disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
                                {processing ? 'Menyimpan...' : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
