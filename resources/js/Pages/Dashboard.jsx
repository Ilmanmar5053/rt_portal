import AdminLayout from '@/Layouts/AdminLayout';
import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { getNamaPerumahan, getNamaRt } from '@/Utils/profilHelper';
import PaymentModal from '@/Components/PaymentModal';
import Chart from 'chart.js/auto';

const bulanNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const bulanNamesFull = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const getJenisIcon = (nama) => {
    const lower = (nama || '').toLowerCase();
    if (lower.includes('sampah') || lower.includes('kebersihan')) return '🧹';
    if (lower.includes('duka') || lower.includes('cita')) return '🕊️';
    if (lower.includes('kas') || lower.includes('rt')) return '🏛️';
    if (lower.includes('keamanan') || lower.includes('ronda')) return '🛡️';
    if (lower.includes('wajib')) return '📋';
    return '💰';
};

const getGroupStatus = (items) => {
    if (!items || items.length === 0) return { label: 'Belum Bayar', color: 'bg-amber-100 text-amber-800' };
    if (items.every((i) => i.status_pembayaran === 'Approved')) {
        return { label: 'Lunas', color: 'bg-emerald-100 text-emerald-800' };
    }
    if (items.some((i) => i.status_pembayaran === 'Rejected')) {
        return { label: 'Perlu Perhatian', color: 'bg-rose-100 text-rose-800' };
    }
    return { label: 'Belum Bayar', color: 'bg-amber-100 text-amber-800' };
};

export default function Dashboard({ iurans, surats, pengaduans, warga, adminStats, adminPengaduans, activePrograms, wargaPerRt, iuranChartData, transaksiKas, saldoKasSaatIni }) {
    const { auth, profil } = usePage().props;
    const [selectedPreview, setSelectedPreview] = useState(null);
    const [wargaPreview, setWargaPreview] = useState(null);

    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);
    const isAdmin = ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'].includes(auth.user.role);
    const isWarga = ['warga_kk', 'warga_anggota'].includes(auth.user.role);

    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    
    const iuranChartRef = useRef(null);
    const iuranChartInstance = useRef(null);

    // Monitoring Active Users State & Polling
    const [activeUsers, setActiveUsers] = useState({ count: 0, users: [] });
    const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);
    useEffect(() => {
        if (!isAdmin) return;
        
        const fetchActiveUsers = async () => {
            try {
                // Add timestamp to prevent browser caching (especially Safari)
                const ts = new Date().getTime();
                const response = await fetch(`/api/active-users?_t=${ts}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setActiveUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch active users", error);
            }
        };

        // Initial fetch
        fetchActiveUsers();

        // Poll every 10 seconds
        const interval = setInterval(fetchActiveUsers, 10000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    useEffect(() => {
        // --- Grafik Warga per RT ---
        if (isAdmin && wargaPerRt && wargaPerRt.length > 0 && chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)'); // Indigo 600
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: wargaPerRt.map(item => item.rt),
                    datasets: [{
                        label: 'Total Warga',
                        data: wargaPerRt.map(item => item.total),
                        borderColor: '#4f46e5',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#4f46e5',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            padding: 12,
                            titleFont: { size: 13 },
                            bodyFont: { size: 14, weight: 'bold' },
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + ' Warga';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f3f4f6',
                                drawBorder: false,
                            },
                            ticks: {
                                stepSize: 5,
                                font: { size: 11 },
                                color: '#6b7280'
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 11, weight: 'bold' },
                                color: '#4b5563'
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                }
            });
        }
        
        // --- Grafik Iuran Kas (Lunas vs Belum) ---
        if (isAdmin && iuranChartRef.current && iuranChartData) {
            if (iuranChartInstance.current) {
                iuranChartInstance.current.destroy();
            }

            const ctx2 = iuranChartRef.current.getContext('2d');
            
            iuranChartInstance.current = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: iuranChartData.labels,
                    datasets: [
                        {
                            label: 'Lunas',
                            data: iuranChartData.lunas_nominal,
                            borderColor: '#059669', // emerald 600
                            backgroundColor: 'rgba(5, 150, 105, 0.15)',
                            borderWidth: 3,
                            pointStyle: 'circle',
                            pointRadius: 6,
                            pointHoverRadius: 9,
                            pointBackgroundColor: '#059669',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            tension: 0.35,
                            fill: true,
                        },
                        {
                            label: 'Belum Lunas',
                            data: iuranChartData.belum_lunas_nominal,
                            borderColor: '#e11d48', // rose 600
                            backgroundColor: 'rgba(225, 29, 72, 0.15)',
                            borderWidth: 3,
                            pointStyle: 'circle',
                            pointRadius: 6,
                            pointHoverRadius: 9,
                            pointBackgroundColor: '#e11d48',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            tension: 0.35,
                            fill: true,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: 'bold' } }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            padding: 12,
                            titleFont: { size: 13 },
                            bodyFont: { size: 14, weight: 'bold' },
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) { label += ': '; }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f3f4f6', drawBorder: false },
                            ticks: {
                                font: { size: 11 }, color: '#6b7280',
                                callback: function(value) {
                                    if (value >= 1000000) return 'Rp ' + (value / 1000000) + 'jt';
                                    if (value >= 1000) return 'Rp ' + (value / 1000) + 'k';
                                    return 'Rp ' + value;
                                }
                            }
                        },
                        x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' }, color: '#4b5563' } }
                    }
                }
            });
        }
        
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            if (iuranChartInstance.current) {
                iuranChartInstance.current.destroy();
            }
        }
    }, [wargaPerRt, iuranChartData, isAdmin]);

    // 5 Kartu Statistik Ringkas & Rapat (Fresh, Iconic, Modern & Minimalis)
    const stats = [
        { title: 'Total Warga', value: adminStats?.total_warga || '0', emoji: '👥', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-200/80' },
        { title: 'Total KK', value: adminStats?.total_kk || '0', emoji: '🏘️', color: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-200/80' },
        { title: 'Rumah Dihuni', value: adminStats?.rumah_dihuni || '0', emoji: '🏠', color: 'text-cyan-800', bg: 'bg-cyan-100', border: 'border-cyan-200/80' },
        { title: 'Rumah Kosong', value: adminStats?.rumah_kosong || '0', emoji: '🚪', color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-200/80' },
        { title: 'Saldo Kas RT', value: adminStats?.saldo_kas_saat_ini || adminStats?.kas_bulan_ini || 'Rp 0', emoji: '💰', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-200/80' },
    ];

    const adminQuickLinks = [
        { name: 'Data Warga', href: route('admin.warga.index'), emoji: '👥', color: 'text-teal-800', bg: 'bg-teal-100/80' },
        { name: 'Iuran Kas', href: route('admin.iuran.index'), emoji: '💰', color: 'text-emerald-800', bg: 'bg-emerald-100/80' },
        { name: 'Bantuan Sosial', href: route('admin.bansos.index'), emoji: '🎁', color: 'text-amber-800', bg: 'bg-amber-100/80' },
        { name: 'Pengaduan', href: route('admin.pengaduan.index'), emoji: '📢', color: 'text-rose-800', bg: 'bg-rose-100/80' },
        { name: 'Surat Pengantar', href: route('admin.surat.index'), emoji: '📄', color: 'text-indigo-800', bg: 'bg-indigo-100/80' },
        { name: 'Laporan RT', href: route('admin.laporan.index'), emoji: '📈', color: 'text-purple-800', bg: 'bg-purple-100/80' },
    ];

    const wargaQuickLinks = [
        { name: 'Iuran Kas', href: route('warga.iuran.index'), emoji: '💰', color: 'text-emerald-800', bg: 'bg-emerald-100/80' },
        { name: 'Pengaduan', href: route('warga.pengaduan.index'), emoji: '📢', color: 'text-rose-800', bg: 'bg-rose-100/80' },
        { name: 'Surat Pengantar', href: route('warga.surat.index'), emoji: '📄', color: 'text-indigo-800', bg: 'bg-indigo-100/80' },
        { name: 'Bantuan Sosial', href: route('warga.bansos.index'), emoji: '🎁', color: 'text-amber-800', bg: 'bg-amber-100/80' },
        { name: 'Pengkinian Data', href: route('warga.pengkinian-data.index'), emoji: '📋', color: 'text-cyan-800', bg: 'bg-cyan-100/80' },
    ];

    if (isWarga) {
        return (
            <WargaLayout header="Dashboard">
                <Head title="Dashboard Warga" />
                <WargaDashboardContent
                    auth={auth}
                    warga={warga}
                    quickLinks={wargaQuickLinks}
                    iurans={iurans}
                    surats={surats}
                    pengaduans={pengaduans}
                    wargaPreview={wargaPreview}
                    setWargaPreview={setWargaPreview}
                    namaPerumahan={namaPerumahan}
                    namaRt={namaRt}
                    transaksiKas={transaksiKas}
                    saldoKasSaatIni={saldoKasSaatIni}
                />
            </WargaLayout>
        );
    }

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-black leading-tight text-gray-800 tracking-tight">
                    ⚡ Dashboard Administrator
                </h2>
            }
        >
            <Head title="Dashboard Admin" />

            {/* Custom Animation Keyframes for Welcome Banner */}
            <style>{`
                @keyframes handWave {
                    0% { transform: rotate(0deg); }
                    15% { transform: rotate(14deg); }
                    30% { transform: rotate(-8deg); }
                    45% { transform: rotate(14deg); }
                    60% { transform: rotate(-4deg); }
                    75% { transform: rotate(10deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-hand-wave {
                    display: inline-block;
                    transform-origin: 70% 70%;
                    animation: handWave 2s infinite;
                }
                @keyframes borderFlash {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-border-flash {
                    background-size: 250% 250%;
                    animation: borderFlash 4s linear infinite;
                }
                @keyframes marqueeText {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee-slow {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marqueeText 24s linear infinite;
                }
            `}</style>

            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Welcome Hero Banner WITH ANIMATED FLASH BORDER & SAY HI HAND WAVE */}
                <div className="relative rounded-3xl p-[2.5px] bg-gradient-to-r from-amber-400 via-emerald-400 via-cyan-400 to-rose-400 animate-border-flash shadow-xl shadow-emerald-900/10 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-[22px] p-6 sm:p-7 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold mb-2.5 border border-white/20">
                                <span>🏡 Perumahan {namaPerumahan} • {namaRt}</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black mb-1.5 tracking-tight flex items-center gap-2 flex-wrap">
                                <span>Selamat datang kembali,</span>
                                <span className="bg-gradient-to-r from-amber-300 via-emerald-200 to-white bg-clip-text text-transparent font-black underline decoration-amber-400/50">
                                    {auth.user.name}!
                                </span>
                                <span className="animate-hand-wave text-2xl sm:text-3xl ml-1 cursor-default" title="Say Hi!">👋</span>
                            </h3>
                            <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">
                                Ringkasan dan kendali cepat data kewargaan lingkungan hari ini di Perumahan {namaPerumahan}.
                            </p>
                        </div>

                        {/* Marquee Running Text Announcement Banner */}
                        <div className="mt-4 pt-3 border-t border-white/10 overflow-hidden relative flex items-center bg-black/20 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold">
                            <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider mr-3 shrink-0 border border-amber-300/30">
                                📢 Info RT
                            </span>
                            <div className="overflow-hidden w-full relative">
                                <div className="animate-marquee-slow font-mono text-[11px] tracking-wide">
                                    ⚡ Selamat Datang di Portal RT Digital • Layanan Mandiri Kewargaan, Transparansi Kas Realtime, Notifikasi Live & Pengaduan Warga • Tetap jaga kerukunan & kebersihan lingkungan RT 009 / RW 006.
                                </div>
                            </div>
                        </div>

                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                            <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                    </div>
                </div>

                {/* Live Monitoring Active Users (Folded / Show-Hide Collapsible) */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-100 overflow-hidden relative transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            {/* Sonar Indicator */}
                            <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                                    <span>Monitoring Pengunjung Aktif</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold border border-emerald-200">
                                        {activeUsers.count} Online
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Pemantauan aktivitas {activeUsers.count} pengguna terdaftar secara real-time
                                </p>
                            </div>
                        </div>

                        {/* Show / Hide Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsMonitoringOpen(prev => !prev)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-xs transition cursor-pointer shrink-0"
                        >
                            <span>{isMonitoringOpen ? '🙈 Sembunyikan Detail' : '👁️ Tampilkan Monitoring User'}</span>
                            <span className="text-xs">{isMonitoringOpen ? '▲' : '▼'}</span>
                        </button>
                    </div>
                    
                    {/* Collapsible Table Content */}
                    {isMonitoringOpen && (
                        <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 shadow-inner bg-gray-50/50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-100/80 border-b border-gray-200">
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Pengguna</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Lokasi / Keterangan</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Modul Diakses</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Browser</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeUsers.users.length > 0 ? (
                                        activeUsers.users.map((user, idx) => (
                                            <tr key={user.id || idx} className="hover:bg-white transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800">{user.name}</div>
                                                            <div className="text-[10px] text-gray-500 uppercase">{user.role.replace('_', ' ')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                                                    {user.lokasi}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{user.ip_address}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600">
                                                    {user.module}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[11px] text-gray-500 max-w-[150px] truncate" title={user.browser}>
                                                        {user.browser}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${user.is_idle ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                            {user.is_idle ? '🟡' : '🟢'} {user.idle_text}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400 mt-1 font-semibold">Login: {user.login_time}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm font-medium">
                                                Tidak ada pengguna aktif saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 5 Stats Cards — Rapat, Minimalis & Compact (Kotak Tidak Lebar) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group flex items-center gap-3 overflow-hidden"
                        >
                            <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-2xs`}>
                                {stat.emoji}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight truncate">{stat.title}</p>
                                <h4 className="text-lg sm:text-xl font-black text-gray-900 mt-0.5 truncate">{stat.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Baris Grafik Kanan Kiri (Warga per RT & Iuran Kas) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Populasi Warga per RT (Smooth Line Chart) */}
                    {isAdmin && wargaPerRt && wargaPerRt.length > 0 && (
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5 flex flex-col">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg text-lg">📈</span>
                                    <span>Distribusi Warga per RT (RW 009)</span>
                                </h3>
                            </div>
                            <div className="w-full h-[250px] relative">
                                <canvas id="rtChartCanvas" ref={chartRef}></canvas>
                            </div>
                        </div>
                    )}

                    {/* Grafik Perbandingan Iuran Kas */}
                    {isAdmin && iuranChartData && (
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5 flex flex-col">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg text-lg">💰</span>
                                    <span>Perbandingan Iuran Kas ({iuranChartData.year})</span>
                                </h3>
                            </div>
                            <div className="w-full h-[250px] relative">
                                <canvas id="iuranChartCanvas" ref={iuranChartRef}></canvas>
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid Konten Bawah: Quick Action Cards + Tabel Pengaduan Terbaru dengan No & Aksi */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Menu Navigasi Cepat - Modern Iconic Grid */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 overflow-hidden h-full flex flex-col">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                                <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                    <span>⚡ Menu Navigasi Cepat</span>
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    Akses Langsung
                                </span>
                            </div>
                            <div className="p-3.5 grid grid-cols-2 gap-2.5 flex-1">
                                {adminQuickLinks.map((link, index) => (
                                    <Link 
                                        key={index} 
                                        href={link.href} 
                                        className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/80 hover:bg-emerald-50/80 border border-gray-100 hover:border-emerald-200 text-gray-700 hover:text-emerald-900 transition-all duration-200 group"
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${link.bg} ${link.color} flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-110 transition-transform`}>
                                            {link.emoji}
                                        </div>
                                        <span className="font-extrabold text-xs tracking-tight truncate">{link.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pengaduan Terbaru Table dengan No. dan Tombol Preview Data */}
                    {isAdmin && (
                        <div className="lg:col-span-2">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 h-full flex flex-col">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
                                    <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                        <span>📢 Pengaduan & Laporan Warga Terbaru</span>
                                    </h3>
                                    <Link href={route('admin.pengaduan.index')} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900">
                                        Lihat Semua &rarr;
                                    </Link>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/90 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                                                <th className="px-4 py-3 font-extrabold w-12 text-center">No</th>
                                                <th className="px-4 py-3 font-extrabold">Warga</th>
                                                <th className="px-4 py-3 font-extrabold">Pengaduan</th>
                                                <th className="px-4 py-3 font-extrabold">Status</th>
                                                <th className="px-4 py-3 font-extrabold">Tanggal</th>
                                                <th className="px-4 py-3 font-extrabold text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {adminPengaduans && adminPengaduans.length > 0 ? adminPengaduans.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                                    <td className="px-4 py-3.5 font-extrabold text-gray-400 text-center">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-bold text-gray-900">
                                                        {item.warga}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-gray-700 font-medium max-w-[180px] truncate">
                                                        {item.judul}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold
                                                            ${item.status === 'Menunggu' || item.status === 'Diajukan' ? 'bg-amber-100 text-amber-800' : 
                                                            item.status === 'Diproses' ? 'bg-blue-100 text-blue-800' : 
                                                            'bg-emerald-100 text-emerald-800'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-gray-500 font-medium whitespace-nowrap">
                                                        {item.tanggal}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPreview(item)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 text-[11px] font-extrabold transition-all shadow-2xs hover:scale-105"
                                                            title="Preview Detail Pengaduan"
                                                        >
                                                            <span>👁️ Preview</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-10 text-center text-gray-400 font-bold">
                                                        📭 Belum ada pengaduan warga terbaru.
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

            {/* Modal Preview Data Pengaduan (Modern Minimalis) */}
            {selectedPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
                        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                                    📢
                                </span>
                                <div>
                                    <h3 className="font-black text-base leading-tight">Preview Data Pengaduan</h3>
                                    <p className="text-xs text-emerald-100 mt-0.5">Laporan lingkungan RT/RW</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPreview(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pelapor</p>
                                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{selectedPreview.warga}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tanggal</p>
                                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{selectedPreview.tanggal}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Kategori</p>
                                    <p className="font-extrabold text-gray-900 mt-0.5">{selectedPreview.kategori || 'Umum / Lingkungan'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Status Progres</p>
                                    <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        selectedPreview.status === 'Menunggu' || selectedPreview.status === 'Diajukan' ? 'bg-amber-100 text-amber-800' :
                                        selectedPreview.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                                        'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {selectedPreview.status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Judul Pengaduan</p>
                                <h4 className="font-black text-gray-900 text-sm bg-gray-50/80 px-3.5 py-2.5 rounded-xl border border-gray-100">
                                    {selectedPreview.judul}
                                </h4>
                            </div>

                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Deskripsi / Isi Pengaduan</p>
                                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/70 text-gray-700 font-medium whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                                    {selectedPreview.deskripsi || 'Tidak ada rincian deskripsi tambahan.'}
                                </div>
                            </div>

                            {selectedPreview.foto && (
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Foto Bukti</p>
                                    <div className="flex gap-2 overflow-x-auto">
                                        {(Array.isArray(selectedPreview.foto) ? selectedPreview.foto : [selectedPreview.foto]).map((f, idx) => (
                                            <a key={idx} href={f} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                                                <img src={f} alt="Bukti" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setSelectedPreview(null)}
                                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs font-extrabold transition-colors"
                            >
                                Tutup
                            </button>
                            <Link
                                href={route('admin.pengaduan.index')}
                                className="px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-extrabold transition-colors shadow-xs"
                            >
                                Kelola di Modul Pengaduan →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function WargaDashboardContent({ auth, warga, quickLinks, iurans, surats, pengaduans, wargaPreview, setWargaPreview, namaPerumahan, namaRt, transaksiKas, saldoKasSaatIni }) {
    const { profil } = usePage().props;
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, tagihanInfo: null });
    const groupedIurans = useMemo(() => {
        if (!iurans || !Array.isArray(iurans) || iurans.length === 0) return [];
        const groups = {};
        iurans.forEach((item) => {
            const key = `${item.periode_tahun}-${item.periode_bulan}`;
            if (!groups[key]) {
                groups[key] = {
                    key,
                    tahun: item.periode_tahun,
                    bulan: item.periode_bulan,
                    items: [],
                    totalAmount: 0,
                };
            }
            groups[key].items.push(item);
            groups[key].totalAmount += Number(item.jumlah_bayar) || 0;
        });
        return Object.values(groups).sort((a, b) => {
            if (b.tahun !== a.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
        });
    }, [iurans]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Welcome Banner Warga WITH ANIMATED FLASH BORDER & SAY HI HAND WAVE */}
            <div className="relative rounded-3xl p-[2.5px] bg-gradient-to-r from-amber-400 via-emerald-400 via-cyan-400 to-rose-400 animate-border-flash shadow-xl shadow-emerald-900/10 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-[22px] p-6 sm:p-7 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold mb-2.5 border border-white/20">
                            <span>🏡 Perumahan {namaPerumahan} • {namaRt}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black mb-1.5 tracking-tight flex items-center gap-2 flex-wrap">
                            <span>Selamat datang,</span>
                            <span className="bg-gradient-to-r from-amber-300 via-emerald-200 to-white bg-clip-text text-transparent font-black underline decoration-amber-400/50">
                                {auth.user.name}!
                            </span>
                            <span className="animate-hand-wave text-2xl sm:text-3xl ml-1 cursor-default" title="Say Hi!">👋</span>
                        </h3>
                        <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">Pantau kewargaan dan layanan lingkungan secara langsung dan transparan.</p>
                        {warga && (
                            <p className="mt-3 text-xs bg-white/15 inline-block px-3 py-1.5 rounded-full font-bold border border-white/20">
                                👤 {warga.nama_lengkap} &mdash; {warga.status_hubungan_keluarga || 'Warga'}
                            </p>
                        )}
                    </div>

                    {/* Marquee Running Text Announcement Banner */}
                    <div className="mt-4 pt-3 border-t border-white/10 overflow-hidden relative flex items-center bg-black/20 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold">
                        <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider mr-3 shrink-0 border border-amber-300/30">
                            📢 Info RT
                        </span>
                        <div className="overflow-hidden w-full relative">
                            <div className="animate-marquee-slow font-mono text-[11px] tracking-wide">
                                ⚡ Selamat Datang Warga RT 009 / RW 006 • Manfaatkan Fitur Layanan Surat Online, Cek Iuran Kas & Pengaduan Realtime • Lingkungan Aman, Warga Rukun & Sejahtera!
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                </div>
            </div>

            {/* Quick Links Warga - Iconic Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xs border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl ${link.bg} ${link.color} flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform shrink-0`}>
                            {link.emoji}
                        </div>
                        <span className="font-extrabold text-xs text-gray-800 group-hover:text-emerald-700 transition-colors truncate">{link.name}</span>
                    </Link>
                ))}
            </div>

            {/* Ringkasan Iuran dengan Nomor Urut dan Preview */}
            {iurans && iurans.length > 0 && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
                        <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                            <span>💰 Iuran & Tagihan Terakhir Saya</span>
                        </h3>
                        <Link href={route('warga.iuran.index')} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900">
                            Lihat Semua &rarr;
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/90 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-3 font-extrabold w-12 text-center">No</th>
                                    <th className="px-4 py-3 font-extrabold">Periode Bulan</th>
                                    <th className="px-4 py-3 font-extrabold">Komponen Iuran</th>
                                    <th className="px-4 py-3 font-extrabold">Total Akumulasi</th>
                                    <th className="px-4 py-3 font-extrabold">Status</th>
                                    <th className="px-4 py-3 font-extrabold text-center">Aksi / Rincian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {groupedIurans.slice(0, 5).map((group, index) => {
                                    const statusGroup = getGroupStatus(group.items);
                                    return (
                                        <tr key={group.key} className="hover:bg-emerald-50/40 transition-colors">
                                            <td className="px-4 py-3.5 font-extrabold text-gray-400 text-center">{index + 1}</td>
                                            <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span>📅</span>
                                                    <span>{bulanNamesShort[group.bulan]} {group.tahun}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600 font-medium">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-extrabold text-[10px]">
                                                        {group.items.length} Komponen
                                                    </span>
                                                    {group.items.map((item, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-bold">
                                                            <span>{getJenisIcon(item.jenis_iuran)}</span>
                                                            <span>{item.jenis_iuran}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 font-black text-emerald-700 whitespace-nowrap">
                                                Rp {group.totalAmount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${statusGroup.color}`}>
                                                    {statusGroup.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setWargaPreview({ type: 'iuran_group', data: group })}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-extrabold transition-all shadow-2xs"
                                                    >
                                                        <span>👁️ Rincian</span>
                                                    </button>
                                                    {statusGroup.label !== 'Approved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentModal({
                                                                isOpen: true,
                                                                tagihanInfo: {
                                                                    periode: `${bulanNamesShort[group.bulan]} ${group.tahun}`,
                                                                    total: group.totalAmount
                                                                }
                                                            })}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-black transition-all shadow-sm"
                                                            title="Lihat Info Pembayaran / Rekening"
                                                        >
                                                            <span>💳 Bayar</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Riwayat Arus Kas RT - Transparansi Warga */}
            {transaksiKas && transaksiKas.data && transaksiKas.data.length > 0 && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <div>
                            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">🏛️</span>
                                <span>Buku Kas & Riwayat Transaksi RT</span>
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Transparansi arus kas lingkungan perumahan.</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100/50 flex flex-col items-end">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5 animate-pulse">Saldo Akhir Kas RT</span>
                            <span className="text-base font-black text-emerald-600">Rp {Number(saldoKasSaatIni || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-3 font-extrabold">Tanggal</th>
                                    <th className="px-4 py-3 font-extrabold">Kategori</th>
                                    <th className="px-4 py-3 font-extrabold">Keterangan</th>
                                    <th className="px-4 py-3 font-extrabold text-right">Debet (Masuk)</th>
                                    <th className="px-4 py-3 font-extrabold text-right">Kredit (Keluar)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {transaksiKas.data.map((trx, idx) => (
                                    <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-bold">
                                            {new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                                                trx.jenis === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                                {trx.jenis === 'Pemasukan' ? '↙️' : '↗️'} {trx.kategori}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-medium">
                                            {trx.keterangan}
                                            {trx.referensi && <div className="text-[10px] text-gray-400 mt-0.5 font-bold">Ref: {trx.referensi}</div>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right font-black text-emerald-600">
                                            {trx.jenis === 'Pemasukan' ? `+ Rp ${Number(trx.jumlah).toLocaleString('id-ID')}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right font-black text-rose-600">
                                            {trx.jenis === 'Pengeluaran' ? `- Rp ${Number(trx.jumlah).toLocaleString('id-ID')}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Links (Basic Support for Inertia) */}
                    {transaksiKas.links && transaksiKas.links.length > 3 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-center gap-1">
                            {transaksiKas.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        link.active ? 'bg-emerald-600 text-white shadow-sm' : 
                                        !link.url ? 'text-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Ringkasan Pengaduan Saya dengan Nomor Urut dan Preview */}
            {pengaduans && pengaduans.length > 0 && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
                        <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                            <span>📢 Pengaduan Terakhir Saya</span>
                        </h3>
                        <Link href={route('warga.pengaduan.index')} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900">
                            Lihat Semua &rarr;
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/90 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-3 font-extrabold w-12 text-center">No</th>
                                    <th className="px-4 py-3 font-extrabold">Judul</th>
                                    <th className="px-4 py-3 font-extrabold">Kategori</th>
                                    <th className="px-4 py-3 font-extrabold">Tanggal</th>
                                    <th className="px-4 py-3 font-extrabold">Status</th>
                                    <th className="px-4 py-3 font-extrabold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {pengaduans.slice(0, 5).map((item, index) => (
                                    <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                        <td className="px-4 py-3.5 font-extrabold text-gray-400 text-center">{index + 1}</td>
                                        <td className="px-4 py-3.5 font-bold text-gray-900 max-w-[180px] truncate">{item.judul}</td>
                                        <td className="px-4 py-3.5 text-gray-600 font-medium">{item.kategori}</td>
                                        <td className="px-4 py-3.5 text-gray-500 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                                item.status_progres === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                                                item.status_progres === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                                                'bg-amber-100 text-amber-800'}`}>
                                                {item.status_progres}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setWargaPreview({ type: 'pengaduan', data: item })}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-extrabold transition-all shadow-2xs"
                                            >
                                                <span>👁️ Preview</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Preview Warga */}
            {wargaPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden">
                        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                            <h3 className="font-black text-base">
                                {wargaPreview.type === 'iuran_group' ? '💰 Rincian Tagihan Iuran Bulanan' :
                                 wargaPreview.type === 'iuran' ? '💰 Detail Tagihan Iuran' : '📢 Detail Laporan Pengaduan'}
                            </h3>
                            <button onClick={() => setWargaPreview(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✕</button>
                        </div>
                        <div className="p-5 space-y-3 text-xs">
                            {wargaPreview.type === 'iuran_group' ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                                        <div>
                                            <div className="text-xs font-black text-gray-800">
                                                Periode Tagihan {bulanNamesFull[wargaPreview.data.bulan]} {wargaPreview.data.tahun}
                                            </div>
                                            <div className="text-[11px] font-bold text-gray-500">
                                                {wargaPreview.data.items.length} Komponen Iuran
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-emerald-700">
                                            Rp {wargaPreview.data.totalAmount.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Rincian Komponen:</div>
                                        {wargaPreview.data.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/90 border border-gray-100">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg bg-white shadow-2xs border border-gray-100 flex items-center justify-center text-sm shrink-0">
                                                        {getJenisIcon(item.jenis_iuran)}
                                                    </span>
                                                    <div>
                                                        <div className="font-extrabold text-gray-800">{item.jenis_iuran}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold">Status: {item.status_pembayaran}</div>
                                                    </div>
                                                </div>
                                                <div className="font-extrabold text-emerald-800">
                                                    Rp {Number(item.jumlah_bayar).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const grp = wargaPreview.data;
                                                setWargaPreview(null);
                                                setPaymentModal({
                                                    isOpen: true,
                                                    tagihanInfo: {
                                                        periode: `${bulanNamesFull[grp.bulan]} ${grp.tahun}`,
                                                        total: grp.totalAmount
                                                    }
                                                });
                                            }}
                                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <span>💳</span>
                                            <span>Bayar Sekarang</span>
                                        </button>
                                        <Link
                                            href={route('warga.iuran.index')}
                                            className="w-full py-2.5 bg-emerald-700 text-white text-center rounded-xl text-xs font-extrabold hover:bg-emerald-800 transition-colors shadow-sm flex items-center justify-center"
                                        >
                                            Riwayat Lengkap &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ) : wargaPreview.type === 'iuran' ? (
                                <div className="space-y-3">
                                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-black text-gray-800">{wargaPreview.data.jenis_iuran}</div>
                                            <div className="text-[11px] font-bold text-gray-500">Periode: {bulanNamesFull[wargaPreview.data.periode_bulan]} {wargaPreview.data.periode_tahun}</div>
                                        </div>
                                        <div className="text-sm font-black text-emerald-800">
                                            Rp {Number(wargaPreview.data.jumlah_bayar).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-gray-500">Status Tagihan:</span>
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">{wargaPreview.data.status_pembayaran}</span>
                                    </div>
                                    {wargaPreview.data.status_pembayaran !== 'Approved' && (
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const item = wargaPreview.data;
                                                    setWargaPreview(null);
                                                    setPaymentModal({
                                                        isOpen: true,
                                                        tagihanInfo: {
                                                            periode: `${item.jenis_iuran} (${bulanNamesFull[item.periode_bulan]} ${item.periode_tahun})`,
                                                            total: item.jumlah_bayar
                                                        }
                                                    });
                                                }}
                                                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <span>💳</span>
                                                <span>Bayar Sekarang (Info Rekening)</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <p><strong>Judul:</strong> {wargaPreview.data.judul}</p>
                                    <p><strong>Kategori:</strong> {wargaPreview.data.kategori}</p>
                                    <p><strong>Status Progres:</strong> {wargaPreview.data.status_progres}</p>
                                    <p><strong>Deskripsi:</strong> {wargaPreview.data.deskripsi || '-'}</p>
                                </>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                            <button onClick={() => setWargaPreview(null)} className="px-4 py-2 rounded-xl bg-gray-200 font-extrabold text-xs">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, tagihanInfo: null })}
                profil={profil}
                tagihanInfo={paymentModal.tagihanInfo}
                namaRt={namaRt}
            />
        </div>
    );
}
