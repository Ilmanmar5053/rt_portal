import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';

const menuIconStyle = `
    @keyframes zoomIn {
        from {
            transform: scale(1);
        }
        to {
            transform: scale(1.1);
        }
    }
    .menu-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        font-size: 16px;
        margin-right: 10px;
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }
    .menu-link:hover .menu-icon,
    .menu-parent:hover .menu-icon {
        transform: scale(1.1);
    }
    .menu-link.active .menu-icon {
        transform: scale(1.05);
    }
    .submenu-enter {
        opacity: 1;
    }
    .chevron-icon {
        transition: transform 0.3s ease;
    }
    .menu-parent.open .chevron-icon {
        transform: rotate(90deg);
    }

    @media (max-width: 767px) {
        html, body {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
        }
    }
`;

export default function AdminLayout({ header, children }) {
    const pageProps = usePage()?.props || {};
    const auth = pageProps.auth || {};
    const profil = pageProps.profil || null;
    const user = auth.user || {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default autohide (collapsed to mini icons w-20)
    const [isHoveringSidebar, setIsHoveringSidebar] = useState(false); // Temporarily expand on hover
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar
    
    // Dynamic Clock State
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Sync App Icon / Favicon dynamically from Profil
    useEffect(() => {
        const faviconUrl = profil?.logo_path ? `/storage/${profil.logo_path}` : '/images/puridelta.png';
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = faviconUrl;
    }, [profil]);

    const [openMenus, setOpenMenus] = useState({}); // Track which parent menus are open

    // Whether the desktop sidebar should be rendered expanded (explicit open or hover)
    const isExpanded = isSidebarOpen || isHoveringSidebar;
    const isAdmin = user?.role === 'superadmin';

    // Toggle submenu
    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    // Auto-expand menu if child is active
    useEffect(() => {
        const menusToOpen = {};
        menuGroups.forEach(group => {
            if (group.type === 'group' && group.children) {
                const hasActiveChild = group.children.some(child => child.active);
                if (hasActiveChild) {
                    menusToOpen[group.name] = true;
                }
            }
        });
        setOpenMenus(menusToOpen);
    }, []);

    const menuGroups = [
        {
            type: 'single',
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: { emoji: '🏡', bg: 'bg-emerald-100', color: 'text-emerald-700' },
        },
        {
            type: 'group',
            name: 'Data Master',
            icon: { emoji: '📋', bg: 'bg-emerald-100', color: 'text-emerald-700' },
            children: [
                {
                    name: 'Data Rumah',
                    href: route('admin.rumah.index'),
                    active: route().current('admin.rumah.*'),
                    icon: { emoji: '🏠', bg: 'bg-emerald-100', color: 'text-emerald-700' },
                },
                {
                    name: 'Data KK (Keluarga)',
                    href: route('admin.keluarga.index'),
                    active: route().current('admin.keluarga.*'),
                    icon: { emoji: '👨‍👩‍👧‍👦', bg: 'bg-emerald-100', color: 'text-emerald-700' },
                },
                {
                    name: 'Data Anggota Warga',
                    href: route('admin.warga.index'),
                    active: route().current('admin.warga.*'),
                    icon: { emoji: '👤', bg: 'bg-teal-100', color: 'text-teal-700' },
                },
            ]
        },
        {
            type: 'group',
            name: 'Struktur & Wilayah',
            icon: { emoji: '🗺️', bg: 'bg-indigo-100', color: 'text-indigo-700' },
            children: [
                {
                    name: 'Mapping Blok Rumah',
                    href: route('admin.mapping-blok.index'),
                    active: route().current('admin.mapping-blok.*'),
                    icon: { emoji: '🛰️', bg: 'bg-cyan-100', color: 'text-cyan-700' },
                },
                {
                    name: 'Struktur RT',
                    href: route('admin.struktur-rt.index'),
                    active: route().current('admin.struktur-rt.*'),
                    icon: { emoji: '🏢', bg: 'bg-indigo-100', color: 'text-indigo-700' },
                },
            ]
        },
        {
            type: 'single',
            name: 'Laporan',
            href: route('admin.laporan.index'),
            active: route().current('admin.laporan.*'),
            icon: { emoji: '📈', bg: 'bg-rose-100', color: 'text-rose-700' },
        },
        {
            type: 'group',
            name: 'Keuangan',
            icon: { emoji: '💼', bg: 'bg-emerald-100', color: 'text-emerald-700' },
            children: [
                {
                    name: 'Iuran Kas',
                    href: route('admin.iuran.index'),
                    active: route().current('admin.iuran.*'),
                    icon: { emoji: '💰', bg: 'bg-emerald-100', color: 'text-emerald-700' },
                },
                {
                    name: 'Transaksi Iuran',
                    href: route('admin.transaksi-iuran.index'),
                    active: route().current('admin.transaksi-iuran.*'),
                    icon: { emoji: '🧾', bg: 'bg-indigo-100', color: 'text-indigo-700' },
                },
                {
                    name: 'Arus Kas',
                    href: route('admin.transaksi-kas.index'),
                    active: route().current('admin.transaksi-kas.*'),
                    icon: { emoji: '📊', bg: 'bg-teal-100', color: 'text-teal-700' },
                },
            ]
        },
        {
            type: 'group',
            name: 'Layanan',
            icon: { emoji: '🛎️', bg: 'bg-rose-100', color: 'text-rose-700' },
            children: [
                {
                    name: 'Pengaduan',
                    href: route('admin.pengaduan.index'),
                    active: route().current('admin.pengaduan.*'),
                    icon: { emoji: '📢', bg: 'bg-rose-100', color: 'text-rose-700' },
                },
                {
                    name: 'Surat Pengantar',
                    href: route('admin.surat.index'),
                    active: route().current('admin.surat.*'),
                    icon: { emoji: '📄', bg: 'bg-teal-100', color: 'text-teal-700' },
                },
                {
                    name: 'Program & Kegiatan',
                    href: route('admin.program-kegiatan.index'),
                    active: route().current('admin.program-kegiatan.*'),
                    icon: { emoji: '🗓️', bg: 'bg-emerald-100', color: 'text-emerald-700' },
                },
                {
                    name: 'Bantuan Sosial',
                    href: route('admin.bansos.index'),
                    active: route().current('admin.bansos.*'),
                    icon: { emoji: '🎁', bg: 'bg-amber-100', color: 'text-amber-700' },
                },
            ]
        },
    ];

    // Add admin-only menu group
    if (isAdmin) {
        menuGroups.push({
            type: 'group',
            name: 'Pengaturan',
            icon: { emoji: '⚙️', bg: 'bg-rose-100', color: 'text-rose-700' },
            children: [
                {
                    name: 'Manajemen Akses',
                    href: route('admin.permissions.index'),
                    active: route().current('admin.permissions.*'),
                    icon: { emoji: '🔐', bg: 'bg-rose-100', color: 'text-rose-700' },
                },
                {
                    name: 'Manajemen User',
                    href: route('admin.users.index'),
                    active: route().current('admin.users.*'),
                    icon: { emoji: '👥', bg: 'bg-emerald-100', color: 'text-emerald-700' },
                },
                {
                    name: 'Manajemen Database',
                    href: route('admin.database.index'),
                    active: route().current('admin.database.*'),
                    icon: { emoji: '🗄️', bg: 'bg-amber-100', color: 'text-amber-700' },
                },
                {
                    name: 'Log Aktivitas',
                    href: route('admin.activity-logs.index'),
                    active: route().current('admin.activity-logs.*'),
                    icon: { emoji: '📜', bg: 'bg-purple-100', color: 'text-purple-700' },
                },
                {
                    name: 'Profil Lingkungan',
                    href: route('admin.profil.edit'),
                    active: route().current('admin.profil.*'),
                    icon: { emoji: '🏘️', bg: 'bg-teal-100', color: 'text-teal-700' },
                },
            ]
        });
    }

    // Filter menu based on permissions
    const permissions = usePage().props.auth.permissions || {};
    
    // Helper to check if menu should be visible based on permissions
    const canAccess = (menuName) => {
        if (isAdmin && (menuName === 'Manajemen Akses' || menuName === 'Manajemen User' || menuName === 'Manajemen Database' || menuName === 'Log Aktivitas' || menuName === 'Pengaturan')) return true;
        if (menuName === 'Dashboard' || menuName === 'Profil Lingkungan') return true;

        if (menuName === 'Data Rumah' || menuName === 'Mapping Blok Rumah') return permissions['data_rumah']?.access !== false;
        if (menuName === 'Data KK (Keluarga)') return permissions['data_keluarga']?.access !== false;
        if (menuName === 'Data Anggota Warga') return permissions['data_warga']?.access !== false;
        if (menuName === 'Struktur RT') return user?.role === 'superadmin' || user?.role === 'rw';
        
        if (menuName === 'Laporan') return true;
        if (menuName === 'Iuran Kas') return permissions['iuran_kas']?.access !== false;
        if (menuName === 'Arus Kas') return true; // always visible for admin roles
        if (menuName === 'Pengaduan') return permissions['pengaduan']?.access !== false;
        if (menuName === 'Surat Pengantar') return permissions['surat_pengantar']?.access !== false;
        if (menuName === 'Program & Kegiatan') return permissions['program_kegiatan']?.access !== false;
        if (menuName === 'Data Master' || menuName === 'Struktur & Wilayah' || menuName === 'Keuangan' || menuName === 'Layanan') return true;
        
        return true;
    };

    // Helper to render menu items
    const renderMenuItem = (item, isMobile = false) => {
        // slug for aria-controls/id if needed
        const slug = item.name.replace(/\s+/g, '-').toLowerCase();

        if (item.type === 'single') {
            return (
                <Link
                    key={item.name}
                    href={item.href}
                    onClick={isMobile ? () => setIsMobileSidebarOpen(false) : undefined}
                    className={`menu-link flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                        item.active
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-950/50 border border-emerald-400/40 backdrop-blur-md active'
                            : 'text-emerald-100 hover:bg-white/15 hover:text-white font-semibold hover:shadow-sm'
                    }`}
                    title={!isExpanded && !isMobile ? item.name : undefined}
                >
                    <div className={`menu-icon shadow-sm ${item.icon.bg} ${item.icon.color}`}>
                        {item.icon.emoji}
                    </div>
                    {(isExpanded || isMobile) && <span className="text-sm truncate">{item.name}</span>}
                </Link>
            );
        }

        // Group menu with children
        const isOpen = openMenus[item.name];
        const hasActiveChild = item.children?.some(child => child.active);

        return (
            <div key={item.name} className="menu-group">
                <button
                    onClick={() => toggleMenu(item.name)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(item.name); } }}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    aria-controls={`submenu-${slug}`}
                    className={`menu-parent ${isOpen ? 'open' : ''} w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                        hasActiveChild
                            ? 'bg-white/15 text-white font-black border border-white/20 backdrop-blur-md'
                            : 'text-emerald-100 hover:bg-white/15 hover:text-white font-semibold hover:shadow-sm'
                    }`}
                    title={!isExpanded && !isMobile ? item.name : undefined}
                >
                    <div className="flex items-center">
                        <div className={`menu-icon shadow-sm ${item.icon.bg} ${item.icon.color}`}>
                            {item.icon.emoji}
                        </div>
                        {(isExpanded || isMobile) && <span className="text-sm truncate menu-group-title">{item.name}</span>}
                    </div>
                    {(isExpanded || isMobile) && (
                        <svg className="chevron-icon w-4 h-4 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </button>
                
                {(isExpanded || isMobile) && (
                    <div id={`submenu-${slug}`} role="region" aria-label={`${item.name} submenu`} className={`mt-1 ml-4 space-y-1 pl-3 border-l-2 border-emerald-400/30 ${isOpen ? '' : 'hidden'}`}>
                        {isOpen && item.children?.filter(child => canAccess(child.name)).map((child, idx) => (
                            <Link
                                key={child.name}
                                href={child.href}
                                onClick={isMobile ? () => setIsMobileSidebarOpen(false) : undefined}
                                className={`submenu-enter menu-link flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm ${
                                    child.active
                                        ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white font-bold shadow-md border border-emerald-400/30 backdrop-blur-md active'
                                        : 'text-emerald-200/90 hover:bg-white/15 hover:text-white font-normal hover:shadow-sm'
                                }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className={`menu-icon shadow-sm ${child.icon.bg} ${child.icon.color} !w-7 !h-7 !text-sm`}>
                                    {child.icon.emoji}
                                </div>
                                <span className="truncate">{child.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans w-full max-w-full">
            <style>{menuIconStyle}</style>

            {/* Sidebar Desktop */}
            <aside
                className={`sticky top-0 self-start h-screen max-h-screen flex-shrink-0 relative overflow-hidden transition-all duration-300 ease-in-out hidden md:flex md:flex-col ${
                    isExpanded ? 'w-64' : 'w-20'
                } z-30 shadow-2xl shadow-emerald-950/20`} onMouseEnter={() => setIsHoveringSidebar(true)} onMouseLeave={() => setIsHoveringSidebar(false)}
            >
                {/* Background Housing Estate & Deep Green Gradient with White Highlights */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/images/green_housing_estate_bg.png" 
                        alt="Background Housing Estate" 
                        className="w-full h-full object-cover opacity-35 filter brightness-95 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-900/90 to-teal-950/95"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-emerald-400/20 mix-blend-overlay pointer-events-none"></div>
                </div>

                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0 relative z-10 bg-emerald-950/40 backdrop-blur-md">
                    {isExpanded ? (
                        <Link href="/" className="flex items-center gap-3">
                            {profil?.logo_path ? (
                                <img src={`/storage/${profil.logo_path}`} alt="Logo RT" className="h-8 w-8 object-contain" />
                            ) : (
                                <img src="/images/puridelta.png" alt="Logo RT" className="h-8 w-8 object-contain" />
                            )}
                            <span className="font-extrabold text-white text-lg truncate drop-shadow-md">Portal RT</span>
                        </Link>
                    ) : (
                        <Link href="/" className="mx-auto flex justify-center">
                            {profil?.logo_path ? (
                                <img src={`/storage/${profil.logo_path}`} alt="Logo RT" className="h-8 w-8 object-contain" />
                            ) : (
                                <img src="/images/puridelta.png" alt="Logo RT" className="h-8 w-8 object-contain" />
                            )}
                        </Link>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 relative z-10 min-h-0 custom-scrollbar">
                    {menuGroups.filter(item => canAccess(item.name)).map((item) => renderMenuItem(item, false))}
                </div>

                {/* Profile bottom section - Sticky at bottom of sidebar */}
                <div className="p-3 border-t border-white/10 flex-shrink-0 relative z-10 bg-emerald-950/80 backdrop-blur-md sticky bottom-0 shadow-lg">
                    {isExpanded ? (
                        <div className="flex items-center justify-between bg-emerald-900/60 backdrop-blur-md p-2.5 rounded-xl border border-emerald-700/50 shadow-inner gap-2">
                            <Link href={route('profile.edit')} className="flex items-center gap-2.5 min-w-0 flex-1 group" title="Buka Profil Akun">
                                <div className="w-9 h-9 rounded-full bg-emerald-400/20 text-emerald-100 font-extrabold flex items-center justify-center border border-emerald-400/40 flex-shrink-0 group-hover:bg-emerald-400/30 transition-colors shadow-sm">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">{user.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-300/80">👤 Profil Akun</p>
                                </div>
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="px-2 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors flex-shrink-0" title="Keluar Akun">
                                🚪 Keluar
                            </Link>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-emerald-600 shadow-sm">
                                        {user.name?.charAt(0) || 'U'}
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="left" width="48">
                                    <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Keluar</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar overlay with Transition */}
            <Transition show={isMobileSidebarOpen}>
                <Transition.Child
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div 
                        className="md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm" 
                        onClick={() => setIsMobileSidebarOpen(false)}
                        aria-hidden="true"
                    />
                </Transition.Child>

                {/* Mobile Sidebar */}
                <Transition.Child
                    enter="transition ease-in-out duration-300 transform"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transition ease-in-out duration-300 transform"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                    className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-white shadow-2xl md:hidden flex flex-col"
                >
                    <div className="flex flex-col h-full relative overflow-hidden">
                        {/* Background Leafy Blur for Mobile */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <img 
                                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
                                alt="Background Leaf" 
                                className="w-full h-full object-cover opacity-20 filter blur-[2px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/95 via-green-50/90 to-teal-100/95"></div>
                        </div>

                        <div className="h-16 flex items-center justify-between px-5 border-b border-emerald-200/50 flex-shrink-0 relative z-10 bg-white/40 backdrop-blur-md">
                            <Link href="/" className="flex items-center gap-3">
                                {profil?.logo_path ? (
                                    <img src={`/storage/${profil.logo_path}`} alt="Logo RT" className="h-8 w-8 object-contain" />
                                ) : (
                                    <img src="/images/puridelta.png" alt="Logo RT" className="h-8 w-8 object-contain" />
                                )}
                                <span className="font-bold text-emerald-900 text-lg">Portal RT</span>
                            </Link>
                            <button onClick={() => setIsMobileSidebarOpen(false)} className="p-3 -mr-3 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 focus:outline-none transition-colors">
                                <span className="sr-only">Close sidebar</span>
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 relative z-10 custom-scrollbar">
                            {menuGroups.filter(item => canAccess(item.name)).map((item) => renderMenuItem(item, true))}
                        </div>

                        <div className="p-4 border-t border-emerald-200/50 flex-shrink-0 relative z-10 bg-white/80 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-emerald-200/60 shadow-xs gap-2">
                                <Link href={route('profile.edit')} onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-2.5 min-w-0 flex-1 group">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center border border-emerald-200 flex-shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-emerald-950 truncate leading-tight">{user.name}</p>
                                        <p className="text-[10px] font-bold text-emerald-700">👤 Profil Akun</p>
                                    </div>
                                </Link>
                                <Link href={route('logout')} method="post" as="button" className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors flex-shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px]">
                                    🚪 <span className="sr-only">Keluar</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Transition.Child>
            </Transition>

            {/* Main content - Scrollable Independently */}
            <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0 bg-gray-100/50 w-full max-w-full transition-all duration-300 ease-in-out">
                {/* Header - STICKY TOP TITLE BAR */}
                <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 shadow-sm w-full max-w-full">
                    <div className="flex items-center gap-2">
                        {/* Desktop Toggle button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-expanded={isSidebarOpen}
                            aria-label="Toggle sidebar"
                            className="hidden md:block text-gray-500 hover:text-emerald-700 focus:outline-none transition-colors p-2 rounded-lg hover:bg-emerald-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {/* Mobile Toggle button */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            aria-expanded={isMobileSidebarOpen}
                            aria-label="Open navigation menu"
                            className="md:hidden text-gray-500 hover:text-emerald-700 focus:outline-none transition-colors p-2 rounded-lg hover:bg-emerald-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {/* Title Bar with App Logo Icon */}
                        <div className="flex items-center gap-3 border-l border-gray-200/80 pl-3 md:pl-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 p-1 flex items-center justify-center shadow-xs flex-shrink-0">
                                {profil?.logo_path ? (
                                    <img src={`/storage/${profil.logo_path}`} alt="Logo Aplikasi" className="w-full h-full object-contain" />
                                ) : (
                                    <img src="/images/puridelta.png" alt="Logo Aplikasi" className="w-full h-full object-contain" />
                                )}
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/60 leading-none inline-block">
                                    {profil?.nama_rt || 'PORTAL RT DIGITAL'}
                                </span>
                                {header && (
                                    <h1 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight leading-tight mt-0.5">
                                        {header}
                                    </h1>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-5">
                        {/* Dynamic Clock and Date */}
                        <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-xl font-black text-gray-800 tracking-wider tabular-nums leading-none mb-1 shadow-xs px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-1">
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center space-x-2 text-sm focus:outline-none p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <span className="text-gray-700 font-semibold hidden sm:block">{user.name}</span>
                                    <svg className="h-4 w-4 text-gray-400 hidden sm:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <div className="w-8 h-8 sm:hidden rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                        {user.name.charAt(0)}
                                    </div>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width="48">
                                <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Keluar</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full flex flex-col">
                    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 w-full">
                        {/* Header for mobile since top bar space might be constrained */}
                        {header && (
                            <div className="sm:hidden mb-6 text-xl font-bold text-gray-800 tracking-tight">
                                {header}
                            </div>
                        )}
                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <footer className="w-full mt-auto py-6 px-4 text-center text-xs text-gray-500 border-t border-gray-200/50 bg-gray-50/50">
                        <p className="font-semibold">&copy; 2026 Portal RT 009 / RW 006.</p>
                        <p>Develop by Ilman Nafian</p>
                        <p>Hak Cipta Dilindungi Undang-Undang.</p>
                    </footer>
                </main>
            </div>
        </div>
    );
}