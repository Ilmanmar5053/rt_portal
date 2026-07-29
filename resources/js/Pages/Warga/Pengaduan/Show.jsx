import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ pengaduan }) {
    const statusColor = (status) => {
        switch (status) {
            case 'Diajukan': return 'bg-yellow-100 text-yellow-800';
            case 'Diproses': return 'bg-blue-100 text-blue-800';
            case 'Selesai': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <WargaLayout header="Detail Pengaduan">
            <Head title="Detail Pengaduan" />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{pengaduan.judul}</h3>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColor(pengaduan.status_progres)}`}>
                            {pengaduan.status_progres}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 font-medium">Kategori</p>
                            <p className="text-gray-900">{pengaduan.kategori}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Tanggal & Waktu</p>
                            <p className="text-gray-900">{new Date(pengaduan.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Anonim</p>
                            <p className="text-gray-900">{pengaduan.is_anonim ? 'Ya' : 'Tidak'}</p>
                        </div>
                    </div>
 
                    <div>
                        <p className="text-gray-500 font-medium text-sm mb-2">Deskripsi</p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {pengaduan.deskripsi}
                        </div>
                    </div>
 
                    {pengaduan.foto_bukti && pengaduan.foto_bukti.length > 0 && (
                        <div>
                            <p className="text-gray-500 font-medium text-sm mb-2">Bukti Foto</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {pengaduan.foto_bukti.map((foto, index) => (
                                    <img
                                        key={`${foto}-${index}`}
                                        src={`/storage/${foto}`}
                                        alt={`Bukti pengaduan ${index + 1}`}
                                        className="w-full h-52 object-cover rounded-xl border border-gray-200"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
 
                    {/* Riwayat komentar admin (hanya ditampilkan, tidak bisa dibalas) */}
                    <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Riwayat Catatan/Admin</h4>
                        {pengaduan.logs && pengaduan.logs.length > 0 ? (
                            pengaduan.logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                                        😊
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 mb-1">
                                            <span className="font-medium text-gray-800">{log.user ? log.user.name : 'Admin'}</span>
                                            <span className="ml-2">{new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 italic text-indigo-900" style={{ fontSize: '14px' }}>{log.komentar}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Belum ada catatan dari admin.</p>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                        <Link href={route('warga.pengaduan.index')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            &larr; Kembali ke Daftar Pengaduan
                        </Link>
                    </div>
                </div>
            </div>
        </WargaLayout>
    );
}
