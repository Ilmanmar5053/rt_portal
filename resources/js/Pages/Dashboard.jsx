import AdminLayout from '@/Layouts/AdminLayout';
import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { getNamaPerumahan, getNamaRt } from '@/Utils/profilHelper';

export default function Dashboard({ iurans, surats, pengaduans, warga, adminStats, adminPengaduans }) {
    const { auth, profil } = usePage().props;
    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);
    const isAdmin = ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'].includes(auth.user.role);
    const isWarga = ['warga_kk', 'warga_anggota'].includes(auth.user.role);

    // Data from Backend
    const stats = [
        { title: 'Total Warga', value: adminStats?.total_warga || '0', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total KK', value: adminStats?.total_kk || '0', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { title: 'Total Rumah Dihuni', value: adminStats?.rumah_dihuni || '0', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Rumah Kosong', value: adminStats?.rumah_kosong || '0', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-red-600', bg: 'bg-red-100' },
        { title: 'Kas RT Bulan Ini', value: adminStats?.kas_bulan_ini || 'Rp 0', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600', bg: 'bg-green-100' },
    ];

    const adminQuickLinks = [
        { name: 'Data Warga', href: route('admin.warga.index'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Iuran Kas', href: route('admin.iuran.index'), icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
        { name: 'Pengaduan', href: route('admin.pengaduan.index'), icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { name: 'Surat Pengantar', href: route('admin.surat.index'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ]

    const wargaQuickLinks = [
        { name: 'Iuran Kas', href: route('warga.iuran.index'), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Pengaduan', href: route('warga.pengaduan.index'), icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { name: 'Surat Pengantar', href: route('warga.surat.index'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ];

    const quickLinks = isAdmin ? adminQuickLinks : wargaQuickLinks;

    if (isWarga) {
        return (
            <WargaLayout header="Dashboard">
                <Head title="Dashboard Warga" />
                <WargaDashboardContent
                    auth={auth}
                    warga={warga}
                    quickLinks={quickLinks}
                    iurans={iurans}
                    surats={surats}
                    pengaduans={pengaduans}
                />
            </WargaLayout>
        );
    }

    return (
        <AdminLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="space-y-8">
                    
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 rounded-3xl p-5 sm:p-8 shadow-xl shadow-emerald-900/15 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/20">
                                <span>📍 Perumahan {namaPerumahan} • {namaRt}</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">Selamat datang kembali, {auth.user.name}! 👋</h3>
                            <p className="text-emerald-50 text-sm sm:text-lg break-words">Berikut adalah ringkasan data lingkungan kita hari ini di Perumahan {namaPerumahan}.</p>
                        </div>
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/4">
                            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center gap-5">
                                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                    <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Quick Menu / Sidebar equivalent */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-800">Menu Navigasi Cepat</h3>
                                </div>
                                <div className="p-3">
                                    {quickLinks.map((link, index) => (
                                        <Link 
                                            key={index} 
                                            href={link.href} 
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                        >
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
                                            </svg>
                                            <span className="font-medium">{link.name}</span>
                                            <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800 text-lg">Pengaduan Terbaru</h3>
                                        <Link href={route('admin.pengaduan.index')} className="text-sm font-medium text-blue-600 hover:text-blue-800">Lihat Semua</Link>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-4 font-semibold">Warga</th>
                                                    <th className="px-6 py-4 font-semibold">Pengaduan</th>
                                                    <th className="px-6 py-4 font-semibold">Status</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Tanggal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {adminPengaduans && adminPengaduans.length > 0 ? adminPengaduans.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.warga}</td>
                                                        <td className="px-6 py-4 text-gray-600">{item.judul}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                                ${item.status === 'Menunggu' ? 'bg-red-100 text-red-700' : 
                                                                item.status === 'Diproses' ? 'bg-yellow-100 text-yellow-700' : 
                                                                'bg-green-100 text-green-700'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-gray-500">{item.tanggal}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                            Belum ada pengaduan warga terbaru.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isAdmin && iurans && (
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 text-lg">Riwayat Iuran & Tagihan Saya</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-4 font-semibold">Periode</th>
                                                    <th className="px-6 py-4 font-semibold">Jenis</th>
                                                    <th className="px-6 py-4 font-semibold">Nominal</th>
                                                    <th className="px-6 py-4 font-semibold">Status</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {iurans.length > 0 ? iurans.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.periode_bulan}/{item.periode_tahun}</td>
                                                        <td className="px-6 py-4 text-gray-600">{item.jenis_iuran}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-700">Rp {Number(item.jumlah_bayar).toLocaleString('id-ID')}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                                ${item.status_pembayaran === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                                item.status_pembayaran === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                                'bg-red-100 text-red-700'}`}>
                                                                {item.status_pembayaran === 'Pending' ? 'Belum Bayar' : item.status_pembayaran === 'Approved' ? 'Lunas' : 'Ditolak'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {item.status_pembayaran === 'Approved' ? (
                                                                <Link href={route('warga.iuran.show', item.id)} className="text-blue-600 hover:text-blue-800 font-medium" title="Lihat Kuitansi">
                                                                    Cetak Kuitansi
                                                                </Link>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">Menunggu Pembayaran</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                            Belum ada tagihan iuran.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Riwayat Surat Pengantar (Warga) */}
                        {!isAdmin && surats && (
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full mt-6">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 text-lg">Riwayat Surat Pengantar</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-4 font-semibold">Jenis Surat</th>
                                                    <th className="px-6 py-4 font-semibold">Keperluan</th>
                                                    <th className="px-6 py-4 font-semibold">Tanggal Diajukan</th>
                                                    <th className="px-6 py-4 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {surats.length > 0 ? surats.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.jenis_surat}</td>
                                                        <td className="px-6 py-4 text-gray-600 line-clamp-1 max-w-[200px]">{item.keperluan}</td>
                                                        <td className="px-6 py-4 text-gray-700">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                                ${item.status === 'Disetujui' || item.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                                                                item.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 
                                                                'bg-yellow-100 text-yellow-700'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                            Belum ada riwayat surat pengantar.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Riwayat Pengaduan (Warga) */}
                        {!isAdmin && pengaduans && (
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full mt-6">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 text-lg">Riwayat Laporan Pengaduan</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-4 font-semibold">Kategori</th>
                                                    <th className="px-6 py-4 font-semibold">Judul</th>
                                                    <th className="px-6 py-4 font-semibold">Tanggal Dilaporkan</th>
                                                    <th className="px-6 py-4 font-semibold">Status Progres</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {pengaduans.length > 0 ? pengaduans.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.kategori}</td>
                                                        <td className="px-6 py-4 text-gray-600 line-clamp-1 max-w-[200px]">{item.judul}</td>
                                                        <td className="px-6 py-4 text-gray-700">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                                ${item.status_progres === 'Selesai' ? 'bg-green-100 text-green-700' : 
                                                                item.status_progres === 'Diproses' ? 'bg-blue-100 text-blue-700' : 
                                                                'bg-yellow-100 text-yellow-700'}`}>
                                                                {item.status_progres}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                            Belum ada riwayat laporan pengaduan.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
            </div>
        </AdminLayout>
    );
}

function WargaDashboardContent({ auth, warga, quickLinks, iurans, surats, pengaduans }) {
    const { profil } = usePage().props;
    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 sm:p-8 shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/20">
                        <span>📍 Perumahan {namaPerumahan} • {namaRt}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 break-words">Selamat datang, {auth.user.name}! 👋</h3>
                    <p className="text-emerald-100 text-sm sm:text-base break-words">Pantau dan kelola kebutuhan kewargaan Anda di lingkungan Perumahan {namaPerumahan}.</p>
                    {warga && (
                        <p className="mt-3 text-xs sm:text-sm bg-white/20 inline-block px-3 py-1.5 rounded-full break-words max-w-full">
                            🏠 {warga.nama_lengkap} &mdash; {warga.status_hubungan_keluarga || 'Warga'} • Perumahan {namaPerumahan}
                        </p>
                    )}
                </div>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickLinks.map((link, index) => (
                    <Link key={index} href={link.href} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group flex items-center gap-4">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path></svg>
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">{link.name}</span>
                        <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                ))}
            </div>

            {/* Ringkasan Iuran */}
            {iurans && iurans.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-lg">Iuran Terakhir</h3>
                        <Link href={route('warga.iuran.index')} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">Lihat Semua &rarr;</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Periode</th>
                                <th className="px-6 py-3 font-semibold">Jenis</th>
                                <th className="px-6 py-3 font-semibold">Nominal</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {iurans.slice(0, 5).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">{item.periode_bulan}/{item.periode_tahun}</td>
                                        <td className="px-6 py-3 text-gray-600">{item.jenis_iuran}</td>
                                        <td className="px-6 py-3 font-medium">Rp {Number(item.jumlah_bayar).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                item.status_pembayaran === 'Approved' ? 'bg-green-100 text-green-700' :
                                                item.status_pembayaran === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'}`}>
                                                {item.status_pembayaran === 'Approved' ? 'Lunas' : item.status_pembayaran === 'Pending' ? 'Belum Bayar' : 'Ditolak'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ringkasan Pengaduan */}
            {pengaduans && pengaduans.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-lg">Pengaduan Terakhir Saya</h3>
                        <Link href={route('warga.pengaduan.index')} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">Lihat Semua &rarr;</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Judul</th>
                                <th className="px-6 py-3 font-semibold">Kategori</th>
                                <th className="px-6 py-3 font-semibold">Tanggal</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {pengaduans.slice(0, 3).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">{item.judul}</td>
                                        <td className="px-6 py-3 text-gray-600">{item.kategori}</td>
                                        <td className="px-6 py-3 text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                item.status_progres === 'Selesai' ? 'bg-green-100 text-green-700' :
                                                item.status_progres === 'Diproses' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                                {item.status_progres}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
