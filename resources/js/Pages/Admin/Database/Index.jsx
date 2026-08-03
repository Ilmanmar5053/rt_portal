import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ stats, dbInfo }) {
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        password: '',
        targets: ['warga', 'keuangan', 'program', 'layanan'],
    });

    // Handle Checkbox Toggle
    const toggleTarget = (targetKey) => {
        if (data.targets.includes(targetKey)) {
            setData('targets', data.targets.filter(t => t !== targetKey));
        } else {
            setData('targets', [...data.targets, targetKey]);
        }
    };

    // Quick toggle all
    const handleSelectAll = () => {
        if (data.targets.length === 4) {
            setData('targets', []);
        } else {
            setData('targets', ['warga', 'keuangan', 'program', 'layanan']);
        }
    };

    // Submit form reset database
    const handleConfirmReset = (e) => {
        e.preventDefault();
        post(route('admin.database.reset'), {
            onSuccess: () => {
                setShowModal(false);
                reset('password');
            },
            onError: () => {
                setShowModal(false);
            }
        });
    };

    const targetLabels = {
        'warga': { label: 'Data Warga & Kartu Keluarga (KK)', tables: 'wargas, keluargas' },
        'keuangan': { label: 'Data Keuangan RT (Iuran & Arus Kas)', tables: 'iuran_kas, transaksi_kas' },
        'program': { label: 'Data Program & Kegiatan RT', tables: 'program_kegiatans' },
        'layanan': { label: 'Data Layanan (Pengaduan & Surat Pengantar)', tables: 'pengaduans, pengaduan_logs, surat_pengantars' },
    };

    const totalSelectedRows = Object.keys(stats.operasional).reduce((acc, key) => {
        const item = stats.operasional[key];
        let include = false;
        if (data.targets.includes('warga') && (key === 'wargas' || key === 'keluargas')) include = true;
        if (data.targets.includes('keuangan') && (key === 'iuran_kas' || key === 'transaksi_kas')) include = true;
        if (data.targets.includes('program') && key === 'program_kegiatans') include = true;
        if (data.targets.includes('layanan') && (key === 'pengaduans' || key === 'surat_pengantars' || key === 'pengaduan_logs')) include = true;
        return include ? acc + item.count : acc;
    }, 0);

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shadow-sm">
                                🗄️
                            </span>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Manajemen Database &amp; Backup
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola pencadangan (backup) dan pembersihan data operasional untuk kesiapan deployment hosting baru.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-xs font-bold text-gray-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{dbInfo.database_name}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 font-normal">{dbInfo.server_version}</span>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Database - Admin" />

            {/* ── SECTION 1: DATA DILINDUNGI (NEVER DELETED) ── */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-xl border border-emerald-700/50 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-700/60">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
                            🛡️
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] font-bold tracking-wider uppercase border border-emerald-400/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Proteksi Ganda Aktif
                            </span>
                            <h3 className="text-lg font-black text-white mt-1">
                                Data Inti yang Dilindungi (Tidak Akan Dihapus)
                            </h3>
                            <p className="text-emerald-200 text-xs mt-0.5">
                                Tabel berikut bersifat permanen dan terkunci di backend. Fitur reset database tidak akan pernah menyentuh data ini.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.protected).map(([key, item]) => (
                        <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15 flex items-center justify-between hover:bg-white/15 transition-all">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{item.icon}</span>
                                    <h4 className="text-xs font-extrabold text-white">{item.label}</h4>
                                </div>
                                <p className="text-[11px] text-emerald-200 mt-1 line-clamp-1">{item.desc}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-emerald-300">{item.count}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">Baris</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SECTION 2: BACKUP DATABASE ── */}
            <div className="mb-8">
                <h3 className="text-base font-black text-gray-900 tracking-tight mb-3 flex items-center gap-2">
                    <span>📦 Pencadangan Data (Backup)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* SQL Dump */}
                    <div className="card-residential p-5 bg-gradient-to-br from-white to-blue-50/40 border border-blue-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl shadow-inner">
                                    📥
                                </span>
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                                    Format .SQL
                                </span>
                            </div>
                            <h4 className="text-base font-extrabold text-gray-900">Unduh SQL Backup (Database Dump)</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Export seluruh skema tabel beserta isi data ke dalam satu file `.sql`. Cocok untuk import ke phpMyAdmin, MySQL server hosting baru, atau keperluan restore.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-blue-100/60 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500 font-medium">
                                Kompatibel dengan semua hosting
                            </span>
                            <a
                                href={route('admin.database.backup.sql')}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Unduh SQL Dump
                            </a>
                        </div>
                    </div>

                    {/* JSON Snapshot */}
                    <div className="card-residential p-5 bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-inner">
                                    📑
                                </span>
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                                    Format .JSON
                                </span>
                            </div>
                            <h4 className="text-base font-extrabold text-gray-900">Unduh Snapshot JSON</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Export seluruh data operasional dan profil dalam bentuk array JSON terstruktur. Mudah dibaca, dianalisis, dan diintegrasikan dengan aplikasi lain.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-emerald-100/60 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500 font-medium">
                                Snapshot lengkap seluruh tabel
                            </span>
                            <a
                                href={route('admin.database.backup.json')}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Unduh JSON Snapshot
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SECTION 3: STATUS TABEL OPERASIONAL ── */}
            <div className="mb-8">
                <h3 className="text-base font-black text-gray-900 tracking-tight mb-3 flex items-center justify-between">
                    <span>📊 Status Data Operasional (Dapat Dibersihkan)</span>
                    <span className="text-xs font-medium text-gray-500">
                        Total {Object.values(stats.operasional).reduce((a, b) => a + b.count, 0)} baris data tersimpan
                    </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(stats.operasional).map(([key, item]) => (
                        <div key={key} className="card-residential p-4 bg-white border border-gray-100 hover:border-gray-300 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg">{item.icon}</span>
                                <span className="text-lg font-black text-gray-900">{item.count}</span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-800 mt-2 truncate">{item.label}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SECTION 4: DANGER ZONE (RESET OPERASIONAL) ── */}
            <div className="rounded-2xl border-2 border-rose-400/80 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/40 p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl border border-rose-200 shadow-inner">
                            ⚠️
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold tracking-wider uppercase border border-rose-200">
                                Area Administrasi Khusus (Danger Zone)
                            </span>
                            <h3 className="text-lg font-black text-rose-950 mt-1">
                                Bersihkan Data Operasional (Clear Database untuk Hosting)
                            </h3>
                            <p className="text-xs text-rose-800 mt-0.5">
                                Gunakan fitur ini saat ingin mengosongkan data transaksi atau warga sebelum upload/hosting baru.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pilih Kategori yang Ingin Dihapus */}
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                            1. Pilih Kategori Data Operasional yang Ingin Dikosongkan:
                        </label>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-xs font-bold text-rose-700 hover:text-rose-800 underline transition"
                        >
                            {data.targets.length === 4 ? 'Batalkan Semua Pilihan' : 'Pilih Semua Kategori'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(targetLabels).map(([key, info]) => {
                            const isChecked = data.targets.includes(key);
                            return (
                                <div
                                    key={key}
                                    onClick={() => toggleTarget(key)}
                                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                        isChecked
                                            ? 'border-rose-500 bg-rose-100/50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="mt-0.5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 pointer-events-none"
                                    />
                                    <div>
                                        <h4 className="text-xs font-extrabold text-gray-900">{info.label}</h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Tabel: {info.tables}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="mt-6 pt-5 border-t border-rose-200/80">
                    <div className="max-w-md">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                            2. Masukkan Password Administrator Anda untuk Konfirmasi:
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Ketik password akun superadmin Anda..."
                                value={data.password}
                                onChange={e => {
                                    setData('password', e.target.value);
                                    clearErrors('password');
                                }}
                                className={`w-full pr-10 pl-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition ${
                                    errors.password ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-white'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{errors.password}</span>
                            </p>
                        )}
                        {errors.targets && (
                            <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{errors.targets}</span>
                            </p>
                        )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                            <strong>Estimasi Data Dihapus:</strong> <span className="font-extrabold text-rose-700">{totalSelectedRows}</span> baris operasional
                        </div>
                        <button
                            type="button"
                            disabled={data.targets.length === 0 || !data.password}
                            onClick={() => setShowModal(true)}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-md ${
                                data.targets.length === 0 || !data.password
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-lg active:scale-95'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Kosongkan Data Terpilih
                        </button>
                    </div>
                </div>
            </div>

            {/* ── MODAL KONFIRMASI RESET ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl flex-shrink-0">
                                🚨
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Konfirmasi Penghapusan Data</h3>
                                <p className="text-xs text-rose-700 font-semibold">
                                    Tindakan ini tidak dapat dibatalkan (Irreversible Action)
                                </p>
                            </div>
                        </div>

                        <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 text-xs text-gray-700 space-y-2">
                            <p className="font-bold text-rose-900">
                                Anda akan menghapus total <span className="underline font-black">{totalSelectedRows}</span> baris data dari kategori berikut:
                            </p>
                            <ul className="list-disc list-inside space-y-1 font-semibold text-gray-800">
                                {data.targets.map(key => (
                                    <li key={key}>{targetLabels[key].label}</li>
                                ))}
                            </ul>
                            <p className="pt-2 border-t border-rose-200/80 text-[11px] text-emerald-800 font-bold">
                                🛡️ Data Profil RT, Akun User Pengurus, Rumah/Blok, dan Hak Akses TIDAK AKAN DIHAPUS.
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleConfirmReset}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md transition active:scale-95"
                            >
                                {processing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Ya, Kosongkan Sekarang</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
