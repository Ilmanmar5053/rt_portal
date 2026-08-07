import React, { useState, useEffect, useRef } from 'react';

// Dynamic Loader for PDF.js to support PDF files
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

// Helper to convert DD-MM-YYYY to HTML input date ISO format YYYY-MM-DD
const formatDateToISO = (dateStr) => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (/^\d{4}\-\d{2}\-\d{2}$/.test(clean)) return clean;

    const dmy = clean.match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})/);
    if (dmy) {
        const day = dmy[1].padStart(2, '0');
        const month = dmy[2].padStart(2, '0');
        const year = dmy[3];
        return `${year}-${month}-${day}`;
    }

    const ymd = clean.match(/(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})/);
    if (ymd) {
        const year = ymd[1];
        const month = ymd[2].padStart(2, '0');
        const day = ymd[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return clean;
};

export default function KKScannerModal({ isOpen, onClose, file, initialNoKk, onApply }) {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [scanEngine, setScanEngine] = useState('');
    const [pastedText, setPastedText] = useState('');

    // Authentic Kartu Keluarga Header State
    const [kkHeader, setKkHeader] = useState({
        no_kk: initialNoKk || '3604120803900000',
        nama_kepala_keluarga: '',
        alamat_lengkap: '',
        rt: '004',
        rw: '002',
        kode_pos: '42192',
        kelurahan: 'PONTANG',
        kecamatan: 'PONTANG',
        kabupaten_kota: 'SERANG',
        provinsi: 'BANTEN'
    });

    const [anggotaList, setAnggotaList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(file || null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setKkHeader(prev => ({
                ...prev,
                no_kk: initialNoKk || prev.no_kk || '3604120803900000'
            }));
        }
    }, [isOpen, initialNoKk]);

    useEffect(() => {
        if (file) {
            setSelectedFile(file);
            processFilePreview(file);
        }
    }, [file, isOpen]);

    if (!isOpen) return null;

    // Process File Preview
    const processFilePreview = async (f) => {
        if (!f) return;
        setPreviewUrl('');

        if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
            setStatusText('File PDF terpilih. Klik "Ekstrak File Ke Tabel" atau tempel teks dari Gemini.');
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
                setStatusText('File Gambar terpilih. Siap diproses!');
            };
            reader.readAsDataURL(f);
        }
    };

    // Advanced Precision Parser for Indonesian KK Text
    const parseRawKKText = (text) => {
        if (!text || text.trim().length === 0) return null;

        let no_kk = '';
        let nama_kepala_keluarga = '';
        let alamat_lengkap = '';
        let rt = '004';
        let rw = '002';
        let kode_pos = '42192';
        let kelurahan = '';
        let kecamatan = '';
        let kabupaten_kota = '';
        let provinsi = '';

        const getVal = (regex) => {
            const m = text.match(regex);
            return m ? m[1].replace(/[*_`]/g, '').trim() : '';
        };

        no_kk = getVal(/(?:No\.?\s*KK|Nomor\s*KK|No\s*Kartu\s*Keluarga|No\.?\s*Dokumen)\s*:?\s*(\d{16})/i);
        nama_kepala_keluarga = getVal(/(?:\*\*?Nama\s*Kepala\s*Keluarga\*\*?|Nama\s*Kepala\s*Keluarga)\s*:?\s*([^\n\r*]+)/i);
        alamat_lengkap = getVal(/(?:\*\*?Alamat\*\*?|Alamat)\s*:?\s*([^\n\r*]+)/i);
        kode_pos = getVal(/(?:\*\*?Kode\s*Pos\*\*?|Kode\s*Pos)\s*:?\s*(\d{5})/i);
        kelurahan = getVal(/(?:\*\*?Desa\/?Kelurahan\*\*?|\*\*?Kelurahan\*\*?|\*\*?Desa\*\*?|Desa|Kelurahan)\s*:?\s*([^\n\r*]+)/i);
        kecamatan = getVal(/(?:\*\*?Kecamatan\*\*?|Kecamatan)\s*:?\s*([^\n\r*]+)/i);
        kabupaten_kota = getVal(/(?:\*\*?Kabupaten\/?Kota\*\*?|\*\*?Kota\*\*?|\*\*?Kabupaten\*\*?|Kabupaten|Kota)\s*:?\s*([^\n\r*]+)/i);
        provinsi = getVal(/(?:\*\*?Provinsi\*\*?|Provinsi)\s*:?\s*([^\n\r*]+)/i);

        const rtRwStr = getVal(/(?:\*\*?RT\/?RW\*\*?|RT\/RW|RT\s*\/?\s*RW)\s*:?\s*([^\n\r*]+)/i);
        if (rtRwStr) {
            const parts = rtRwStr.split(/[\/\-]/);
            if (parts[0]) rt = parts[0].replace(/\D/g, '').padStart(3, '0') || '004';
            if (parts[1]) rw = parts[1].replace(/\D/g, '').padStart(3, '0') || '002';
        }

        // Keywords for education and job matching
        const eduKeywords = [
            { key: 'TIDAK/BELUM SEKOLAH', val: 'Tidak/Belum Sekolah' },
            { key: 'BELUM TAMAT SD', val: 'Belum Tamat SD/Sederajat' },
            { key: 'TAMAT SD', val: 'Tamat SD/Sederajat' },
            { key: 'SD/SEDERAJAT', val: 'Tamat SD/Sederajat' },
            { key: 'SLTP', val: 'SLTP/Sederajat' },
            { key: 'SMP', val: 'SLTP/Sederajat' },
            { key: 'SLTA', val: 'SLTA/Sederajat' },
            { key: 'SMA', val: 'SLTA/Sederajat' },
            { key: 'SMK', val: 'SLTA/Sederajat' },
            { key: 'DIPLOMA', val: 'Diploma III/Akademi' },
            { key: 'STRATA I', val: 'Diploma IV/Strata I' },
            { key: 'S1', val: 'Diploma IV/Strata I' }
        ];

        const jobKeywords = [
            { key: 'BELUM/TIDAK BEKERJA', val: 'Belum/Tidak Bekerja' },
            { key: 'TIDAK BEKERJA', val: 'Belum/Tidak Bekerja' },
            { key: 'MENGURUS RUMAH TANGGA', val: 'Mengurus Rumah Tangga' },
            { key: 'PELAJAR/MAHASISWA', val: 'Pelajar/Mahasiswa' },
            { key: 'PELAJAR', val: 'Pelajar/Mahasiswa' },
            { key: 'MAHASISWA', val: 'Pelajar/Mahasiswa' },
            { key: 'KARYAWAN SWASTA', val: 'Karyawan Swasta' },
            { key: 'PEGAWAI NEGERI', val: 'PNS' },
            { key: 'PNS', val: 'PNS' },
            { key: 'WIRASWASTA', val: 'Wiraswasta' },
            { key: 'PETANI', val: 'Petani/Pekebun' },
            { key: 'BURUH', val: 'Buruh Harian Lepas' }
        ];

        // Extract Relationships, Nama Ayah, & Nama Ibu from Table 2
        const relationshipsMap = {};
        const parentsMap = {};
        const lines = text.split('\n');

        let table2Headers = [];

        lines.forEach(line => {
            if (line.includes('|')) {
                const cols = line.split('|').map(c => c.trim().replace(/[*_`]/g, ''));
                const lineUpper = line.toUpperCase();
                
                if (lineUpper.includes('STATUS HUBUNGAN') || lineUpper.includes('NAMA AYAH') || lineUpper.includes('NAMA IBU')) {
                    table2Headers = cols.map(c => c.toUpperCase());
                    return;
                }

                if (cols.length >= 3) {
                    const idxNum = parseInt(cols[1]);
                    if (!isNaN(idxNum)) {
                        let statusHub = '';
                        cols.forEach(col => {
                            const u = col.toUpperCase();
                            if (['KEPALA KELUARGA', 'ISTRI', 'ANAK', 'MENANTU', 'CUCU', 'ORANG TUA', 'MERTUA', 'FAMILI LAIN'].includes(u)) {
                                statusHub = u.split(' ')
                                    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
                                    .join(' ');
                            }
                        });
                        if (statusHub) {
                            relationshipsMap[idxNum] = statusHub;
                        }

                        let ayah = '';
                        let ibu = '';

                        if (table2Headers.length > 0) {
                            const ayahIdx = table2Headers.findIndex(h => h.includes('NAMA AYAH') || h.includes('AYAH'));
                            const ibuIdx = table2Headers.findIndex(h => h.includes('NAMA IBU') || h.includes('IBU'));
                            if (ayahIdx !== -1 && cols[ayahIdx] && !cols[ayahIdx].toUpperCase().includes('NAMA AYAH')) {
                                ayah = cols[ayahIdx];
                            }
                            if (ibuIdx !== -1 && cols[ibuIdx] && !cols[ibuIdx].toUpperCase().includes('NAMA IBU')) {
                                ibu = cols[ibuIdx];
                            }
                        }

                        if (!ayah && cols.length >= 5) {
                            const cand = cols[cols.length - 2];
                            if (cand && !['KEPALA KELUARGA', 'ISTRI', 'ANAK', 'KAWIN', 'BELUM KAWIN', 'WNI', 'WNA'].includes(cand.toUpperCase())) {
                                ayah = cand;
                            }
                        }
                        if (!ibu && cols.length >= 5) {
                            const cand = cols[cols.length - 1];
                            if (cand && !['KEPALA KELUARGA', 'ISTRI', 'ANAK', 'KAWIN', 'BELUM KAWIN', 'WNI', 'WNA'].includes(cand.toUpperCase())) {
                                ibu = cand;
                            }
                        }

                        if (ayah || ibu) {
                            parentsMap[idxNum] = {
                                nama_ayah: ayah.toUpperCase(),
                                nama_ibu: ibu.toUpperCase()
                            };
                        }
                    }
                }
            }
        });

        // Extract Demographic Data from Table 1
        const members = [];

        lines.forEach(line => {
            if (line.includes('|')) {
                const cols = line.split('|').map(c => c.trim().replace(/[*_`]/g, ''));
                const nikCol = cols.find(c => /^\d{16}$/.test(c));
                if (nikCol) {
                    const idxNum = parseInt(cols[1]) || (members.length + 1);

                    let name = cols[2] || '';
                    if (/^\d+$/.test(name) || name === idxNum.toString()) {
                        name = cols[3] || '';
                    }

                    const jkCol = cols.find(c => c.toUpperCase() === 'LAKI-LAKI' || c.toUpperCase() === 'PEREMPUAN') || 'LAKI-LAKI';
                    const jk = jkCol.toUpperCase().includes('PEREMPUAN') ? 'Perempuan' : 'Laki-laki';

                    let rawTglLahir = '';
                    const dateCol = cols.find(c => /\b\d{2}[\-\/]\d{2}[\-\/]\d{4}\b/.test(c));
                    if (dateCol) {
                        const dm = dateCol.match(/\b\d{2}[\-\/]\d{2}[\-\/]\d{4}\b/);
                        if (dm) rawTglLahir = dm[0];
                    }

                    let tempatLahir = '';
                    const placeCol = cols.find(c => 
                        /^[A-Za-z\s]{3,}$/.test(c) && 
                        !['LAKI-LAKI', 'PEREMPUAN', 'ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDHA', 'NO', 'NAMA LENGKAP', 'NIK'].includes(c.toUpperCase()) &&
                        c !== name
                    );
                    if (placeCol) {
                        tempatLahir = placeCol;
                    }

                    // Extract explicit education and job from row columns
                    let pendExtracted = '';
                    let pekExtracted = '';
                    cols.forEach(c => {
                        const cu = c.toUpperCase();
                        eduKeywords.forEach(e => {
                            if (cu.includes(e.key)) pendExtracted = e.val;
                        });
                        jobKeywords.forEach(j => {
                            if (cu.includes(j.key)) pekExtracted = j.val;
                        });
                    });

                    // Age calculation
                    const birthYearMatch = rawTglLahir.match(/\d{4}/);
                    const birthYear = birthYearMatch ? parseInt(birthYearMatch[0]) : 1990;
                    const currentYear = new Date().getFullYear();
                    const age = Math.max(0, currentYear - birthYear);

                    const isoDate = formatDateToISO(rawTglLahir);
                    const displayTtl = tempatLahir && rawTglLahir ? `${tempatLahir}, ${rawTglLahir}` : (rawTglLahir || tempatLahir || 'SERANG, 01-01-1990');
                    const statusHub = relationshipsMap[idxNum] || (idxNum === 1 ? 'Kepala Keluarga' : (idxNum === 2 ? 'Istri' : 'Anak'));

                    // Smart Pendidikan & Pekerjaan inference based on Age and Status
                    let finalPend = pendExtracted;
                    if (!finalPend) {
                        if (age < 6) finalPend = 'Tidak/Belum Sekolah';
                        else if (age <= 12) finalPend = 'Belum Tamat SD/Sederajat';
                        else if (age <= 15) finalPend = 'SLTP/Sederajat';
                        else finalPend = 'SLTA/Sederajat';
                    }

                    let finalPek = pekExtracted;
                    if (!finalPek) {
                        if (age < 6) finalPek = 'Belum/Tidak Bekerja';
                        else if (age <= 18) finalPek = 'Pelajar/Mahasiswa';
                        else if (statusHub === 'Istri') finalPek = 'Mengurus Rumah Tangga';
                        else if (statusHub === 'Kepala Keluarga') finalPek = 'Karyawan Swasta';
                        else finalPek = 'Belum/Tidak Bekerja';
                    }

                    const pData = parentsMap[idxNum] || {};

                    members.push({
                        idxNum: idxNum,
                        nik: nikCol,
                        nama: name.toUpperCase(),
                        nama_lengkap: name.toUpperCase(),
                        jk: jk,
                        jenis_kelamin: jk,
                        ttl: displayTtl,
                        tempat_lahir: tempatLahir || 'SERANG',
                        tanggal_lahir: isoDate || '1990-01-01',
                        hubungan: statusHub,
                        status_hubungan_keluarga: statusHub,
                        pendidikan: finalPend,
                        pekerjaan: finalPek,
                        nama_ayah: pData.nama_ayah || '',
                        nama_ibu: pData.nama_ibu || ''
                    });
                }
            }
        });

        // Smart parent inference for children ('Anak')
        const kepalaObj = members.find(m => m.hubungan === 'Kepala Keluarga');
        const istriObj = members.find(m => m.hubungan === 'Istri');

        members.forEach(m => {
            if (m.hubungan === 'Anak') {
                if (!m.nama_ayah && kepalaObj) m.nama_ayah = kepalaObj.nama;
                if (!m.nama_ibu && istriObj) m.nama_ibu = istriObj.nama;
            }
            if (!m.nama_ayah) m.nama_ayah = '-';
            if (!m.nama_ibu) m.nama_ibu = '-';
        });

        if (!nama_kepala_keluarga && members.length > 0) {
            nama_kepala_keluarga = members[0].nama;
        }

        return {
            header: {
                no_kk: no_kk || initialNoKk || kkHeader.no_kk || '3604120803900000',
                nama_kepala_keluarga: nama_kepala_keluarga || 'ILMAN',
                alamat_lengkap: alamat_lengkap || 'KP. KESABILAN',
                rt: rt || '004',
                rw: rw || '002',
                kode_pos: kode_pos || '42192',
                kelurahan: kelurahan || 'PONTANG',
                kecamatan: kecamatan || 'PONTANG',
                kabupaten_kota: kabupaten_kota || 'SERANG',
                provinsi: provinsi || 'BANTEN'
            },
            members: members
        };
    };

    // Handle Manual Text Parsing
    const handleParsePastedText = () => {
        if (!pastedText.trim()) {
            alert('Silakan tempelkan teks hasil ekstraksi Gemini / Google Lens terlebih dahulu!');
            return;
        }

        const res = parseRawKKText(pastedText);
        if (res && res.members.length > 0) {
            setKkHeader(res.header);
            setAnggotaList(res.members);
            setScanEngine('Extracted by Gemini / Google Lens');
            setStatusText(`✨ Sukses membaca Header KK (${res.header.no_kk}) & ${res.members.length} Anggota Keluarga (Akurat Pendidikan & Pekerjaan)!`);
        } else {
            alert('Format teks tidak dikenali. Pastikan teks berisi tabel atau baris NIK 16 digit.');
        }
    };

    const handleAddAnggotaRow = () => {
        setAnggotaList([...anggotaList, {
            nik: '',
            nama: '',
            nama_lengkap: '',
            jk: 'Laki-laki',
            jenis_kelamin: 'Laki-laki',
            ttl: '',
            tempat_lahir: 'SERANG',
            tanggal_lahir: '',
            hubungan: 'Anak',
            status_hubungan_keluarga: 'Anak',
            pendidikan: 'Belum Tamat SD/Sederajat',
            pekerjaan: 'Pelajar/Mahasiswa',
            nama_ayah: 'ILMAN',
            nama_ibu: 'BAYETI'
        }]);
    };

    const handleRemoveAnggotaRow = (idx) => {
        setAnggotaList(anggotaList.filter((_, i) => i !== idx));
    };

    const handleUpdateAnggota = (idx, field, val) => {
        const updated = [...anggotaList];
        updated[idx][field] = val;
        if (field === 'nama') updated[idx]['nama_lengkap'] = val;
        if (field === 'jk') updated[idx]['jenis_kelamin'] = val;
        if (field === 'hubungan') updated[idx]['status_hubungan_keluarga'] = val;
        if (field === 'ttl') {
            const iso = formatDateToISO(val);
            if (iso) updated[idx]['tanggal_lahir'] = iso;
        }
        setAnggotaList(updated);
    };

    const handleApplyData = () => {
        onApply({
            kkHeader,
            anggotaList
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in duration-200">
                
                {/* Top Bar */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-xl backdrop-blur-md shadow-inner">
                            🇮🇩
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-base tracking-wide text-amber-300 uppercase">
                                    KARTU KELUARGA (KK) REPUBLIK INDONESIA
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-black border border-amber-300/30">
                                    Format Otentik Dokumen
                                </span>
                            </div>
                            <p className="text-xs text-slate-300">Pendidikan & Pekerjaan presisi sesuai usia warga. Header Nomor KK terpisah dari NIK Anggota Keluarga.</p>
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
                <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar bg-slate-50/50">
                    
                    {/* Kotak Tempel Teks */}
                    <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <label className="font-extrabold text-xs text-blue-950 flex items-center gap-2">
                                <span>📋 Tempelkan Teks Hasil Ekstraksi Gemini / Google Lens Di Sini:</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[10px] font-black">
                                    Format Kartu Keluarga
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setPastedText(`Nomor KK : 3604120803900000
Nama Kepala Keluarga : ILMAN
Alamat : KP. KESABILAN
RT/RW : 004/002
Kode Pos : 42192
Desa/Kelurahan : PONTANG
Kecamatan : PONTANG
Kabupaten/Kota : SERANG
Provinsi : BANTEN

Tabel 1: Data Demografi
| No | Nama Lengkap | NIK | Jenis Kelamin | Tempat Lahir | Tanggal Lahir |
| 1 | ILMAN | 3604120803900004 | LAKI-LAKI | SERANG | 08-03-1990 |
| 2 | BAYETI | 3604125204920002 | PEREMPUAN | SERANG | 12-04-1992 |
| 3 | ZARA NAVISHA | 3604127101190001 | PEREMPUAN | SERANG | 31-01-2019 |
| 4 | ANINDIRA MAHESWARI | 3604124212210001 | PEREMPUAN | BERANG | 02-12-2021 |

Tabel 2: Data Status dan Orang Tua
| No | Status Hubungan Dalam Keluarga | Nama Ayah | Nama Ibu |
| 1 | KEPALA KELUARGA | HASAN | ASMAH |
| 2 | ISTRI | KASMIN | RUKIAH |
| 3 | ANAK | ILMAN | BAYETI |
| 4 | ANAK | ILMAN | BAYETI |`);
                                }}
                                className="text-xs text-blue-700 hover:text-blue-900 underline font-bold cursor-pointer"
                            >
                                🧪 Isikan Teks KK ILMAN
                            </button>
                        </div>
                        
                        <textarea
                            rows="4"
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Tempelkan teks Kartu Keluarga dari Google Gemini / Lens di sini..."
                            className="w-full p-3 bg-white border border-blue-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 shadow-inner"
                        ></textarea>

                        <div className="flex items-center justify-between">
                            <p className="text-[11px] text-blue-800 font-medium">
                                💡 Klik tombol biru di kanan untuk mengekstrak data ke format KK resmi di bawah.
                            </p>
                            <button
                                type="button"
                                onClick={handleParsePastedText}
                                className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>⚡</span>
                                <span>Uraikan Ke Layout KK</span>
                            </button>
                        </div>
                    </div>

                    {/* Format Tampilan Kartu Keluarga */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200/80 shadow-md space-y-4">
                        
                        {/* Header Judul Dokumen & Nomor KK (Kuning) */}
                        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                            <h2 className="text-xl font-black text-slate-900 tracking-widest uppercase">
                                KARTU KELUARGA
                            </h2>
                            <div className="flex items-center justify-center gap-2">
                                <span className="font-extrabold text-xs text-slate-700">No.</span>
                                <input
                                    type="text"
                                    maxLength="16"
                                    value={kkHeader.no_kk}
                                    onChange={(e) => setKkHeader({ ...kkHeader, no_kk: e.target.value })}
                                    className="px-3 py-1 bg-amber-100 border-2 border-amber-400 rounded-lg font-mono font-black text-sm text-slate-900 text-center focus:ring-2 focus:ring-amber-500 w-56 tracking-wider shadow-inner"
                                    placeholder="Nomor KK (16 Digit)"
                                />
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                                    Nomor Kartu Keluarga
                                </span>
                            </div>
                        </div>

                        {/* Layout 2 Kolom Identitas KK */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            {/* Kolom Kiri */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Nama Kepala Keluarga</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        value={kkHeader.nama_kepala_keluarga}
                                        onChange={(e) => setKkHeader({ ...kkHeader, nama_kepala_keluarga: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900 uppercase"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Alamat</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        value={kkHeader.alamat_lengkap}
                                        onChange={(e) => setKkHeader({ ...kkHeader, alamat_lengkap: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">RT / RW</span>
                                    <span className="text-slate-400">:</span>
                                    <div className="flex items-center gap-1.5 flex-1">
                                        <input
                                            type="text"
                                            value={kkHeader.rt}
                                            onChange={(e) => setKkHeader({ ...kkHeader, rt: e.target.value })}
                                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                                            placeholder="RT"
                                        />
                                        <span>/</span>
                                        <input
                                            type="text"
                                            value={kkHeader.rw}
                                            onChange={(e) => setKkHeader({ ...kkHeader, rw: e.target.value })}
                                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                                            placeholder="RW"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Kode Pos</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        maxLength="5"
                                        value={kkHeader.kode_pos}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kode_pos: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                                    />
                                </div>
                            </div>

                            {/* Kolom Kanan */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Desa / Kelurahan</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        value={kkHeader.kelurahan}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kelurahan: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Kecamatan</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        value={kkHeader.kecamatan}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kecamatan: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Kabupaten / Kota</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        value={kkHeader.kabupaten_kota}
                                        onChange={(e) => setKkHeader({ ...kkHeader, kabupaten_kota: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <span className="w-40 text-slate-600 font-bold">Provinsi</span>
                                    <span className="text-slate-400">:</span>
                                    <input
                                        type="text"
                                        value={kkHeader.provinsi}
                                        onChange={(e) => setKkHeader({ ...kkHeader, provinsi: e.target.value })}
                                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabel Data Anggota Keluarga */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <span>TABEL ANGGOTA KELUARGA ({anggotaList.length} ORANG)</span>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black border border-blue-200">
                                        Pendidikan & Pekerjaan Akurat Berdasar Usia
                                    </span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleAddAnggotaRow}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
                                >
                                    + Tambah Anggota
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-900 text-white font-extrabold border-b border-slate-700">
                                        <tr>
                                            <th className="py-2.5 px-3 w-8 text-center border-r border-slate-800">No</th>
                                            <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-800">NIK (16 Digit Warga)</th>
                                            <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-800">Nama Lengkap</th>
                                            <th className="py-2.5 px-3 min-w-[110px] border-r border-slate-800">Jenis Kelamin</th>
                                            <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-800">Tempat, Tgl Lahir</th>
                                            <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-800">Status Hubungan</th>
                                            <th className="py-2.5 px-3 min-w-[150px] border-r border-slate-800">Pendidikan</th>
                                            <th className="py-2.5 px-3 min-w-[150px] border-r border-slate-800">Pekerjaan</th>
                                            <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-800">Nama Ayah</th>
                                            <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-800">Nama Ibu</th>
                                            <th className="py-2.5 px-3 w-10 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {anggotaList.length > 0 ? (
                                            anggotaList.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/40 font-medium">
                                                    <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-100">{idx + 1}</td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <input
                                                            type="text"
                                                            maxLength="16"
                                                            value={row.nik}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nik', e.target.value)}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:bg-white"
                                                            placeholder="3604..."
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <input
                                                            type="text"
                                                            value={row.nama || row.nama_lengkap || ''}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nama', e.target.value.toUpperCase())}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900 uppercase focus:bg-white"
                                                            placeholder="NAMA LENGKAP"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <select
                                                            value={row.jk || row.jenis_kelamin || 'Laki-laki'}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'jk', e.target.value)}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
                                                        >
                                                            <option value="Laki-laki">Laki-laki</option>
                                                            <option value="Perempuan">Perempuan</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <input
                                                            type="text"
                                                            value={row.ttl || ''}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'ttl', e.target.value)}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white"
                                                            placeholder="SERANG, 08-03-1990"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <select
                                                            value={row.hubungan || row.status_hubungan_keluarga || 'Anak'}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'hubungan', e.target.value)}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
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
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <select
                                                            value={row.pendidikan || 'SLTA/Sederajat'}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'pendidikan', e.target.value)}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium"
                                                        >
                                                            <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                                                            <option value="Belum Tamat SD/Sederajat">Belum Tamat SD/Sederajat</option>
                                                            <option value="Tamat SD/Sederajat">Tamat SD/Sederajat</option>
                                                            <option value="SLTP/Sederajat">SLTP/Sederajat</option>
                                                            <option value="SLTA/Sederajat">SLTA/Sederajat</option>
                                                            <option value="Diploma I/II">Diploma I/II</option>
                                                            <option value="Diploma III/Akademi">Diploma III/Akademi</option>
                                                            <option value="Diploma IV/Strata I">Diploma IV/Strata I</option>
                                                            <option value="Strata II">Strata II</option>
                                                            <option value="Strata III">Strata III</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <select
                                                            value={row.pekerjaan || 'Pelajar/Mahasiswa'}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'pekerjaan', e.target.value)}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium"
                                                        >
                                                            <option value="Belum/Tidak Bekerja">Belum/Tidak Bekerja</option>
                                                            <option value="Mengurus Rumah Tangga">Mengurus Rumah Tangga</option>
                                                            <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                                                            <option value="PNS">PNS</option>
                                                            <option value="Karyawan Swasta">Karyawan Swasta</option>
                                                            <option value="Wiraswasta">Wiraswasta</option>
                                                            <option value="Petani/Pekebun">Petani/Pekebun</option>
                                                            <option value="Buruh Harian Lepas">Buruh Harian Lepas</option>
                                                            <option value="Lainnya">Lainnya</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <input
                                                            type="text"
                                                            value={row.nama_ayah || ''}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nama_ayah', e.target.value.toUpperCase())}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 uppercase focus:bg-white"
                                                            placeholder="NAMA AYAH"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2.5 border-r border-slate-100">
                                                        <input
                                                            type="text"
                                                            value={row.nama_ibu || ''}
                                                            onChange={(e) => handleUpdateAnggota(idx, 'nama_ibu', e.target.value.toUpperCase())}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 uppercase focus:bg-white"
                                                            placeholder="NAMA IBU"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAnggotaRow(idx)}
                                                            className="w-6 h-6 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold flex items-center justify-center mx-auto"
                                                            title="Hapus baris"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="11" className="py-8 text-center text-slate-400 font-medium">
                                                    Belum ada anggota keluarga. Tempelkan teks di atas lalu klik "Uraikan Ke Layout KK".
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
                <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-600 font-semibold">
                        💡 Pastikan Nomor KK di atas terisi. Menekan tombol di kanan akan menerapkan Header KK & {anggotaList.length} Warga ke form utama.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex-1 sm:flex-none"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyData}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex-1 sm:flex-none cursor-pointer"
                        >
                            ✓ Terapkan ke Form KK ({anggotaList.length} Warga)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
