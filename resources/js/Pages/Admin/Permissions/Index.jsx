import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
    home:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    users:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    user:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    cash:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
    chart:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    chat:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
    document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    shield:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    lock:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    crown:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3l3.5 5L12 3l3.5 5L19 3v13H5V3z" />,
    save:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />,
    check:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />,
    x:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />,
    info:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

function Icon({ name, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icons[name]}
        </svg>
    );
}

// ─── Role colors ──────────────────────────────────────────────────────────────
const roleColors = {
    superadmin:    { bg: 'bg-amber-50',    border: 'border-amber-300',  header: 'bg-amber-600',   badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-500' },
    rw:            { bg: 'bg-blue-50',     border: 'border-blue-200',   header: 'bg-blue-600',    badge: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500' },
    rt:            { bg: 'bg-indigo-50',   border: 'border-indigo-200', header: 'bg-indigo-600',  badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
    bendahara:     { bg: 'bg-emerald-50',  border: 'border-emerald-200',header: 'bg-emerald-700', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    sekretaris:    { bg: 'bg-purple-50',   border: 'border-purple-200', header: 'bg-purple-600',  badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
    warga_kk:      { bg: 'bg-rose-50',     border: 'border-rose-200',   header: 'bg-rose-600',    badge: 'bg-rose-100 text-rose-800',     dot: 'bg-rose-500' },
    warga_anggota: { bg: 'bg-gray-50',     border: 'border-gray-200',   header: 'bg-gray-500',    badge: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400' },
};

const actionConfig = {
    access:  { label: 'Lihat/Akses',   shortLabel: 'Lihat',   icon: 'user',   color: 'text-blue-600',    bg: 'peer-checked:bg-blue-600' },
    manage:  { label: 'Kelola (CRUD)', shortLabel: 'Kelola',  icon: 'document', color: 'text-emerald-600', bg: 'peer-checked:bg-emerald-600' },
    approve: { label: 'Setujui/Proses', shortLabel: 'Setujui', icon: 'shield', color: 'text-purple-600',  bg: 'peer-checked:bg-purple-600' },
};

// ─── Checkbox Component ───────────────────────────────────────────────────────
function PermCheckbox({ checked, disabled, onChange, actionKey, label }) {
    const cfg = actionConfig[actionKey];
    const colors = {
        access:  { border: 'border-blue-400',    bg: 'bg-blue-600',    ring: 'focus:ring-blue-400' },
        manage:  { border: 'border-emerald-400',  bg: 'bg-emerald-600', ring: 'focus:ring-emerald-400' },
        approve: { border: 'border-purple-400',   bg: 'bg-purple-600',  ring: 'focus:ring-purple-400' },
    };
    const c = colors[actionKey];

    return (
        <label
            title={disabled ? (actionKey === 'access' ? 'Terkunci — Superadmin memiliki semua akses' : 'Tidak tersedia untuk role ini') : label}
            className={`group relative flex flex-col items-center gap-1 cursor-pointer select-none ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
            <div className={`relative w-6 h-6 rounded-md border-2 transition-all duration-150 flex items-center justify-center
                ${disabled
                    ? checked ? `${c.bg} border-transparent` : 'border-gray-300 bg-gray-100'
                    : checked
                        ? `${c.bg} border-transparent shadow-sm`
                        : `border-gray-300 bg-white hover:${c.border} hover:border-2`
                }`}
            >
                {checked && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {!checked && !disabled && (
                    <svg className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={disabled ? undefined : onChange}
                className="sr-only"
            />
            <span className="text-[10px] font-semibold text-gray-500 leading-none text-center">{actionConfig[actionKey].shortLabel}</span>
        </label>
    );
}

// ─── Chevron Icon ─────────────────────────────────────────────────────────────
function ChevronIcon({ open }) {
    return (
        <svg
            className={`w-5 h-5 text-white/70 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ roleKey, roleInfo, modules, actions, permissions, isSuperAdmin, isWargaRole, onSave, saving }) {
    const colors = roleColors[roleKey] || roleColors.rw;
    const [localPerms, setLocalPerms] = useState(permissions);
    const [dirty, setDirty] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setLocalPerms(permissions);
        setDirty(false);
    }, [permissions]);

    const toggle = (modKey, actionKey) => {
        if (isSuperAdmin) return;
        if (isWargaRole && actionKey !== 'access') return;
        setLocalPerms(prev => ({
            ...prev,
            [modKey]: { ...prev[modKey], [actionKey]: !prev[modKey][actionKey] }
        }));
        setDirty(true);
    };

    const handleSave = () => {
        const permsArray = [];
        Object.keys(localPerms).forEach(modKey => {
            Object.keys(localPerms[modKey]).forEach(actionKey => {
                permsArray.push({
                    module: modKey,
                    action: actionKey,
                    is_active: localPerms[modKey][actionKey],
                });
            });
        });
        onSave(roleKey, permsArray, () => setDirty(false));
    };

    const handleReset = () => {
        setLocalPerms(permissions);
        setDirty(false);
    };

    // Count total granted permissions
    const totalGranted = Object.values(localPerms).reduce((acc, mod) =>
        acc + Object.values(mod).filter(Boolean).length, 0
    );
    const totalPossible = Object.keys(modules).length * Object.keys(actions).length;
    const totalModulesActive = Object.values(localPerms).filter(mod => Object.values(mod).some(Boolean)).length;

    return (
        <div className={`rounded-2xl border-2 ${colors.border} overflow-hidden shadow-sm transition-all duration-200 ${dirty ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
            {/* ── Card Header (clickable to collapse) ── */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`w-full ${colors.header} px-5 py-4 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/40 transition-opacity hover:opacity-90`}
            >
                <div className="flex items-center gap-3">
                    {isSuperAdmin ? (
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L9.5 9H2l5.8 4.2-2.2 6.8L12 16l6.4 4L16 13.2 21.8 9H14.5z"/>
                            </svg>
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon name="shield" className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div className="text-left">
                        <h3 className="font-bold text-white text-base">{roleInfo.label}</h3>
                        <p className="text-white/70 text-xs mt-0.5">
                            {isSuperAdmin
                                ? 'Hak akses penuh — tidak dapat diubah'
                                : isOpen
                                    ? (isWargaRole ? 'Hanya akses lihat yang dapat diatur' : `${totalGranted} dari ${totalPossible} hak akses aktif`)
                                    : `${totalModulesActive} modul aktif · klik untuk ${isOpen ? 'tutup' : 'lihat detail'}`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Pill badges */}
                    {isSuperAdmin && (
                        <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold shadow">
                            <Icon name="lock" className="w-3.5 h-3.5" />
                            TERKUNCI
                        </span>
                    )}
                    {isWargaRole && !isSuperAdmin && (
                        <span className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            Akses Terbatas
                        </span>
                    )}
                    {dirty && !isSuperAdmin && (
                        <span className="flex items-center gap-1 bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                            ● Belum Disimpan
                        </span>
                    )}
                    {/* Mini stat badge when closed */}
                    {!isOpen && !isSuperAdmin && (
                        <span className="hidden sm:flex items-center gap-1 bg-white/20 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                            {totalGranted}/{totalPossible} akses
                        </span>
                    )}
                    {/* Chevron */}
                    <ChevronIcon open={isOpen} />
                </div>
            </button>

            {/* ── Permission Table (collapsible) ── */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
            <div className={`${colors.bg}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">
                                    Modul / Menu
                                </th>
                                {Object.keys(actions).map(actionKey => (
                                    <th key={actionKey} className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[90px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`font-bold ${actionConfig[actionKey].color}`}>
                                                {actionConfig[actionKey].shortLabel}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[70px]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.keys(modules).map((modKey, idx) => {
                                const modPerms = localPerms[modKey] || {};
                                const hasAnyAccess = Object.values(modPerms).some(Boolean);
                                const mod = modules[modKey];
                                return (
                                    <tr key={modKey}
                                        className={`transition-colors ${isSuperAdmin ? '' : 'hover:bg-white/60'} ${idx % 2 === 0 ? '' : 'bg-white/30'}`}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                                                    ${hasAnyAccess ? `${colors.header} text-white` : 'bg-gray-200 text-gray-400'}`}>
                                                    <Icon name={mod.icon || 'document'} className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-semibold text-gray-800 text-sm">{mod.name}</span>
                                            </div>
                                        </td>
                                        {Object.keys(actions).map(actionKey => {
                                            const isChecked = modPerms[actionKey] ?? false;
                                            const isDisabled = isSuperAdmin || (isWargaRole && actionKey !== 'access');
                                            return (
                                                <td key={actionKey} className="px-4 py-3.5 text-center">
                                                    <div className="flex justify-center">
                                                        <PermCheckbox
                                                            checked={isChecked}
                                                            disabled={isDisabled}
                                                            onChange={() => toggle(modKey, actionKey)}
                                                            actionKey={actionKey}
                                                            label={`${actionConfig[actionKey].label} untuk ${mod.name}`}
                                                        />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3.5 text-center">
                                            {hasAnyAccess ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer: Save / Reset Buttons ── */}
                {!isSuperAdmin && (
                    <div className={`px-5 py-3.5 border-t border-gray-200 bg-white/50 flex items-center justify-between gap-3`}>
                        <div className="text-xs text-gray-500">
                            {dirty ? (
                                <span className="text-amber-600 font-semibold flex items-center gap-1">
                                    <Icon name="info" className="w-4 h-4" />
                                    Ada perubahan yang belum disimpan
                                </span>
                            ) : (
                                <span className="text-gray-400">Semua perubahan tersimpan</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {dirty && (
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={!dirty || saving}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-150
                                    ${!dirty
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : saving
                                            ? 'bg-emerald-400 text-white cursor-wait'
                                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md active:scale-95'
                                    }`}
                            >
                                <Icon name="save" className="w-4 h-4" />
                                {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                )}
                {isSuperAdmin && (
                    <div className="px-5 py-3 border-t border-amber-200 bg-amber-50/70 flex items-center gap-2.5 text-xs text-amber-700">
                        <Icon name="lock" className="w-4 h-4 text-amber-500" />
                        <span><strong>Terkunci:</strong> Hak akses Administrator bersifat permanen dan tidak dapat diubah oleh siapapun, termasuk oleh Administrator itu sendiri.</span>
                    </div>
                )}
            </div>
            </div> {/* end collapsible */}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index({ matrix, roles, modules, actions }) {
    const { flash, errors } = usePage().props;
    const [saving, setSaving] = useState(null); // which role is being saved
    const [savedRole, setSavedRole] = useState(null);

    const handleSave = (roleKey, permissionsArray, onSuccess) => {
        setSaving(roleKey);
        router.put(
            route('admin.permissions.bulk'),
            { role: roleKey, permissions: permissionsArray },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setSaving(null);
                    setSavedRole(roleKey);
                    onSuccess();
                    setTimeout(() => setSavedRole(null), 3000);
                },
                onError: () => {
                    setSaving(null);
                },
            }
        );
    };

    const wargaRoles = ['warga_kk', 'warga_anggota'];

    return (
        <AdminLayout header="Matriks Manajemen Hak Akses">
            <Head title="Manajemen Hak Akses" />

            <div className="space-y-6 pb-8">

                {/* ── Flash messages ── */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Icon name="check" className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Berhasil disimpan</div>
                            <div className="text-xs mt-0.5">{flash.success}</div>
                        </div>
                    </div>
                )}
                {(flash?.error || errors?.error) && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <Icon name="x" className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Terjadi kesalahan</div>
                            <div className="text-xs mt-0.5">{flash?.error || errors?.error}</div>
                        </div>
                    </div>
                )}

                {/* ── Info Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-rose-900 p-6 shadow-lg">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border-4 border-white"></div>
                        <div className="absolute -bottom-12 -left-8 w-64 h-64 rounded-full border-4 border-white"></div>
                    </div>
                    <div className="relative flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <Icon name="shield" className="w-8 h-8 text-emerald-200" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white mb-1">Pengaturan Hak Akses Per Role</h2>
                            <p className="text-emerald-200 text-sm leading-relaxed">
                                Atur secara detail hak akses setiap role untuk masing-masing modul.
                                Tersedia 3 level akses: <strong className="text-white">Lihat/Akses</strong> (dapat membuka menu),
                                <strong className="text-white"> Kelola (CRUD)</strong> (dapat tambah/edit/hapus), dan
                                <strong className="text-white"> Setujui/Proses</strong> (dapat approve atau memproses data).
                            </p>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="relative mt-5 flex flex-wrap gap-4">
                        {[
                            { label: 'Lihat/Akses',    color: 'bg-blue-500',    desc: 'Dapat membuka menu & melihat data' },
                            { label: 'Kelola (CRUD)',  color: 'bg-emerald-500', desc: 'Tambah, edit, dan hapus data' },
                            { label: 'Setujui/Proses', color: 'bg-purple-500',  desc: 'Approve atau proses permintaan' },
                        ].map(({ label, color, desc }) => (
                            <div key={label} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                                <div className={`w-4 h-4 rounded-md ${color} flex items-center justify-center shadow`}>
                                    <Icon name="check" className="w-2.5 h-2.5 text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-semibold text-xs">{label}</div>
                                    <div className="text-white/60 text-[10px]">{desc}</div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-2">
                            <Icon name="lock" className="w-4 h-4 text-amber-300" />
                            <div>
                                <div className="text-amber-200 font-bold text-xs">Administrator</div>
                                <div className="text-amber-200/70 text-[10px]">Semua akses penuh — TERKUNCI</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Role Cards Grid ── */}
                <div className="grid grid-cols-1 gap-6">
                    {Object.keys(roles).map(roleKey => {
                        const roleInfo = roles[roleKey];
                        const permissions = matrix[roleKey] || {};
                        const isSuperAdmin = roleKey === 'superadmin';
                        const isWargaRole = wargaRoles.includes(roleKey);
                        return (
                            <RoleCard
                                key={roleKey}
                                roleKey={roleKey}
                                roleInfo={roleInfo}
                                modules={modules}
                                actions={actions}
                                permissions={permissions}
                                isSuperAdmin={isSuperAdmin}
                                isWargaRole={isWargaRole}
                                onSave={handleSave}
                                saving={saving === roleKey}
                            />
                        );
                    })}
                </div>

                {/* ── Footer Note ── */}
                <div className="text-center text-xs text-gray-400 py-2">
                    Perubahan hak akses akan berlaku setelah pengguna login ulang atau sesi baru.
                    Role <strong>Administrator</strong> selalu memiliki semua akses dan tidak dapat dibatasi.
                </div>

            </div>
        </AdminLayout>
    );
}
