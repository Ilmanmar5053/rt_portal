import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ surat }) {
    const statusColor = (status) => {
        switch (status) {
            case 'Pending RT': return 'bg-yellow-100 text-yellow-800';
            case 'Pending RW': return 'bg-orange-100 text-orange-800';
            case 'Disetujui': return 'bg-green-100 text-green-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <WargaLayout header="Detail Surat Pengantar">
            <Head title="Detail Surat" />
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{surat.jenis_surat}</h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColor(surat.status)}`}>{surat.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-500 font-medium">Tanggal Pengajuan</p><p className="text-gray-900">{new Date(surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                </div>
                <div><p className="text-gray-500 font-medium text-sm mb-2">Keperluan</p><div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{surat.keperluan}</div></div>
                {surat.keterangan_tambahan && (
                    <div><p className="text-gray-500 font-medium text-sm mb-2">Keterangan Tambahan</p><div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{surat.keterangan_tambahan}</div></div>
                )}
                <div className="border-t border-gray-100 pt-5"><Link href={route('warga.surat.index')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">&larr; Kembali</Link></div>
            </div>
        </WargaLayout>
    );
}
