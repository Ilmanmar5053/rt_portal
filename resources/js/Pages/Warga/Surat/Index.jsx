import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ surats, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('warga.surat.index'));
    };

    const statusColor = (status) => {
        switch (status) {
            case 'Pending RT': return 'bg-teal-100 text-teal-800 border border-teal-200 font-bold';
            case 'Pending RW': return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold';
            case 'Disetujui': return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold';
            case 'Ditolak': return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold';
            default: return 'bg-gray-100 text-gray-800 font-bold';
        }
    };

    return (
        <WargaLayout header="Surat Pengantar Saya">
            <Head title="Surat Pengantar" />

            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-1/2 md:w-1/3"></div>
                    <Link href={route('warga.surat.create')} className="bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-800 hover:from-emerald-800 hover:to-rose-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-700/20 inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Ajukan Surat
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-12">No</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Jenis Surat</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Keperluan</th>
                                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {surats.data && surats.data.length > 0 ? (
                                surats.data.map((item, index) => {
                                    const d = new Date(item.created_at);
                                    const day = String(d.getDate()).padStart(2, '0');
                                    const month = d.toLocaleString('id-ID', { month: 'short' });
                                    const year = d.getFullYear();
                                    const hour = String(d.getHours()).padStart(2, '0');
                                    const min = String(d.getMinutes()).padStart(2, '0');
                                    const sec = String(d.getSeconds()).padStart(2, '0');
                                    const formattedDate = `${day}/${month}/${year} ${hour}:${min}:${sec}`;

                                    return (
                                    <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium text-center">
                                            {(surats.current_page - 1) * surats.per_page + index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{formattedDate}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.jenis_surat}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.keperluan}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs ${statusColor(item.status)}`}>{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={route('warga.surat.show', item.id)} className="text-emerald-700 hover:text-emerald-900 text-sm font-bold">Detail</Link>
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium">Belum ada surat pengantar. Klik "Ajukan Surat" untuk mengajukan baru.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {surats.links && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {surats.from || 0} sampai {surats.to || 0} dari {surats.total} data</span>
                        <div className="flex space-x-1">
                            {surats.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded-lg text-sm transition-colors ${link.active ? 'bg-emerald-700 text-white font-bold shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WargaLayout>
    );
}
