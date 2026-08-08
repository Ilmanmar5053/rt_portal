import AdminLayout from '@/Layouts/AdminLayout';
import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, wargaProfile, keluargaProfile, anggotaKeluarga = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const isWargaRole = ['warga', 'warga_kk', 'warga_anggota'].includes(user.role);

    const [activeTab, setActiveTab] = useState(wargaProfile ? 'warga_data' : 'info'); // 'warga_data' | 'info' | 'password' | 'danger'

    // Determine layout automatically based on user role
    const Layout = isWargaRole ? WargaLayout : AdminLayout;

    // Avatar / Foto Profil Upload Logic
    const avatarPath = user.avatar || (wargaProfile ? wargaProfile.foto_profil : null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            router.post(route('profile.avatar.update'), formData, {
                preserveScroll: true,
                onFinish: () => {
                    setIsUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            });
        }
    };

    const handleRemoveAvatar = () => {
        if (confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) {
            router.delete(route('profile.avatar.delete'), { preserveScroll: true });
        }
    };

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
            case 'warga_kk':
                return { label: '🏡 Kepala Keluarga', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'warga_anggota':
                return { label: '👨‍👩‍👧‍👦 Anggota Warga', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
            default:
                return { label: '🏡 Warga RT', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
        }
    };

    const roleInfo = getRoleBadge(user.role);
    const initial = (user.name || 'U').charAt(0).toUpperCase();

    // Calculate age if tanggal_lahir exists
    const getUsia = (tglLahir) => {
        if (!tglLahir) return null;
        const birth = new Date(tglLahir);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age > 0 ? `${age} Tahun` : null;
    };

    // Format tanggal Indonesia
    const formatTanggal = (tglStr) => {
        if (!tglStr) return '-';
        try {
            const date = new Date(tglStr);
            return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        } catch (e) {
            return tglStr;
        }
    };

    return (
        <Layout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Profil Saya</h2>}>
            <Head title="Profil Warga" />

            <div className="py-6 max-w-6xl mx-auto space-y-5 px-4 sm:px-6 lg:px-8">
                
                {/* ICONIC USER HEADER CARD WITH AVATAR EDITOR */}
                <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 text-white shadow-xl border border-emerald-600/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                        
                        {/* Avatar Image Frame & Interactive Upload Button */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-xl flex items-center justify-center relative">
                                    {avatarPath ? (
                                        <img 
                                            src={`/storage/${avatarPath}`} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl sm:text-5xl font-black text-white">{initial}</span>
                                    )}

                                    {/* Hover Camera Overlay Button */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-1"
                                        title="Klik untuk Upload / Ganti Foto Profil"
                                    >
                                        <span className="text-xl">📷</span>
                                        <span className="text-[10px] uppercase font-black tracking-wider">Ubah Foto</span>
                                    </button>
                                </div>

                                {/* Hidden File Input */}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarSelect} 
                                    accept="image/jpeg,image/png,image/jpg,image/webp" 
                                    className="hidden" 
                                />
                            </div>

                            {/* Action Buttons underneath Avatar */}
                            <div className="flex items-center gap-1.5 mt-2.5">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] border border-white/30 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                >
                                    <span>📷</span>
                                    <span>{isUploading ? 'Uploading...' : (avatarPath ? 'Ganti Foto' : 'Upload Foto')}</span>
                                </button>
                                {avatarPath && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="px-2 py-1 rounded-xl bg-rose-500/40 hover:bg-rose-500/60 text-rose-100 font-extrabold text-[11px] border border-rose-300/40 transition shadow-2xs cursor-pointer"
                                        title="Hapus foto profil"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 text-center sm:text-left space-y-1.5">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{wargaProfile ? wargaProfile.nama_lengkap : user.name}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border shadow-xs ${roleInfo.bg}`}>
                                    {roleInfo.label}
                                </span>
                            </div>

                            <p className="text-xs text-emerald-100 font-mono font-medium flex items-center justify-center sm:justify-start gap-1.5">
                                <span>✉️ {user.email}</span>
                                {wargaProfile && <span>• 🆔 NIK: <strong>{wargaProfile.nik}</strong></span>}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-bold">
                                {keluargaProfile && (
                                    <span className="bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/30 flex items-center gap-1">
                                        📜 No. KK: {keluargaProfile.no_kk}
                                    </span>
                                )}
                                {keluargaProfile && (keluargaProfile.rumah_blok?.blok || keluargaProfile.blok) && (
                                    <span className="bg-amber-300 text-emerald-950 px-2.5 py-1 rounded-lg border border-amber-400 flex items-center gap-1 font-extrabold shadow-2xs">
                                        🏠 Rumah: Blok {keluargaProfile.rumah_blok?.blok || keluargaProfile.blok} No. {keluargaProfile.rumah_blok?.nomor_rumah || keluargaProfile.nomor_rumah}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Navigation Tabs */}
                        <div className="flex flex-wrap justify-center bg-black/20 p-1.5 rounded-2xl border border-white/20 sm:self-end gap-1">
                            {wargaProfile && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('warga_data')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === 'warga_data'
                                            ? 'bg-amber-300 text-emerald-950 shadow-sm font-black'
                                            : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    📋 Profil Warga (KK)
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'info'
                                        ? 'bg-white text-emerald-950 shadow-sm font-black'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                ⚙️ Akun Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('password')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'password'
                                        ? 'bg-white text-emerald-950 shadow-sm font-black'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                🔑 Ubah Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TAB 1: MASTER DATA WARGA (RINGKASAN SINKRONISASI KK) ── */}
                {activeTab === 'warga_data' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                        
                        {/* NOTICE BANNER READ ONLY */}
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-start gap-2.5">
                                <span className="text-xl shrink-0">ℹ️</span>
                                <div className="space-y-0.5">
                                    <p className="font-extrabold text-emerald-950 text-sm">
                                        Data Profil Warga Terintegrasi Master Data KK RT
                                    </p>
                                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                                        Informasi ini tersinkronisasi langsung secara real-time dari Master Data Kartu Keluarga RT. Halaman ini bersifat <strong>Ringkasan (Read-Only)</strong>. Jika ada kesalahan data, silakan gunakan fitur Pengkinian Data.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('warga.pengkinian-data.index')}
                                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition shrink-0 whitespace-nowrap"
                            >
                                ✏️ Pengkinian Data Warga →
                            </Link>
                        </div>

                        {/* GRID TABLE INFORMASI LENGKAP WARGA & KK */}
                        {wargaProfile ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                
                                {/* TABLE CARD 1: IDENTITAS PRIBADI WARGA */}
                                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black">
                                                👤
                                            </span>
                                            <h3 className="font-extrabold text-base text-gray-900">
                                                Identitas Pribadi Warga
                                            </h3>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase border border-emerald-200">
                                            {wargaProfile.status_hubungan_keluarga || 'Warga RT'}
                                        </span>
                                    </div>

                                    {/* FOTO PROFIL SUMMARY ROW */}
                                    <div className="flex items-center gap-4 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-emerald-200 border border-emerald-300 shrink-0 flex items-center justify-center shadow-xs">
                                            {avatarPath ? (
                                                <img src={`/storage/${avatarPath}`} alt="Foto Profil" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-black text-emerald-800">{initial}</span>
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                                                Foto Profil {wargaProfile.status_hubungan_keluarga === 'Kepala Keluarga' ? 'Kepala Keluarga' : 'Warga'}
                                            </h4>
                                            <p className="text-[11px] text-gray-500">
                                                {avatarPath ? 'Foto profil resmi aktif & tersimpan' : 'Belum mengunggah foto profil.'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 underline inline-block"
                                            >
                                                📷 Upload / Update Foto Profil Mandiri
                                            </button>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-100 text-xs">
                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Nomor NIK</span>
                                            <span className="col-span-2 font-mono font-bold text-gray-900 tracking-wider">
                                                {wargaProfile.nik || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Nama Lengkap</span>
                                            <span className="col-span-2 font-bold text-gray-900 uppercase">
                                                {wargaProfile.nama_lengkap || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Jenis Kelamin</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.jenis_kelamin === 'Laki-laki' ? '👨 Laki-laki' : '👩 Perempuan'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Tempat, Tgl Lahir</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.tempat_lahir || '-'}, {formatTanggal(wargaProfile.tanggal_lahir)} {getUsia(wargaProfile.tanggal_lahir) && `(${getUsia(wargaProfile.tanggal_lahir)})`}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Agama</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.agama || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Pendidikan Terakhir</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.pendidikan || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Pekerjaan</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.pekerjaan || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Status Perkawinan</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.status_perkawinan || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Status Hubungan</span>
                                            <span className="col-span-2 font-bold text-emerald-800">
                                                {wargaProfile.status_hubungan_keluarga || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Kewarganegaraan</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.kewarganegaraan || 'WNI'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Orang Tua (Ayah / Ibu)</span>
                                            <span className="col-span-2 font-semibold text-gray-800">
                                                {wargaProfile.nama_ayah || '-'} / {wargaProfile.nama_ibu || '-'}
                                            </span>
                                        </div>

                                        <div className="py-2.5 grid grid-cols-3 gap-2">
                                            <span className="text-gray-500 font-semibold">Status Keberadaan</span>
                                            <span className="col-span-2">
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                                    🟢 {wargaProfile.status_hidup || 'Hidup'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* TABLE CARD 2: DATA KARTU KELUARGA & DOMISILI RT */}
                                <div className="space-y-5">
                                    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-black">
                                                    🏡
                                                </span>
                                                <h3 className="font-extrabold text-base text-gray-900">
                                                    Data Kartu Keluarga & Rumah RT
                                                </h3>
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase border border-blue-200">
                                                Terdaftar KK
                                            </span>
                                        </div>

                                        {keluargaProfile ? (
                                            <div className="divide-y divide-gray-100 text-xs">
                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Nomor KK</span>
                                                    <span className="col-span-2 font-mono font-bold text-gray-900 tracking-wider">
                                                        {keluargaProfile.no_kk || '-'}
                                                    </span>
                                                </div>

                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Kepala Keluarga</span>
                                                    <span className="col-span-2 font-bold text-gray-900 uppercase">
                                                        {keluargaProfile.kepala_keluarga_nama || (keluargaProfile.kepala_keluarga ? keluargaProfile.kepala_keluarga.nama_lengkap : '-')}
                                                    </span>
                                                </div>

                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Blok & No. Rumah</span>
                                                    <span className="col-span-2 font-extrabold text-emerald-700">
                                                        Blok {keluargaProfile.rumah_blok?.blok || keluargaProfile.blok || '-'} No. {keluargaProfile.rumah_blok?.nomor_rumah || keluargaProfile.nomor_rumah || '-'}
                                                    </span>
                                                </div>

                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Alamat Lengkap</span>
                                                    <span className="col-span-2 font-semibold text-gray-800">
                                                        {keluargaProfile.alamat_lengkap || '-'}
                                                    </span>
                                                </div>

                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Wilayah RT / RW</span>
                                                    <span className="col-span-2 font-bold text-gray-900">
                                                        RT {keluargaProfile.rt || '005'} / RW {keluargaProfile.rw || '008'}
                                                    </span>
                                                </div>

                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Kelurahan / Kec.</span>
                                                    <span className="col-span-2 font-semibold text-gray-800">
                                                        {keluargaProfile.kelurahan || 'Pontang'} / {keluargaProfile.kecamatan || 'Pontang'}
                                                    </span>
                                                </div>

                                                <div className="py-2.5 grid grid-cols-3 gap-2">
                                                    <span className="text-gray-500 font-semibold">Kota & Provinsi</span>
                                                    <span className="col-span-2 font-semibold text-gray-800">
                                                        {keluargaProfile.kabupaten_kota || 'Kab. Serang'}, {keluargaProfile.provinsi || 'Banten'} ({keluargaProfile.kode_pos || '42135'})
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 py-4 text-center italic">
                                                Data Kartu Keluarga belum dikaitkan secara lengkap.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* TABLE CARD 3: DAFTAR ANGGOTA KELUARGA DALAM 1 KK */}
                                <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-black">
                                                👨‍👩‍👧‍👦
                                            </span>
                                            <div>
                                                <h3 className="font-extrabold text-base text-gray-900">
                                                    Daftar Anggota Keluarga (Satu KK)
                                                </h3>
                                                <p className="text-[11px] text-gray-500">
                                                    Total {anggotaKeluarga.length} orang terdaftar dalam KK No. {keluargaProfile?.no_kk || '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] border border-purple-200">
                                            {anggotaKeluarga.length} Anggota
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-inner bg-gray-50/50">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-600 font-extrabold">
                                                    <th className="px-4 py-3">#</th>
                                                    <th className="px-4 py-3">Nama Lengkap</th>
                                                    <th className="px-4 py-3">NIK</th>
                                                    <th className="px-4 py-3">Hubungan Keluarga</th>
                                                    <th className="px-4 py-3">L/P</th>
                                                    <th className="px-4 py-3">Pendidikan</th>
                                                    <th className="px-4 py-3">Pekerjaan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {anggotaKeluarga.length > 0 ? (
                                                    anggotaKeluarga.map((member, idx) => {
                                                        const isCurrentUser = String(member.id) === String(wargaProfile?.id);
                                                        return (
                                                            <tr 
                                                                key={member.id || idx} 
                                                                className={`hover:bg-white transition-colors ${
                                                                    isCurrentUser ? 'bg-emerald-50/80 font-bold text-emerald-950' : 'text-gray-800'
                                                                }`}
                                                            >
                                                                <td className="px-4 py-3 font-semibold text-gray-400">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="font-extrabold uppercase">{member.nama_lengkap}</span>
                                                                        {isCurrentUser && (
                                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                                                                                Saya
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 font-mono font-semibold text-gray-700">
                                                                    {member.nik}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                                        member.status_hubungan_keluarga === 'Kepala Keluarga'
                                                                            ? 'bg-emerald-100 text-emerald-800'
                                                                            : member.status_hubungan_keluarga === 'Istri'
                                                                            ? 'bg-purple-100 text-purple-800'
                                                                            : 'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                        {member.status_hubungan_keluarga}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold">
                                                                    {member.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600">
                                                                    {member.pendidikan || '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600">
                                                                    {member.pekerjaan || '-'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="px-4 py-6 text-center text-gray-500 italic">
                                                            Belum ada daftar anggota keluarga terdata di KK ini.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="p-8 bg-white rounded-3xl text-center space-y-2 border border-gray-100 shadow-sm">
                                <span className="text-3xl block">📋</span>
                                <h4 className="font-extrabold text-gray-800 text-base">Profil Warga Belum Di-link ke Master Data KK</h4>
                                <p className="text-xs text-gray-500 max-w-md mx-auto">
                                    Akun Anda belum secara otomatis terhubung dengan data NIK / KK di Master Data RT. Silakan hubungi Administrator atau Pengurus RT untuk memverifikasi NIK akun Anda.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 2: INFORMASI AKUN LOGIN (EMAIL & NAME) ── */}
                {activeTab === 'info' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in duration-200 max-w-2xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                )}

                {/* ── TAB 3: UBAH PASSWORD AKUN ── */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in duration-200 max-w-2xl">
                        <UpdatePasswordForm />
                    </div>
                )}

                {/* ── TAB 4: DANGER ZONE ── */}
                {activeTab === 'danger' && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 animate-in fade-in duration-200 max-w-2xl">
                        <DeleteUserForm />
                    </div>
                )}

            </div>
        </Layout>
    );
}
