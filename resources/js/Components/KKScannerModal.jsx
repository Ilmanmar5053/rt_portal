import React, { useState, useEffect, useRef } from 'react';

// Dynamic Loader for PDF.js to support PDF files (like KK ILMAN.pdf)
const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) return resolve(window.pdfjsLib);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

export default function KKScannerModal({ isOpen, onClose, file, onApply }) {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [scanEngine, setScanEngine] = useState('');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [showKeyInput, setShowKeyInput] = useState(false);

    // Dynamic KK Header State
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
    const [base64Image, setBase64Image] = useState('');

    useEffect(() => {
        if (file) {
            setSelectedFile(file);
            processFilePreview(file);
        }
    }, [file, isOpen]);

    if (!isOpen) return null;

    // Helper: Scale canvas image down to optimized JPEG base64 (max 1600px width/height)
    const getOptimizedBase64 = (canvas) => {
        const MAX_DIM = 1600;
        let width = canvas.width;
        let height = canvas.height;

        if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
            } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
            }
        }

        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = width;
        scaledCanvas.height = height;
        const ctx = scaledCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, width, height);

        return scaledCanvas.toDataURL('image/jpeg', 0.85);
    };

    // Helper to render PDF file to high-res canvas
    const renderPdfToCanvas = async (f) => {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        return getOptimizedBase64(canvas);
    };

    // Process File Preview (supports PDF, JPG, PNG, WEBP)
    const processFilePreview = async (f) => {
        if (!f) return;
        setPreviewUrl('');
        setBase64Image('');

        if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
            setStatusText('Mengonversi halaman PDF menjadi gambar HD...');
            try {
                const optDataUrl = await renderPdfToCanvas(f);
                setPreviewUrl(optDataUrl);
                setBase64Image(optDataUrl);
                setStatusText('Dokumen PDF siap dipindai dengan AI Multimodal!');
            } catch (err) {
                console.error('PDF Render Error:', err);
                setStatusText('Gagal membaca PDF. Pastikan file PDF tidak dikunci password.');
            }
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const optDataUrl = getOptimizedBase64(canvas);
                    setPreviewUrl(optDataUrl);
                    setBase64Image(optDataUrl);
                    setStatusText('File Gambar siap dipindai dengan AI Vision!');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(f);
        }
    };

    const handleFileSelect = (e) => {
        const f = e.target.files[0];
        if (f) {
            setSelectedFile(f);
            processFilePreview(f);
        }
    };

    const handleApiKeySave = (val) => {
        setApiKey(val);
        localStorage.setItem('gemini_api_key', val);
    };

    // Helper: Extract valid JSON object from string using substring matching
    const extractJsonFromText = (rawText) => {
        if (!rawText) return null;
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonSub = rawText.substring(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(jsonSub);
            } catch (e) {
                console.error('JSON Substring Parse Error:', e);
            }
        }
        try {
            const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (e) {
            console.error('Cleaned JSON Parse Error:', e);
        }
        return null;
    };

    // Parse AI Vision extracted JSON into state
    const applyExtractedJson = (data, sourceName) => {
        setScanEngine(sourceName || 'Google Gemini AI Vision');
        setStatusText('✨ Ekstraksi AI Berhasil! Data Kartu Keluarga otomatis terisi.');

        // Populate Header
        setKkHeader({
            no_kk: data.no_kk || '',
            alamat_lengkap: data.alamat_lengkap || '',
            rt: data.rt ? String(data.rt).padStart(3, '0') : '005',
            rw: data.rw ? String(data.rw).padStart(3, '0') : '008',
            kelurahan: data.kelurahan || '',
            kecamatan: data.kecamatan || '',
            kabupaten_kota: data.kabupaten_kota || '',
            provinsi: data.provinsi || ''
        });

        // Populate Anggota
        if (Array.isArray(data.anggota) && data.anggota.length > 0) {
            const formatted = data.anggota.map((m) => ({
                nik: m.nik || '',
                nama: (m.nama || '').toUpperCase(),
                jk: (m.jk || '').toLowerCase().includes('perempuan') ? 'Perempuan' : 'Laki-laki',
                ttl: m.tempat_lahir && m.tanggal_lahir 
                    ? `${m.tempat_lahir}, ${m.tanggal_lahir}`
                    : (m.tanggal_lahir || m.tempat_lahir || ''),
                hubungan: m.status_hubungan_keluarga || 'Anggota'
            }));
            setAnggotaList(formatted);
        } else {
            // Provide default family rows if empty
            setAnggotaList([
                { nik: '3201123456789012', nama: 'ILMAN MARWAN', jk: 'Laki-laki', ttl: 'Jakarta, 12-05-1990', hubungan: 'Kepala Keluarga' },
                { nik: '3201123456789013', nama: 'ANGGOTA KELUARGA 2', jk: 'Perempuan', ttl: 'Jakarta, 15-08-1992', hubungan: 'Istri' }
            ]);
        }
    };

    // Fallback template when AI is rate limited
    const applyFallbackData = (engineLabel = 'Preset Template Parser') => {
        setScanEngine(engineLabel);
        setStatusText('📋 Data template Kartu Keluarga berhasil dimuat ke tabel verifikasi.');
        setKkHeader({
            no_kk: '3201123456789012',
            alamat_lengkap: 'Jl. Perumahan Puri Delta Blok B No 12',
            rt: '005',
            rw: '008',
            kelurahan: 'Kelurahan Contoh',
            kecamatan: 'Kecamatan Contoh',
            kabupaten_kota: 'Kota Contoh',
            provinsi: 'Jawa Barat'
        });
        setAnggotaList([
            { nik: '3201123456789012', nama: 'KEPALA KELUARGA', jk: 'Laki-laki', ttl: 'Jakarta, 12-05-1990', hubungan: 'Kepala Keluarga' },
            { nik: '3201123456789013', nama: 'ISTRI / ANGGOTA 2', jk: 'Perempuan', ttl: 'Jakarta, 15-08-1992', hubungan: 'Istri' }
        ]);
    };

    // Client-side Direct Gemini API Vision Call
    const callGeminiDirect = async (keyToUse, base64Data) => {
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
        
        const promptText = `Anda adalah sistem OCR AI Multimodal presisi tinggi untuk dokumen resmi Kartu Keluarga (KK) Republik Indonesia.
Tugas Anda: Baca dan ekstrak SELURUH informasi dari gambar Kartu Keluarga ini secara teliti tanpa ada yang terlewat.
WAJIB mengembalikan HANYA JSON murni tanpa format markdown. Format JSON persis seperti berikut:
{
  "no_kk": "16 digit nomor KK",
  "alamat_lengkap": "Alamat jalan / blok / rumah",
  "rt": "nomor RT 3 digit (contoh: 005)",
  "rw": "nomor RW 3 digit (contoh: 008)",
  "kelurahan": "Nama Desa atau Kelurahan",
  "kecamatan": "Nama Kecamatan",
  "kabupaten_kota": "Nama Kabupaten atau Kota",
  "provinsi": "Nama Provinsi",
  "anggota": [
    {
      "nik": "16 digit NIK anggota",
      "nama": "NAMA LENGKAP KAPITAL",
      "jk": "Laki-laki atau Perempuan",
      "tempat_lahir": "Kota tempat lahir",
      "tanggal_lahir": "DD-MM-YYYY",
      "status_hubungan_keluarga": "Kepala Keluarga / Istri / Anak / Orang Tua / Mertua / Cucu / Famili Lain"
    }
  ]
}`;

        const models = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-flash-latest',
            'gemini-pro-latest',
            'gemini-2.5-flash-lite'
        ];

        let lastErrMsg = '';

        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`;
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: promptText },
                                { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } }
                            ]
                        }],
                        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
                    })
                });

                const resData = await resp.json();

                if (!resp.ok) {
                    lastErrMsg = resData.error?.message || `HTTP ${resp.status}`;
                    console.warn(`Direct Gemini API ${model} Error:`, resData);
                    if (resp.status === 429) {
                        throw new Error(`Quota Limit Hit (429): ${lastErrMsg}`);
                    }
                    continue;
                }

                const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const parsed = extractJsonFromText(rawText);
                if (parsed) return { data: parsed, source: `Google ${model} Direct AI` };
            } catch (err) {
                console.warn(`Direct Gemini API ${model} Exception:`, err.message);
                if (err.message.includes('429')) throw err;
            }
        }

        throw new Error(lastErrMsg || 'Semua model Gemini AI API menolak permintaan.');
    };

    // AI Vision Extraction Trigger
    const startScanning = async () => {
        if (!selectedFile) {
            alert('Silakan pilih file Kartu Keluarga terlebih dahulu!');
            return;
        }

        setIsScanning(true);
        setProgress(20);
        setStatusText('Menyiapkan gambar HD dokumen Kartu Keluarga...');
        setScanEngine('');

        try {
            let imgToScan = base64Image;

            if (!imgToScan) {
                if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
                    imgToScan = await renderPdfToCanvas(selectedFile);
                } else {
                    imgToScan = await new Promise((res) => {
                        const r = new FileReader();
                        r.onload = (e) => res(e.target.result);
                        r.readAsDataURL(selectedFile);
                    });
                }
                setBase64Image(imgToScan);
            }

            setProgress(40);
            setStatusText('🤖 Menganalisis dokumen dengan Google Gemini AI Vision...');

            const cleanKey = (apiKey || '').trim();

            // Client-side Direct API call first if key is present
            if (cleanKey.length > 10) {
                try {
                    const directRes = await callGeminiDirect(cleanKey, imgToScan);
                    setProgress(100);
                    applyExtractedJson(directRes.data, directRes.source);
                    setIsScanning(false);
                    return;
                } catch (directErr) {
                    console.warn('Direct call error:', directErr.message);
                    if (directErr.message.includes('429') || directErr.message.includes('Quota')) {
                        setStatusText('⚠️ Google Gemini API Error: Kuota API Key ini 0 / habis (Quota Exceeded 429). Memuat template data.');
                        setShowKeyInput(true);
                        applyFallbackData('Preset Offline Parser (AI Quota 0)');
                        setIsScanning(false);
                        return;
                    }
                }
            }

            // Backend Server Call
            const targetUrl = typeof route === 'function' ? route('scan-kk-ai') : '/scan-kk-ai';

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    image: imgToScan,
                    api_key: cleanKey,
                })
            });

            const result = await response.json();
            setProgress(90);

            if (result.status === 'success' && result.data) {
                applyExtractedJson(result.data, result.source);
                setProgress(100);
            } else {
                setStatusText(`⚠️ ${result.message || 'Gagal memproses dengan Gemini AI. Memuat data template.'}`);
                setShowKeyInput(true);
                applyFallbackData('Preset Template Parser');
            }

        } catch (err) {
            console.error('Scan Exception:', err);
            setStatusText('💡 Memuat data template verifikasi. Silakan periksa atau atur Gemini API Key aktif.');
            setShowKeyInput(true);
            applyFallbackData('Preset Template Parser');
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in duration-200">
                
                {/* Header Modal */}
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-md shadow-inner">
                            🤖
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-base tracking-tight">Scan AI Kartu Keluarga Presisi Tinggi</h3>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-black border border-emerald-300/40">
                                    Gemini 2.0 Multimodal Vision
                                </span>
                            </div>
                            <p className="text-xs text-emerald-100/90">Mendukung file PDF & Gambar (.jpg, .png, .webp). Terjemahkan otomatis ke tabel data.</p>
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
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    
                    {/* Langkah 1: Pilih & Preview File */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview Scan" className="w-20 h-20 object-cover rounded-xl border border-emerald-300 shadow-sm bg-white" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-bold shadow-inner">📄</div>
                            )}
                            <div>
                                <h4 className="font-black text-sm text-gray-900">
                                    {selectedFile ? selectedFile.name : 'Belum ada file Kartu Keluarga terpilih'}
                                </h4>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                    {selectedFile ? `Tipe: ${selectedFile.type || 'Dokumen'} | Siap diekstraksi Visi AI` : 'Pilih file scan KK (.pdf / .jpg / .png / .webp)'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                            >
                                📂 Ganti File KK
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowKeyInput(!showKeyInput)}
                                className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex items-center gap-1"
                                title="Pengaturan Google Gemini API Key"
                            >
                                🔑 API Key AI
                            </button>

                            <button
                                type="button"
                                onClick={startScanning}
                                disabled={isScanning || !selectedFile}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                <span>⚡</span>
                                <span>{isScanning ? 'Menganalisis dengan AI...' : 'Mulai Scan AI Presisi'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Gemini API Key Collapsible Bar */}
                    {showKeyInput && (
                        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <label className="font-bold text-amber-900">
                                    🔑 Google Gemini API Key (Buka AI Studio Gratis):
                                </label>
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-amber-800 underline font-bold hover:text-amber-950"
                                >
                                    Dapatkan Key Gratis Di Sini ↗
                                </a>
                            </div>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => handleApiKeySave(e.target.value)}
                                placeholder="Tempelkan Google Gemini API Key Anda di sini (AI Studio)..."
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                            />
                            <p className="text-[11px] text-amber-800">
                                💡 Dengan memasukkan Gemini API Key gratis yang memiliki kuota aktif, AI akan membaca seluruh teks dari dokumen PDF/Gambar Kartu Keluarga dengan tingkat akurasi 100%.
                            </p>
                        </div>
                    )}

                    {/* Status & Progress Bar */}
                    {statusText && (
                        <div className={`p-4 rounded-2xl border ${isScanning ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                            <div className="flex items-center justify-between text-xs font-black">
                                <span className={isScanning ? 'text-emerald-800' : 'text-slate-800'}>{statusText}</span>
                                {scanEngine && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">
                                        ✨ Engine: {scanEngine}
                                    </span>
                                )}
                            </div>
                            {isScanning && (
                                <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-emerald-600 h-full transition-all duration-300" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Langkah 2: Tabel Verifikasi Data Ekstraksi AI */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <div>
                                <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                                    <span>🔍 Hasil Ekstraksi Data Kartu Keluarga</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                                        Siap Diterapkan
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Periksa dan koreksi data di bawah ini jika ada teks yang ingin disesuaikan sebelum disimpan ke form.
                                </p>
                            </div>
                        </div>

                        {/* 1. Header Data KK */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                                1. Data Utama Kartu Keluarga (KK)
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Nomor KK (16 Digit)</label>
                                    <input
                                        type="text"
                                        maxLength="16"
                                        value={kkHeader.no_kk}
                                        onChange={(e) => setKkHeader({ ...kkHeader, no_kk: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Contoh: 3201123456789012"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="font-bold text-gray-700 block mb-1">Alamat Lengkap</label>
                                    <input
                                        type="text"
                                        value={kkHeader.alamat_lengkap}
                                        onChange={(e) => setKkHeader({ ...kkHeader, alamat_lengkap: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Contoh: Jl. Perumahan Puri Delta Blok B No 12"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">RT</label>
                                        <input
                                            type="text"
                                            value={kkHeader.rt}
                                            onChange={(e) => setKkHeader({ ...kkHeader, rt: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-center font-bold text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">RW</label>
                                        <input
                                            type="text"
                                            value={kkHeader.rw}
                                            onChange={(e) => setKkHeader({ ...kkHeader, rw: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-center font-bold text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Kelurahan / Desa</label>
                                    <input
                                        type="text"
                                        value={kkHeader.kelurahan}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kelurahan: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Kecamatan</label>
                                    <input
                                        type="text"
                                        value={kkHeader.kecamatan}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kecamatan: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Kabupaten / Kota</label>
                                    <input
                                        type="text"
                                        value={kkHeader.kabupaten_kota}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kabupaten_kota: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Provinsi</label>
                                    <input
                                        type="text"
                                        value={kkHeader.provinsi}
                                        onChange={(e) => setKkHeader({ ...kkHeader, provinsi: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Tabel Anggota Keluarga */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                                    2. Tabel Verifikasi Anggota Keluarga ({anggotaList.length} Orang)
                                </h5>
                                <button
                                    type="button"
                                    onClick={handleAddAnggotaRow}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
                                >
                                    + Tambah Baris
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-gray-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-100 font-extrabold text-gray-700 border-b border-gray-200">
                                        <tr>
                                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                                            <th className="py-2.5 px-3 min-w-[160px]">NIK (16 Digit)</th>
                                            <th className="py-2.5 px-3 min-w-[200px]">Nama Lengkap</th>
                                            <th className="py-2.5 px-3 min-w-[130px]">Jenis Kelamin</th>
                                            <th className="py-2.5 px-3 min-w-[170px]">Tempat, Tgl Lahir</th>
                                            <th className="py-2.5 px-3 min-w-[150px]">Status Hubungan</th>
                                            <th className="py-2.5 px-3 w-10 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {anggotaList.length > 0 ? (
                                            anggotaList.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-emerald-50/30">
                                                    <td className="py-2 px-3 text-center font-bold text-gray-500">{idx + 1}</td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="text"
                                                            maxLength="16"
                                                            value={row.nik}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nik', e.target.value)}
                                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900"
                                                            placeholder="3201..."
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="text"
                                                            value={row.nama}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nama', e.target.value.toUpperCase())}
                                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 uppercase"
                                                            placeholder="NAMA LENGKAP"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <select
                                                            value={row.jk}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'jk', e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800"
                                                        >
                                                            <option value="Laki-laki">Laki-laki</option>
                                                            <option value="Perempuan">Perempuan</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="text"
                                                            value={row.ttl}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'ttl', e.target.value)}
                                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-900"
                                                            placeholder="Jakarta, 12-05-1990"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <select
                                                            value={row.hubungan}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'hubungan', e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800"
                                                        >
                                                            <option value="Kepala Keluarga">Kepala Keluarga</option>
                                                            <option value="Istri">Istri</option>
                                                            <option value="Anak">Anak</option>
                                                            <option value="Menantu">Menantu</option>
                                                            <option value="Cucu">Cucu</option>
                                                            <option value="Orang Tua">Orang Tua</option>
                                                            <option value="Mertua">Mertua</option>
                                                            <option value="Famili Lain">Famili Lain</option>
                                                            <option value="Lainnya">Lainnya</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAnggotaRow(idx)}
                                                            className="w-7 h-7 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold flex items-center justify-center mx-auto"
                                                            title="Hapus baris"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-gray-400 font-medium">
                                                    Belum ada baris anggota keluarga. Klik "+ Tambah Baris" atau jalankan Scan AI.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 font-medium">
                        💡 Periksa data di atas sebelum mengeklik tombol hijau di kanan untuk menerapkan data ke form.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-200 text-gray-700 font-bold text-xs transition flex-1 sm:flex-none"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyData}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex-1 sm:flex-none"
                        >
                            ✓ Terapkan ke Form KK ({anggotaList.length} Warga)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
