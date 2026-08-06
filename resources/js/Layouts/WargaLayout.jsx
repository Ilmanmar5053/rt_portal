import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Transition } from '@headlessui/react';

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
            icon: { emoji: '🏡', bg: 'bg-emerald-100', color: 'text-emerald-700' },
            permission: null, // always visible
        },
        {
            name: 'Iuran Kas',
            href: route('warga.iuran.index'),
            active: route().current('warga.iuran.*'),
            icon: { emoji: '💰', bg: 'bg-emerald-100', color: 'text-emerald-700' },
            permission: 'iuran_kas',
        },
        {
            name: 'Pengaduan',
            href: route('warga.pengaduan.index'),
            active: route().current('warga.pengaduan.*'),
            icon: { emoji: '📢', bg: 'bg-rose-100', color: 'text-rose-700' },
            permission: 'pengaduan',
        },
        {
            name: 'Surat Pengantar',
            href: route('warga.surat.index'),
            active: route().current('warga.surat.*'),
            icon: { emoji: '📄', bg: 'bg-teal-100', color: 'text-teal-700' },
            permission: 'surat_pengantar',
        },
        {
            name: 'Program & Kegiatan',
            href: route('warga.program-kegiatan.index'),
            active: route().current('warga.program-kegiatan.*'),
            icon: { emoji: '🗓️', bg: 'bg-emerald-100', color: 'text-emerald-700' },
            permission: 'program_kegiatan',
        },
        {
            name: 'Bantuan Sosial',
            href: route('warga.bansos.index'),
            active: route().current('warga.bansos.*'),
            icon: { emoji: '🎁', bg: 'bg-amber-100', color: 'text-amber-700' },
            permission: null,
        },
        {
            name: 'Pengkinian Data',
            href: route('warga.pengkinian-data.index'),
            active: route().current('warga.pengkinian-data.*'),
            icon: { emoji: '📋', bg: 'bg-cyan-100', color: 'text-cyan-700' },
            permission: null,
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
                className={`sticky top-0 h-screen max-h-screen flex-shrink-0 relative overflow-hidden border-r border-emerald-100 transition-all duration-300 ease-in-out hidden md:flex md:flex-col ${
                    isExpanded ? 'w-64' : 'w-20'
                } z-30 shadow-lg shadow-emerald-900/5`} onMouseEnter={() => setIsHoveringSidebar(true)} onMouseLeave={() => setIsHoveringSidebar(false)}
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

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 relative z-10 min-h-0">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`menu-link flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                                item.active
                                    ? 'bg-emerald-600/10 text-emerald-900 font-semibold shadow-sm border border-emerald-200/50 backdrop-blur-sm active'
                                    : 'text-emerald-800 hover:bg-white/40 hover:text-emerald-900 font-medium hover:shadow-sm'
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

                {/* Profile bottom section - Sticky at bottom of sidebar */}
                <div className="p-3 border-t border-emerald-200/50 flex-shrink-0 relative z-10 bg-white/90 backdrop-blur-md sticky bottom-0 shadow-sm">
                    {isExpanded ? (
                        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-emerald-200/60 shadow-xs gap-2">
                            <Link href={route('profile.edit')} className="flex items-center gap-2.5 min-w-0 flex-1 group" title="Buka Profil Akun">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center border border-emerald-200 flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-emerald-950 truncate leading-tight group-hover:text-blue-600 transition-colors">{user.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-700">👤 Profil Akun</p>
                                </div>
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors flex-shrink-0" title="Keluar Akun">
                                🚪 Keluar
                            </Link>
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
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className={`menu-link flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                        item.active
                                            ? 'bg-emerald-600/10 text-emerald-900 font-semibold shadow-sm border border-emerald-200/50 backdrop-blur-sm active'
                                            : 'text-emerald-800 hover:bg-white/40 hover:text-emerald-900 font-medium hover:shadow-sm'
                                    }`}
                                >
                                    <div className={`menu-icon shadow-sm ${item.icon.bg} ${item.icon.color}`}>
                                        {item.icon.emoji}
                                    </div>
                                    <span className="text-sm ml-1">{item.name}</span>
                                </Link>
                            ))}
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

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-gray-100/50 w-full max-w-full transition-all duration-300 ease-in-out">
                {/* Header - STICKY TOP */}
                <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 shadow-sm w-full max-w-full">
                    <div className="flex items-center">
                        {/* Desktop Toggle button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:block text-gray-500 hover:text-emerald-700 focus:outline-none mr-4 transition-colors p-2.5 rounded-md hover:bg-emerald-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {/* Mobile Toggle button */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden text-gray-500 hover:text-emerald-700 focus:outline-none mr-4 transition-colors p-2.5 rounded-md hover:bg-emerald-50"
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
