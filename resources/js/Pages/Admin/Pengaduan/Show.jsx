import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ pengaduan }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100 text-green-800';
            case 'Diproses': return 'bg-yellow-100 text-yellow-800';
            case 'Diajukan': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const form = useForm({ komentar: '' });

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Pengaduan Warga</h2>}
        >
            <Head title="Detail Pengaduan" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-8 text-white relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                                        Kategori: {pengaduan.kategori}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-1">{pengaduan.judul}</h3>
                                    <p className="text-red-100 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Dilaporkan pada {new Date(pengaduan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm bg-white ${
                                        pengaduan.status_progres === 'Selesai' ? 'text-green-600' : 
                                        pengaduan.status_progres === 'Diproses' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {pengaduan.status_progres}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Informasi Pelapor</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                                        {pengaduan.is_anonim ? '?' : pengaduan.warga?.nama_lengkap.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">
                                            {pengaduan.is_anonim ? 'Warga Anonim (Identitas Dirahasiakan)' : pengaduan.warga?.nama_lengkap}
                                        </p>
                                        {!pengaduan.is_anonim && (
                                            <p className="text-sm text-gray-600">Blok {pengaduan.warga?.keluarga?.rumah_blok?.blok} - {pengaduan.warga?.keluarga?.rumah_blok?.nomor_rumah} | Kontak: {pengaduan.warga?.no_hp || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Detail Laporan</h4>
                                <div className="prose max-w-none text-gray-800 bg-white border border-gray-100 rounded-xl p-6 shadow-sm whitespace-pre-wrap">
                                    {pengaduan.deskripsi}
                                </div>
                            </div>
 
                            {pengaduan.foto_bukti && pengaduan.foto_bukti.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Bukti Foto</h4>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {pengaduan.foto_bukti.map((foto, index) => (
                                            <img
                                                key={`${foto}-${index}`}
                                                src={`/storage/${foto}`}
                                                alt={`Bukti pengaduan ${index + 1}`}
                                                className="w-full h-56 object-cover rounded-2xl border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
 
                            {/* Komentar / Catatan Admin (satu arah) */}
                            <div className="mt-8">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Catatan & Komentar Admin</h4>

                                {/* Form komentar */}
                                <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
                                    <form onSubmit={(e) => { e.preventDefault(); form.post(route('admin.pengaduan.comment', pengaduan.id)); }} className="space-y-3">
                                        <textarea
                                            value={form.data.komentar}
                                            onChange={(e) => form.setData('komentar', e.target.value)}
                                            placeholder="Tambahkan catatan atau komentar untuk pengaduan ini (hanya admin yang melihat dan warga tidak bisa membalas)"
                                            className="w-full rounded-md border-gray-200 shadow-sm p-3 text-sm"
                                            rows={3}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                                disabled={form.processing}
                                            >
                                                Tambah Komentar
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Daftar riwayat komentar */}
                                <div className="space-y-3">
                                    {pengaduan.logs && pengaduan.logs.length > 0 ? (
                                        pengaduan.logs.map((log) => (
                                            <div key={log.id} className="flex items-start gap-3">
                                                <div className="w-11 flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                                                        😊
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        <span className="font-medium text-gray-800">{log.user ? log.user.name : 'Admin'}</span>
                                                        <span className="ml-2 text-xs text-gray-400">{new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>

                                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm italic text-indigo-900" style={{ fontSize: '14px' }}>
                                                        {log.komentar}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">Belum ada catatan dari admin.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                <Link
                                    href={route('admin.pengaduan.index')}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Kembali
                                </Link>
                                <Link
                                    href={route('admin.pengaduan.edit', pengaduan.id)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    Update Status / Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
