import AdminLayout from '@/Layouts/AdminLayout';
import WargaLayout from '@/Layouts/WargaLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth, profil } = usePage().props;
    const user = auth?.user || {};
    const isWargaRole = user.role === 'warga';

    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password' | 'danger'

    // Determine layout automatically based on user role
    const Layout = isWargaRole ? WargaLayout : AdminLayout;

    const getRoleBadge = (role) => {
        switch (role) {
            case 'superadmin':
                return { label: '👑 Superadmin', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
            case 'rw':
                return { label: '🏛️ Ketua RW', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
            case 'rt':
                return { label: '🏘️ Ketua RT', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'bendahara':
                return { label: '💰 Bendahara RT', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
            case 'sekretaris':
                return { label: '📝 Sekretaris RT', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
            default:
                return { label: '🏡 Warga RT', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
        }
    };

    const roleInfo = getRoleBadge(user.role);
    const initial = (user.name || 'U').charAt(0).toUpperCase();

    return (
        <Layout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Profil Akun</h2>}>
            <Head title="Profil Akun" />

            <div className="py-6 max-w-5xl mx-auto space-y-5 px-4 sm:px-6 lg:px-8">
                
                {/* ICONIC USER HEADER CARD */}
                <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                        {/* Avatar Initial Circle */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-cyan-500/30 flex-shrink-0 border-2 border-white/20">
                            {initial}
                        </div>

                        {/* User Details */}
                        <div className="flex-1 text-center sm:text-left space-y-1.5">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-xl font-black tracking-tight">{user.name}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${roleInfo.bg}`}>
                                    {roleInfo.label}
                                </span>
                            </div>

                            <p className="text-xs text-cyan-200/80 font-mono font-medium flex items-center justify-center sm:justify-start gap-1">
                                ✉️ {user.email}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-bold">
                                {user.email_verified_at ? (
                                    <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                                        ✓ Email Terverifikasi
                                    </span>
                                ) : (
                                    <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                                        ⚠️ Belum Verifikasi
                                    </span>
                                )}
                                <span className="bg-white/10 text-slate-200 px-2.5 py-1 rounded-lg border border-white/10">
                                    ID Akun: #{user.id}
                                </span>
                            </div>
                        </div>

                        {/* Quick Navigation Tabs */}
                        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 sm:self-end">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'info'
                                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                👤 Profil
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('password')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'password'
                                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                🔑 Password
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('danger')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'danger'
                                        ? 'bg-rose-600 text-white shadow-sm font-black'
                                        : 'text-rose-300 hover:text-rose-100'
                                }`}
                            >
                                ⚠️ Hapus
                            </button>
                        </div>
                    </div>
                </div>

                {/* COMPACT & INFORMATIVE CONTENT CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Card 1: Informasi Profil */}
                    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all ${
                        activeTab === 'info' ? 'ring-2 ring-blue-500/20' : ''
                    }`}>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Card 2: Keamanan & Password */}
                    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all ${
                        activeTab === 'password' ? 'ring-2 ring-purple-500/20' : ''
                    }`}>
                        <UpdatePasswordForm />
                    </div>

                    {/* Card 3: Danger Zone / Hapus Akun (Full Width on Bottom or Active Tab) */}
                    <div className={`lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-rose-100 transition-all ${
                        activeTab === 'danger' ? 'ring-2 ring-rose-500/20 bg-rose-50/20' : ''
                    }`}>
                        <DeleteUserForm />
                    </div>
                </div>

            </div>
        </Layout>
    );
}
