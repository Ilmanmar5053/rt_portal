import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ iurans, filters }) {
    const statusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold';
            case 'Pending': return 'bg-teal-100 text-teal-800 border border-teal-200 font-bold';
            case 'Rejected': return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold';
            default: return 'bg-gray-100 text-gray-800 font-bold';
        }
    };

    const bulanNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return (
        <WargaLayout header="Riwayat Iuran Kas Keluarga (Per KK)">
            <Head title="Iuran Keluarga (KK)" />

            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Periode</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Jenis</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Jumlah</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {iurans.data && iurans.data.length > 0 ? (
                                iurans.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-bold">{bulanNames[item.periode_bulan]} {item.periode_tahun}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.jenis_iuran}</td>
                                        <td className="px-6 py-4 text-sm text-emerald-900 font-bold">Rp {Number(item.jumlah_bayar).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs ${statusColor(item.status_pembayaran)}`}>{item.status_pembayaran}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-medium">Belum ada data iuran.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {iurans.links && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {iurans.from || 0} sampai {iurans.to || 0} dari {iurans.total} data</span>
                        <div className="flex space-x-1">
                            {iurans.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded-lg text-sm transition-colors ${link.active ? 'bg-emerald-700 text-white font-bold shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WargaLayout>
    );
}
