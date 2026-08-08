import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Index({ logsData, filters }) {
    const { data: groupedLogs, current_page, last_page, total, per_page } = logsData;

    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'time');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(true);

    // Auto-refresh poll every 4 seconds for realtime stream
    useEffect(() => {
        if (!isLiveActive) return;
        const interval = setInterval(() => {
            router.reload({
                only: ['logsData'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [isLiveActive]);

    // Handle filter / sorting change
    const handleFilter = (newSortBy = sortBy, newSortOrder = sortOrder, searchVal = search) => {
        router.get(
            route('admin.activity-logs.index'),
            {
                search: searchVal,
                sort_by: newSortBy,
                sort_order: newSortOrder,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSortToggle = (field) => {
        let newOrder = 'asc';
        if (sortBy === field) {
            newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(field);
        setSortOrder(newOrder);
        handleFilter(field, newOrder, search);
    };

    const openDetailModal = (group) => {
        setSelectedGroup(group);
        setIsDetailOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailOpen(false);
        setSelectedGroup(null);
    };

    // Helper for action badges
    const getActionBadge = (action) => {
        const act = (action || '').toUpperCase();
        switch (act) {
            case 'LOGIN':
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">🔑 LOGIN</span>;
            case 'LOGOUT':
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-gray-100 text-gray-700 border border-gray-300 flex items-center gap-1">🚪 LOGOUT</span>;
            case 'CREATE':
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">➕ CREATE</span>;
            case 'UPDATE':
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">✏️ UPDATE</span>;
            case 'DELETE':
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">🗑️ DELETE</span>;
            case 'VIEW':
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">👁️ VIEW</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-gray-100 text-gray-800 border border-gray-300">{act}</span>;
        }
    };

    // Render Before/After diff table
    const renderDiffTable = (oldVal, newVal) => {
        if (!oldVal && !newVal) return null;
        
        const allKeys = Array.from(new Set([...Object.keys(oldVal || {}), ...Object.keys(newVal || {})]));
        if (allKeys.length === 0) return null;

        return (
            <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 shadow-xs bg-white text-xs">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left font-bold text-gray-600">Properti / Field</th>
                            <th className="px-3 py-2 text-left font-bold text-rose-700 bg-rose-50/50">Nilai Sebelum (Before)</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700 bg-emerald-50/50">Nilai Sesudah (After)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allKeys.map((key) => {
                            const before = oldVal && oldVal[key] !== undefined ? (typeof oldVal[key] === 'object' ? JSON.stringify(oldVal[key]) : String(oldVal[key])) : '-';
                            const after = newVal && newVal[key] !== undefined ? (typeof newVal[key] === 'object' ? JSON.stringify(newVal[key]) : String(newVal[key])) : '-';
                            const isChanged = before !== after;

                            return (
                                <tr key={key} className={isChanged ? 'bg-amber-50/30' : ''}>
                                    <td className="px-3 py-2 font-mono text-gray-700 font-semibold whitespace-nowrap">{key}</td>
                                    <td className="px-3 py-2 text-rose-800 bg-rose-50/20 font-mono break-all">{before}</td>
                                    <td className="px-3 py-2 text-emerald-800 bg-emerald-50/20 font-mono break-all">{after}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-2">
                        <span>Log Aktivitas & Audit Trail</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-200">
                            🔒 Rahasia System
                        </span>
                    </div>

                    {/* Live Stream Auto Refresh Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsLiveActive(prev => !prev)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black transition cursor-pointer border ${
                            isLiveActive
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300 shadow-xs'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                        title="Klik untuk Mengaktifkan/Mematikan Live Realtime Auto-Refresh"
                    >
                        <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                        <span>{isLiveActive ? '🟢 Live Stream Realtime Active' : '⏸️ Stream Paused'}</span>
                    </button>
                </div>
            }
        >
            <Head title="Log Aktivitas & Audit Trail System" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* Header Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">📜</span>
                                <h2 className="text-xl font-black tracking-tight">Audit Trail & Rekap Aktivitas Pengguna</h2>
                            </div>
                            <p className="text-emerald-200/80 text-xs sm:text-sm max-w-2xl">
                                Seluruh riwayat login, akses modul, serta perubahan data (CRUD Before & After) dicatat secara otomatis dan dikelompokkan secara rapi per pengguna.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-semibold">
                            <span>Total Sesi Dicatat:</span>
                            <span className="font-black text-emerald-300 text-sm">{total} Group Aktivitas</span>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter(sortBy, sortOrder, search)}
                            placeholder="Cari nama user, IP address, modul, deskripsi..."
                            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                        <span className="absolute left-3.5 top-3 text-gray-400 text-xs">🔍</span>
                    </div>

                    {/* Sorting Controls */}
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Urutkan:</span>
                        
                        <select
                            value={sortBy}
                            onChange={(e) => handleFilter(e.target.value, sortOrder, search)}
                            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:ring-emerald-500"
                        >
                            <option value="time">⏱️ Waktu Terakhir</option>
                            <option value="name">👤 Nama Pengguna (A-Z)</option>
                            <option value="module">🗂️ Modul Diakses</option>
                            <option value="count">📊 Jumlah Aktivitas</option>
                        </select>

                        <button
                            onClick={() => handleSortToggle(sortBy)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black rounded-xl border border-gray-200 transition-colors flex items-center gap-1"
                            title="Beralih Urutan A-Z / Z-A atau Terbaru / Terlama"
                        >
                            {sortOrder === 'asc' ? '⬆️ A-Z / Terlama' : '⬇️ Z-A / Terbaru'}
                        </button>
                    </div>
                </div>

                {/* Grouped Table */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-black text-gray-500 uppercase tracking-wider">
                                    <th className="py-4 px-4 w-12 text-center">No</th>
                                    <th 
                                        className="py-4 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSortToggle('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Pengguna & Akses</span>
                                            {sortBy === 'name' && (sortOrder === 'asc' ? '🔼' : '🔽')}
                                        </div>
                                    </th>
                                    <th 
                                        className="py-4 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSortToggle('module')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Modul & Ringkasan</span>
                                            {sortBy === 'module' && (sortOrder === 'asc' ? '🔼' : '🔽')}
                                        </div>
                                    </th>
                                    <th 
                                        className="py-4 px-4 cursor-pointer hover:bg-gray-100 transition-colors text-center"
                                        onClick={() => handleSortToggle('count')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Total Aktivitas</span>
                                            {sortBy === 'count' && (sortOrder === 'asc' ? '🔼' : '🔽')}
                                        </div>
                                    </th>
                                    <th 
                                        className="py-4 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSortToggle('time')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Waktu Terakhir</span>
                                            {sortBy === 'time' && (sortOrder === 'asc' ? '🔼' : '🔽')}
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {groupedLogs && groupedLogs.length > 0 ? (
                                    groupedLogs.map((group, index) => {
                                        const rowIndex = (current_page - 1) * per_page + index + 1;
                                        return (
                                            <tr key={group.group_key} className="hover:bg-emerald-50/40 transition-colors group">
                                                <td className="py-4 px-4 font-bold text-gray-500 text-center">{rowIndex}</td>
                                                
                                                {/* User Info */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center border border-emerald-200 flex-shrink-0 shadow-xs">
                                                            {group.user_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                                                                    {group.user_name}
                                                                </span>
                                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                                                    {group.user_role}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-mono">
                                                                <span>🌐 IP: {group.ip_address}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Module & Last Action Summary */}
                                                <td className="py-4 px-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {getActionBadge(group.last_action)}
                                                            <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                                                {group.last_module}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 truncate max-w-xs font-medium text-[11px]">
                                                            {group.last_description}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Total Activities Badge */}
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-200 shadow-xs">
                                                        ⚡ {group.total_activities} Aktivitas
                                                    </span>
                                                </td>

                                                {/* Last Activity Time */}
                                                <td className="py-4 px-4 font-mono text-gray-700 font-bold whitespace-nowrap">
                                                    {group.last_activity_formatted}
                                                </td>

                                                {/* Action Button: View Detail (👁️) */}
                                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => openDetailModal(group)}
                                                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 mx-auto active:scale-95"
                                                        title="Lihat Rincian Log & Perubahan Data (Before/After)"
                                                    >
                                                        <span>👁️</span>
                                                        <span>Rincian</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                                            <div className="text-4xl mb-2">📭</div>
                                            Belum ada log aktivitas yang tercatat dalam sistem.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {last_page > 1 && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">
                                Halaman {current_page} dari {last_page} ({total} Data)
                            </span>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: last_page }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => router.get(route('admin.activity-logs.index'), { page: p, search, sort_by: sortBy, sort_order: sortOrder }, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                                            p === current_page 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Audit Trail (👁️) */}
            <Transition appear show={isDetailOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeDetailModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
                                    {selectedGroup && (
                                        <>
                                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center border border-emerald-300 text-lg shadow-xs">
                                                        {selectedGroup.user_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <Dialog.Title as="h3" className="text-lg font-black text-gray-900 flex items-center gap-2">
                                                            {selectedGroup.user_name}
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                                                {selectedGroup.user_role}
                                                            </span>
                                                        </Dialog.Title>
                                                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                            🌐 IP Address: {selectedGroup.ip_address} | Total {selectedGroup.total_activities} Aktivitas
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={closeDetailModal}
                                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                                                    Timeline & Rincian Perubahan Data (Before / After)
                                                </h4>

                                                {selectedGroup.logs && selectedGroup.logs.length > 0 ? (
                                                    selectedGroup.logs.map((log, idx) => (
                                                        <div key={log.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 shadow-xs space-y-2">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-gray-400 font-mono">#{idx + 1}</span>
                                                                    {getActionBadge(log.action)}
                                                                    <span className="font-bold text-xs text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs">
                                                                        {log.module}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] font-mono font-bold text-gray-500">
                                                                    ⏱️ {log.created_at}
                                                                </span>
                                                            </div>

                                                            <p className="text-xs font-semibold text-gray-800">
                                                                {log.description}
                                                            </p>

                                                            {log.url && (
                                                                <div className="text-[11px] font-mono text-gray-500 truncate bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                                                                    🔗 {log.url}
                                                                </div>
                                                            )}

                                                            {/* Render Before / After Comparison Table if present */}
                                                            {renderDiffTable(log.old_values, log.new_values)}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">Tidak ada rincian log tambahan.</p>
                                                )}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                                                <button
                                                    onClick={closeDetailModal}
                                                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-xs transition-colors"
                                                >
                                                    Tutup Detail
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AdminLayout>
    );
}
