import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show({ iuran }) {
    const { auth } = usePage().props;
    const isAdmin = ['superadmin', 'rw', 'rt'].includes(auth.user.role);
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Iuran Kas</h2>}
        >
            <Head title="Detail Iuran Kas" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        {/* Receipt Header */}
                        <div className="bg-blue-600 px-6 py-8 text-white relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Kuitansi Pembayaran</h3>
                                    <p className="text-blue-100">Portal RT/RW Digital</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${iuran.status_pembayaran === 'Approved' ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'}`}>
                                        {iuran.status_pembayaran}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            </div>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Diterima Dari:</p>
                                    <p className="text-lg font-bold text-gray-900">{iuran.warga?.nama_lengkap}</p>
                                    <p className="text-sm text-gray-600">Blok {iuran.warga?.keluarga?.rumah_blok?.blok} - {iuran.warga?.keluarga?.rumah_blok?.nomor_rumah}</p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-sm text-gray-500 mb-1">Tanggal Transaksi:</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(iuran.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-gray-600">ID: TRX-{String(iuran.id).padStart(5, '0')}</p>
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-100 py-6 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Jenis Pembayaran</span>
                                    <span className="font-semibold text-gray-900">Iuran {iuran.jenis_iuran}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Periode</span>
                                    <span className="font-semibold text-gray-900">{bulan[iuran.periode_bulan - 1]} {iuran.periode_tahun}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold text-gray-900">Total Dibayar</span>
                                    <span className="font-bold text-blue-600 text-2xl">Rp {Number(iuran.jumlah_bayar).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Link
                                    href={isAdmin ? route('admin.iuran.index') : route('warga.dashboard')}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium print:hidden"
                                >
                                    Kembali
                                </Link>
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm print:hidden"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                    Cetak Kuitansi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
