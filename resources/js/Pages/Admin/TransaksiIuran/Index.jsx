import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

// ─── Helper Functions: Format Rupiah & Terbilang Bahasa Indonesia
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number || 0);
}

function terbilang(angka) {
    const bill = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    angka = Math.floor(Math.abs(Number(angka))) || 0;
    
    if (angka < 12) return bill[angka];
    if (angka < 20) return terbilang(angka - 10) + ' Belas';
    if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10);
    if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
    if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100);
    if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
    if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
    if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
    if (angka < 1000000000000) return terbilang(Math.floor(angka / 1000000000)) + ' Milyar ' + terbilang(angka % 1000000000);
    return 'Terlalu Besar';
}

function getTerbilangRupiah(nominal) {
    if (!nominal || isNaN(nominal) || nominal <= 0) return 'Nol Rupiah';
    const text = terbilang(nominal).replace(/\s+/g, ' ').trim();
    return text + ' Rupiah';
}

export default function Index({ transaksis, filters, summary, profilRt }) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || 'semua');
    const [bulan, setBulan] = useState(filters.bulan || '');
    const [tahun, setTahun] = useState(filters.tahun || '');

    // State Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [isKwitansiModalOpen, setIsKwitansiModalOpen] = useState(false);
    const [selectedKwitansi, setSelectedKwitansi] = useState(null);

    const printRef = useRef(null);

    // Form setup using Inertia useForm
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kategori_penyerahan: 'pengelolaan_sampah',
        tanggal_penyerahan: new Date().toISOString().split('T')[0],
        periode: '',
        jumlah_dana: '',
        penerima_nama: '',
        penerima_instansi: 'Pihak Pengelola Sampah (Pengurus RW)',
        penerima_jabatan: 'Ketua / Pengelola Sampah RW',
        penyerah_nama: profilRt?.nama_bendahara || 'Bendahara RT',
        penyerah_jabatan: 'Bendahara RT',
        metode_pembayaran: 'Tunai',
        catatan: '',
        status: 'Diserahkan',
        bukti_transfer: null,
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.transaksi-iuran.index'), { search, kategori, bulan, tahun }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setSearch('');
        setKategori('semua');
        setBulan('');
        setTahun('');
        router.get(route('admin.transaksi-iuran.index'), {}, { preserveState: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditItem(null);
        // Pre-fill defaults based on profilRt
        setData({
            kategori_penyerahan: 'pengelolaan_sampah',
            tanggal_penyerahan: new Date().toISOString().split('T')[0],
            periode: `Periode ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`,
            jumlah_dana: '',
            penerima_nama: '',
            penerima_instansi: 'Pihak Pengelola Sampah (Pengurus RW)',
            penerima_jabatan: 'Pengelola Sampah RW',
            penyerah_nama: profilRt?.nama_bendahara || 'Bendahara RT',
            penyerah_jabatan: 'Bendahara RT',
            metode_pembayaran: 'Tunai',
            catatan: '',
            status: 'Diserahkan',
            bukti_transfer: null,
        });
        setIsFormModalOpen(true);
    };

    const openEditModal = (item) => {
        clearErrors();
        setEditItem(item);
        setData({
            kategori_penyerahan: item.kategori_penyerahan,
            tanggal_penyerahan: item.tanggal_penyerahan ? item.tanggal_penyerahan.substring(0, 10) : '',
            periode: item.periode || '',
            jumlah_dana: item.jumlah_dana,
            penerima_nama: item.penerima_nama || '',
            penerima_instansi: item.penerima_instansi || '',
            penerima_jabatan: item.penerima_jabatan || '',
            penyerah_nama: item.penyerah_nama || '',
            penyerah_jabatan: item.penyerah_jabatan || '',
            metode_pembayaran: item.metode_pembayaran || 'Tunai',
            catatan: item.catatan || '',
            status: item.status || 'Diserahkan',
            bukti_transfer: null,
        });
        setIsFormModalOpen(true);
    };

    const handleKategoriChange = (val) => {
        let instansi = '';
        let jabatan = '';
        let sisaDana = 0;

        if (val === 'pengelolaan_sampah') {
            instansi = 'Pihak Pengelola Sampah (Pengurus RW)';
            jabatan = 'Pengelola Sampah RW';
            sisaDana = summary.sisa_dana_sampah > 0 ? summary.sisa_dana_sampah : '';
        } else if (val === 'dana_duka') {
            instansi = 'DKM Masjid Al-Ikhlas';
            jabatan = 'Pengurus DKM / Dana Duka';
            sisaDana = summary.sisa_dana_duka > 0 ? summary.sisa_dana_duka : '';
        } else {
            instansi = '';
            jabatan = '';
        }

        setData((prev) => ({
            ...prev,
            kategori_penyerahan: val,
            penerima_instansi: instansi,
            penerima_jabatan: jabatan,
            jumlah_dana: prev.jumlah_dana || sisaDana,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editItem) {
            // Put request for update
            post(route('admin.transaksi-iuran.update', editItem.id), {
                headers: {
                    '_method': 'PUT',
                },
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.transaksi-iuran.store'), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus catatan penyerahan No. ${item.nomor_kwitansi}?`)) {
            router.delete(route('admin.transaksi-iuran.destroy', item.id));
        }
    };

    const openKwitansiModal = (item) => {
        setSelectedKwitansi(item);
        setIsKwitansiModalOpen(true);
    };

    const handlePrintKwitansi = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        try {
            const element = document.getElementById('kwitansi-printable-area');
            if (!element) {
                alert('Elemen kwitansi tidak ditemukan!');
                return;
            }
            
            // Dynamic import to avoid SSR/Vite build issues
            const html2canvasModule = await import('html2canvas');
            const jsPDFModule = await import('jspdf');
            
            const html2canvas = html2canvasModule.default || html2canvasModule;
            const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

            // Render element to canvas
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            
            // Buat PDF A5 Landscape (210mm x 148.5mm)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a5'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // Posisikan di tengah vertikal jika canvas lebih pendek dari kertas A5
            const pageHeight = pdf.internal.pageSize.getHeight();
            const yPos = pdfHeight < pageHeight ? (pageHeight - pdfHeight) / 2 : 0;
            
            pdf.addImage(imgData, 'JPEG', 0, yPos, pdfWidth, pdfHeight);
            pdf.save(`Kwitansi_${selectedKwitansi?.nomor_kwitansi || 'Terima'}.pdf`);
            
        } catch (error) {
            console.error('Error saat membuat PDF:', error);
            alert('Gagal membuat PDF. Coba kembali beberapa saat. (Lihat console untuk detail error)');
        }
    };

    const getKategoriBadge = (kat) => {
        switch (kat) {
            case 'pengelolaan_sampah':
                return { label: '🧹 Iuran Kebersihan (Pengurus RW)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
            case 'dana_duka':
                return { label: '🕌 Dana Duka Cita (DKM Masjid)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
            default:
                return { label: '📦 Penyerahan Lainnya', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Transaksi Penyerahan Iuran & Kwitansi Digital</h2>}>
            <Head title="Transaksi Iuran - Modul Keuangan" />

            {/* CSS Print Rules khusus Kwitansi Digital */}
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    html, body {
                        width: 100vw !important;
                        height: 100vh !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #kwitansi-printable-area, #kwitansi-printable-area * {
                        visibility: visible !important;
                    }
                    #kwitansi-printable-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        padding: 10mm !important;
                        margin: 0 !important;
                        background: #ffffff !important;
                        box-sizing: border-box !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="py-6 max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
                
                {/* HEADER BANNER */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 border border-emerald-600/40 rounded-full text-xs font-black text-emerald-200 uppercase tracking-widest">
                                💼 Modul Keuangan RT
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white">Catatan Transaksi Penyerahan Iuran</h1>
                            <p className="text-xs text-emerald-200 max-w-2xl">
                                Pencatatan & penerbitan **Kwitansi Digital** untuk penyerahan dana Iuran Kebersihan kepada **Pihak Pengelola Sampah (Pengurus RW)** dan Dana Duka Cita kepada **DKM Masjid**.
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
                        >
                            <span className="text-base">🧾</span>
                            <span>+ Buat Transaksi Penyerahan Baru</span>
                        </button>
                    </div>
                </div>

                {/* SUMMARY STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Card 1: Penyerahan Iuran Sampah */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Iuran Sampah (Ke RW)</span>
                            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">🧹</span>
                        </div>
                        <p className="mt-3 text-xl font-black text-emerald-700">{formatRupiah(summary.total_penyerahan_sampah)}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-gray-500 border-t border-gray-100 pt-2">
                            <span>Terkumpul: {formatRupiah(summary.total_terkumpul_kebersihan)}</span>
                            <span className={summary.sisa_dana_sampah > 0 ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                                {summary.sisa_dana_sampah > 0 ? `Sisa: ${formatRupiah(summary.sisa_dana_sampah)}` : '✓ Lunas Terpenuhi'}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Penyerahan Dana Duka */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Dana Duka (Ke DKM)</span>
                            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">🕌</span>
                        </div>
                        <p className="mt-3 text-xl font-black text-indigo-700">{formatRupiah(summary.total_penyerahan_duka)}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-gray-500 border-t border-gray-100 pt-2">
                            <span>Terkumpul: {formatRupiah(summary.total_terkumpul_duka)}</span>
                            <span className={summary.sisa_dana_duka > 0 ? 'text-amber-600 font-extrabold' : 'text-indigo-600 font-extrabold'}>
                                {summary.sisa_dana_duka > 0 ? `Sisa: ${formatRupiah(summary.sisa_dana_duka)}` : '✓ Lunas Terpenuhi'}
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Total Penyerahan Lainnya */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Penyerahan Lainnya</span>
                            <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg font-bold">📦</span>
                        </div>
                        <p className="mt-3 text-xl font-black text-teal-700">{formatRupiah(summary.total_penyerahan_lainnya)}</p>
                        <p className="mt-2 text-[11px] font-bold text-gray-400 border-t border-gray-100 pt-2">Alokasi Penyerahan Non-Rutin</p>
                    </div>

                    {/* Card 4: Total Keseluruhan Penyerahan */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Total Penyerahan</span>
                            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">📊</span>
                        </div>
                        <p className="mt-3 text-xl font-black text-gray-900">{formatRupiah(summary.total_keseluruhan)}</p>
                        <p className="mt-2 text-[11px] font-bold text-emerald-600 border-t border-gray-100 pt-2">Total Dana Diserahkan</p>
                    </div>
                </div>

                {/* FILTER SEARCH BAR */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari No Kwitansi, Penerima, Instansi..."
                                className="pl-9 text-xs font-semibold w-full rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <select
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className="text-xs font-bold rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 w-full md:w-auto"
                        >
                            <option value="semua">Semua Kategori</option>
                            <option value="pengelolaan_sampah">🧹 Iuran Sampah (Pengurus RW)</option>
                            <option value="dana_duka">🕌 Dana Duka Cita (DKM Masjid)</option>
                            <option value="lainnya">📦 Penyerahan Lainnya</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer w-full md:w-auto"
                        >
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer w-full md:w-auto"
                        >
                            Reset
                        </button>
                    </form>
                </div>

                {/* TABLE OF TRANSACTIONS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-extrabold border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4">No. Kwitansi</th>
                                    <th className="py-3 px-4">Kategori & Instansi</th>
                                    <th className="py-3 px-4">Tanggal & Periode</th>
                                    <th className="py-3 px-4">Penerima & Penyerah</th>
                                    <th className="py-3 px-4">Nominal (Rp)</th>
                                    <th className="py-3 px-4">Metode</th>
                                    <th className="py-3 px-4 text-center">Kwitansi & Akses</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {transaksis.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-400 font-bold">
                                            Belum ada catatan transaksi penyerahan iuran. Klik "+ Buat Transaksi Penyerahan Baru" untuk menambahkan.
                                        </td>
                                    </tr>
                                ) : (
                                    transaksis.data.map((item) => {
                                        const katBadge = getKategoriBadge(item.kategori_penyerahan);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                                                
                                                {/* No Kwitansi */}
                                                <td className="py-3.5 px-4 font-mono font-black text-gray-900 whitespace-nowrap">
                                                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                                        {item.nomor_kwitansi}
                                                    </span>
                                                </td>

                                                {/* Kategori & Instansi */}
                                                <td className="py-3.5 px-4 space-y-1">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${katBadge.bg}`}>
                                                        {katBadge.label}
                                                    </span>
                                                    <p className="font-extrabold text-gray-900">{item.penerima_instansi}</p>
                                                </td>

                                                {/* Tanggal & Periode */}
                                                <td className="py-3.5 px-4">
                                                    <p className="font-bold text-gray-900">
                                                        {new Date(item.tanggal_penyerahan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 font-semibold">{item.periode || '-'}</p>
                                                </td>

                                                {/* Penerima & Penyerah */}
                                                <td className="py-3.5 px-4 space-y-0.5">
                                                    <p className="text-gray-900 font-extrabold">📥 {item.penerima_nama}</p>
                                                    <p className="text-[11px] text-gray-500">📤 Diserahkan: {item.penyerah_nama}</p>
                                                </td>

                                                {/* Nominal */}
                                                <td className="py-3.5 px-4 font-black text-emerald-700 text-sm whitespace-nowrap">
                                                    {formatRupiah(item.jumlah_dana)}
                                                </td>

                                                {/* Metode */}
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[10px] border border-gray-200">
                                                        💳 {item.metode_pembayaran}
                                                    </span>
                                                </td>

                                                {/* Akses Aksi */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => openKwitansiModal(item)}
                                                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-lg text-xs transition cursor-pointer flex items-center gap-1 border border-indigo-200"
                                                            title="Cetak / Lihat Kwitansi Digital"
                                                        >
                                                            <span>🧾 Kwitansi</span>
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition cursor-pointer border border-amber-200"
                                                            title="Edit Transaksi"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition cursor-pointer border border-rose-200"
                                                            title="Hapus Transaksi"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ════════════════════════════════════════════════════════════════════════════════════ */}
            {/* MODAL FORM TAMBAH / EDIT TRANSAKSI PENYERAHAN */}
            {/* ════════════════════════════════════════════════════════════════════════════════════ */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                                    🧾
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">
                                        {editItem ? 'Edit Transaksi Penyerahan Iuran' : 'Tambah Transaksi Penyerahan Iuran'}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Catat dana yang diserahkan ke Pihak Pengelola Sampah (RW) atau DKM Masjid.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFormModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
                            
                            {/* Kategori Penyerahan */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                                    Kategori Penyerahan Dana *
                                </label>
                                <select
                                    value={data.kategori_penyerahan}
                                    onChange={(e) => handleKategoriChange(e.target.value)}
                                    className="w-full rounded-xl border-gray-200 font-bold text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="pengelolaan_sampah">🧹 Iuran Kebersihan & Sampah (Ke Pengurus RW)</option>
                                    <option value="dana_duka">🕌 Dana Duka Cita (Ke DKM Masjid)</option>
                                    <option value="lainnya">📦 Penyerahan Dana Lainnya</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Tanggal Penyerahan */}
                                <div>
                                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                                        Tanggal Penyerahan *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal_penyerahan}
                                        onChange={(e) => setData('tanggal_penyerahan', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                        required
                                    />
                                    {errors.tanggal_penyerahan && <p className="mt-1 text-red-500 text-[11px]">{errors.tanggal_penyerahan}</p>}
                                </div>

                                {/* Periode */}
                                <div>
                                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                                        Periode Iuran
                                    </label>
                                    <input
                                        type="text"
                                        value={data.periode}
                                        onChange={(e) => setData('periode', e.target.value)}
                                        placeholder="Misal: Periode Agustus 2026"
                                        className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Nominal Dana */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                                    Jumlah Dana Diserahkan (Rp) *
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-bold">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        value={data.jumlah_dana}
                                        onChange={(e) => setData('jumlah_dana', e.target.value)}
                                        placeholder="0"
                                        className="pl-9 w-full rounded-xl border-gray-200 font-extrabold text-emerald-700 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                {data.jumlah_dana > 0 && (
                                    <p className="mt-1 text-[11px] text-emerald-800 font-extrabold italic bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                                        # Terbilang: {getTerbilangRupiah(data.jumlah_dana)} #
                                    </p>
                                )}
                                {errors.jumlah_dana && <p className="mt-1 text-red-500 text-[11px]">{errors.jumlah_dana}</p>}
                            </div>

                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📥 Data Pihak Penerima (Pihak Luar/RW/DKM)</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Pihak Penerima *</label>
                                        <input
                                            type="text"
                                            value={data.penerima_nama}
                                            onChange={(e) => setData('penerima_nama', e.target.value)}
                                            placeholder="Nama Lengkap Penerima"
                                            className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Instansi / Lembaga Penerima *</label>
                                        <input
                                            type="text"
                                            value={data.penerima_instansi}
                                            onChange={(e) => setData('penerima_instansi', e.target.value)}
                                            placeholder="Pengurus RW 05 / DKM Masjid"
                                            className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📤 Data Pihak Penyerah (Pengurus RT)</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Penyerah *</label>
                                        <input
                                            type="text"
                                            value={data.penyerah_nama}
                                            onChange={(e) => setData('penyerah_nama', e.target.value)}
                                            placeholder="Bendahara / Ketua RT"
                                            className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Metode Pembayaran *</label>
                                        <select
                                            value={data.metode_pembayaran}
                                            onChange={(e) => setData('metode_pembayaran', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                        >
                                            <option value="Tunai">Tunai (Cash)</option>
                                            <option value="Transfer Bank">Transfer Bank</option>
                                            <option value="QRIS">QRIS</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                                    Catatan / Keterangan Penyerahan
                                </label>
                                <textarea
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                    rows="2"
                                    placeholder="Rincian tambahan penyerahan..."
                                    className="w-full rounded-xl border-gray-200 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                ></textarea>
                            </div>

                            {/* Upload Bukti Transfer */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                                    Upload Bukti Penyerahan / Transfer (Foto/PDF)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setData('bukti_transfer', e.target.files[0])}
                                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : editItem ? 'Perbarui Transaksi' : 'Simpan & Terbit Kwitansi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════════════════ */}
            {/* MODAL KWITANSI DIGITAL FORMAL (VIEW & PRINT READY) */}
            {/* ════════════════════════════════════════════════════════════════════════════════════ */}
            {isKwitansiModalOpen && selectedKwitansi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm overflow-y-auto sm:p-4 print:bg-white print:p-0">
                    <div className="bg-white shadow-2xl relative flex flex-col mx-auto print:shadow-none print:w-full print:max-w-none" style={{ width: '28cm', maxWidth: '100vw' }}>
                        
                        {/* Header Action Buttons (Hidden when printing) */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-3 bg-gray-50 no-print">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🧾</span>
                                <h3 className="text-base font-black text-gray-900">Kwitansi Digital Formal</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>💾</span>
                                    <span>Save to PDF</span>
                                </button>
                                <button
                                    onClick={handlePrintKwitansi}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>🖨️</span>
                                    <span>Cetak Kwitansi</span>
                                </button>
                                <button
                                    onClick={() => setIsKwitansiModalOpen(false)}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer"
                                >
                                    ✕ Tutup
                                </button>
                            </div>
                        </div>

                        {/* ─── PRINTABLE DOCUMENT BODY ─── */}
                        <div className="overflow-x-auto">
                            <div id="kwitansi-printable-area" ref={printRef} className="p-8 bg-white text-gray-900 relative font-sans flex-shrink-0" style={{ width: '100%', minHeight: '15cm' }}>
                            
                            {/* Header Kop Kwitansi */}
                            <div className="flex items-center gap-5 mb-4">
                                {profilRt?.logo_path ? (
                                    <img src={`/storage/${profilRt.logo_path}`} alt="Logo RT" className="h-20 w-20 object-contain" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-emerald-900 text-white font-black text-2xl flex items-center justify-center border-2 border-emerald-700 flex-shrink-0">
                                        RT
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-black text-red-700 uppercase tracking-wide">
                                        {profilRt?.nama_rt || 'PORTAL LINGKUNGAN RT 09 / RW 06'}
                                    </h2>
                                    <p className="text-[13px] font-medium text-gray-800 mt-1 leading-tight max-w-[90%]">
                                        {profilRt?.alamat || 'Puri Delta Residence, Kelurahan Delta, Kab. Bekasi'}
                                    </p>
                                    <p className="text-[12px] text-gray-600 font-bold mt-0.5">
                                        Telp/WA: {profilRt?.nomor_wa || '0812-3456-7890'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Thick Red Line */}
                            <div className="w-full border-t-[3px] border-red-700 mb-5"></div>

                            {/* Title */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black uppercase tracking-widest inline-block border-b-[2px] border-gray-900 pb-1">
                                    KWITANSI / TANDA TERIMA
                                </h3>
                            </div>

                            {/* Content Rincian Kwitansi */}
                            <div className="space-y-4 text-sm font-semibold text-gray-800 px-2">
                                
                                <div className="flex items-end">
                                    <span className="w-48 italic flex-shrink-0 text-[13px]">No. Transaksi</span>
                                    <span className="mr-3 mb-0.5">:</span>
                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 font-extrabold text-[13px]">
                                        {selectedKwitansi.nomor_kwitansi}
                                    </span>
                                </div>

                                <div className="flex items-end">
                                    <span className="w-48 italic flex-shrink-0 text-[13px]">Telah diterima dari</span>
                                    <span className="mr-3 mb-0.5">:</span>
                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 font-extrabold uppercase text-[13px]">
                                        {selectedKwitansi.penyerah_nama} ({selectedKwitansi.penyerah_jabatan || 'Pengurus RT'})
                                    </span>
                                </div>

                                <div className="flex items-end">
                                    <span className="w-48 italic flex-shrink-0 text-[13px]">Banyaknya uang</span>
                                    <span className="mr-3 mb-0.5">:</span>
                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5">
                                        <span className="bg-gray-100 px-3 py-1 font-extrabold italic text-[13px]">
                                            # {getTerbilangRupiah(selectedKwitansi.jumlah_dana)} #
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-end">
                                    <span className="w-48 italic flex-shrink-0 text-[13px]">Untuk Pembayaran</span>
                                    <span className="mr-3 mb-0.5">:</span>
                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 font-extrabold leading-tight text-[13px]">
                                        {selectedKwitansi.catatan || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="mt-8 flex items-end justify-between px-2 pb-2">
                                {/* Big Amount Box */}
                                <div className="bg-gray-100 text-gray-900 px-8 py-2 rounded-lg font-black text-xl border border-gray-200">
                                    {formatRupiah(selectedKwitansi.jumlah_dana)}
                                </div>

                                {/* Signature Box */}
                                <div className="text-center text-[12px] font-medium mr-4">
                                    <p className="mb-0.5 text-gray-800">
                                        {profilRt?.alamat ? profilRt.alamat.split(',').pop().trim() : 'Bekasi'}, {new Date(selectedKwitansi.tanggal_penyerahan).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="mb-12 text-gray-800">Yang Menerima,</p>
                                    
                                    <div className="inline-block border-b border-gray-900 font-extrabold text-gray-900 px-4 pb-0.5 min-w-[160px] text-sm">
                                        {selectedKwitansi.penerima_nama}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

        </AdminLayout>
    );
}
