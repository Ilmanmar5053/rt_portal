import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

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
    const { auth, profil } = usePage().props;
    const user = auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default autohide (collapsed to mini icons w-20)
    const [isHoveringSidebar, setIsHoveringSidebar] = useState(false); // Temporarily expand on hover
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar
    const [openMenus, setOpenMenus] = useState({}); // Track which parent menus are open

    // Whether the desktop sidebar should be rendered expanded (explicit open or hover)
    const isExpanded = isSidebarOpen || isHoveringSidebar;
    const isAdmin = user.role === 'superadmin';

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
            icon: { emoji: '🏠', bg: 'bg-blue-100', color: 'text-blue-600' },
        },
        {
            type: 'group',
            name: 'Data Master',
            icon: { emoji: '📋', bg: 'bg-purple-100', color: 'text-purple-600' },
            children: [
                {
                    name: 'Data Rumah',
                    href: route('admin.rumah.index'),
                    active: route().current('admin.rumah.*'),
                    icon: { emoji: '🏡', bg: 'bg-orange-100', color: 'text-orange-600' },
                },
                {
                    name: 'Data KK (Keluarga)',
                    href: route('admin.keluarga.index'),
                    active: route().current('admin.keluarga.*'),
                    icon: { emoji: '👨‍👩‍👧‍👦', bg: 'bg-pink-100', color: 'text-pink-600' },
                },
                {
                    name: 'Data Anggota Warga',
                    href: route('admin.warga.index'),
                    active: route().current('admin.warga.*'),
                    icon: { emoji: '👤', bg: 'bg-violet-100', color: 'text-violet-600' },
                },
            ]
        },
        {
            type: 'single',
            name: 'Laporan',
            href: route('admin.laporan.index'),
            active: route().current('admin.laporan.*'),
            icon: { emoji: '📈', bg: 'bg-amber-100', color: 'text-amber-600' },
        },
        {
            type: 'group',
            name: 'Keuangan',
            icon: { emoji: '💼', bg: 'bg-green-100', color: 'text-green-600' },
            children: [
                {
                    name: 'Iuran Kas',
                    href: route('admin.iuran.index'),
                    active: route().current('admin.iuran.*'),
                    icon: { emoji: '💰', bg: 'bg-emerald-100', color: 'text-emerald-600' },
                },
                {
                    name: 'Arus Kas',
                    href: route('admin.transaksi-kas.index'),
                    active: route().current('admin.transaksi-kas.*'),
                    icon: { emoji: '📊', bg: 'bg-teal-100', color: 'text-teal-600' },
                },
            ]
        },
        {
            type: 'group',
            name: 'Layanan',
            icon: { emoji: '🛎️', bg: 'bg-cyan-100', color: 'text-cyan-600' },
            children: [
                {
                    name: 'Pengaduan',
                    href: route('admin.pengaduan.index'),
                    active: route().current('admin.pengaduan.*'),
                    icon: { emoji: '📢', bg: 'bg-red-100', color: 'text-red-600' },
                },
                {
                    name: 'Surat Pengantar',
                    href: route('admin.surat.index'),
                    active: route().current('admin.surat.*'),
                    icon: { emoji: '📄', bg: 'bg-sky-100', color: 'text-sky-600' },
                },
            ]
        },
    ];

    // Add admin-only menu group
    if (isAdmin) {
        menuGroups.push({
            type: 'group',
            name: 'Pengaturan',
            icon: { emoji: '⚙️', bg: 'bg-gray-100', color: 'text-gray-600' },
            children: [
                {
                    name: 'Manajemen Akses',
                    href: route('admin.permissions.index'),
                    active: route().current('admin.permissions.*'),
                    icon: { emoji: '🔐', bg: 'bg-yellow-100', color: 'text-yellow-600' },
                },
                {
                    name: 'Manajemen User',
                    href: route('admin.users.index'),
                    active: route().current('admin.users.*'),
                    icon: { emoji: '👥', bg: 'bg-indigo-100', color: 'text-indigo-600' },
                },
                {
                    name: 'Profil Lingkungan',
                    href: route('admin.profil.edit'),
                    active: route().current('admin.profil.*'),
                    icon: { emoji: '🏘️', bg: 'bg-teal-100', color: 'text-teal-600' },
                },
            ]
        });
    }

    // Filter menu based on permissions
    const permissions = usePage().props.auth.permissions || {};
    
    // Helper to check if menu should be visible based on permissions
    const canAccess = (menuName) => {
        if (isAdmin && (menuName === 'Manajemen Akses' || menuName === 'Manajemen User' || menuName === 'Pengaturan')) return true;
        if (menuName === 'Dashboard' || menuName === 'Profil Lingkungan') return true;

        if (menuName === 'Data Rumah') return permissions['data_rumah']?.access !== false;
        if (menuName === 'Data KK (Keluarga)') return permissions['data_keluarga']?.access !== false;
        if (menuName === 'Data Anggota Warga') return permissions['data_warga']?.access !== false;
        if (menuName === 'Laporan') return true;
        if (menuName === 'Iuran Kas') return permissions['iuran_kas']?.access !== false;
        if (menuName === 'Arus Kas') return true; // always visible for admin roles
        if (menuName === 'Pengaduan') return permissions['pengaduan']?.access !== false;
        if (menuName === 'Surat Pengantar') return permissions['surat_pengantar']?.access !== false;
        if (menuName === 'Data Master' || menuName === 'Keuangan' || menuName === 'Layanan') return true;
        
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
                            ? 'bg-emerald-600/10 text-emerald-900 font-bold shadow-sm border border-emerald-200/50 backdrop-blur-sm active'
                            : 'text-emerald-900/70 hover:bg-white/40 hover:text-emerald-900 font-medium hover:shadow-sm'
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
                            ? 'bg-emerald-600/10 text-emerald-900 font-bold shadow-sm border border-emerald-200/50 backdrop-blur-sm'
                            : 'text-emerald-900/70 hover:bg-white/40 hover:text-emerald-900 font-medium hover:shadow-sm'
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
                        <svg className="chevron-icon w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </button>
                
                {(isExpanded || isMobile) && (
                    <div id={`submenu-${slug}`} role="region" aria-label={`${item.name} submenu`} className={`mt-1 ml-4 space-y-1 pl-3 border-l-2 border-emerald-200/50 ${isOpen ? '' : 'hidden'}`}>
                        {isOpen && item.children?.filter(child => canAccess(child.name)).map((child, idx) => (
                            <Link
                                key={child.name}
                                href={child.href}
                                onClick={isMobile ? () => setIsMobileSidebarOpen(false) : undefined}
                                className={`submenu-enter menu-link flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm ${
                                    child.active
                                        ? 'bg-emerald-600/10 text-emerald-900 font-semibold shadow-sm border border-emerald-200/50 backdrop-blur-sm active'
                                        : 'text-emerald-900/60 hover:bg-white/40 hover:text-emerald-900 font-normal hover:shadow-sm'
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
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden font-sans w-full max-w-full">
            <style>{menuIconStyle}</style>
            {/* Sidebar Desktop */}
            <aside
                className={`flex-shrink-0 relative overflow-hidden border-r border-emerald-100 transition-all duration-300 ease-in-out hidden md:flex md:flex-col ${
                    isExpanded ? 'w-64' : 'w-20'
                } z-20 shadow-lg shadow-emerald-900/5`} onMouseEnter={() => setIsHoveringSidebar(true)} onMouseLeave={() => setIsHoveringSidebar(false)}
            >
                {/* Background Leafy Blur */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
                        alt="Background Leaf" 
                        className="w-full h-full object-cover opacity-20 filter blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/95 via-green-50/90 to-teal-100/95"></div>
                </div>

                <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-200/50 flex-shrink-0 relative z-10">
                    {isExpanded ? (
                        <Link href="/" className="flex items-center gap-3">
                            {profil?.logo_path ? (
                                <img src={`/storage/${profil.logo_path}`} alt="Logo RT" className="h-8 w-8 object-contain" />
                            ) : (
                                <img src="/images/puridelta.png" alt="Logo RT" className="h-8 w-8 object-contain" />
                            )}
                            <span className="font-bold text-emerald-900 text-lg truncate">Portal RT</span>
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

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 relative z-10">
                    {menuGroups.filter(item => canAccess(item.name)).map((item) => renderMenuItem(item, false))}
                </div>

                {/* Profile bottom section */}
                <div className="p-4 border-t border-emerald-200/50 flex-shrink-0 relative z-10 bg-white/20 backdrop-blur-sm">
                    {isExpanded ? (
                        <div className="flex items-center bg-white/60 backdrop-blur-md p-2.5 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold flex-shrink-0 border border-emerald-200">
                                {user.name.charAt(0)}
                            </div>
                            <div className="ml-3 truncate flex-1">
                                <p className="text-sm font-bold text-emerald-900 truncate">{user.name}</p>
                                <Link href={route('logout')} method="post" as="button" className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 border border-emerald-200 shadow-sm">
                                        {user.name.charAt(0)}
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

            {/* Mobile Sidebar overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 relative overflow-hidden shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Background Leafy Blur for Mobile */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
                        alt="Background Leaf" 
                        className="w-full h-full object-cover opacity-20 filter blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/95 via-green-50/90 to-teal-100/95"></div>
                </div>

                <div className="h-16 flex items-center justify-between px-5 border-b border-emerald-200/50 flex-shrink-0 relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        {profil?.logo_path ? (
                            <img src={`/storage/${profil.logo_path}`} alt="Logo RT" className="h-8 w-8 object-contain" />
                        ) : (
                            <img src="/images/puridelta.png" alt="Logo RT" className="h-8 w-8 object-contain" />
                        )}
                        <span className="font-bold text-emerald-900 text-lg">Portal RT</span>
                    </Link>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-white/30 focus:outline-none transition-colors">
                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 relative z-10">
                    {menuGroups.filter(item => canAccess(item.name)).map((item) => renderMenuItem(item, true))}
                </div>

                <div className="p-5 border-t border-emerald-200/50 flex-shrink-0 relative z-10 bg-white/20 backdrop-blur-sm">
                    <div className="flex items-center bg-white/60 backdrop-blur-md p-3 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold flex-shrink-0 border border-emerald-200">
                            {user.name.charAt(0)}
                        </div>
                        <div className="ml-3 flex-1 truncate">
                            <p className="text-sm font-bold text-emerald-900 truncate">{user.name}</p>
                            <Link href={route('logout')} method="post" as="button" className="text-xs text-red-500 hover:text-red-700 font-medium mt-0.5 transition-colors">
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-gray-100/50 w-full max-w-full transition-all duration-300 ease-in-out">
                {/* Header */}
                <header className="bg-white border-b border-gray-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 flex-shrink-0 shadow-sm w-full max-w-full">
                    <div className="flex items-center">
                        {/* Desktop Toggle button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-expanded={isSidebarOpen}
                            aria-label="Toggle sidebar"
                            className="hidden md:block text-gray-500 hover:text-blue-600 focus:outline-none mr-4 transition-colors p-2.5 rounded-md hover:bg-gray-100"
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
                            className="md:hidden text-gray-500 hover:text-blue-600 focus:outline-none mr-4 transition-colors p-2.5 rounded-md hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {/* Optional page header title passed via prop */}
                        {header && (
                            <div className="hidden sm:block text-xl font-bold text-gray-800 tracking-tight">
                                {header}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
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
                <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full">
                    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
                </main>
            </div>
        </div>
    );
}