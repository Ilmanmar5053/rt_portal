import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const menuIconStyle = `
    @keyframes bounceIcon {
        0%, 100% { transform: translateY(0) scale(1); }
        30% { transform: translateY(-6px) scale(1.15); }
        60% { transform: translateY(-2px) scale(1.05); }
    }
    @keyframes zoomPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.3) rotate(-8deg); }
        100% { transform: scale(1.15); }
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
    .menu-link:hover .menu-icon {
        animation: bounceIcon 0.5s ease forwards;
    }
    .menu-link.active .menu-icon {
        animation: zoomPop 0.4s ease forwards;
    }

    /* Mobile fixes: ensure main content uses full width and remove unexpected margins */
    @media (max-width: 767px) {
        html, body {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
        }
        .warga-main-wrapper {
            padding-left: 0 !important;
            padding-right: 0 !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
            overflow-x: hidden !important;
        }

        /* Prevent content cards from being constrained by accidental centered containers */
        .warga-main-wrapper > * {
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
    }
`;

export default function WargaLayout({ header, children }) {
    const { auth, profil } = usePage().props;
    const user = auth.user;
    const permissions = auth.permissions || {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default autohide (collapsed to mini icons w-20)
    const [isHoveringSidebar, setIsHoveringSidebar] = useState(false); // Temporarily expand on hover
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar

    const isExpanded = isSidebarOpen || isHoveringSidebar;

    const allMenuItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard') || route().current('warga.dashboard'),
            icon: { emoji: '🏠', bg: 'bg-blue-100', color: 'text-blue-600' },
            permission: null, // always visible
        },
        {
            name: 'Iuran Kas',
            href: route('warga.iuran.index'),
            active: route().current('warga.iuran.*'),
            icon: { emoji: '💰', bg: 'bg-emerald-100', color: 'text-emerald-600' },
            permission: 'iuran_kas',
        },
        {
            name: 'Pengaduan',
            href: route('warga.pengaduan.index'),
            active: route().current('warga.pengaduan.*'),
            icon: { emoji: '📢', bg: 'bg-orange-100', color: 'text-orange-600' },
            permission: 'pengaduan',
        },
        {
            name: 'Surat Pengantar',
            href: route('warga.surat.index'),
            active: route().current('warga.surat.*'),
            icon: { emoji: '📄', bg: 'bg-indigo-100', color: 'text-indigo-600' },
            permission: 'surat_pengantar',
        },
    ];

    // Filter menu items based on permissions toggle
    const menuItems = allMenuItems.filter(item => {
        if (!item.permission) return true;
        return permissions[item.permission]?.access !== false;
    });

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
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`menu-link flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                                item.active
                                    ? 'bg-emerald-600/10 text-emerald-900 font-semibold shadow-sm border border-emerald-200/50 backdrop-blur-sm active'
                                    : 'text-emerald-900/70 hover:bg-white/40 hover:text-emerald-900 font-medium hover:shadow-sm'
                            }`}
                            title={!isExpanded ? item.name : undefined}
                        >
                            <div className={`menu-icon shadow-sm ${item.icon.bg} ${item.icon.color}`}>
                                {item.icon.emoji}
                            </div>
                            {isExpanded && <span className="text-sm truncate">{item.name}</span>}
                        </Link>
                    ))}
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
                className={`fixed inset-y-0 left-0 z-50 w-72 relative overflow-hidden transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
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
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`menu-link flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                item.active
                                    ? 'bg-emerald-600/10 text-emerald-900 font-semibold shadow-sm border border-emerald-200/50 backdrop-blur-sm active'
                                    : 'text-emerald-900/70 hover:bg-white/40 hover:text-emerald-900 font-medium hover:shadow-sm'
                            }`}
                        >
                            <div className={`menu-icon shadow-sm ${item.icon.bg} ${item.icon.color}`}>
                                {item.icon.emoji}
                            </div>
                            <span className="text-sm ml-1">{item.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-5 border-t border-emerald-200/50 flex-shrink-0 relative z-10 bg-white/20 backdrop-blur-sm">
                    <div className="flex items-center bg-white/60 backdrop-blur-md p-3 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="ml-3 flex-1 truncate">
                            <p className="text-sm font-bold text-emerald-900 truncate">{user.name}</p>
                            <Link href={route('logout')} method="post" as="button" className="text-xs text-red-500 hover:text-red-700 font-medium mt-0.5">
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
                            className="hidden md:block text-gray-500 hover:text-blue-600 focus:outline-none mr-4 transition-colors p-2.5 rounded-md hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {/* Mobile Toggle button */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
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
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full max-w-full">
                    {/* Header for mobile since top bar space might be constrained */}
                    {header && (
                        <div className="sm:hidden mb-6 text-xl font-bold text-gray-800 tracking-tight">
                            {header}
                        </div>
                    )}
                    <div className="w-full max-w-full mx-auto warga-main-wrapper">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
