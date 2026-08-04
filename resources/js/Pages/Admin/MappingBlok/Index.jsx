import React, { useState, useRef } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function MappingBlokIndex({ profil, rumahBloks }) {
    // Canvas & Viewport States
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const canvasContainerRef = useRef(null);
    const mapContentRef = useRef(null); // Ref khusus untuk menghitung koordinat persis terhadap area gambar peta

    // DUA MODE INTERAKTIF UTAMA
    const [isAddMode, setIsAddMode] = useState(false); // Mode Klik Objek Rumah untuk Pasang Pin
    const [isDragPinMode, setIsDragPinMode] = useState(false); // Mode Geser-Geser Posisi Pin Langsung di Peta

    // State untuk Drag-and-Drop posisi Pin secara realtime
    const [draggingPin, setDraggingPin] = useState(null);
    const [dragPinCoord, setDragPinCoord] = useState(null);

    // Filter & Search States for table
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, DIHUNI, KOSONG, PINNED, UNPINNED
    const [selectedCategoryColor, setSelectedCategoryColor] = useState('ALL');

    // Modals
    const [activePopupHouse, setActivePopupHouse] = useState(null); // Detail popup terintegrasi KK saat pin diklik
    const [configModalHouse, setConfigModalHouse] = useState(null); // Modal pasang / atur pin (tanpa input koordinat)
    const [uploadModalOpen, setUploadModalOpen] = useState(false); // Modal upload HD map

    // Form untuk Pengaturan Pin Rumah (Default Merah Sonar Sesuai Permintaan)
    const pinForm = useForm({
        rumah_blok_id: '',
        coord_x: '50.00',
        coord_y: '50.00',
        pin_label: '',
        pin_color: 'rose', // Default merah sonar
    });

    // Form untuk Upload Gambar Mapping HD
    const mapUploadForm = useForm({
        map_image: null,
    });

    // Peta default berkualitas tinggi jika Admin belum mengupload citra satelit
    const defaultSatelliteUrl = '/images/ilustrasi-perumahan.jpeg';
    const mapImageUrl = profil?.map_image_path
        ? `/storage/${profil.map_image_path}`
        : defaultSatelliteUrl;

    // Zoom handlers
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const toggleFullscreen = () => {
        if (!canvasContainerRef.current) return;
        if (!document.fullscreenElement) {
            canvasContainerRef.current.requestFullscreen().catch((err) => {
                console.error('Fullscreen error:', err);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // --- HELPER AMBIL NAMA KEPALA KELUARGA AKURAT ---
    const getKepalaNameFromKK = (kk) => {
        if (!kk) return null;
        const kepalaWarga = kk.wargas?.find((w) => w.status_hubungan_keluarga === 'Kepala Keluarga');
        return (
            kk.kepala_keluarga_nama ||
            kk.kepala_keluarga?.nama_lengkap ||
            kk.kepalaKeluarga?.nama_lengkap ||
            kepalaWarga?.nama_lengkap ||
            kk.wargas?.[0]?.nama_lengkap ||
            null
        );
    };

    const getKepalaKeluargaName = (rumah) => {
        if (!rumah || !rumah.keluargas || rumah.keluargas.length === 0) return 'Belum Dihuni / Kosong';
        const kk = rumah.keluargas[0];
        const name = getKepalaNameFromKK(kk);
        return name || 'Kepala Keluarga Terdaftar';
    };

    // --- HELPER KOORDINAT PERSIS MATEMATIS (ANTI BERUBAH / ANTI MELOMPAT) ---
    // Menghitung koordinat persis relatif terhadap mapContentRef agar tidak bergeser atau melompat saat zoom/pan
    const getPercentageCoord = (clientX, clientY) => {
        if (!mapContentRef.current) return { x: '50.00', y: '50.00' };
        const rect = mapContentRef.current.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;
        x = Math.max(0.5, Math.min(99.5, x));
        y = Math.max(0.5, Math.min(99.5, y));
        return { x: x.toFixed(2), y: y.toFixed(2) };
    };

    // --- CANVAS PAN & DRAG-AND-DROP HANDLERS ---
    const handleCanvasMouseDown = (e) => {
        if (draggingPin || isAddMode) return;
        setIsDraggingCanvas(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleCanvasMouseMove = (e) => {
        // 1. Jika sedang mendrag sebuah Pin (Geser-Geser Pin Fleksibel)
        if (draggingPin && isDragPinMode) {
            const coords = getPercentageCoord(e.clientX, e.clientY);
            setDragPinCoord(coords);
            return;
        }

        // 2. Jika sedang menggeser peta (Pan canvas)
        if (!isDraggingCanvas || isAddMode) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleCanvasMouseUp = () => {
        // Jika sedang mendrag pin dan dilepas -> simpan koordinat baru langsung ke DB
        if (draggingPin && dragPinCoord && isDragPinMode) {
            const targetId = draggingPin.id;
            const targetX = dragPinCoord.x;
            const targetY = dragPinCoord.y;

            // Update optimistik lokal agar posisi pin menetap seketika di titik baru tanpa kedipan
            draggingPin.coord_x = targetX;
            draggingPin.coord_y = targetY;

            router.put(
                route('admin.mapping-blok.pin.update', targetId),
                {
                    coord_x: targetX,
                    coord_y: targetY,
                    pin_label: draggingPin.pin_label || '',
                    pin_color: draggingPin.pin_color || 'rose',
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setDraggingPin(null);
                        setDragPinCoord(null);
                    },
                }
            );
            return;
        }

        setIsDraggingCanvas(false);
        setDraggingPin(null);
        setDragPinCoord(null);
    };

    // Klik pada area peta saat mode Pasang Pin (Klik Objek Rumah)
    const handleCanvasClick = (e) => {
        if (!isAddMode) return;
        const coords = getPercentageCoord(e.clientX, e.clientY);

        // Cari rumah pertama yang BELUM dipasang pin (unpinned) sebagai default
        // Ini mencegah tertimpanya pin rumah sebelumnya yang sudah tersimpan!
        const firstUnpinned = rumahBloks.find((r) => !r.coord_x || !r.coord_y);
        const defaultId = firstUnpinned ? firstUnpinned.id : '';

        pinForm.setData({
            rumah_blok_id: defaultId,
            coord_x: coords.x,
            coord_y: coords.y,
            pin_label: '',
            pin_color: 'rose', // Default merah sonar
        });
        setConfigModalHouse({ isNew: true });
        setIsAddMode(false);
    };

    // Klik atau tahan pada pin di peta
    const handlePinMouseDown = (e, rumah) => {
        if (isDragPinMode) {
            e.stopPropagation();
            setDraggingPin(rumah);
            setDragPinCoord({ x: rumah.coord_x, y: rumah.coord_y });
        }
    };

    const handlePinClick = (e, rumah) => {
        e.stopPropagation();
        if (isDragPinMode) {
            pinForm.setData({
                rumah_blok_id: rumah.id,
                coord_x: rumah.coord_x || '50.00',
                coord_y: rumah.coord_y || '50.00',
                pin_label: rumah.pin_label || '',
                pin_color: rumah.pin_color || 'rose',
            });
            setConfigModalHouse(rumah);
        } else {
            setActivePopupHouse(rumah);
        }
    };

    // Submit simpan posisi pin (Mendukung penambahan tanpa batas dan tanpa menimpa pin sebelumnya)
    const handleSavePin = (e) => {
        e.preventDefault();
        const targetId = configModalHouse?.id || pinForm.data.rumah_blok_id;
        if (!targetId) {
            alert('Silakan pilih Alamat / Blok Rumah terlebih dahulu.');
            return;
        }

        pinForm.put(route('admin.mapping-blok.pin.update', targetId), {
            preserveScroll: true,
            onSuccess: () => {
                setConfigModalHouse(null);
                pinForm.reset();
            },
        });
    };

    // Hapus pin dari peta
    const handleDeletePin = (rumah) => {
        if (confirm(`Hapus tanda pin untuk Blok ${rumah.blok} No. ${rumah.nomor_rumah} dari peta?`)) {
            router.delete(route('admin.mapping-blok.pin.delete', rumah.id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (configModalHouse?.id === rumah.id) setConfigModalHouse(null);
                    if (activePopupHouse?.id === rumah.id) setActivePopupHouse(null);
                },
            });
        }
    };

    // Submit upload gambar citra satelit HD
    const handleUploadMap = (e) => {
        e.preventDefault();
        mapUploadForm.post(route('admin.mapping-blok.upload'), {
            forceFormData: true,
            onSuccess: () => {
                setUploadModalOpen(false);
                mapUploadForm.reset();
            },
        });
    };

    // Filter daftar rumah
    const isHouseOccupied = (r) => {
        if (!r) return false;
        return r.status_hunian === 'Diisi' || r.status_hunian === 'Dihuni' || (Array.isArray(r.keluargas) && r.keluargas.length > 0);
    };

    const filteredHouses = rumahBloks.filter((item) => {
        const matchesSearch =
            !searchTerm ||
            `Blok ${item.blok}-${item.nomor_rumah}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.pin_label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.keluargas || []).some((k) =>
                (k.kepala_keluarga?.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (k.no_kk || '').includes(searchTerm)
            );

        const isPinned = Boolean(item.coord_x && item.coord_y);
        const matchesFilter =
            filterStatus === 'ALL'
                ? true
                : filterStatus === 'PINNED'
                ? isPinned
                : filterStatus === 'UNPINNED'
                ? !isPinned
                : filterStatus === 'DIHUNI'
                ? isHouseOccupied(item)
                : filterStatus === 'KOSONG'
                ? !isHouseOccupied(item)
                : true;

        const matchesColor =
            selectedCategoryColor === 'ALL' || item.pin_color === selectedCategoryColor;

        return matchesSearch && matchesFilter && matchesColor;
    });

    // Get color styles KECIL KELAP-KELIP SEPERTI SONAR (Default Merah Sonar Sesuai Permintaan)
    const getPinColorStyles = (color) => {
        const chosen = color || 'rose';
        switch (chosen) {
            case 'rose':
                return {
                    sonarDot: 'bg-rose-600 border-white shadow-[0_0_12px_rgba(244,63,94,1)]',
                    sonarRing: 'bg-rose-500/60',
                    sonarBorder: 'border-rose-500/50',
                    label: 'Merah Sonar',
                };
            case 'emerald':
                return {
                    sonarDot: 'bg-emerald-600 border-white shadow-[0_0_12px_rgba(16,185,129,1)]',
                    sonarRing: 'bg-emerald-500/60',
                    sonarBorder: 'border-emerald-500/50',
                    label: 'Hijau Sonar',
                };
            case 'amber':
                return {
                    sonarDot: 'bg-amber-500 border-white shadow-[0_0_12px_rgba(245,158,11,1)]',
                    sonarRing: 'bg-amber-500/60',
                    sonarBorder: 'border-amber-500/50',
                    label: 'Kuning Sonar',
                };
            case 'purple':
                return {
                    sonarDot: 'bg-purple-600 border-white shadow-[0_0_12px_rgba(168,85,247,1)]',
                    sonarRing: 'bg-purple-500/60',
                    sonarBorder: 'border-purple-500/50',
                    label: 'Ungu Sonar',
                };
            case 'blue':
                return {
                    sonarDot: 'bg-blue-600 border-white shadow-[0_0_12px_rgba(59,130,246,1)]',
                    sonarRing: 'bg-blue-500/60',
                    sonarBorder: 'border-blue-500/50',
                    label: 'Biru Sonar',
                };
            default:
                return {
                    sonarDot: 'bg-rose-600 border-white shadow-[0_0_12px_rgba(244,63,94,1)]',
                    sonarRing: 'bg-rose-500/60',
                    sonarBorder: 'border-rose-500/50',
                    label: 'Merah Sonar',
                };
        }
    };

    // Hitung statistik
    const totalHouses = rumahBloks.length;
    const totalPinned = rumahBloks.filter((r) => r.coord_x && r.coord_y).length;
    const totalDihuni = rumahBloks.filter(isHouseOccupied).length;

    // Aksi klik "Pasang Pin" dari tabel bawah -> Aktifkan mode dan scroll ke kanvas
    const handleInstallFromTable = (rumah) => {
        pinForm.setData({
            rumah_blok_id: rumah.id,
            coord_x: '50.00',
            coord_y: '50.00',
            pin_label: '',
            pin_color: 'rose', // Default Merah Sonar
        });
        setIsDragPinMode(false);
        setIsAddMode(true);
        if (canvasContainerRef.current) {
            canvasContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-teal-600/20">
                            🛰️
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <span>Mapping Blok Rumah Warga</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold uppercase">
                                    Citra Satelit HD
                                </span>
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">
                                Pemetaan visual tanda pin sonar merah terintegrasi database Kartu Keluarga (fleksibel digeser)
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Header */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                        >
                            <span>⚙️</span>
                            <span>Setting & Upload Citra HD</span>
                        </button>

                        {/* Tombol 1: Pasang Pin dengan Klik Objek Rumah */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsDragPinMode(false);
                                setIsAddMode(!isAddMode);
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                                isAddMode
                                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white ring-4 ring-rose-300 animate-pulse'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                            }`}
                        >
                            <span>{isAddMode ? '✓ Klik Atap Rumah di Peta...' : '➕ Pasang Pin Sonar (Klik Objek)'}</span>
                        </button>

                        {/* Tombol 2: Mode Geser-Geser Pin Fleksibel */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddMode(false);
                                setIsDragPinMode(!isDragPinMode);
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                                isDragPinMode
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white ring-4 ring-amber-300 animate-pulse'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                        >
                            <span>{isDragPinMode ? '🖐️ Mode Geser Pin Aktif' : '🖐️ Geser-Geser Posisi Pin'}</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Mapping Blok Rumah - Admin" />

            <div className="space-y-6">
                {/* BARIS STATISTIK RINGKAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Rumah Terdaftar</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalHouses} <span className="text-sm font-bold text-gray-500">Unit</span></h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                            🏠
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rumah Sudah Ada Pin</p>
                            <h3 className="text-2xl font-black text-cyan-700 mt-1">{totalPinned} <span className="text-sm font-bold text-gray-400">/ {totalHouses} Unit</span></h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl font-bold">
                            📍
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rumah Dihuni (KK Terintegrasi)</p>
                            <h3 className="text-2xl font-black text-purple-700 mt-1">{totalDihuni} <span className="text-sm font-bold text-gray-400">Unit</span></h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                            👨‍👩‍👧‍👦
                        </div>
                    </div>
                </div>

                {/* BANNER INFORMASI MODE PASANG PIN (KLIK OBJEK RUMAH) */}
                {isAddMode && (
                    <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-bounce">📍</span>
                            <div>
                                <h3 className="text-sm font-black tracking-tight">Mode Klik Objek Rumah Sedang Aktif</h3>
                                <p className="text-xs text-rose-100">
                                    Silakan <strong>klik tepat di atap/objek rumah</strong> pada gambar citra satelit di bawah, lalu pilih alamat rumah dari dropdown yang muncul.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddMode(false)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-xl transition backdrop-blur-sm cursor-pointer whitespace-nowrap"
                        >
                            ✕ Batal Pasang Pin
                        </button>
                    </div>
                )}

                {/* BANNER INFORMASI MODE GESER-GESER PIN (DRAG & DROP FLEKSIBEL) */}
                {isDragPinMode && (
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-bounce">🖐️</span>
                            <div>
                                <h3 className="text-sm font-black tracking-tight">Mode Geser-Geser Posisi Pin Aktif</h3>
                                <p className="text-xs text-amber-100">
                                    Klik dan <strong>tahan (drag & drop) ikon pin mana saja</strong> di peta lalu geser ke objek rumah yang tepat. Posisi otomatis tersimpan begitu dilepas!
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDragPinMode(false)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-xl transition backdrop-blur-sm cursor-pointer whitespace-nowrap"
                        >
                            ✕ Selesai Geser Pin
                        </button>
                    </div>
                )}

                {/* AREA CANVAS CITRA SATELIT HD & PIN INTERAKTIF SONAR KELAP-KELIP */}
                <div
                    ref={canvasContainerRef}
                    className="bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden relative select-none"
                >
                    {/* Floating Toolbar di Atas Canvas */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                        {/* Keterangan Kategori Pin Sonar */}
                        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2 text-white flex items-center gap-4 shadow-xl pointer-events-auto">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Legenda Sonar:</span>
                            <div className="flex items-center gap-3 text-xs font-bold">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                                    <span>Merah Sonar (Penting/Default)</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <span>Hijau</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                    <span>Kuning</span>
                                </span>
                            </div>
                        </div>

                        {/* Tombol Zoom & Fullscreen */}
                        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-1.5 flex items-center gap-1 shadow-xl pointer-events-auto">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="w-8 h-8 rounded-xl hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center transition"
                                title="Zoom Out (-)"
                            >
                                ➖
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="px-2.5 h-8 rounded-xl hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center transition"
                                title="Reset Zoom (100%)"
                            >
                                {Math.round(zoom * 100)}%
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="w-8 h-8 rounded-xl hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center transition"
                                title="Zoom In (+)"
                            >
                                ➕
                            </button>
                            <div className="w-px h-6 bg-slate-700 mx-1"></div>
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="px-3 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-black text-xs flex items-center gap-1.5 transition"
                            >
                                <span>{isFullscreen ? '✕ Keluar Fullscreen' : '⛶ Fullscreen'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Canvas Inner Viewport */}
                    <div
                        onClick={handleCanvasClick}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        className={`relative w-full h-[540px] sm:h-[680px] overflow-hidden transition-all duration-150 ${
                            isAddMode
                                ? 'cursor-crosshair'
                                : isDragPinMode
                                ? 'cursor-grab'
                                : isDraggingCanvas
                                ? 'cursor-grabbing'
                                : 'cursor-grab'
                        }`}
                    >
                        {/* MAP CONTENT REF - Container gambar peta dan pin agar perhitungan persentase 100% presisi dan tidak berubah saat digeser */}
                        <div
                            ref={mapContentRef}
                            style={{
                                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                transformOrigin: 'center center',
                                transition: isDraggingCanvas ? 'none' : 'transform 0.2s ease-out',
                            }}
                            className="absolute inset-0 w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={mapImageUrl}
                                alt="Citra Satelit Mapping Blok Rumah"
                                className="w-full h-full object-cover sm:object-contain pointer-events-none select-none"
                            />

                            {/* OVERLAY TITIK PIN SONAR MERAH KELAP-KELIP (KECIL & PRESISI) */}
                            {rumahBloks.map((rumah) => {
                                if (!rumah.coord_x || !rumah.coord_y) return null;
                                const style = getPinColorStyles(rumah.pin_color);
                                const kepalaNama = getKepalaKeluargaName(rumah);

                                // Hitung koordinat apakah sedang didrag atau tidak
                                const currentX =
                                    draggingPin?.id === rumah.id && dragPinCoord
                                        ? dragPinCoord.x
                                        : rumah.coord_x;
                                const currentY =
                                    draggingPin?.id === rumah.id && dragPinCoord
                                        ? dragPinCoord.y
                                        : rumah.coord_y;

                                return (
                                    <div
                                        key={rumah.id}
                                        onMouseDown={(e) => handlePinMouseDown(e, rumah)}
                                        onClick={(e) => handlePinClick(e, rumah)}
                                        style={{
                                            left: `${currentX}%`,
                                            top: `${currentY}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                        className={`absolute z-20 group transition-transform ${
                                            draggingPin?.id === rumah.id
                                                ? 'scale-150 z-50 cursor-grabbing'
                                                : isDragPinMode
                                                ? 'cursor-grab hover:scale-150 hover:z-30'
                                                : 'cursor-pointer hover:scale-150 hover:z-30'
                                        }`}
                                    >
                                        {/* Gelombang Sonar Kelap-Kelip 1 (Ping) */}
                                        <span
                                            className={`absolute -inset-2 rounded-full ${style.sonarRing} animate-ping opacity-75 pointer-events-none`}
                                        ></span>

                                        {/* Gelombang Sonar Lingkaran Luar 2 (Pulse) */}
                                        <span
                                            className={`absolute -inset-3 rounded-full border ${style.sonarBorder} animate-pulse opacity-60 pointer-events-none`}
                                        ></span>

                                        {/* Titik Sonar Merah Kecil di Tengah */}
                                        <div
                                            className={`relative w-4 h-4 rounded-full border-2 ${style.sonarDot} flex items-center justify-center transition-all`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                        </div>

                                        {/* Tooltip Hover Bersih (Hanya muncul saat kursor didekatkan) */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-xl bg-slate-950/95 border border-slate-700/80 text-white text-[11px] font-black whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex flex-col items-center">
                                            <span>Blok {rumah.blok}-{rumah.nomor_rumah}</span>
                                            {rumah.pin_label && (
                                                <span className="text-[10px] font-bold text-cyan-300">
                                                    {rumah.pin_label}
                                                </span>
                                            )}
                                            <span className="text-[9px] font-medium text-slate-300">
                                                {kepalaNama}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Status Info Bar */}
                    <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                            <span>
                                <strong className="text-white">Citra Landscape HD:</strong>{' '}
                                {profil?.map_image_path ? 'Citra Satelit RT Terpasang' : 'Peta Citra Satelit Demo Default'}
                            </span>
                        </div>
                        <div className="text-slate-400">
                            {isAddMode
                                ? '💡 Klik di atap rumah pada peta untuk memasang pin sonar merah.'
                                : isDragPinMode
                                ? '🖐️ Drag & drop titik sonar merah mana saja untuk memindahkan posisi.'
                                : '💡 Klik pada titik sonar untuk melihat popup detail Kepala Keluarga & alamat.'}
                        </div>
                    </div>
                </div>

                {/* DAFTAR MASTER RUMAH & KONTROL FILTER */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-black text-gray-900">
                                Integrasi Data Master Rumah & Posisi Pin
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                Daftar seluruh rumah di RT terintegrasi langsung dengan database Kartu Keluarga dan penandaan titik satelit
                            </p>
                        </div>

                        {/* Filter Status Pin & Search */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="text-xs font-bold rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                            >
                                <option value="ALL">Semua Status Pin & Hunian</option>
                                <option value="PINNED">📍 Sudah Ada Pin di Peta</option>
                                <option value="UNPINNED">⭕ Belum Dipasang Pin</option>
                                <option value="DIHUNI">✓ Sudah Dihuni (Ada KK)</option>
                                <option value="KOSONG">🏠 Kosong / Belum Dihuni</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Cari blok, rumah, kepala keluarga..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="text-xs font-medium rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 min-w-[220px]"
                            />
                        </div>
                    </div>

                    {/* TABLE INTEGRASI DATA RUMAH & KARTU KELUARGA */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="px-4 py-3.5 text-center font-black uppercase tracking-wider w-12">No</th>
                                    <th className="px-4 py-3.5 text-left font-black uppercase tracking-wider">Blok & No. Rumah</th>
                                    <th className="px-4 py-3.5 text-left font-black uppercase tracking-wider">Kepala Keluarga (Integrasi KK)</th>
                                    <th className="px-4 py-3.5 text-left font-black uppercase tracking-wider">Label / Keterangan</th>
                                    <th className="px-4 py-3.5 text-center font-black uppercase tracking-wider">Status Pin</th>
                                    <th className="px-4 py-3.5 text-center font-black uppercase tracking-wider">Status Hunian</th>
                                    <th className="px-4 py-3.5 text-right font-black uppercase tracking-wider">Aksi Pin</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 font-medium text-gray-700">
                                {filteredHouses.length > 0 ? (
                                    filteredHouses.map((rumah, idx) => {
                                        const isPinned = Boolean(rumah.coord_x && rumah.coord_y);
                                        const kepalaNama = getKepalaKeluargaName(rumah);
                                        const kk = rumah.keluargas && rumah.keluargas[0];

                                        return (
                                            <tr key={rumah.id} className="hover:bg-cyan-50/40 transition-colors">
                                                <td className="px-4 py-3 text-center font-bold text-gray-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-black text-gray-900">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span>🏠</span>
                                                        <span>Blok {rumah.blok}-{rumah.nomor_rumah}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {kk ? (
                                                        <div className="space-y-0.5">
                                                            <div className="font-extrabold text-gray-900">
                                                                {kepalaNama}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 font-mono">
                                                                No. KK: {kk.no_kk} &bull; {kk.wargas?.length || 0} Jiwa
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Belum terdaftar KK</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {rumah.pin_label ? (
                                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 font-bold text-xs">
                                                            {rumah.pin_label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono font-bold">
                                                    {isPinned ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px]">
                                                            <span>📍</span>
                                                            <span>Terpasang di Peta</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Belum ada pin</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                                                            isHouseOccupied(rumah)
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {isHouseOccupied(rumah) ? 'Diisi (Ada KK)' : 'Kosong'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-1.5">
                                                    {isPinned ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handlePinClick(e, rumah)}
                                                                className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold transition"
                                                                title="Tampilkan Popup Detail Rumah"
                                                            >
                                                                Lihat Popup
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    pinForm.setData({
                                                                        rumah_blok_id: rumah.id,
                                                                        coord_x: rumah.coord_x,
                                                                        coord_y: rumah.coord_y,
                                                                        pin_label: rumah.pin_label || '',
                                                                        pin_color: rumah.pin_color || 'rose',
                                                                    });
                                                                    setConfigModalHouse(rumah);
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition"
                                                                title="Atur ulang label atau warna"
                                                            >
                                                                Atur Label/Warna
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeletePin(rumah)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition"
                                                                title="Hapus pin dari peta"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInstallFromTable(rumah)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-sm"
                                                        >
                                                            <span>➕</span>
                                                            <span>Pasang Pin</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400 italic">
                                            Tidak ada blok rumah yang cocok dengan kata kunci atau filter status Anda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL 1: POPUP DETAIL RUMAH TERINTEGRASI KK (SAAT PIN DIKLIK DI MODE NORMAL) */}
            {activePopupHouse && (
                <div
                    onClick={() => setActivePopupHouse(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
                    >
                        {/* Header Modal Popup */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 px-6 py-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                                    🏡
                                </span>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">
                                        Blok {activePopupHouse.blok} - No. {activePopupHouse.nomor_rumah}
                                    </h3>
                                    <p className="text-xs text-cyan-200 font-medium">
                                        Informasi Integrasi Peta Satelit & Kartu Keluarga
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActivePopupHouse(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body Detail Rumah */}
                        <div className="p-6 space-y-5">
                            {/* Keterangan Label Custom jika ada */}
                            {activePopupHouse.pin_label && (
                                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3.5 flex items-center gap-3">
                                    <span className="text-xl">🏷️</span>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">
                                            Keterangan / Label Titik Peta
                                        </p>
                                        <p className="text-sm font-extrabold text-cyan-950">
                                            {activePopupHouse.pin_label}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Integrasi Data Kartu Keluarga */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>👑</span>
                                    <span>Kepala Keluarga Terdaftar</span>
                                </h4>

                                {activePopupHouse.keluargas && activePopupHouse.keluargas.length > 0 ? (
                                    <div className="space-y-3">
                                        {activePopupHouse.keluargas.map((kk) => (
                                            <div key={kk.id} className="bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-xs space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black text-gray-900">
                                                        {getKepalaNameFromKK(kk) || 'Kepala Keluarga'}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                                                        {activePopupHouse.status_hunian}
                                                    </span>
                                                </div>

                                                <div className="text-xs font-mono text-gray-600 flex items-center gap-2">
                                                    <span>📄 No. KK:</span>
                                                    <span className="font-bold text-gray-800">{kk.no_kk}</span>
                                                </div>

                                                <div className="text-xs text-gray-600">
                                                    <span>👥 Jumlah Jiwa: </span>
                                                    <strong className="text-gray-900">{kk.wargas?.length || 0} Warga</strong>
                                                </div>

                                                {kk.wargas && kk.wargas.length > 0 && (
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <p className="text-[11px] font-bold text-gray-500 mb-1">Daftar Anggota:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {kk.wargas.slice(0, 5).map((w) => (
                                                                <span key={w.id} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold">
                                                                    {w.nama_lengkap} ({w.status_hubungan_keluarga})
                                                                </span>
                                                            ))}
                                                            {kk.wargas.length > 5 && (
                                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold">
                                                                    +{kk.wargas.length - 5} lainnya
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-2 flex justify-end">
                                                    <Link
                                                        href={route('admin.keluarga.show', kk.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition"
                                                    >
                                                        <span>Lihat Detail Lengkap KK</span>
                                                        <span>→</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-xs italic bg-white rounded-xl border border-gray-200/60">
                                        Belum ada data Kartu Keluarga terhubung dengan blok rumah ini (Status: {activePopupHouse.status_hunian}).
                                    </div>
                                )}
                            </div>

                            {/* Alamat Lengkap */}
                            <div className="text-xs text-gray-600 bg-slate-100/70 rounded-xl p-3.5 space-y-1 font-medium">
                                <span className="font-bold text-gray-800 block">📍 Alamat Posisi Rumah:</span>
                                <p>
                                    Blok {activePopupHouse.blok} Nomor {activePopupHouse.nomor_rumah} &bull; Lingkungan RT
                                </p>
                            </div>
                        </div>

                        {/* Footer Popup */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    const h = activePopupHouse;
                                    setActivePopupHouse(null);
                                    pinForm.setData({
                                        rumah_blok_id: h.id,
                                        coord_x: h.coord_x,
                                        coord_y: h.coord_y,
                                        pin_label: h.pin_label || '',
                                        pin_color: h.pin_color || 'rose',
                                    });
                                    setConfigModalHouse(h);
                                }}
                                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-black transition"
                            >
                                ⚙️ Edit Warna & Label Pin
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePopupHouse(null)}
                                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition"
                            >
                                Tutup Popup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: PILIH ALAMAT RUMAH (TANPA INPUT KOORDINAT X/Y AGAR FLEKSIBEL & TIDAK RIBET) */}
            {configModalHouse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-6 py-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                                    📍
                                </span>
                                <div>
                                    <h3 className="text-base font-black tracking-tight">
                                        Pasang / Atur Pin Sonar Objek Rumah
                                    </h3>
                                    <p className="text-xs text-rose-100">
                                        Pilih alamat dari database KK (posisi otomatis terpasang pada titik yang Anda ketuk)
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfigModalHouse(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSavePin} className="p-6 space-y-5">
                            {/* PILIH RUMAH BLOK DARI DROPDOWN */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                                    Pilih Alamat / Unit Blok Rumah (Integrasi Database KK)
                                </label>
                                <select
                                    value={pinForm.data.rumah_blok_id}
                                    onChange={(e) => {
                                        const selected = rumahBloks.find((r) => String(r.id) === String(e.target.value));
                                        pinForm.setData({
                                            ...pinForm.data,
                                            rumah_blok_id: e.target.value,
                                            pin_label: selected?.pin_label || pinForm.data.pin_label,
                                            pin_color: selected?.pin_color || 'rose', // Default Merah Sonar
                                        });
                                    }}
                                    className="w-full text-xs font-bold rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500 py-2.5"
                                    required
                                >
                                    <option value="">-- Pilih Alamat / Blok Rumah --</option>
                                    {rumahBloks.map((r) => {
                                        const kkNama = getKepalaKeluargaName(r);
                                        const isPinned = Boolean(r.coord_x && r.coord_y);
                                        return (
                                            <option key={r.id} value={r.id}>
                                                Blok {r.blok}-{r.nomor_rumah} &bull; {kkNama} {isPinned ? '[📍 Sudah Ada Pin]' : '[⭕ Belum Ada Pin]'}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* PREVIEW INTEGRASI DATA KK YANG DIPILIH */}
                            {pinForm.data.rumah_blok_id && (
                                (() => {
                                    const selected = rumahBloks.find((r) => String(r.id) === String(pinForm.data.rumah_blok_id));
                                    if (!selected) return null;
                                    const kk = selected.keluargas && selected.keluargas[0];
                                    const kepalaNamaAkurat = getKepalaNameFromKK(kk);

                                    return (
                                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between font-extrabold text-emerald-950">
                                                <span>✓ Terintegrasi Data Rumah: Blok {selected.blok}-{selected.nomor_rumah}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] uppercase">
                                                    {selected.status_hunian}
                                                </span>
                                            </div>
                                            {kk ? (
                                                <div className="text-emerald-900">
                                                    <strong>Kepala Keluarga:</strong> {kepalaNamaAkurat || 'Kepala Keluarga'} (KK: {kk.no_kk})
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 italic">
                                                    Belum ada Kartu Keluarga terdaftar pada unit ini.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            )}

                            {/* LABEL INFORMATIF / KETERANGAN */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                                    Keterangan / Label Tambahan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={pinForm.data.pin_label}
                                    onChange={(e) => pinForm.setData('pin_label', e.target.value)}
                                    placeholder="Cth: Rumah Ketua RT 09 / Warung Sembako / Pos Security"
                                    className="w-full text-xs font-medium rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500 py-2.5"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Label akan muncul saat kursor didekatkan ke ikon pin.
                                </p>
                            </div>

                            {/* PILIHAN WARNA PIN SONAR */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 mb-2">
                                    Pilih Warna Tanda Pin Sonar Peta
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {[
                                        { id: 'rose', label: 'Merah Sonar', color: 'bg-rose-600', icon: '📍' },
                                        { id: 'emerald', label: 'Hijau Sonar', color: 'bg-emerald-600', icon: '🟢' },
                                        { id: 'amber', label: 'Kuning Sonar', color: 'bg-amber-500', icon: '🟡' },
                                        { id: 'purple', label: 'Ungu Sonar', color: 'bg-purple-600', icon: '🟣' },
                                        { id: 'blue', label: 'Biru Sonar', color: 'bg-blue-600', icon: '🔵' },
                                    ].map((col) => (
                                        <button
                                            key={col.id}
                                            type="button"
                                            onClick={() => pinForm.setData('pin_color', col.id)}
                                            className={`p-2.5 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-1 transition cursor-pointer ${
                                                pinForm.data.pin_color === col.id
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-base">{col.icon}</span>
                                            <span>{col.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* INFO TITIK LOKASI OTOMATIS (TANPA INPUT KOORDINAT MANUAL) */}
                            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">📍</span>
                                    <div>
                                        <span className="font-extrabold block text-slate-100">Titik Objek Rumah Terpilih</span>
                                        <span className="text-[11px] text-slate-400">Posisi otomatis diambil dari ketukan Anda di citra peta</span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-rose-400 font-mono text-[11px] font-bold">
                                    Siap Pasang
                                </span>
                            </div>

                            {/* Action Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                {configModalHouse && !configModalHouse.isNew && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePin(configModalHouse)}
                                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-extrabold transition cursor-pointer"
                                    >
                                        🗑️ Hapus Pin
                                    </button>
                                )}
                                <div className="flex items-center gap-2 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setConfigModalHouse(null)}
                                        className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={pinForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition cursor-pointer"
                                    >
                                        💾 Simpan Pin Sonar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: UPLOAD GAMBAR MAPPING RUMAH KUALITAS HD */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
                                    🛰️
                                </span>
                                <div>
                                    <h3 className="text-base font-black tracking-tight">
                                        Upload Citra Satelit Mapping Rumah HD
                                    </h3>
                                    <p className="text-xs text-cyan-200">
                                        Format resolusi tinggi (HD / Full HD Landscape)
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleUploadMap} className="p-6 space-y-5">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-xs text-cyan-950 space-y-1">
                                <p className="font-extrabold flex items-center gap-1.5">
                                    <span>💡</span>
                                    <span>Rekomendasi Pengaturan Gambar HD:</span>
                                </p>
                                <p className="text-cyan-800">
                                    Gunakan tangkapan layar (screenshot) atau foto drone dari <strong>Google Earth / Satelit</strong> berorientasi landscape minimal resolusi <strong>1920x1080px</strong> agar tanda pin berada tepat di atap rumah dan jernih saat di-zoom.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 mb-2">
                                    Pilih File Gambar Citra HD (Maks. 15 MB)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => mapUploadForm.setData('map_image', e.target.files[0])}
                                    className="w-full text-xs font-medium border border-gray-300 rounded-xl p-2.5 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                    required
                                />
                                {mapUploadForm.errors.map_image && (
                                    <p className="text-xs text-rose-600 font-bold mt-1">
                                        {mapUploadForm.errors.map_image}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setUploadModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={mapUploadForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-900 hover:from-slate-800 hover:to-cyan-800 text-white text-xs font-black shadow-md transition cursor-pointer"
                                >
                                    {mapUploadForm.processing ? 'Mengunggah HD...' : '⬆️ Upload Citra Peta HD'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
