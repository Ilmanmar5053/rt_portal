import React, { useState, useMemo, useRef, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Transition, Dialog } from '@headlessui/react';

export default function Index({ auth, strukturRts, wargas, flash, wargaList, activeRt }) {
    // Generate RT tabs 001 to 011
    const rtTabs = Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(3, '0'));
    const [activeTab, setActiveTab] = useState(activeRt || rtTabs[0]);

    useEffect(() => {
        if (activeRt) {
            setActiveTab(activeRt);
        }
    }, [activeRt]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [errorPopup, setErrorPopup] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        rt_nomor: activeTab,
        warga_id: '',
        jabatan: '',
        periode_mulai: '',
        periode_selesai: '',
        foto_profil: null,
    });

    useEffect(() => {
        if (flash?.error) {
            setErrorPopup(flash.error);
        } else if (errors?.warga_id) {
            setErrorPopup(errors.warga_id);
        }
    }, [flash, errors]);

    // Handle Tab Change
    const handleTabChange = (rt) => {
        setActiveTab(rt);
        setData('rt_nomor', rt);
        
        router.get(
            route('admin.struktur-rt.index'),
            { rt: rt },
            { preserveState: true, preserveScroll: true, only: ['strukturRts', 'wargaList', 'activeRt'] }
        );
    };

    // Filter struktur for current active tab
    const currentStruktur = useMemo(() => {
        return strukturRts.filter(item => item.rt_nomor === activeTab);
    }, [strukturRts, activeTab]);

    // Separate hierarchically
    const ketua = currentStruktur.find(item => item.jabatan.toLowerCase().includes('ketua'));
    const sekretaris = currentStruktur.find(item => item.jabatan.toLowerCase().includes('sekretaris'));
    const bendahara = currentStruktur.find(item => item.jabatan.toLowerCase().includes('bendahara'));
    const lainnya = currentStruktur.filter(item => 
        !item.jabatan.toLowerCase().includes('ketua') && 
        !item.jabatan.toLowerCase().includes('sekretaris') && 
        !item.jabatan.toLowerCase().includes('bendahara')
    );

    const openModal = (item = null, defaultJabatan = '') => {
        clearErrors();
        if (item) {
            setEditingItem(item);
            setData({
                rt_nomor: item.rt_nomor || activeTab,
                warga_id: item.warga_id || '',
                jabatan: item.jabatan || '',
                periode_mulai: item.periode_mulai || '',
                periode_selesai: item.periode_selesai || '',
                foto_profil: null, 
            });
        } else {
            setEditingItem(null);
            setData({
                rt_nomor: activeTab,
                warga_id: '',
                jabatan: defaultJabatan,
                periode_mulai: '',
                periode_selesai: '',
                foto_profil: null,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setEditingItem(null);
            clearErrors();
        }, 300);
    };

    const handleWargaSelect = (selectedId) => {
        if (!selectedId) {
            setData('warga_id', '');
            return;
        }

        const selectedWarga = wargas.find(w => String(w.id) === String(selectedId));
        if (selectedWarga && selectedWarga.is_pengurus && String(selectedWarga.pengurus_id) !== String(editingItem?.id)) {
            setErrorPopup(`🚫 Tidak Dapat Ditambahkan!\n\nNama warga "${selectedWarga.nama_lengkap}" sudah menjadi pengurus (${selectedWarga.jabatan_pengurus}) di RT ${selectedWarga.rt_pengurus}.\n\nPenambahan data pengurus RT hanya bisa dengan nama warga yang belum menjadi pengurus di RT mana pun!`);
            setData('warga_id', '');
            return;
        }

        setData('warga_id', selectedId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const selectedWarga = wargas.find(w => String(w.id) === String(data.warga_id));
        if (selectedWarga && selectedWarga.is_pengurus && String(selectedWarga.pengurus_id) !== String(editingItem?.id)) {
            setErrorPopup(`🚫 Tidak Dapat Ditambahkan!\n\nNama warga "${selectedWarga.nama_lengkap}" sudah menjadi pengurus (${selectedWarga.jabatan_pengurus}) di RT ${selectedWarga.rt_pengurus}.\n\nPenambahan data pengurus RT hanya bisa dengan nama warga yang belum menjadi pengurus di RT mana pun!`);
            return;
        }

        const targetRt = editingItem ? editingItem.rt_nomor : activeTab;
        const payload = {
            ...data,
            rt_nomor: targetRt
        };

        if (editingItem) {
            router.post(route('admin.struktur-rt.update', editingItem.id), {
                _method: 'put',
                ...payload
            }, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: (err) => {
                    if (err.warga_id) setErrorPopup(err.warga_id);
                }
            });
        } else {
            router.post(route('admin.struktur-rt.store'), payload, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: (err) => {
                    if (err.warga_id) setErrorPopup(err.warga_id);
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus pengurus ini?')) {
            router.delete(route('admin.struktur-rt.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Compact Card for Top Levels
    const OrgCard = ({ item, roleTitle, defaultJabatan }) => {
        const jbtn = defaultJabatan || roleTitle;
        if (!item) return (
            <div onClick={() => openModal(null, jbtn)} className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-2xl p-4 w-[160px] h-[190px] bg-white/50 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 group-hover:text-emerald-600 transition-transform mb-2 shadow-sm text-lg font-black">+</div>
                <p className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-700 text-center uppercase tracking-wide">Tambah<br/>{roleTitle}</p>
            </div>
        );

        return (
            <div className="relative flex flex-col items-center bg-white rounded-2xl w-[160px] shadow-sm hover:shadow-lg border border-gray-100 group transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => openModal(item)} className="p-1.5 bg-amber-500/90 text-white rounded hover:bg-amber-600 shadow-sm backdrop-blur-sm">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-rose-500/90 text-white rounded hover:bg-rose-600 shadow-sm backdrop-blur-sm">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>

                {/* Banner Photo */}
                <div className="w-full h-28 relative overflow-hidden bg-gray-100">
                    {item.foto_profil ? (
                        <img src={`/storage/${item.foto_profil}`} alt={item.warga?.nama_lengkap} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black bg-emerald-50 group-hover:scale-110 transition-transform duration-700 ease-out">
                            {item.warga?.nama_lengkap?.charAt(0) || '?'}
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                </div>
                
                {/* Content over gradient & below */}
                <div className="flex flex-col items-center w-full px-3 pb-4 -mt-6 relative z-10">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white shadow-sm text-[8px] font-black uppercase tracking-wider rounded text-center mb-1.5 transform group-hover:scale-105 transition-transform duration-300">
                        {item.jabatan}
                    </span>
                    
                    <h3 className="text-xs font-black text-gray-800 text-center leading-tight mb-2 line-clamp-2" title={item.warga?.nama_lengkap}>{item.warga?.nama_lengkap}</h3>
                    
                    <div className="text-[9px] text-gray-500 w-full space-y-1 text-center">
                        <p className="font-medium truncate">📞 {item.warga?.no_hp || '-'}</p>
                        {item.periode_mulai && (
                            <p className="text-[8px] font-medium text-emerald-700/80">
                                ⏳ {new Date(item.periode_mulai).getFullYear()} - {item.periode_selesai ? new Date(item.periode_selesai).getFullYear() : 'Skg'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Compact List Row for Divisions/Sections
    const OrgListRow = ({ item }) => {
        return (
            <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow group overflow-hidden relative">
                <div className="flex items-center gap-4 flex-1 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                        {item.foto_profil ? (
                            <img src={`/storage/${item.foto_profil}`} alt={item.warga?.nama_lengkap} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold group-hover:scale-110 transition-transform duration-500 bg-emerald-50">
                                {item.warga?.nama_lengkap?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-bold text-gray-800">{item.warga?.nama_lengkap}</h4>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-md border border-emerald-100/50 uppercase tracking-wide">
                                {item.jabatan}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">📞 {item.warga?.no_hp || '-'}</span>
                            <span className="flex items-center gap-1">🏠 {item.warga?.keluarga?.alamat || 'Tidak ada alamat'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {item.periode_mulai && (
                        <div className="hidden sm:block text-[10px] text-right text-gray-500">
                            <p className="font-medium text-emerald-700/80">
                                {formatDate(item.periode_mulai)} - {item.periode_selesai ? formatDate(item.periode_selesai) : 'Sekarang'}
                            </p>
                            <p className="text-[9px]">Periode Jabatan</p>
                        </div>
                    )}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 leading-tight flex items-center gap-2">
                            🏢 Struktur RT
                        </h2>
                        <p className="text-[13px] text-gray-500 font-medium mt-1">
                            Manajemen kepengurusan RT 001 hingga RT 011 secara dinamis
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Struktur RT" />

            <style>{`
                @keyframes smoothMovingGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-smooth-green-gradient {
                    background: linear-gradient(-45deg, #f0fdf4, #d1fae5, #ecfdf5, #a7f3d0, #f0fdf4, #e6f4ea);
                    background-size: 300% 300%;
                    animation: smoothMovingGradient 10s ease infinite;
                }
                @keyframes pulseGlowOrb {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.18); }
                }
                .animate-pulse-glow {
                    animation: pulseGlowOrb 6s ease-in-out infinite;
                }
            `}</style>

            <div className="max-w-6xl mx-auto pb-12">
                
                {flash.message && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-bold flex items-center gap-3 shadow-sm text-sm">
                        <span className="w-6 h-6 bg-emerald-100 flex items-center justify-center rounded-full text-xs">✅</span> {flash.message}
                    </div>
                )}

                {/* Dynamic Iconic Tabs with Soft Green Container */}
                <div className="mb-8 p-3 sm:p-4 rounded-3xl bg-emerald-50/80 border border-emerald-200/60 shadow-sm backdrop-blur-md">
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1 px-1">
                        {rtTabs.map(rt => {
                            const isActive = activeTab === rt;
                            return (
                                <button
                                    key={rt}
                                    onClick={() => handleTabChange(rt)}
                                    className={`relative flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-2xl font-black text-xs transition-all duration-300 ${
                                        isActive 
                                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 scale-105 z-10 ring-2 ring-emerald-400/50' 
                                        : 'bg-white/80 text-emerald-900 border border-emerald-100 hover:bg-emerald-100/80 hover:border-emerald-300 hover:text-emerald-950'
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                        📍
                                    </span>
                                    RT {rt}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Organizational Chart Area with Moving Gradient Background */}
                <div className="animate-smooth-green-gradient rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-emerald-200/60 relative overflow-hidden">
                    {/* Decorative bg blobs with pulse glow animation */}
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-300/40 rounded-full blur-3xl animate-pulse-glow pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-300/40 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '3s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="text-center mb-10">
                            <span className="px-4 py-1.5 bg-emerald-700/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block border border-emerald-500/50 shadow-md">Struktur Organisasi</span>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight drop-shadow-sm">Rukun Tetangga {activeTab}</h3>
                        </div>

                        {/* Level 1: Ketua */}
                        <div className="flex justify-center w-full mb-8">
                            <OrgCard item={ketua} roleTitle="Ketua RT" defaultJabatan="Ketua RT" />
                        </div>

                        {/* Connection Lines */}
                        {ketua && (sekretaris || bendahara) && (
                            <div className="hidden md:block w-px h-6 bg-gray-200 -mt-8 mb-0 relative z-0"></div>
                        )}
                        {ketua && (sekretaris || bendahara) && (
                            <div className="hidden md:block w-1/2 max-w-[200px] h-px bg-gray-200 mb-6 relative z-0"></div>
                        )}

                        {/* Level 2: Sekretaris & Bendahara */}
                        <div className="flex flex-row justify-center gap-8 md:gap-16 w-full mb-10 relative z-10">
                            <div className="flex flex-col items-center">
                                {ketua && sekretaris && <div className="hidden md:block absolute top-[-24px] w-px h-6 bg-gray-200"></div>}
                                <OrgCard item={sekretaris} roleTitle="Sekretaris" defaultJabatan="Sekretaris" />
                            </div>
                            <div className="flex flex-col items-center">
                                {ketua && bendahara && <div className="hidden md:block absolute top-[-24px] w-px h-6 bg-gray-200"></div>}
                                <OrgCard item={bendahara} roleTitle="Bendahara" defaultJabatan="Bendahara" />
                            </div>
                        </div>

                        {/* Level 3 and Warga List (Side by Side) */}
                        <div className="w-full mt-6 pt-6 border-t border-dashed border-gray-200">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                                
                                {/* Level 3: Seksi-seksi Lainnya (Compact List) */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Daftar Divisi / Seksi Lainnya</h4>
                                        <button onClick={() => openModal()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5">
                                            <span>+</span> Tambah Divisi
                                        </button>
                                    </div>
                                    
                                    {lainnya.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {lainnya.map(item => (
                                                <OrgListRow key={item.id} item={item} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white/50 rounded-2xl border border-gray-100 text-gray-400 text-xs font-medium">
                                            <div className="text-2xl mb-2 opacity-50">🌱</div>
                                            Belum ada data divisi lainnya di RT {activeTab}.
                                        </div>
                                    )}
                                </div>

                                {/* Listing Warga */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Daftar Warga RT {activeTab}</h4>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-full">
                                            Total: {wargaList?.total || 0} Warga
                                        </span>
                                    </div>
                                    
                                    {wargaList?.data?.length > 0 ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse min-w-[500px]">
                                                    <thead>
                                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-500 tracking-wider">
                                                            <th className="p-3">Nama Warga</th>
                                                            <th className="p-3">Blok / Rumah</th>
                                                            <th className="p-3">Kepala Keluarga</th>
                                                            <th className="p-3">No. HP</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                                                        {wargaList.data.map(w => (
                                                            <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="p-3 font-semibold text-gray-900">{w.nama_lengkap}</td>
                                                                <td className="p-3 whitespace-nowrap">{w.keluarga?.rumah_blok?.nama_blok || '-'}</td>
                                                                <td className="p-3">
                                                                    <div className="text-gray-900">{w.keluarga?.kepala_keluarga_nama || '-'}</div>
                                                                    <div className="text-[10px] text-gray-400 mt-0.5 font-mono">KK: {w.keluarga?.no_kk || '-'}</div>
                                                                </td>
                                                                <td className="p-3 whitespace-nowrap">{w.no_hp || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Pagination */}
                                            {wargaList.links && wargaList.links.length > 3 && (
                                                <div className="p-3 border-t border-gray-100 bg-gray-50/30 flex justify-center flex-wrap gap-1">
                                                    {wargaList.links.map((link, idx) => {
                                                        if (link.url === null) {
                                                            return (
                                                                <div key={idx} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1.5 text-[11px] font-bold rounded-lg text-gray-400 bg-gray-50 border border-gray-100" />
                                                            )
                                                        }
                                                        const url = link.url.includes('rt=') ? link.url : `${link.url}&rt=${activeTab}`;
                                                        return (
                                                            <Link
                                                                key={idx}
                                                                href={url}
                                                                preserveScroll
                                                                preserveState
                                                                only={['wargaList', 'activeRt', 'strukturRts']}
                                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${link.active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white/50 rounded-2xl border border-gray-100 text-gray-400 text-xs font-medium">
                                            <div className="text-2xl mb-2 opacity-50">👥</div>
                                            Belum ada data warga di RT {activeTab}.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Transition appear show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-t-3xl">
                                        <Dialog.Title as="h3" className="text-base font-black text-gray-800 flex items-center gap-2">
                                            <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-sm">👤</span>
                                            {editingItem ? 'Edit Pengurus' : 'Tambah Pengurus'} <span className="text-emerald-600">RT {activeTab}</span>
                                        </Dialog.Title>
                                        <button onClick={closeModal} className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50">
                                            ✕
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-4">
                                            {/* Jabatan Dropdown */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Jabatan / Posisi</label>
                                                <div className="relative">
                                                    <select
                                                        value={data.jabatan}
                                                        onChange={e => setData('jabatan', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm font-medium shadow-sm appearance-none"
                                                        required
                                                    >
                                                        <option value="">-- Pilih Jabatan --</option>
                                                        <option value="Ketua RT">Ketua RT</option>
                                                        <option value="Sekretaris">Sekretaris</option>
                                                        <option value="Bendahara">Bendahara</option>
                                                        <option value="Seksi Keamanan">Seksi Keamanan</option>
                                                        <option value="Seksi Kebersihan">Seksi Kebersihan</option>
                                                        <option value="Seksi Kerohanian">Seksi Kerohanian</option>
                                                        <option value="Seksi Pemuda & Olahraga">Seksi Pemuda & Olahraga</option>
                                                        <option value="Seksi Humas">Seksi Humas</option>
                                                        <option value="Seksi Pembangunan">Seksi Pembangunan</option>
                                                        <option value="Lainnya">Lainnya...</option>
                                                    </select>
                                                </div>
                                                {errors.jabatan && <p className="text-rose-500 text-[10px] mt-1">{errors.jabatan}</p>}
                                            </div>

                                            {/* Warga Selection */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Warga</label>
                                                <select
                                                    value={data.warga_id}
                                                    onChange={e => handleWargaSelect(e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm shadow-sm font-medium"
                                                    required
                                                >
                                                    <option value="">-- Pilih Warga (Status: Warga Biasa) --</option>
                                                    {wargas.map(w => {
                                                        const isAlreadyPengurus = w.is_pengurus && String(w.pengurus_id) !== String(editingItem?.id);
                                                        return (
                                                            <option 
                                                                key={w.id} 
                                                                value={w.id}
                                                                disabled={isAlreadyPengurus}
                                                                className={isAlreadyPengurus ? 'text-gray-400 bg-gray-50' : 'text-gray-900 font-medium'}
                                                            >
                                                                {w.nama_lengkap} {isAlreadyPengurus ? `(Sudah menjadi pengurus di RT ${w.rt_pengurus} - ${w.jabatan_pengurus})` : `(NIK: ${w.nik})`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {errors.warga_id && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.warga_id}</p>}
                                            </div>

                                            {/* Periode */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Mulai Jabatan</label>
                                                    <input
                                                        type="date"
                                                        value={data.periode_mulai}
                                                        onChange={e => setData('periode_mulai', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Selesai (Opsional)</label>
                                                    <input
                                                        type="date"
                                                        value={data.periode_selesai}
                                                        onChange={e => setData('periode_selesai', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Foto Upload */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Foto Profil Pengurus</label>
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <svg className="w-6 h-6 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                            </svg>
                                                            <p className="mb-0.5 text-xs text-gray-500"><span className="font-semibold">Klik untuk unggah</span></p>
                                                            <p className="text-[9px] text-gray-400">JPG, PNG, atau WEBP (Max: 2MB)</p>
                                                        </div>
                                                        <input 
                                                            id="dropzone-file" 
                                                            type="file" 
                                                            className="hidden" 
                                                            ref={fileInputRef}
                                                            onChange={e => setData('foto_profil', e.target.files[0])}
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                </div>
                                                {data.foto_profil && (
                                                    <p className="text-xs text-emerald-600 font-bold mt-2">Terpilih: {data.foto_profil.name}</p>
                                                )}
                                                {errors.foto_profil && <p className="text-rose-500 text-[10px] mt-1">{errors.foto_profil}</p>}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors text-xs"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all text-xs disabled:opacity-70 flex justify-center items-center shadow-lg shadow-gray-900/20 hover:shadow-emerald-600/30"
                                            >
                                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Error Popup Dialog */}
            <Transition appear show={!!errorPopup} as={React.Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setErrorPopup(null)}>
                    <Transition.Child
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
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-rose-100">
                                    <div className="flex items-center gap-3 text-rose-600 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl flex-shrink-0">
                                            🚫
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-base font-black text-gray-900 leading-tight">
                                                Gagal Menambahkan Pengurus
                                            </Dialog.Title>
                                            <p className="text-xs text-rose-500 font-semibold mt-0.5">Validasi Data Pengurus RT</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-100 text-xs text-gray-800 leading-relaxed font-semibold whitespace-pre-line mb-6">
                                        {errorPopup}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setErrorPopup(null)}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 text-xs"
                                        >
                                            Tutup & Perbaiki Data
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AdminLayout>
    );
}
