import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useState } from 'react';
import { debounce } from 'lodash';

export default function Index({ pengaduans, filters, warga, stats = {} }) {
    const { errors: pageErrors } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'Semua');

    const { data, setData, post, processing, errors, reset } = useForm({
        judul: '',
        deskripsi: '',
        kategori: 'Lainnya',
        foto_bukti: [],
        is_anonim: false,
    });

    const [warningMessage, setWarningMessage] = useState('');
    const [lastClickAt, setLastClickAt] = useState(null);

    // Auto-search dengan debounce 400ms untuk Warga
    const handleSearchChange = debounce((val) => {
        setSearch(val);
        router.get(
            route('warga.pengaduan.index'),
            { search: val, status },
            { preserveState: true, replace: true }
        );
    }, 400);

    const handleStatusChange = (val) => {
        setStatus(val);
        router.get(
            route('warga.pengaduan.index'),
            { search, status: val },
            { preserveState: true, replace: true }
        );
    };

    const submit = (e) => {
        e.preventDefault();

        // Deteksi apakah user sudah punya pengaduan aktif (Diajukan / Diproses)
        const hasActive = pengaduans?.data?.some((p) => p.status_progres === 'Diajukan' || p.status_progres === 'Diproses');
        if (hasActive) {
            setWarningMessage('Masih ada pengaduan yang masih berlangsung, pengaduan hanya bisa dilakukan setelah pengaduan sebelumnya berstatus "selesai".');
            setTimeout(() => setWarningMessage(''), 5000);
            return;
        }

        const now = Date.now();
        if (lastClickAt && now - lastClickAt < 800) {
            setWarningMessage('Masih ada pengaduan yang masih berlangsung, pengaduan hanya bisa dilakukan setelah pengaduan sebelumnya berstatus "selesai".');
            setTimeout(() => setWarningMessage(''), 5000);
            return;
        }
        setLastClickAt(now);

        post(route('warga.pengaduan.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            }
        });
    };

    const statusConfig = (statusVal) => {
        switch (statusVal) {
            case 'Diajukan': return { cls: 'bg-rose-100 text-rose-800 border-rose-200 font-bold', dot: 'bg-rose-500' };
            case 'Diproses': return { cls: 'bg-amber-100 text-amber-800 border-amber-200 font-bold', dot: 'bg-amber-500' };
            case 'Selesai': return { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold', dot: 'bg-emerald-500' };
            default: return { cls: 'bg-gray-100 text-gray-800 border-gray-200 font-bold', dot: 'bg-gray-500' };
        }
    };

    const kategoriIcon = (kat) => {
        switch (kat) {
            case 'Keamanan': return '🔒';
            case 'Fasilitas': return '🏗️';
            case 'Kebersihan': return '🧹';
            default: return '📋';
        }
    };

    // 4 Dashboard Cards Statistik Ringkas & Rapat (Fresh, Iconic, Modern & Minimalis)
    const statCards = [
        { title: 'Total Laporan Saya', value: stats.total || 0, emoji: '📢', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-200' },
        { title: 'Pengaduan Baru', value: stats.baru || 0, emoji: '🆕', color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-200' },
        { title: 'Sedang Diproses', value: stats.diproses || 0, emoji: '⏳', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-200' },
        { title: 'Selesai / Tuntas', value: stats.selesai || 0, emoji: '✅', color: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-200' },
    ];

    return (
        <WargaLayout header="Pengaduan Warga">
            <Head title="Pengaduan Warga" />

            <div className="space-y-6 animate-in fade-in duration-300">
                {!warga && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-rose-800 text-sm">Data Kependudukan Belum Terdaftar</h4>
                            <p className="text-rose-700 text-sm mt-1">Akun Anda belum dihubungkan ke data warga. Anda tidak bisa mengirim pengaduan sampai pengurus RT mendaftarkan data kependudukan Anda. Silakan hubungi pengurus RT.</p>
                        </div>
                    </div>
                )}

                {pageErrors?.warga && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
                        ⚠️ {pageErrors.warga}
                    </div>
                )}

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-rose-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-1">Sampaikan Pengaduan Anda 📢</h2>
                        <p className="text-emerald-100 text-sm">Laporkan masalah di lingkungan agar dapat segera ditangani oleh pengurus RT.</p>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="mt-4 inline-flex items-center gap-2 bg-white text-emerald-800 font-extrabold px-5 py-2 rounded-xl hover:bg-emerald-50 transition-all shadow-sm text-xs"
                        >
                            {showForm ? '✕ Tutup Form' : '➕ Buat Pengaduan Baru'}
                        </button>
                    </div>
                    <div className="absolute right-4 bottom-0 opacity-10 text-[120px] leading-none pointer-events-none select-none">📢</div>
                </div>

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

                {/* Form Pengaduan (Collapsible) */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                <span>📢</span>
                            </div>
                            <h3 className="font-bold text-gray-800">Form Pengaduan Baru</h3>
                        </div>
                        {warningMessage && (
                            <div className="p-4 mb-4 rounded-lg text-sm bg-rose-50 border border-rose-200 text-rose-700">
                                {warningMessage}
                            </div>
                        )}

                        <form onSubmit={submit} className="p-6 space-y-5" encType="multipart/form-data">
                            <div>
                                <InputLabel htmlFor="judul" value="Judul Pengaduan *" />
                                <input
                                    id="judul"
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                    value={data.judul}
                                    onChange={(e) => setData('judul', e.target.value)}
                                    placeholder="Contoh: Lampu jalan mati di depan blok B"
                                    required
                                />
                                <InputError message={errors.judul} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kategori" value="Kategori *" />
                                <select
                                    id="kategori"
                                    className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                    value={data.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                >
                                    <option value="Keamanan">🔒 Keamanan</option>
                                    <option value="Fasilitas">🏗️ Fasilitas</option>
                                    <option value="Kebersihan">🧹 Kebersihan</option>
                                    <option value="Lainnya">📋 Lainnya</option>
                                </select>
                                <InputError message={errors.kategori} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="deskripsi" value="Deskripsi Lengkap *" />
                                <textarea
                                    id="deskripsi"
                                    className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                    rows="4"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Jelaskan masalah secara detail agar pengurus RT dapat menindaklanjuti..."
                                    required
                                ></textarea>
                                <InputError message={errors.deskripsi} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="foto_bukti" value="Unggah Bukti Foto (1-3 gambar) *" />
                                <input
                                    id="foto_bukti"
                                    type="file"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setData('foto_bukti', Array.from(e.target.files))}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Unggah minimal 1 dan maksimal 3 foto untuk bukti pengaduan.</p>
                                <InputError
                                    message={errors.foto_bukti || errors['foto_bukti.0'] || errors['foto_bukti.1'] || errors['foto_bukti.2']}
                                    className="mt-2"
                                />
                            </div>
 
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input
                                    id="is_anonim"
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={data.is_anonim}
                                    onChange={(e) => setData('is_anonim', e.target.checked)}
                                />
                                <label htmlFor="is_anonim" className="text-sm text-gray-700">
                                    <span className="font-medium">Kirim sebagai anonim</span>
                                    <span className="text-gray-500 ml-1">— nama Anda tidak akan ditampilkan ke pengurus</span>
                                </label>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 flex items-start gap-2">
                                <span>📌 Pengaduan Anda akan otomatis berstatus <strong>"Diajukan"</strong> dan akan diproses oleh pengurus RT sesegera mungkin.</span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Mengirim...' : '🚀 Kirim Pengaduan'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter Otomatis dan Tabel Riwayat Pengaduan Saya */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/60">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">📋</span>
                            <h3 className="font-bold text-gray-800 text-sm">Riwayat Pengaduan Saya</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-60">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
                                <input
                                    type="text"
                                    defaultValue={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Cari subjek..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white text-gray-700 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="Semua">📌 Semua Status</option>
                                <option value="Diajukan">🆕 Diajukan</option>
                                <option value="Diproses">⏳ Diproses</option>
                                <option value="Selesai">✅ Selesai</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabel Riwayat Pengaduan dengan Nomor Urut */}
                    {pengaduans.data && pengaduans.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/90 border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                                        <th className="px-4 py-3.5 text-center w-12">No</th>
                                        <th className="px-4 py-3.5">Subjek / Judul</th>
                                        <th className="px-4 py-3.5">Kategori</th>
                                        <th className="px-4 py-3.5">Tanggal</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                    {pengaduans.data.map((item, idx) => {
                                        const st = statusConfig(item.status_progres);
                                        const num = (pengaduans.current_page - 1) * pengaduans.per_page + idx + 1;
                                        return (
                                            <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                                <td className="px-4 py-3.5 font-extrabold text-gray-400 text-center">{num}</td>
                                                <td className="px-4 py-3.5 font-bold text-gray-900 max-w-[220px] truncate">{item.judul}</td>
                                                <td className="px-4 py-3.5 font-semibold text-gray-700">
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                                                        {kategoriIcon(item.kategori)} {item.kategori}
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
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${st.cls}`}>
                                                        {item.status_progres === 'Diajukan' && '🆕'}
                                                        {item.status_progres === 'Diproses' && '⏳'}
                                                        {item.status_progres === 'Selesai' && '✅'}
                                                        {item.status_progres}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <Link
                                                        href={route('warga.pengaduan.show', item.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-extrabold transition-all"
                                                    >
                                                        <span>👁️ Detail</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400 font-bold text-xs">
                            📭 Belum ada riwayat pengaduan.
                        </div>
                    )}

                    {pengaduans.links && pengaduans.total > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                                Menampilkan <strong>{pengaduans.from || 0}</strong> - <strong>{pengaduans.to || 0}</strong> dari <strong>{pengaduans.total}</strong>
                            </span>
                            <div className="flex space-x-1">
                                {pengaduans.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-lg ${link.active ? 'bg-emerald-700 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WargaLayout>
    );
}
