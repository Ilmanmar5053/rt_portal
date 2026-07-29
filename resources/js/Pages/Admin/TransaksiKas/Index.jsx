import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Index({ transaksis, summary, filters, tahunList, kategoriPemasukan, kategoriPengeluaran }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [jenis, setJenis] = useState(filters.jenis || 'Semua');
    const [bulan, setBulan] = useState(filters.bulan || 'Semua');
    const [tahun, setTahun] = useState(filters.tahun || 'Semua');

    const handleFilter = (overrides = {}) => {
        router.get(route('admin.transaksi-kas.index'), {
            search: overrides.search ?? search,
            jenis: overrides.jenis ?? jenis,
            bulan: overrides.bulan ?? bulan,
            tahun: overrides.tahun ?? tahun,
        }, { preserveScroll: true });
    };

    const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return (
        <AdminLayout header={<h2 className="text-2xl font-bold text-gray-800">Arus Kas</h2>}>
            <Head title="Transaksi Arus Kas" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Pemasukan</p>
                            <p className="text-lg font-bold text-emerald-600">{fmt(summary.total_pemasukan)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Pengeluaran</p>
                            <p className="text-lg font-bold text-red-600">{fmt(summary.total_pengeluaran)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${summary.saldo_bersih >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Saldo Bersih (Filter)</p>
                            <p className={`text-lg font-bold ${summary.saldo_bersih >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{fmt(summary.saldo_bersih)}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs text-indigo-200 font-medium">Saldo Kas Saat Ini</p>
                            <p className="text-lg font-bold text-white">{fmt(summary.saldo_akhir)}</p>
                        </div>
                    </div>
                </div>

                {/* Filters + Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
                        <div className="flex flex-wrap gap-3 flex-1">
                            <input
                                type="text"
                                placeholder="Cari keterangan..."
                                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            />
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white" value={jenis}
                                onChange={(e) => { setJenis(e.target.value); handleFilter({ jenis: e.target.value }); }}>
                                <option value="Semua">Semua Jenis</option>
                                <option value="Pemasukan">Pemasukan</option>
                                <option value="Pengeluaran">Pengeluaran</option>
                            </select>
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white" value={bulan}
                                onChange={(e) => { setBulan(e.target.value); handleFilter({ bulan: e.target.value }); }}>
                                <option value="Semua">Semua Bulan</option>
                                {bulanNames.slice(1).map((b, i) => (
                                    <option key={i + 1} value={i + 1}>{b}</option>
                                ))}
                            </select>
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white" value={tahun}
                                onChange={(e) => { setTahun(e.target.value); handleFilter({ tahun: e.target.value }); }}>
                                <option value="Semua">Semua Tahun</option>
                                {tahunList.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <Link
                            href={route('admin.transaksi-kas.create')}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Catat Transaksi
                        </Link>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <h3 className="font-bold text-gray-800">Buku Kas — Riwayat Transaksi</h3>
                        <span className="ml-auto text-xs text-gray-500">{transaksis.total} transaksi</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Keterangan</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wide">Debet (Masuk)</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-red-600 uppercase tracking-wide">Kredit (Keluar)</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Saldo</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transaksis.data && transaksis.data.length > 0 ? (
                                    transaksis.data.map((item) => (
                                        <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${item.jenis === 'Pemasukan' ? 'border-l-4 border-l-emerald-300' : 'border-l-4 border-l-red-300'}`}>
                                            <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-medium text-gray-900">{item.keterangan}</div>
                                                {item.referensi && <div className="text-xs text-gray-400 mt-0.5">Ref: {item.referensi}</div>}
                                                {item.creator && <div className="text-xs text-gray-400">oleh {item.creator.name}</div>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.jenis === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {item.jenis === 'Pemasukan' ? (
                                                    <span className="text-emerald-600 font-semibold text-sm">+{fmt(item.jumlah)}</span>
                                                ) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {item.jenis === 'Pengeluaran' ? (
                                                    <span className="text-red-600 font-semibold text-sm">-{fmt(item.jumlah)}</span>
                                                ) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`text-sm font-bold ${item.saldo_setelah >= 0 ? 'text-gray-800' : 'text-red-700'}`}>
                                                    {fmt(item.saldo_setelah)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={route('admin.transaksi-kas.edit', item.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => { if (confirm(`Hapus transaksi "${item.keterangan}"?`)) router.delete(route('admin.transaksi-kas.destroy', item.id)); }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-16 text-center">
                                            <div className="text-4xl mb-3">📂</div>
                                            <p className="text-gray-500 font-medium">Belum ada transaksi</p>
                                            <Link href={route('admin.transaksi-kas.create')} className="mt-3 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                + Catat Transaksi Pertama
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transaksis.links && transaksis.total > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Menampilkan {transaksis.from}–{transaksis.to} dari {transaksis.total} transaksi
                            </p>
                            <div className="flex gap-1">
                                {transaksis.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${link.active ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
