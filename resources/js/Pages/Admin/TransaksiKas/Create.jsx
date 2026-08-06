import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Create({ kategoriPemasukan, kategoriPengeluaran, saldoSaatIni }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        jenis: 'Pemasukan',
        kategori: kategoriPemasukan[0],
        keterangan: '',
        jumlah: '',
        referensi: '',
    });

    const kategoriList = data.jenis === 'Pemasukan' ? kategoriPemasukan : kategoriPengeluaran;

    const handleJenisChange = (newJenis) => {
        const defaultKat = newJenis === 'Pemasukan' ? kategoriPemasukan[0] : kategoriPengeluaran[0];
        setData({ ...data, jenis: newJenis, kategori: defaultKat });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.transaksi-kas.store'));
    };

    const previewSaldo = data.jenis === 'Pemasukan'
        ? saldoSaatIni + (parseFloat(data.jumlah) || 0)
        : saldoSaatIni - (parseFloat(data.jumlah) || 0);

    return (
        <AdminLayout header={<h2 className="text-2xl font-bold text-gray-800">Catat Transaksi Baru</h2>}>
            <Head title="Catat Transaksi" />

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Flash Error Alert */}
                {flash?.error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <div>
                            <h3 className="text-sm font-bold text-red-800">Transaksi Gagal</h3>
                            <p className="text-sm text-red-700 mt-1">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Saldo Info */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-5 text-white flex items-center justify-between">
                    <div>
                        <p className="text-indigo-200 text-sm">Saldo Kas Saat Ini</p>
                        <p className="text-2xl font-bold">{fmt(saldoSaatIni)}</p>
                    </div>
                    {data.jumlah && (
                        <div className="text-right">
                            <p className="text-indigo-200 text-sm">Saldo Setelah Transaksi</p>
                            <p className={`text-xl font-bold ${previewSaldo >= 0 ? 'text-white' : 'text-red-300'}`}>{fmt(previewSaldo)}</p>
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Jenis Selector */}
                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => handleJenisChange('Pemasukan')}
                            className={`flex-1 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${data.jenis === 'Pemasukan' ? 'bg-emerald-500 text-white shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                            Pemasukan (Debet)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleJenisChange('Pengeluaran')}
                            className={`flex-1 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${data.jenis === 'Pengeluaran' ? 'bg-red-500 text-white shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                            Pengeluaran (Kredit)
                        </button>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal *</label>
                                <input
                                    type="date"
                                    className={`block w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none ${errors.tanggal ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                    required
                                />
                                {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori *</label>
                                <select
                                    className={`block w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white ${errors.kategori ? 'border-red-400' : 'border-gray-200'}`}
                                    value={data.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                >
                                    {kategoriList.map((k) => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                                {errors.kategori && <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan / Deskripsi *</label>
                            <textarea
                                className={`block w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none ${errors.keterangan ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                rows="3"
                                placeholder="Contoh: Iuran wajib warga Januari 2026"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                required
                            />
                            {errors.keterangan && <p className="text-red-500 text-xs mt-1">{errors.keterangan}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="any"
                                        className={`block w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none ${errors.jumlah ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="0"
                                        value={data.jumlah}
                                        onChange={(e) => setData('jumlah', e.target.value)}
                                        required
                                    />
                                </div>
                                {data.jumlah && (
                                    <p className="text-xs text-gray-500 mt-1">{fmt(data.jumlah)}</p>
                                )}
                                {errors.jumlah && <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Referensi <span className="text-gray-400 font-normal">(opsional)</span></label>
                                <input
                                    type="text"
                                    className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                                    placeholder="Mis: No. kwitansi, No. transfer"
                                    value={data.referensi}
                                    onChange={(e) => setData('referensi', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        {data.jumlah && data.keterangan && (
                            <div className={`rounded-xl p-4 border-2 ${data.jenis === 'Pemasukan' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${data.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    Preview Transaksi
                                </p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{data.keterangan}</span>
                                    <span className={`font-bold ${data.jenis === 'Pemasukan' ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {data.jenis === 'Pemasukan' ? '+' : '-'}{fmt(data.jumlah)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <span>Saldo → {fmt(previewSaldo)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            <Link href={route('admin.transaksi-kas.index')} className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-2.5 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2 ${data.jenis === 'Pemasukan' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                                {processing ? (
                                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Menyimpan...</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Simpan Transaksi</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
