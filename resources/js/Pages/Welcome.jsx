import { Head, Link } from '@inertiajs/react';
import { getNamaPerumahan, getNamaRt } from '@/Utils/profilHelper';

export default function Welcome({ auth, profil }) {
    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);
    const features = [
        {
            title: 'Iuran Kas Lingkungan',
            description: 'Pantau pembayaran iuran bulanan dan laporan arus kas RT secara transparan, akuntabel, dan real-time dari mana saja.',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            badge: 'Transparan',
            badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        },
        {
            title: 'Surat Pengantar Online',
            description: 'Ajukan pembuatan surat pengantar RT/RW secara digital tanpa antri dan langsung diproses oleh pengurus lingkungan.',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            color: 'text-teal-700',
            bg: 'bg-teal-50 border-teal-200',
            badge: 'Cepat & Praktis',
            badgeColor: 'bg-teal-100 text-teal-800 border border-teal-200'
        },
        {
            title: 'Pengaduan & Aspirasi',
            description: 'Sampaikan laporan keamanan, kebersihan lingkungan, atau masalah fasilitas umum langsung kepada pengurus secara responsif.',
            icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
            color: 'text-rose-700',
            bg: 'bg-rose-50 border-rose-200',
            badge: 'Responsif',
            badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200'
        },
        {
            title: 'Sensus & Data Kependudukan',
            description: 'Pembaruan data keluarga, anggota KK, dan domisili secara digital dan terpusat dengan jaminan kerahasiaan data.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            badge: 'Akurat & Aman',
            badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        },
    ];

    const pengurus = profil?.pengurus || [];

    // Helper function to get clean avatar URL
    const getAvatar = (nama) => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=10b981&color=fff&bold=true`;
    };

    return (
        <>
            <Head title={`Portal ${namaPerumahan} - ${namaRt}`} />
            <div className="min-h-screen bg-slate-50 selection:bg-emerald-600 selection:text-white font-sans overflow-x-hidden w-full max-w-full relative text-gray-800">
                
                {/* Fixed Clean Header / Navbar */}
                <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm w-full max-w-full transition-all">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            {profil?.logo_path ? (
                                <img 
                                    src={`/storage/${profil.logo_path}`} 
                                    alt="Logo RT" 
                                    className="w-11 h-11 object-contain rounded-xl p-1 bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform" 
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                                    RT
                                </div>
                            )}
                            <div>
                                <div className="font-extrabold text-xl text-gray-900 tracking-tight flex items-center gap-1.5">
                                    <span>Portal</span>
                                    <span className="text-emerald-600">{namaRt.split('/')[0].trim()}</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium -mt-0.5">{namaRt} • {namaPerumahan}</p>
                            </div>
                        </Link>

                        {/* Navigation Menu (Desktop) */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                            <a href="#beranda" className="hover:text-emerald-600 transition-colors">Beranda</a>
                            <a href="#layanan" className="hover:text-emerald-600 transition-colors">Layanan Warga</a>
                            <a href="#profil" className="hover:text-emerald-600 transition-colors">Profil Lingkungan</a>
                            <a href="#pengurus" className="hover:text-emerald-600 transition-colors">Struktur RT</a>
                        </nav>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-md shadow-emerald-600/20 transform hover:-translate-y-0.5"
                                >
                                    <span>Dashboard Saya</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Link
                                        href={route('login')}
                                        className="font-semibold text-sm text-gray-700 hover:text-emerald-600 px-3.5 py-2 rounded-xl transition"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-md shadow-emerald-600/20 transform hover:-translate-y-0.5"
                                    >
                                        <span>Portal Warga</span>
                                        <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section id="beranda" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
                    {/* Subtle decorative background shapes */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 right-0 w-[450px] h-[450px] bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-rose-200/20 rounded-full blur-[80px] max-w-full"></div>
                        <div className="absolute -bottom-24 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 via-emerald-100/20 to-rose-100/20 rounded-full blur-[80px] max-w-full"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            
                            {/* Left Text Column */}
                            <div className="lg:col-span-7 text-center lg:text-left">
                                {/* Top Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-bold mb-6 border border-emerald-300/60 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                    <span>🏡 Transformasi Digital Lingkungan {namaRt}</span>
                                </div>

                                {/* Main Title */}
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] mb-6">
                                    Harmoni Bertetangga, dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-800">Satu Portal Digital.</span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                    Sistem informasi terpadu warga {namaPerumahan}. Kelola iuran kas secara transparan, ajukan surat pengantar online, dan pantau pengaduan lingkungan lebih cepat dan akuntabel.
                                </p>

                                {/* Action Buttons Group */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="w-full sm:w-auto px-8 py-4 text-base bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-3"
                                        >
                                            <span>Buka Dashboard Saya</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                            </svg>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="w-full sm:w-auto px-8 py-4 text-base bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-3"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                                </svg>
                                                <span>Masuk Portal Warga</span>
                                            </Link>
                                            <Link
                                                href={route('login')}
                                                className="w-full sm:w-auto px-8 py-4 text-base bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                                </svg>
                                                <span>Akses Administrator</span>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Quick Trust Badges */}
                                <div className="pt-6 border-t border-gray-200/70 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm font-semibold text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                                        <span>100% Transparan &amp; Terbuka</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold">⚡</span>
                                        <span>Surat Online 24/7</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">🔒</span>
                                        <span>Data Warga Terlindungi</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Visual / Card Showcase */}
                            <div className="lg:col-span-5 relative flex justify-center">
                                {/* Glowing Backdrop */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-15 transform -rotate-2"></div>
                                
                                {/* Main Visual Frame Card */}
                                <div className="relative w-full max-w-lg bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden p-3 sm:p-4">
                                    {/* Card Window Top Bar */}
                                    <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-100 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded-full bg-red-400"></span>
                                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                                            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                                            Status: Lingkungan Kondusif 🟢
                                        </span>
                                    </div>

                                    {/* Community Hero Image */}
                                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100">
                                        <img 
                                            src="/images/puridelta.png" 
                                            alt={`Lingkungan ${namaPerumahan}`} 
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                                        
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-700/90 backdrop-blur-sm text-xs font-bold mb-1.5">
                                                {namaRt}
                                            </span>
                                            <p className="text-sm font-bold leading-snug">
                                                Perumahan {namaPerumahan}, Lingkungan Asri &amp; Nyaman
                                            </p>
                                        </div>
                                    </div>

                                    {/* Floating Stats Widget inside Card */}
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                💰
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Iuran Warga</p>
                                                <p className="text-xs font-extrabold text-gray-900 truncate">100% Transparan</p>
                                            </div>
                                        </div>
                                        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-rose-800 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                📄
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">Surat Online</p>
                                                <p className="text-xs font-extrabold text-gray-900 truncate">Selesai Cepat</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Features / Layanan Section */}
                <section id="layanan" className="py-20 bg-white border-y border-gray-200/80 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3">
                                Layanan Terpadu
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                                Fitur Digital untuk Kemudahan Warga
                            </h2>
                            <p className="text-gray-600 text-base sm:text-lg">
                                Platform informasi mandiri yang meningkatkan pelayanan bimbingan RT, mempercepat surat-menyurat, serta menyajikan laporan keuangan terbuka.
                            </p>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Card Header & Badge */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path>
                                                </svg>
                                            </div>
                                            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${feature.badgeColor}`}>
                                                {feature.badge}
                                            </span>
                                        </div>

                                        {/* Title & Desc */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Action Footnote */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                                        <span>Akses Layanan</span>
                                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Profil & Kepengurusan RT Section */}
                <section id="profil" className="py-20 bg-slate-50 relative overflow-hidden">
                    {/* Subtle Background Accent */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none max-w-full"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none max-w-full"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider mb-3">
                                Profil Lingkungan
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                                Rukun Tetangga &amp; Rukun Warga ({namaRt})
                            </h2>
                            <p className="text-gray-600 text-base sm:text-lg">
                                Mengenal lebih dekat struktur kepengurusan dan kontak layanan resmi di lingkungan {namaPerumahan}.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            
                            {/* Left Col: Informasi Lingkungan */}
                            <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-gray-200/80 shadow-md">
                                <div className="flex flex-col items-center text-center pb-8 border-b border-gray-100">
                                    {profil?.logo_path ? (
                                        <img 
                                            src={`/storage/${profil.logo_path}`} 
                                            alt="Logo RT" 
                                            className="w-28 h-28 object-contain bg-slate-50 p-3 rounded-2xl border border-gray-100 shadow-sm mb-4" 
                                        />
                                    ) : (
                                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-emerald-600/20 mb-4">
                                            RT
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-black text-gray-900">
                                        {namaRt}
                                    </h3>
                                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                                        Perumahan {namaPerumahan}
                                    </p>
                                </div>

                                <div className="pt-6 space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
                                            📍
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Lingkungan</p>
                                            <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                                {profil?.alamat || `Perumahan ${namaPerumahan}, ${namaRt}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 font-bold">
                                            💬
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Layanan Warga (WhatsApp)</p>
                                            <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                                                {profil?.nomor_wa || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center flex-shrink-0 font-bold">
                                            🏛️
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Organisasi</p>
                                            <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                                {namaRt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Struktur Kepengurusan */}
                            <div id="pengurus" className="lg:col-span-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Struktur Kepengurusan RT
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Pengurus aktif yang siap melayani warga lingkungan RT 009.
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-flex px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                        {pengurus.length} Pengurus
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {pengurus.length > 0 ? (
                                        pengurus.map((person, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-4 group"
                                            >
                                                <img 
                                                    src={getAvatar(person.nama)} 
                                                    alt={person.nama} 
                                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-100 group-hover:border-emerald-500 transition-colors flex-shrink-0" 
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                                                        {person.jabatan}
                                                    </span>
                                                    <h4 className="text-base font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                                        {person.nama}
                                                    </h4>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                                            <p className="font-medium">Belum ada data pengurus yang ditampilkan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Call To Action Banner */}
                <section className="py-16 bg-white relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-rose-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none max-w-full"></div>
                            
                            <div className="relative z-10 max-w-2xl text-center md:text-left">
                                <span className="inline-block px-3.5 py-1 rounded-full bg-rose-950/40 backdrop-blur-sm text-rose-100 text-xs font-bold mb-3 uppercase tracking-wider border border-rose-300/30">
                                    🏡 Portal Digital RT 009
                                </span>
                                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
                                    Siap Mengakses Layanan Lingkungan Anda?
                                </h3>
                                <p className="text-emerald-100 text-sm sm:text-base">
                                    Masuk ke akun warga untuk mulai bayar iuran kas, membuat surat pengantar online, serta memantau pengaduan.
                                </p>
                            </div>

                            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <Link
                                    href={route('login')}
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-800 font-extrabold rounded-2xl hover:bg-gray-100 transition shadow-lg text-center whitespace-nowrap"
                                >
                                    Masuk ke Portal &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
                                    RT
                                </div>
                                <div>
                                    <span className="font-extrabold text-lg text-white tracking-tight">
                                        Portal<span className="text-emerald-400">{namaRt.split('/')[0].trim()}</span>
                                    </span>
                                    <p className="text-xs text-gray-400">{namaRt} • Perumahan {namaPerumahan}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-gray-400">
                                <a href="#beranda" className="hover:text-white transition-colors">Beranda</a>
                                <a href="#layanan" className="hover:text-white transition-colors">Layanan</a>
                                <a href="#profil" className="hover:text-white transition-colors">Profil Lingkungan</a>
                                <a href="#pengurus" className="hover:text-white transition-colors">Struktur RT</a>
                            </div>

                            <p className="text-xs text-gray-500 text-center md:text-right">
                                &copy; {new Date().getFullYear()} {namaRt}.<br className="hidden md:inline" /> Hak Cipta Dilindungi Undang-Undang.
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
