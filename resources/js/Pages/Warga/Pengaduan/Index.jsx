import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useState } from 'react';

export default function Index({ pengaduans, filters, warga }) {
    const { errors: pageErrors } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        judul: '',
        deskripsi: '',
        kategori: 'Lainnya',
        foto_bukti: [],
        is_anonim: false,
    });

    const [warningMessage, setWarningMessage] = useState('');
    const [lastClickAt, setLastClickAt] = useState(null);

    const submit = (e) => {
        e.preventDefault();

        // Deteksi apakah user sudah punya pengaduan aktif (Diajukan / Diproses)
        const hasActive = pengaduans?.data?.some((p) => p.status_progres === 'Diajukan' || p.status_progres === 'Diproses');
        if (hasActive) {
            setWarningMessage('Masih ada pengaduan yang masih berlangsung, pengaduan hanya bisa dilakukan setelah pengaduan sebelumnya berstatus "selesai".');
            // bersihkan pesan setelah beberapa detik
            setTimeout(() => setWarningMessage(''), 5000);
            return;
        }

        // Deteksi klik ganda cepat pada tombol Kirim Pengaduan
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

    const statusConfig = (status) => {
        switch (status) {
            case 'Diajukan': return { cls: 'bg-rose-100 text-rose-800 border-rose-200 font-bold', dot: 'bg-rose-500' };
            case 'Diproses': return { cls: 'bg-teal-100 text-teal-800 border-teal-200 font-bold', dot: 'bg-teal-500' };
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

    return (
        <WargaLayout header="Pengaduan Warga">
            <Head title="Pengaduan Warga" />

            <div className="space-y-6">
                {/* Warning: Warga belum terdaftar */}
                {!warga && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-red-800 text-sm">Data Kependudukan Belum Terdaftar</h4>
                            <p className="text-red-700 text-sm mt-1">Akun Anda belum dihubungkan ke data warga. Anda tidak bisa mengirim pengaduan sampai pengurus RT mendaftarkan data kependudukan Anda. Silakan hubungi pengurus RT.</p>
                        </div>
                    </div>
                )}

                {/* Error dari backend */}
                {pageErrors?.warga && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
                        ⚠️ {pageErrors.warga}
                    </div>
                )}
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-1">Sampaikan Pengaduan Anda 📢</h2>
                        <p className="text-orange-100 text-sm">Laporkan masalah di lingkungan agar dapat segera ditangani pengurus RT.</p>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="mt-4 inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-all shadow-sm"
                        >
                            {showForm ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    Tutup Form
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Buat Pengaduan Baru
                                </>
                            )}
                        </button>
                    </div>
                    <div className="absolute right-4 bottom-0 opacity-10 text-[120px] leading-none pointer-events-none select-none">📢</div>
                </div>

                {/* Form Pengaduan (Collapsible) */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </div>
                            <h3 className="font-bold text-gray-800">Form Pengaduan Baru</h3>
                        </div>
                        {warningMessage && (
                            <div className="p-4 mb-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                                {warningMessage}
                            </div>
                        )}

                        <form onSubmit={submit} className="p-6 space-y-5" encType="multipart/form-data">
                            <div>
                                <InputLabel htmlFor="judul" value="Judul Pengaduan *" />
                                <input
                                    id="judul"
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:border-orange-400 focus:ring-orange-400 text-sm"
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
                                    className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:border-orange-400 focus:ring-orange-400 text-sm"
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
                                    className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:border-orange-400 focus:ring-orange-400 text-sm"
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
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
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
                                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                                    checked={data.is_anonim}
                                    onChange={(e) => setData('is_anonim', e.target.checked)}
                                />
                                <label htmlFor="is_anonim" className="text-sm text-gray-700">
                                    <span className="font-medium">Kirim sebagai anonim</span>
                                    <span className="text-gray-500 ml-1">— nama Anda tidak akan ditampilkan ke pengurus</span>
                                </label>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Pengaduan Anda akan otomatis berstatus <strong>"Diajukan"</strong> dan akan diproses oleh pengurus RT sesegera mungkin.</span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-800 hover:from-emerald-800 hover:to-rose-900 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? (
                                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Mengirim...</>
                                    ) : (
                                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>Kirim Pengaduan</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Riwayat Pengaduan Saya */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </div>
                            <h3 className="font-bold text-gray-800">Riwayat Pengaduan Saya</h3>
                        </div>
                        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {pengaduans.total || 0} Pengaduan
                        </span>
                    </div>

                    {pengaduans.data && pengaduans.data.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {pengaduans.data.map((item) => {
                                const st = statusConfig(item.status_progres);
                                return (
                                    <div key={item.id} className="p-5 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="text-2xl mt-0.5 flex-shrink-0">{kategoriIcon(item.kategori)}</div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.judul}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {item.kategori} · {new Date(item.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {item.deskripsi && (
                                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.deskripsi}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                    {item.status_progres}
                                                </span>
                                                <Link
                                                    href={route('warga.pengaduan.show', item.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Detail →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="text-5xl mb-4">📭</div>
                            <h4 className="font-semibold text-gray-700 mb-1">Belum ada pengaduan</h4>
                            <p className="text-sm text-gray-500">Klik tombol <strong>"Buat Pengaduan Baru"</strong> di atas untuk melaporkan masalah.</p>
                        </div>
                    )}

                    {pengaduans.links && pengaduans.total > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Menampilkan {pengaduans.from || 0} - {pengaduans.to || 0} dari {pengaduans.total}
                            </span>
                            <div className="flex space-x-1">
                                {pengaduans.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-lg text-sm ${link.active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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
