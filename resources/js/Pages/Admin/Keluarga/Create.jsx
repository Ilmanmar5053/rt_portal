import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import KKScannerModal from '@/Components/KKScannerModal';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        no_kk: '',
        blok: '',
        nomor_rumah: '',
        alamat_lengkap: '',
        rt: '005',
        rw: '008',
        provinsi: '',
        kabupaten_kota: '',
        kecamatan: '',
        kelurahan: '',
        kode_pos: '',
        file_kk: null,
        file_ktp_kepala: null,
    });

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedAnggotaList, setScannedAnggotaList] = useState([]);

    const handleApplyOCRData = ({ kkHeader, anggotaList }) => {
        let mappedAnggota = (anggotaList || []).map(a => {
            let parsedTgl = a.tanggal_lahir || '';
            const rawDateStr = a.tanggal_lahir || a.ttl || '';
            const dmyMatch = rawDateStr.match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})/);
            if (dmyMatch) {
                const day = dmyMatch[1].padStart(2, '0');
                const month = dmyMatch[2].padStart(2, '0');
                const year = dmyMatch[3];
                parsedTgl = `${year}-${month}-${day}`;
            }

            let parsedTempat = a.tempat_lahir || '';
            if (!parsedTempat && a.ttl && a.ttl.includes(',')) {
                parsedTempat = a.ttl.split(',')[0].trim();
            }

            return {
                nik: a.nik || '',
                nama_lengkap: a.nama_lengkap || a.nama || '',
                tempat_lahir: parsedTempat || 'SERANG',
                tanggal_lahir: parsedTgl,
                jenis_kelamin: a.jenis_kelamin || a.jk || 'Laki-laki',
                agama: a.agama || 'Islam',
                pendidikan: a.pendidikan || 'SLTA/Sederajat',
                pekerjaan: a.pekerjaan || 'Karyawan Swasta',
                status_perkawinan: a.status_perkawinan || 'Belum Kawin',
                status_hubungan_keluarga: a.status_hubungan_keluarga || a.hubungan || 'Anak',
                kewarganegaraan: a.kewarganegaraan || 'WNI',
                nama_ayah: a.nama_ayah || '-',
                nama_ibu: a.nama_ibu || '-',
                no_hp: '',
                status_hidup: 'Hidup',
            };
        });

        setData(prev => ({
            ...prev,
            no_kk: prev.no_kk ? prev.no_kk : (kkHeader.no_kk || ''),
            alamat_lengkap: kkHeader.alamat_lengkap || prev.alamat_lengkap,
            rt: kkHeader.rt || prev.rt,
            rw: kkHeader.rw || prev.rw,
            kode_pos: kkHeader.kode_pos || prev.kode_pos || '42192',
            provinsi: kkHeader.provinsi || prev.provinsi || 'BANTEN',
            kabupaten_kota: kkHeader.kabupaten_kota || prev.kabupaten_kota || 'SERANG',
            kecamatan: kkHeader.kecamatan || prev.kecamatan || 'PONTANG',
            kelurahan: kkHeader.kelurahan || prev.kelurahan || 'PONTANG',
        }));

        setScannedAnggotaList(mappedAnggota);
    };

    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);

    // Fetch Provinsi on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinsi').then(res => {
            setProvinsiList(res.data);
        }).catch(err => console.error('Error fetching provinsi:', err));
    }, []);

    const cleanWilayahName = (str) => {
        if (!str) return '';
        return str.toUpperCase()
            .replace(/^(KAB\.?|KABUPATEN|KOTA|PROVINSI)\s+/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Fetch Kabupaten when Provinsi changes & auto-align target string
    useEffect(() => {
        if (data.provinsi) {
            const cleanTarget = cleanWilayahName(data.provinsi);
            const selectedProv = provinsiList.find(p => cleanWilayahName(p.nama) === cleanTarget || p.nama.toUpperCase().includes(cleanTarget));
            if (selectedProv) {
                if (data.provinsi !== selectedProv.nama) {
                    setData('provinsi', selectedProv.nama);
                }
                axios.get(`/api/wilayah/kabupaten/${selectedProv.kode}`).then(res => {
                    setKabupatenList(res.data);
                });
            }
        } else {
            setKabupatenList([]);
        }
    }, [data.provinsi, provinsiList]);

    // Fetch Kecamatan when Kabupaten changes & auto-align target string
    useEffect(() => {
        if (data.kabupaten_kota) {
            const cleanTarget = cleanWilayahName(data.kabupaten_kota);
            const selectedKab = kabupatenList.find(k => cleanWilayahName(k.nama) === cleanTarget || k.nama.toUpperCase().includes(cleanTarget));
            if (selectedKab) {
                if (data.kabupaten_kota !== selectedKab.nama) {
                    setData('kabupaten_kota', selectedKab.nama);
                }
                axios.get(`/api/wilayah/kecamatan/${selectedKab.kode}`).then(res => {
                    setKecamatanList(res.data);
                });
            }
        } else {
            setKecamatanList([]);
        }
    }, [data.kabupaten_kota, kabupatenList]);

    // Fetch Kelurahan when Kecamatan changes & auto-align target string
    useEffect(() => {
        if (data.kecamatan) {
            const cleanTarget = cleanWilayahName(data.kecamatan);
            const selectedKec = kecamatanList.find(k => cleanWilayahName(k.nama) === cleanTarget || k.nama.toUpperCase().includes(cleanTarget));
            if (selectedKec) {
                if (data.kecamatan !== selectedKec.nama) {
                    setData('kecamatan', selectedKec.nama);
                }
                axios.get(`/api/wilayah/kelurahan/${selectedKec.kode}`).then(res => {
                    setKelurahanList(res.data);
                });
            }
        } else {
            setKelurahanList([]);
        }
    }, [data.kecamatan, kecamatanList]);

    // Auto-align Kelurahan target string
    useEffect(() => {
        if (data.kelurahan && kelurahanList.length > 0) {
            const cleanTarget = cleanWilayahName(data.kelurahan);
            const selectedKel = kelurahanList.find(k => cleanWilayahName(k.nama) === cleanTarget || k.nama.toUpperCase().includes(cleanTarget));
            if (selectedKel && data.kelurahan !== selectedKel.nama) {
                setData('kelurahan', selectedKel.nama);
            }
        }
    }, [data.kelurahan, kelurahanList]);

    const handleClearForm = () => {
        if (window.confirm('Apakah Anda yakin ingin mengosongkan / membersihkan seluruh kolom isian dan tabel hasil scan sebelum input data baru?')) {
            setData({
                no_kk: '',
                blok: '',
                nomor_rumah: '',
                alamat_lengkap: '',
                rt: '005',
                rw: '008',
                provinsi: '',
                kabupaten_kota: '',
                kecamatan: '',
                kelurahan: '',
                kode_pos: '',
                file_kk: null,
                file_ktp_kepala: null,
            });
            setScannedAnggotaList([]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.keluarga.store'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <h2 className="text-lg font-black leading-tight text-gray-800 tracking-tight">
                        Tambah Kartu Keluarga (KK)
                    </h2>
                </div>
            }
        >
            <Head title="Tambah KK Baru" />

            {/* Container Compact & Presisi (max-w-3xl agar tidak terlalu lebar dan lebih fokus) */}
            <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">

                {/* 1. Hero Header Banner (Warna Senada Emerald-Teal) */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white rounded-3xl p-5 shadow-lg border border-emerald-500/30 relative overflow-hidden flex items-center justify-between gap-4">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/20">
                            ➕ REGISTRASI KK BARU
                        </span>
                        <h2 className="text-lg sm:text-xl font-black tracking-wide">
                            Input Data Kartu Keluarga
                        </h2>
                        <p className="text-xs text-emerald-100 font-medium">
                            Daftarkan nomor KK baru beserta alamat lengkap & wilayah domisili di lingkungan RT.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="inline-flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 font-black px-4 py-2 rounded-xl shadow-md transition-all text-xs cursor-pointer"
                        >
                            <span>⚡</span>
                            <span>Scan OCR & Preview Tabel</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleClearForm}
                            className="inline-flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 font-extrabold px-3.5 py-2 rounded-xl transition-all text-xs cursor-pointer"
                            title="Bersihkan seluruh kolom isian dan hasil scan"
                        >
                            <span>🗑️</span>
                            <span>Clear Form</span>
                        </button>

                        <Link
                            href={route('admin.keluarga.index')}
                            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-extrabold px-3.5 py-2 rounded-xl border border-white/20 transition-all text-xs"
                        >
                            <span>⬅️</span>
                            <span className="hidden sm:inline">Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={submit} encType="multipart/form-data" className="space-y-5">

                    {/* Section 1: 📋 Identitas & Nomor KK */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black">
                                📋
                            </span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Identitas & Nomor Kartu Keluarga (KK)
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Pastikan nomor KK terdiri dari 16 digit angka resmi
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="no_kk" value="Nomor Kartu Keluarga (KK) 16 Digit *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                        🔢
                                    </span>
                                    <TextInput
                                        id="no_kk"
                                        type="text"
                                        className="pl-10 block w-full font-mono font-bold text-sm tracking-wide rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        value={data.no_kk}
                                        onChange={(e) => setData('no_kk', e.target.value)}
                                        placeholder="Cth: 3201012345670001"
                                        maxLength={16}
                                        required
                                    />
                                </div>
                                <InputError message={errors.no_kk} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="blok" value="Blok Rumah (Domisili RT) *" />
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                            🏢
                                        </span>
                                        <TextInput
                                            id="blok"
                                            type="text"
                                            className="pl-10 block w-full uppercase font-extrabold text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={data.blok}
                                            onChange={(e) => setData('blok', e.target.value.toUpperCase())}
                                            placeholder="Cth: BLOK A, BLOK B1"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.blok} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nomor_rumah" value="Nomor Rumah *" />
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                            🏠
                                        </span>
                                        <TextInput
                                            id="nomor_rumah"
                                            type="text"
                                            className="pl-10 block w-full font-extrabold text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={data.nomor_rumah}
                                            onChange={(e) => setData('nomor_rumah', e.target.value)}
                                            placeholder="Cth: 12, 14A, 105"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.nomor_rumah} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: 📍 Alamat & Wilayah Domisili */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-black">
                                📍
                            </span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Alamat & Wilayah Domisili Sesuai KTP/KK
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Pilih wilayah secara urut mulai dari Provinsi hingga Kelurahan
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="alamat_lengkap" value="Alamat Jalan / Dusun / Perumahan *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                        🗺️
                                    </span>
                                    <TextInput
                                        id="alamat_lengkap"
                                        type="text"
                                        className="pl-10 block w-full font-semibold text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        value={data.alamat_lengkap}
                                        onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                        placeholder="Cth: Jl. Perumahan Green Valley No. 10"
                                        required
                                    />
                                </div>
                                <InputError message={errors.alamat_lengkap} className="mt-1" />
                            </div>

                            {/* RT & RW */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="rt" value="RT *" />
                                    <TextInput
                                        id="rt"
                                        type="text"
                                        className="mt-1 block w-full font-extrabold text-center text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50"
                                        value={data.rt}
                                        onChange={(e) => setData('rt', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.rt} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="rw" value="RW *" />
                                    <TextInput
                                        id="rw"
                                        type="text"
                                        className="mt-1 block w-full font-extrabold text-center text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50"
                                        value={data.rw}
                                        onChange={(e) => setData('rw', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.rw} className="mt-1" />
                                </div>
                            </div>

                            {/* Provinsi & Kabupaten/Kota */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="provinsi" value="Provinsi *" />
                                    <select
                                        id="provinsi"
                                        className="mt-1 block w-full text-xs font-semibold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm bg-white py-2.5"
                                        value={data.provinsi}
                                        onChange={(e) => setData(prev => ({ ...prev, provinsi: e.target.value, kabupaten_kota: '', kecamatan: '', kelurahan: '' }))}
                                        required
                                    >
                                        <option value="">-- Pilih Provinsi --</option>
                                        {provinsiList.map(prov => (
                                            <option key={prov.kode} value={prov.nama}>{prov.nama}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.provinsi} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kabupaten_kota" value="Kabupaten / Kota *" />
                                    <select
                                        id="kabupaten_kota"
                                        className="mt-1 block w-full text-xs font-semibold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm disabled:bg-gray-100 py-2.5"
                                        value={data.kabupaten_kota}
                                        onChange={(e) => setData(prev => ({ ...prev, kabupaten_kota: e.target.value, kecamatan: '', kelurahan: '' }))}
                                        required
                                        disabled={kabupatenList.length === 0}
                                    >
                                        <option value="">-- Pilih Kab/Kota --</option>
                                        {kabupatenList.map(kab => (
                                            <option key={kab.kode} value={kab.nama}>{kab.nama}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kabupaten_kota} className="mt-1" />
                                </div>
                            </div>

                            {/* Kecamatan, Kelurahan & Kode Pos */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="kecamatan" value="Kecamatan *" />
                                    <select
                                        id="kecamatan"
                                        className="mt-1 block w-full text-xs font-semibold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm disabled:bg-gray-100 py-2.5"
                                        value={data.kecamatan}
                                        onChange={(e) => setData(prev => ({ ...prev, kecamatan: e.target.value, kelurahan: '' }))}
                                        required
                                        disabled={kecamatanList.length === 0}
                                    >
                                        <option value="">-- Pilih Kecamatan --</option>
                                        {kecamatanList.map(kec => (
                                            <option key={kec.kode} value={kec.nama}>{kec.nama}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kecamatan} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kelurahan" value="Kelurahan / Desa *" />
                                    <select
                                        id="kelurahan"
                                        className="mt-1 block w-full text-xs font-semibold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm disabled:bg-gray-100 py-2.5"
                                        value={data.kelurahan}
                                        onChange={(e) => setData('kelurahan', e.target.value)}
                                        required
                                        disabled={kelurahanList.length === 0}
                                    >
                                        <option value="">-- Pilih Kelurahan --</option>
                                        {kelurahanList.map(kel => (
                                            <option key={kel.kode} value={kel.nama}>{kel.nama}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kelurahan} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kode_pos" value="Kode Pos" />
                                    <TextInput
                                        id="kode_pos"
                                        type="text"
                                        className="mt-1 block w-full font-mono font-bold text-sm text-center rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        value={data.kode_pos}
                                        onChange={(e) => setData('kode_pos', e.target.value)}
                                        placeholder="Cth: 16820"
                                    />
                                    <InputError message={errors.kode_pos} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: 🗂️ Unggah Dokumen Lampiran KK & KTP */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-black">
                                🗂️
                            </span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Unggah Dokumen Lampiran (Opsional)
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Format didukung: PDF, JPG, PNG (Maksimal 2 MB per file)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* File Scan KK */}
                            <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${data.file_kk ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center text-base font-black shadow-sm">
                                        📄
                                    </span>
                                    <div>
                                        <InputLabel htmlFor="file_kk" value="Scan Kartu Keluarga (KK)" />
                                        <p className="text-[10px] text-gray-400">File KK asli/fotokopi</p>
                                    </div>
                                </div>
                                <input
                                    id="file_kk"
                                    type="file"
                                    className="mt-2 block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                                    onChange={(e) => setData('file_kk', e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {data.file_kk ? (
                                    <div className="mt-3 flex items-center justify-between bg-emerald-100/70 p-2 rounded-xl">
                                        <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 truncate">
                                            <span>✓ Terpilih:</span>
                                            <span className="truncate">{data.file_kk.name}</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsScannerOpen(true)}
                                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold shadow-xs transition shrink-0 cursor-pointer"
                                        >
                                            ⚡ Scan & Cek Tabel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsScannerOpen(true)}
                                        className="mt-3 w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer"
                                    >
                                        <span>⚡</span>
                                        <span>Scan & Preview Hasil OCR (Gratis)</span>
                                    </button>
                                )}
                                <InputError message={errors.file_kk} className="mt-1" />
                            </div>

                            {/* File KTP Kepala Keluarga */}
                            <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${data.file_ktp_kepala ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-base font-black shadow-sm">
                                        🪪
                                    </span>
                                    <div>
                                        <InputLabel htmlFor="file_ktp_kepala" value="Scan KTP Kepala Keluarga" />
                                        <p className="text-[10px] text-gray-400">KTP pemegang KK</p>
                                    </div>
                                </div>
                                <input
                                    id="file_ktp_kepala"
                                    type="file"
                                    className="mt-2 block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-indigo-100 file:text-indigo-800 hover:file:bg-indigo-200 cursor-pointer"
                                    onChange={(e) => setData('file_ktp_kepala', e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {data.file_ktp_kepala && (
                                    <p className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                                        <span>✓ Terpilih:</span>
                                        <span className="truncate">{data.file_ktp_kepala.name}</span>
                                    </p>
                                )}
                                <InputError message={errors.file_ktp_kepala} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Hasil Scan Warga yang Sudah Diverifikasi */}
                    {scannedAnggotaList.length > 0 && (
                        <div className="bg-emerald-50/60 border border-emerald-300 rounded-3xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-2xs">
                                        ✓
                                    </span>
                                    <div>
                                        <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                                            Daftar Anggota Keluarga dari Scan OCR ({scannedAnggotaList.length} Orang)
                                        </h4>
                                        <p className="text-[11px] text-emerald-800">
                                            Data ini telah diverifikasi melalui tabel preview OCR dan siap melengkapi data kependudukan.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsScannerOpen(true)}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-extrabold shadow-2xs transition cursor-pointer"
                                >
                                    ✏️ Edit Tabel OCR
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-2xs">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-[10px] font-extrabold text-gray-500 uppercase border-b border-gray-200">
                                            <th className="px-3 py-2">NIK</th>
                                            <th className="px-3 py-2">Nama Lengkap</th>
                                            <th className="px-3 py-2">Jenis Kelamin</th>
                                            <th className="px-3 py-2">Tempat, Tgl Lahir</th>
                                            <th className="px-3 py-2">Hubungan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {scannedAnggotaList.map((w, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-mono font-bold text-gray-700">{w.nik}</td>
                                                <td className="px-3 py-2 font-extrabold text-gray-900">{w.nama}</td>
                                                <td className="px-3 py-2 text-gray-600">{w.jk}</td>
                                                <td className="px-3 py-2 text-gray-600">{w.ttl}</td>
                                                <td className="px-3 py-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                        {w.hubungan}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer Action Buttons (Rapat & Intuitif) */}
                    <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <Link
                            href={route('admin.keluarga.index')}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition-all"
                        >
                            <span>⬅️</span>
                            <span>Batal</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleClearForm}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition-all cursor-pointer"
                                title="Bersihkan seluruh kolom isian"
                            >
                                <span>🗑️</span>
                                <span>Clear / Bersihkan Form</span>
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                                <span>💾</span>
                                <span>{processing ? 'Menyimpan Data...' : 'Simpan Data Kartu Keluarga'}</span>
                            </button>
                        </div>
                    </div>

                </form>
            </div>

            {/* Modal OCR Scanner & Verification Table */}
            <KKScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                file={data.file_kk}
                initialNoKk={data.no_kk}
                onApply={handleApplyOCRData}
            />
        </AdminLayout>
    );
}
