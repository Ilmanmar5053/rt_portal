import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { debounce } from 'lodash';

export default function Index({ pengaduans, filters, stats = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'Semua');

    const sortField = filters.sort_field || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';

    // Auto-search dengan debounce 400ms tanpa tombol terapkan
    const handleSearchChange = debounce((value) => {
        setSearch(value);
        router.get(
            route('admin.pengaduan.index'),
            { search: value, status, sort_field: sortField, sort_direction: sortDirection },
            { preserveState: true, replace: true }
        );
    }, 400);

    // Auto-filter untuk dropdown status tanpa tombol terapkan
    const handleStatusChange = (value) => {
        setStatus(value);
        router.get(
            route('admin.pengaduan.index'),
            { search, status: value, sort_field: sortField, sort_direction: sortDirection },
            { preserveState: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.pengaduan.index'),
            { search, status, sort_field: field, sort_direction: newDirection },
            { preserveState: true, replace: true }
        );
    };

    const SortIndicator = ({ field }) => {
        if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
        return <span className="ml-1 text-emerald-600 font-black">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pengaduan ini?')) {
            router.delete(route('admin.pengaduan.destroy', id));
        }
    };

    const getStatusColor = (statusVal) => {
        switch (statusVal) {
            case 'Selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'Diproses': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Diajukan': return 'bg-rose-100 text-rose-800 border-rose-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // 4 Dashboard Cards Statistik Ringkas & Rapat
    const statCards = [
        { title: 'Total Pengaduan', value: stats.total || 0, emoji: '📢', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-200' },
        { title: 'Pengaduan Baru', value: stats.baru || 0, emoji: '🆕', color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-200' },
        { title: 'Sedang Diproses', value: stats.diproses || 0, emoji: '⏳', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-200' },
        { title: 'Selesai / Tuntas', value: stats.selesai || 0, emoji: '✅', color: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-200' },
    ];

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-black leading-tight text-gray-800 tracking-tight flex items-center gap-2">
                            <span>📢 Manajemen Pengaduan & Laporan Warga</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Pantau dan tindak lanjuti laporan lingkungan dari warga secara efisien
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Pengaduan Warga" />

            <div className="space-y-6 animate-in fade-in duration-300">
                {flash?.success && (
                    <div className="p-4 text-xs font-bold text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center gap-2">
                        <span>✨</span>
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* 4 Dashboard Cards - Compact, Berwarna, Iconic, Lucu & Rapat */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group flex items-center gap-3 overflow-hidden"
                        >
                            <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-2xs`}>
                                {card.emoji}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight truncate">{card.title}</p>
                                <h4 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 truncate">{card.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search Bar Otomatis Tanpa Tombol Terapkan + Action Button Tambah Data */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xs border border-gray-100">
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        {/* Input Pencarian Otomatis dengan Ikon 🔍 */}
                        <div className="relative w-full sm:w-72">
                            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
                            <input
                                type="text"
                                defaultValue={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari warga, subjek, atau laporan..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        {/* Dropdown Status Filter Otomatis */}
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold bg-gray-50/80 text-gray-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        >
                            <option value="Semua">📌 Semua Status</option>
                            <option value="Diajukan">🆕 Diajukan (Baru)</option>
                            <option value="Diproses">⏳ Diproses</option>
                            <option value="Selesai">✅ Selesai</option>
                        </select>
                    </div>

                    <Link
                        href={route('admin.pengaduan.create')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                    >
                        <span>➕ Tambah Data</span>
                    </Link>
                </div>

                {/* Daftar Tabel dengan Nomor Urut dan Tampilan Rapat & Compact */}
                <div className="overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/90 border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3.5 text-center w-12">No</th>
                                    <th className="px-4 py-3.5">Warga</th>
                                    <th className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('judul')}>
                                        Subjek <SortIndicator field="judul" />
                                    </th>
                                    <th className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('kategori')}>
                                        Kategori <SortIndicator field="kategori" />
                                    </th>
                                    <th className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('created_at')}>
                                        Tanggal <SortIndicator field="created_at" />
                                    </th>
                                    <th className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('status_progres')}>
                                        Status <SortIndicator field="status_progres" />
                                    </th>
                                    <th className="px-4 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {pengaduans.data.length > 0 ? (
                                    pengaduans.data.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                            <td className="px-4 py-3.5 font-extrabold text-gray-400 text-center">
                                                {(pengaduans.current_page - 1) * pengaduans.per_page + index + 1}
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-gray-900">
                                                {item.is_anonim ? (
                                                    <span className="inline-flex items-center gap-1 text-gray-500 italic">
                                                        <span>👤 Anonim</span>
                                                    </span>
                                                ) : (
                                                    item.warga?.nama_lengkap || '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-800 font-semibold max-w-[220px] truncate">
                                                {item.judul}
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-gray-600">
                                                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200/80">
                                                    {item.kategori === 'Keamanan' && '🔒'}
                                                    {item.kategori === 'Fasilitas' && '🏗️'}
                                                    {item.kategori === 'Kebersihan' && '🧹'}
                                                    {item.kategori === 'Lainnya' && '📋'}
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-500 font-medium whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getStatusColor(item.status_progres)}`}>
                                                    {item.status_progres === 'Diajukan' && '🆕'}
                                                    {item.status_progres === 'Diproses' && '⏳'}
                                                    {item.status_progres === 'Selesai' && '✅'}
                                                    {item.status_progres}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={route('admin.pengaduan.show', item.id)}
                                                        className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center border border-emerald-200/80 transition-all hover:scale-110"
                                                        title="Lihat Detail / Preview"
                                                    >
                                                        👁️
                                                    </Link>
                                                    <Link
                                                        href={route('admin.pengaduan.edit', item.id)}
                                                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center border border-blue-200/80 transition-all hover:scale-110"
                                                        title="Edit Data"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center border border-rose-200/80 transition-all hover:scale-110"
                                                        title="Hapus Data"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400 font-bold">
                                            📭 Tidak ada data pengaduan yang sesuai dengan filter pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Compact */}
                    {pengaduans.links && pengaduans.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <span className="text-gray-500 font-medium">
                                Menampilkan <strong className="text-gray-800">{pengaduans.from || 0}</strong> hingga <strong className="text-gray-800">{pengaduans.to || 0}</strong> dari <strong className="text-gray-800">{pengaduans.total}</strong> entri
                            </span>
                            <div className="flex gap-1">
                                {pengaduans.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                                            link.active
                                                ? 'bg-emerald-700 text-white shadow-xs'
                                                : link.url
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
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
