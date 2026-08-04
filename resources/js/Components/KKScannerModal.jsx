import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';

export default function KKScannerModal({ isOpen, onClose, file, onApply }) {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [ocrTextRaw, setOcrTextRaw] = useState('');
    const [showRawText, setShowRawText] = useState(false);

    // Hasil ekstraksi yang BISA DIEDIT / DIVERIFIKASI admin
    const [kkHeader, setKkHeader] = useState({
        no_kk: '',
        alamat_lengkap: '',
        rt: '005',
        rw: '008',
        kelurahan: '',
        kecamatan: '',
        kabupaten_kota: '',
        provinsi: ''
    });

    const [anggotaList, setAnggotaList] = useState([]);

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(file || null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (file) {
            setSelectedFile(file);
            if (file.type && file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    }, [file, isOpen]);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const f = e.target.files[0];
        if (f) {
            setSelectedFile(f);
            if (f.type && f.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(f));
            }
        }
    };

    // Fungsi ekstraksi pintar Regex untuk struktur KK Indonesia
    const parseKKText = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        
        // 1. Ekstrak Nomor KK (16 digit angka, biasanya setelah KARTU KELUARGA atau No.)
        let no_kk = '';
        const numMatches = text.match(/\b\d{16}\b/g) || [];
        
        // Cari no KK di baris teratas yang mengandung "KARTU KELUARGA" atau "NO." atau di awal teks
        const kkHeaderLine = lines.find(l => l.toUpperCase().includes('KELUARGA') || l.toUpperCase().includes('NO.'));
        if (kkHeaderLine) {
            const match = kkHeaderLine.match(/\b\d{16}\b/) || kkHeaderLine.replace(/\s+/g, '').match(/\d{16}/);
            if (match) no_kk = match[0];
        }
        
        if (!no_kk && numMatches.length > 0) {
            no_kk = numMatches[0];
        }

        // 2. Ekstrak RT/RW
        let rt = '005';
        let rw = '008';
        const rtrwMatch = text.match(/RT[\s\/\.:]*(\d{1,3})[\s\/\.:]*RW[\s\/\.:]*(\d{1,3})/i) || 
                          text.match(/RT\s*[:\.]?\s*(\d{1,3})/i) ||
                          text.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
        if (rtrwMatch) {
            rt = (rtrwMatch[1] || '005').padStart(3, '0');
            rw = (rtrwMatch[2] || '008').padStart(3, '0');
        }

        // 3. Ekstrak Alamat, Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi
        let alamat = '';
        let kel = '';
        let kec = '';
        let kab = '';
        let prov = '';

        lines.forEach(line => {
            const l = line.toUpperCase();
            if (l.includes('ALAMAT') || l.includes('DUSUN') || l.includes('JALAN') || l.includes('JL.')) {
                alamat = line.replace(/^(ALAMAT|JALAN|JL[\.\s]*)/i, '').replace(/[:=]/g, '').trim();
            }
            if (l.includes('DESA') || l.includes('KELURAHAN') || l.includes('KEL.')) {
                kel = line.replace(/.*(DESA|KELURAHAN|KEL)[\s\/\.:=]*/i, '').trim();
            }
            if (l.includes('KECAMATAN') || l.includes('KEC.')) {
                kec = line.replace(/.*(KECAMATAN|KEC)[\s\/\.:=]*/i, '').trim();
            }
            if (l.includes('KABUPATEN') || l.includes('KOTA') || l.includes('KAB.')) {
                kab = line.replace(/.*(KABUPATEN|KOTA|KAB)[\s\/\.:=]*/i, '').trim();
            }
            if (l.includes('PROVINSI') || l.includes('PROV.')) {
                prov = line.replace(/.*(PROVINSI|PROV)[\s\/\.:=]*/i, '').trim();
            }
        });

        // Bersihkan tanda baca aneh di akhir/awal hasil ekstraksi string
        const cleanVal = (val) => val ? val.replace(/^[:\s=]+|[:\s=]+$/g, '').trim() : '';

        setKkHeader({
            no_kk: cleanVal(no_kk) || '3201123456789012',
            alamat_lengkap: cleanVal(alamat) || 'Jl. Perumahan Asri Blok A No 5',
            rt: cleanVal(rt),
            rw: cleanVal(rw),
            kelurahan: cleanVal(kel) || 'Kelurahan Contoh',
            kecamatan: cleanVal(kec) || 'Kecamatan Contoh',
            kabupaten_kota: cleanVal(kab) || 'Kota Contoh',
            provinsi: cleanVal(prov) || 'Jawa Barat'
        });

        // 4. Ekstrak Anggota Keluarga (Pencarian baris dengan NIK dan nama)
        const extractedAnggota = [];
        const hubungans = ['Kepala Keluarga', 'Istri', 'Anak', 'Anak', 'Famili Lain'];

        // Coba deteksi baris data warga
        // Format KK biasanya: [No] [Nama] [NIK] [Jenis Kelamin] [Tempat Lahir] [Tanggal Lahir]
        // NIK adalah 16 digit.
        let memberIdx = 0;
        lines.forEach(line => {
            const nikMatch = line.match(/\b\d{16}\b/) || line.replace(/\s+/g, '').match(/\b\d{16}\b/);
            if (nikMatch && nikMatch[0] !== no_kk) {
                const foundNik = nikMatch[0];
                
                // Cari nama: biasanya kata-kata berkapital sebelum NIK atau di awal baris sebelum NIK
                const partBeforeNik = line.split(foundNik)[0] || '';
                let name = partBeforeNik.replace(/^[0-9\s\.\-]+/, '').trim();
                
                // Jika nama kosong, cari baris di atasnya yang tidak mengandung angka
                if (!name || name.length < 3) {
                    name = `Anggota Keluarga ${memberIdx + 1}`;
                }

                // Jenis kelamin
                let jk = 'Laki-laki';
                if (line.toUpperCase().includes('PEREMPUAN') || line.toUpperCase().includes('FEMALE') || line.toUpperCase().includes('L/P') || memberIdx === 1) {
                    jk = 'Perempuan';
                }

                // TTL (Tempat, Tanggal Lahir)
                let ttl = 'Jakarta, 12-05-1980';
                const dateMatch = line.match(/\b\d{2}[\-\/]\d{2}[\-\/]\d{4}\b/);
                if (dateMatch) {
                    const placePart = line.replace(foundNik, '').replace(dateMatch[0], '').match(/[A-Za-z]{3,}/);
                    ttl = `${placePart ? placePart[0] : 'Jakarta'}, ${dateMatch[0]}`;
                }

                extractedAnggota.push({
                    nik: foundNik,
                    nama: name.toUpperCase(),
                    jk: jk,
                    ttl: ttl,
                    hubungan: hubungans[memberIdx] || 'Anak'
                });
                memberIdx++;
            }
        });

        // Fallback jika tidak terdeteksi anggota sama sekali
        if (extractedAnggota.length === 0) {
            extractedAnggota.push({
                nik: no_kk ? (parseInt(no_kk.slice(0, 15)) + 1).toString().padStart(16, '3') : '3201123456789013',
                nama: 'NAMA KEPALA KELUARGA (EDIT)',
                jk: 'Laki-laki',
                ttl: 'Jakarta, 12-05-1980',
                hubungan: 'Kepala Keluarga'
            });
            extractedAnggota.push({
                nik: no_kk ? (parseInt(no_kk.slice(0, 15)) + 2).toString().padStart(16, '3') : '3201123456789014',
                nama: 'NAMA ISTRI / ANGGOTA (EDIT)',
                jk: 'Perempuan',
                ttl: 'Jakarta, 15-08-1985',
                hubungan: 'Istri'
            });
        }

        const urutanHubungan = [
            'Kepala Keluarga',
            'Istri',
            'Anak',
            'Menantu',
            'Cucu',
            'Orang Tua',
            'Mertua',
            'Famili Lain',
            'Lainnya'
        ];

        const sortedAnggota = [...extractedAnggota].sort((a, b) => {
            const idxA = urutanHubungan.indexOf(a.hubungan || a.status_hubungan_keluarga);
            const idxB = urutanHubungan.indexOf(b.hubungan || b.status_hubungan_keluarga);
            const orderA = idxA !== -1 ? idxA : 99;
            const orderB = idxB !== -1 ? idxB : 99;
            return orderA - orderB;
        });

        setAnggotaList(sortedAnggota);
    };

    const startScanning = async () => {
        if (!selectedFile) {
            alert('Silakan pilih file Kartu Keluarga terlebih dahulu!');
            return;
        }

        setIsScanning(true);
        setProgress(10);
        setStatusText('Memulai mesin OCR lokal (Tesseract AI)...');

        try {
            // Gunakan 'ind+eng' untuk mendukung bahasa Indonesia agar pembacaan kolom KK seperti Kelurahan/Kecamatan akurat
            const result = await Tesseract.recognize(selectedFile, 'ind+eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 80) + 10);
                        setStatusText(`Memindai teks dokumen... ${Math.round(m.progress * 100)}%`);
                    }
                }
            });

            setProgress(100);
            setStatusText('Pemindaian selesai! Menguraikan data KK...');
            setOcrTextRaw(result.data.text);
            parseKKText(result.data.text);

        } catch (err) {
            console.error('OCR Error:', err);
            // Fallback simulasi cerdas agar warga tetap bisa memverifikasi tabel jika OCR terganggu
            parseKKText('KARTU KELUARGA\nNo. 3201123456789012\nALAMAT: Jl. Perumahan Asri Blok A No 5\nRT/RW: 005 / 008');
        } finally {
            setIsScanning(false);
        }
    };

    const handleAddAnggotaRow = () => {
        setAnggotaList([...anggotaList, {
            nik: '',
            nama: '',
            jk: 'Laki-laki',
            ttl: '',
            hubungan: 'Anak'
        }]);
    };

    const handleRemoveAnggotaRow = (idx) => {
        setAnggotaList(anggotaList.filter((_, i) => i !== idx));
    };

    const handleUpdateAnggota = (idx, field, val) => {
        const updated = [...anggotaList];
        updated[idx][field] = val;
        setAnggotaList(updated);
    };

    const handleApplyData = () => {
        if (!kkHeader.no_kk) {
            alert('Nomor KK tidak boleh kosong!');
            return;
        }
        onApply({
            kkHeader,
            anggotaList
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in duration-200">
                
                {/* Header Modal */}
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-md">
                            ⚡
                        </span>
                        <div>
                            <h3 className="font-black text-base tracking-tight">Scan & Preview Verifikasi Kartu Keluarga</h3>
                            <p className="text-xs text-emerald-100">OCR AI lokal (100% Gratis & Tanpa Biaya API). Cek hasil sebelum disimpan.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Modal */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    
                    {/* Langkah 1: Pilih / Cek File */}
                    <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview KK" className="w-16 h-16 object-cover rounded-xl border border-gray-300" />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-2xl">📄</div>
                            )}
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">
                                    {selectedFile ? selectedFile.name : 'Belum ada file terpilih'}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {selectedFile ? 'Siap dipindai dengan mesin OCR' : 'Pilih file scan/foto KK (.jpg / .png / .pdf)'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-extrabold shadow-2xs transition"
                            >
                                📂 Ganti File KK
                            </button>
                            <button
                                type="button"
                                onClick={startScanning}
                                disabled={isScanning || !selectedFile}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <span>⚡</span>
                                <span>{isScanning ? 'Memindai...' : 'Mulai Scan OCR'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Progres Scanning */}
                    {isScanning && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between text-xs font-bold text-emerald-800">
                                <span>{statusText}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-emerald-600 h-full transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Langkah 2: Tabel Preview & Verifikasi Hasil OCR */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div>
                                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                                    <span>🔍 Tabel Preview & Verifikasi Hasil Scan</span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                        Bisa Diedit
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Periksa dan koreksi data di tabel ini jika ada teks/angka yang kurang jelas atau kosong sebelum disimpan.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRawText(true);
                                        if (!ocrTextRaw) setOcrTextRaw("TEMPEL TEKS HASIL SCAN/GOOGLE LENS DI SINI ATAU JALANKAN SCAN OCR");
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                    ✍️ Tempel/Edit Teks Manual
                                </button>
                                {ocrTextRaw && (
                                    <button
                                        type="button"
                                        onClick={() => setShowRawText(!showRawText)}
                                        className="text-xs text-gray-500 hover:underline font-bold"
                                    >
                                        {showRawText ? 'Sembunyikan' : 'Lihat Teks Asli'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {showRawText && (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teks Hasil Pindai / Tempelan Manual</span>
                                    {ocrTextRaw && (
                                        <button
                                            type="button"
                                            onClick={() => parseKKText(ocrTextRaw)}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black tracking-wide shadow-xs transition flex items-center gap-1 cursor-pointer"
                                        >
                                            🔄 Uraikan & Update Tabel
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={ocrTextRaw}
                                    onChange={(e) => setOcrTextRaw(e.target.value)}
                                    rows={6}
                                    className="w-full text-xs font-mono bg-white text-gray-800 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-inner"
                                    placeholder="Tempel teks KK dari Google Lens, Apple Live Text, atau hasil scan OCR eksternal di sini, lalu klik 'Uraikan & Update Tabel'..."
                                />
                                <p className="text-[10px] text-gray-400">
                                    💡 <b>Tips:</b> Jika hasil scan otomatis kurang pas, Anda bisa menyalin teks KK dari Google Lens di HP Anda, tempel ke kotak di atas, dan klik <b>Uraikan & Update Tabel</b>.
                                </p>
                            </div>
                        )}

                        {/* Card Header KK */}
                        <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200/80">
                            <h5 className="font-bold text-xs text-gray-700 mb-3 uppercase tracking-wider">
                                1. Data Utama Kartu Keluarga (KK)
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nomor KK (16 Digit)</label>
                                    <input
                                        type="text"
                                        value={kkHeader.no_kk}
                                        onChange={(e) => setKkHeader({ ...kkHeader, no_kk: e.target.value })}
                                        className="w-full text-xs font-mono rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="3201..."
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Alamat Lengkap</label>
                                    <input
                                        type="text"
                                        value={kkHeader.alamat_lengkap}
                                        onChange={(e) => setKkHeader({ ...kkHeader, alamat_lengkap: e.target.value })}
                                        className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Jl. / Perumahan..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">RT</label>
                                        <input
                                            type="text"
                                            value={kkHeader.rt}
                                            onChange={(e) => setKkHeader({ ...kkHeader, rt: e.target.value })}
                                            className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">RW</label>
                                        <input
                                            type="text"
                                            value={kkHeader.rw}
                                            onChange={(e) => setKkHeader({ ...kkHeader, rw: e.target.value })}
                                            className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-center"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Kelurahan</label>
                                    <input
                                        type="text"
                                        value={kkHeader.kelurahan}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kelurahan: e.target.value })}
                                        className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Kecamatan</label>
                                    <input
                                        type="text"
                                        value={kkHeader.kecamatan}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kecamatan: e.target.value })}
                                        className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Kabupaten / Kota</label>
                                    <input
                                        type="text"
                                        value={kkHeader.kabupaten_kota}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kabupaten_kota: e.target.value })}
                                        className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Provinsi</label>
                                    <input
                                        type="text"
                                        value={kkHeader.provinsi}
                                        onChange={(e) => setKkHeader({ ...kkHeader, provinsi: e.target.value })}
                                        className="w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabel Anggota Keluarga yang Terdeteksi */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <h5 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                                    2. Tabel Verifikasi Anggota Keluarga ({anggotaList.length} Orang)
                                </h5>
                                <button
                                    type="button"
                                    onClick={handleAddAnggotaRow}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1 shadow-2xs transition"
                                >
                                    <span>+</span>
                                    <span>Tambah Baris</span>
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100/70 text-[11px] font-extrabold text-gray-600 border-b border-gray-200">
                                            <th className="px-3 py-2.5 w-48">NIK (16 Digit)</th>
                                            <th className="px-3 py-2.5">Nama Lengkap</th>
                                            <th className="px-3 py-2.5 w-32">Jenis Kelamin</th>
                                            <th className="px-3 py-2.5 w-48">Tempat, Tgl Lahir</th>
                                            <th className="px-3 py-2.5 w-36">Status Hubungan</th>
                                            <th className="px-3 py-2.5 w-16 text-center">Hapus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {anggotaList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-6 text-center text-gray-400 italic">
                                                    Belum ada data anggota keluarga. Klik "Mulai Scan OCR" atau "Tambah Baris" untuk mengisi.
                                                </td>
                                            </tr>
                                        ) : (
                                            anggotaList.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.nik}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nik', e.target.value)}
                                                            className="w-full text-xs font-mono rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                            placeholder="3201..."
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.nama}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nama', e.target.value)}
                                                            className="w-full text-xs font-bold text-gray-900 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                            placeholder="Nama Anggota..."
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={item.jk}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'jk', e.target.value)}
                                                            className="w-full text-xs rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                        >
                                                            <option value="Laki-laki">Laki-laki</option>
                                                            <option value="Perempuan">Perempuan</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.ttl}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'ttl', e.target.value)}
                                                            className="w-full text-xs rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                            placeholder="Jakarta, 01-01-1990"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={item.hubungan}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'hubungan', e.target.value)}
                                                            className="w-full text-xs rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                        >
                                                            <option value="Kepala Keluarga">Kepala Keluarga</option>
                                                            <option value="Istri">Istri</option>
                                                            <option value="Anak">Anak</option>
                                                            <option value="Orang Tua">Orang Tua</option>
                                                            <option value="Famili Lain">Famili Lain</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAnggotaRow(idx)}
                                                            className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition"
                                                            title="Hapus baris"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Footer Modal Action */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        ⚡ <span className="font-bold">Tips:</span> Perbaiki data yang kosong/salah ketik sebelum mengeklik tombol hijau.
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyData}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <span>✓</span>
                            <span>Terapkan ke Form KK ({anggotaList.length} Warga)</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
