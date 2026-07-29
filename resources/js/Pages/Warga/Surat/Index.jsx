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
            case 'Pending RT': return 'bg-yellow-100 text-yellow-800';
            case 'Pending RW': return 'bg-orange-100 text-orange-800';
            case 'Disetujui': return 'bg-green-100 text-green-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <WargaLayout header="Surat Pengantar Saya">
            <Head title="Surat Pengantar" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-1/2 md:w-1/3 flex">
                        <input type="text" value={data.search} className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="Cari jenis surat..." onChange={(e) => setData('search', e.target.value)} />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm transition-colors">Cari</button>
                    </form>
                    <Link href={route('warga.surat.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Ajukan Surat
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis Surat</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keperluan</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {surats.data && surats.data.length > 0 ? (
                                surats.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.jenis_surat}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.keperluan}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={route('warga.surat.show', item.id)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Detail</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Belum ada surat pengantar. Klik "Ajukan Surat" untuk mengajukan baru.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {surats.links && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {surats.from || 0} sampai {surats.to || 0} dari {surats.total} data</span>
                        <div className="flex space-x-1">
                            {surats.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded-md text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WargaLayout>
    );
}
