import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import WargaLayout from '@/Layouts/WargaLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import KKScannerModal from '@/Components/KKScannerModal';
import axios from 'axios';

export default function PengkinianDataIndex({ warga, keluarga }) {
    const { flash } = usePage().props;
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [previewModalUrl, setPreviewModalUrl] = useState(null);

    // Wilayah API States
    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);

    // Mandatory KK Hierarchy Sort Helper
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

    const sortAnggotaByHubungan = (list) => {
        if (!list || !Array.isArray(list)) return [];
        return [...list].sort((a, b) => {
            const idxA = urutanHubungan.indexOf(a.status_hubungan_keluarga);
            const idxB = urutanHubungan.indexOf(b.status_hubungan_keluarga);
            const orderA = idxA !== -1 ? idxA : 99;
            const orderB = idxB !== -1 ? idxB : 99;
            if (orderA !== orderB) return orderA - orderB;
            return (a.tanggal_lahir || '').localeCompare(b.tanggal_lahir || '');
        });
    };

    // Initialize Form State
    const initialAnggota = sortAnggotaByHubungan((keluarga && keluarga.wargas && keluarga.wargas.length > 0)
        ? keluarga.wargas.map(w => ({
            id: w.id,
            nik: w.nik || '',
            nama_lengkap: w.nama_lengkap || '',
            tempat_lahir: w.tempat_lahir || '',
            tanggal_lahir: w.tanggal_lahir ? w.tanggal_lahir.substring(0, 10) : '',
            jenis_kelamin: w.jenis_kelamin || 'Laki-laki',
            agama: w.agama || 'Islam',
            pendidikan: w.pendidikan || 'SLTA/Sederajat',
            pekerjaan: w.pekerjaan || 'Karyawan Swasta',
            status_perkawinan: w.status_perkawinan || 'Belum Kawin',
            status_hubungan_keluarga: w.status_hubungan_keluarga || 'Anak',
            kewarganegaraan: w.kewarganegaraan || 'WNI',
            nama_ayah: w.nama_ayah || '',
            nama_ibu: w.nama_ibu || '',
            no_hp: w.no_hp || '',
            status_hidup: w.status_hidup || 'Hidup',
        }))
        : [
            {
                id: warga?.id || null,
                nik: warga?.nik || '',
                nama_lengkap: warga?.nama_lengkap || '',
                tempat_lahir: warga?.tempat_lahir || '',
                tanggal_lahir: warga?.tanggal_lahir ? warga?.tanggal_lahir.substring(0, 10) : '',
                jenis_kelamin: warga?.jenis_kelamin || 'Laki-laki',
                agama: warga?.agama || 'Islam',
                pendidikan: warga?.pendidikan || 'SLTA/Sederajat',
                pekerjaan: warga?.pekerjaan || 'Karyawan Swasta',
                status_perkawinan: warga?.status_perkawinan || 'Kawin',
                status_hubungan_keluarga: 'Kepala Keluarga',
                kewarganegaraan: warga?.kewarganegaraan || 'WNI',
                nama_ayah: warga?.nama_ayah || '',
                nama_ibu: warga?.nama_ibu || '',
                no_hp: warga?.no_hp || '',
                status_hidup: 'Hidup',
            }
        ]);

    const { data, setData, post, processing, errors } = useForm({
        no_kk: keluarga?.no_kk || '',
        blok: keluarga?.rumah_blok?.blok || '',
        nomor_rumah: keluarga?.rumah_blok?.nomor_rumah || '',
        alamat_lengkap: keluarga?.alamat_lengkap || '',
        rt: keluarga?.rt || '005',
        rw: keluarga?.rw || '008',
        provinsi: keluarga?.provinsi || '',
        kabupaten_kota: keluarga?.kabupaten_kota || '',
        kecamatan: keluarga?.kecamatan || '',
        kelurahan: keluarga?.kelurahan || '',
        kode_pos: keluarga?.kode_pos || '',
        file_kk: null,
        anggota: initialAnggota,
    });

    // Fetch Provinsi on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinsi')
            .then(res => setProvinsiList(res.data))
            .catch(err => console.error('Gagal memuat provinsi:', err));
    }, []);

    const cleanWilayahName = (str) => {
        if (!str) return '';
        return str.toUpperCase()
            .replace(/^(KAB\.?|KABUPATEN|KOTA|PROVINSI)\s+/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Fetch Kabupaten when Provinsi changes
    useEffect(() => {
        if (data.provinsi) {
            const cleanTarget = cleanWilayahName(data.provinsi);
            const selectedProv = provinsiList.find(p => cleanWilayahName(p.nama) === cleanTarget || p.nama.toUpperCase().includes(cleanTarget));
            if (selectedProv) {
                axios.get(`/api/wilayah/kabupaten/${selectedProv.kode}`)
                    .then(res => setKabupatenList(res.data))
                    .catch(err => console.error('Gagal memuat kabupaten:', err));
            }
        } else {
            setKabupatenList([]);
        }
    }, [data.provinsi, provinsiList]);

    // Fetch Kecamatan when Kabupaten changes
    useEffect(() => {
        if (data.kabupaten_kota) {
            const cleanTarget = cleanWilayahName(data.kabupaten_kota);
            const selectedKab = kabupatenList.find(k => cleanWilayahName(k.nama) === cleanTarget || k.nama.toUpperCase().includes(cleanTarget));
            if (selectedKab) {
                axios.get(`/api/wilayah/kecamatan/${selectedKab.kode}`)
                    .then(res => setKecamatanList(res.data))
                    .catch(err => console.error('Gagal memuat kecamatan:', err));
            }
        } else {
            setKecamatanList([]);
        }
    }, [data.kabupaten_kota, kabupatenList]);

    // Fetch Kelurahan when Kecamatan changes
    useEffect(() => {
        if (data.kecamatan) {
            const cleanTarget = cleanWilayahName(data.kecamatan);
            const selectedKec = kecamatanList.find(k => cleanWilayahName(k.nama) === cleanTarget || k.nama.toUpperCase().includes(cleanTarget));
            if (selectedKec) {
                axios.get(`/api/wilayah/kelurahan/${selectedKec.kode}`)
                    .then(res => setKelurahanList(res.data))
                    .catch(err => console.error('Gagal memuat kelurahan:', err));
            }
        } else {
            setKelurahanList([]);
        }
    }, [data.kecamatan, kecamatanList]);

    // Apply data from OCR Scanner Modal
    const handleApplyOCRData = ({ kkHeader, anggotaList }) => {
        let mappedAnggota = [];
        if (anggotaList && anggotaList.length > 0) {
            mappedAnggota = anggotaList.map(a => {
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

                const existing = data.anggota.find(item =>
                    (item.id && item.nik && item.nik.trim() === (a.nik || '').trim()) ||
                    (item.id && item.nama_lengkap && item.nama_lengkap.trim().toLowerCase() === (a.nama_lengkap || a.nama || '').trim().toLowerCase()) ||
                    (item.id && item.status_hubungan_keluarga === 'Kepala Keluarga' && (a.status_hubungan_keluarga || a.hubungan || '') === 'Kepala Keluarga')
                );

                return {
                    id: existing ? existing.id : null,
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
        }

        setData(prev => ({
            ...prev,
            no_kk: kkHeader.no_kk || prev.no_kk,
            alamat_lengkap: kkHeader.alamat_lengkap || prev.alamat_lengkap,
            rt: kkHeader.rt || prev.rt,
            rw: kkHeader.rw || prev.rw,
            kode_pos: kkHeader.kode_pos || prev.kode_pos || '42192',
            provinsi: kkHeader.provinsi || prev.provinsi || 'BANTEN',
            kabupaten_kota: kkHeader.kabupaten_kota || prev.kabupaten_kota || 'SERANG',
            kecamatan: kkHeader.kecamatan || prev.kecamatan || 'PONTANG',
            kelurahan: kkHeader.kelurahan || prev.kelurahan || 'PONTANG',
            anggota: mappedAnggota.length > 0 ? sortAnggotaByHubungan(mappedAnggota) : prev.anggota
        }));
    };

    // Add new row to Anggota table
    const handleAddAnggota = () => {
        setData('anggota', [
            ...data.anggota,
            {
                id: null,
                nik: '',
                nama_lengkap: '',
                tempat_lahir: '',
                tanggal_lahir: '',
                jenis_kelamin: 'Laki-laki',
                agama: 'Islam',
                pendidikan: 'SLTA/Sederajat',
                pekerjaan: 'Pelajar/Mahasiswa',
                status_perkawinan: 'Belum Kawin',
                status_hubungan_keluarga: 'Anak',
                kewarganegaraan: 'WNI',
                nama_ayah: '',
                nama_ibu: '',
                no_hp: '',
                status_hidup: 'Hidup',
            }
        ]);
    };

    // Remove row from Anggota table
    const handleRemoveAnggota = (index) => {
        if (data.anggota.length === 1) {
            alert('Minimal harus ada 1 anggota keluarga dalam Kartu Keluarga.');
            return;
        }
        const updated = [...data.anggota];
        updated.splice(index, 1);
        setData('anggota', updated);
    };

    // Update row field value
    const handleAnggotaChange = (index, field, value) => {
        const updated = [...data.anggota];
        updated[index][field] = value;
        setData('anggota', updated);
    };

    // Clear all form fields
    const handleClearForm = () => {
        if (window.confirm('Apakah Anda yakin ingin mengosongkan / membersihkan seluruh kolom isian dan tabel anggota keluarga untuk memulai input data baru?')) {
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
                anggota: [
                    {
                        id: null,
                        nik: '',
                        nama_lengkap: '',
                        tempat_lahir: '',
                        tanggal_lahir: '',
                        jenis_kelamin: 'Laki-laki',
                        agama: 'Islam',
                        pendidikan: 'SLTA/Sederajat',
                        pekerjaan: 'Karyawan Swasta',
                        status_perkawinan: 'Belum Kawin',
                        status_hubungan_keluarga: 'Kepala Keluarga',
                        kewarganegaraan: 'WNI',
                        nama_ayah: '-',
                        nama_ibu: '-',
                        no_hp: '',
                        status_hidup: 'Hidup',
                    }
                ],
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('warga.pengkinian-data.store'), {
            forceFormData: true,
            onSuccess: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    return (
        <WargaLayout header="Pengkinian Data">
            <Head title="Pengkinian Data Mandiri - Portal Warga" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">
                {/* HERO BANNER SECTION */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-950 p-6 sm:p-8 text-white shadow-2xl border border-emerald-700/40">
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute top-0 right-1/3 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                                <span>📋</span>
                                <span>Sensus Mandiri & Pengkinian Data Warga</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                                Pembaruan Kartu Keluarga & Anggota Keluarga
                            </h1>
                            <p className="text-sm text-emerald-100/90 leading-relaxed">
                                Kelola data Kartu Keluarga (KK) Anda secara mandiri demi mendukung sensus massal RT yang akurat, terpadu, dan pelaporan yang terenkripsi aman.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsScannerOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <span className="text-lg">⚡</span>
                                <span>Scan KK (OCR AI)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowGuideModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                <span>ℹ️</span>
                                <span>Panduan Sensus</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClearForm}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
                                title="Bersihkan seluruh kolom isian sebelum input data baru"
                            >
                                <span>🗑️</span>
                                <span>Clear Form</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATIONS & ERRORS */}
                {flash?.message && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm font-semibold text-sm">
                        <span className="text-xl">✨</span>
                        <span>{flash.message}</span>
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 shadow-sm space-y-1">
                        <div className="flex items-center gap-2 font-black text-sm">
                            <span>⚠️</span>
                            <span>Terdapat kesalahan pengisian pada form di bawah:</span>
                        </div>
                        <ul className="list-disc list-inside text-xs space-y-0.5 ml-5">
                            {Object.values(errors).map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* MAIN FORM */}
                <form onSubmit={submit} encType="multipart/form-data" className="space-y-8">
                    
                    {/* BAGIAN 1: IDENTITAS & WILAYAH KK */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                                    📋
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-gray-800">
                                        Identitas Kartu Keluarga (KK) & Wilayah Domisili
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Lengkapi nomor KK resmi dan alamat domisili di lingkungan RT
                                    </p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                                FORMAT INDONESIA
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-1">
                                <InputLabel htmlFor="no_kk" value="Nomor Kartu Keluarga (16 Digit) *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">🔢</span>
                                    <TextInput
                                        id="no_kk"
                                        type="text"
                                        maxLength={16}
                                        value={data.no_kk}
                                        onChange={(e) => setData('no_kk', e.target.value)}
                                        className="pl-10 w-full font-mono font-extrabold text-sm tracking-wide rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Cth: 3201012345670001"
                                        required
                                    />
                                </div>
                                <InputError message={errors.no_kk} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:col-span-2">
                                <div>
                                    <InputLabel htmlFor="blok" value="Blok Rumah *" />
                                    <TextInput
                                        id="blok"
                                        type="text"
                                        value={data.blok}
                                        onChange={(e) => setData('blok', e.target.value.toUpperCase())}
                                        className="mt-1 w-full uppercase font-bold text-sm rounded-xl border-gray-300"
                                        placeholder="Cth: BLOK A"
                                        required
                                    />
                                    <InputError message={errors.blok} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="nomor_rumah" value="Nomor Rumah *" />
                                    <TextInput
                                        id="nomor_rumah"
                                        type="text"
                                        value={data.nomor_rumah}
                                        onChange={(e) => setData('nomor_rumah', e.target.value)}
                                        className="mt-1 w-full font-bold text-sm rounded-xl border-gray-300"
                                        placeholder="Cth: 15A"
                                        required
                                    />
                                    <InputError message={errors.nomor_rumah} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="alamat_lengkap" value="Alamat Lengkap Rumah / Jalan *" />
                                <TextInput
                                    id="alamat_lengkap"
                                    type="text"
                                    value={data.alamat_lengkap}
                                    onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                    className="mt-1 w-full text-sm rounded-xl border-gray-300"
                                    placeholder="Cth: Jl. Merpati Raya Perumahan Griya Damai"
                                    required
                                />
                                <InputError message={errors.alamat_lengkap} className="mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="rt" value="RT *" />
                                    <TextInput
                                        id="rt"
                                        type="text"
                                        value={data.rt}
                                        onChange={(e) => setData('rt', e.target.value)}
                                        className="mt-1 w-full text-center font-bold text-sm rounded-xl border-gray-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="rw" value="RW *" />
                                    <TextInput
                                        id="rw"
                                        type="text"
                                        value={data.rw}
                                        onChange={(e) => setData('rw', e.target.value)}
                                        className="mt-1 w-full text-center font-bold text-sm rounded-xl border-gray-300"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dropdown Wilayah Administratif */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2 border-t border-gray-50">
                            <div>
                                <InputLabel htmlFor="provinsi" value="Provinsi *" />
                                <select
                                    id="provinsi"
                                    value={data.provinsi}
                                    onChange={(e) => setData('provinsi', e.target.value)}
                                    className="mt-1 block w-full text-xs font-semibold rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">-- Pilih Provinsi --</option>
                                    {data.provinsi && !provinsiList.some(p => cleanWilayahName(p.nama) === cleanWilayahName(data.provinsi)) && (
                                        <option value={data.provinsi}>{data.provinsi}</option>
                                    )}
                                    {provinsiList.map((p) => (
                                        <option key={p.kode} value={p.nama}>{p.nama}</option>
                                    ))}
                                </select>
                                <InputError message={errors.provinsi} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kabupaten_kota" value="Kabupaten / Kota *" />
                                <select
                                    id="kabupaten_kota"
                                    value={data.kabupaten_kota}
                                    onChange={(e) => setData('kabupaten_kota', e.target.value)}
                                    disabled={!data.provinsi && !data.kabupaten_kota}
                                    className="mt-1 block w-full text-xs font-semibold rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">-- Pilih Kab/Kota --</option>
                                    {data.kabupaten_kota && !kabupatenList.some(k => cleanWilayahName(k.nama) === cleanWilayahName(data.kabupaten_kota)) && (
                                        <option value={data.kabupaten_kota}>{data.kabupaten_kota}</option>
                                    )}
                                    {kabupatenList.map((k) => (
                                        <option key={k.kode} value={k.nama}>{k.nama}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kabupaten_kota} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kecamatan" value="Kecamatan *" />
                                <select
                                    id="kecamatan"
                                    value={data.kecamatan}
                                    onChange={(e) => setData('kecamatan', e.target.value)}
                                    disabled={!data.kabupaten_kota && !data.kecamatan}
                                    className="mt-1 block w-full text-xs font-semibold rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {data.kecamatan && !kecamatanList.some(k => cleanWilayahName(k.nama) === cleanWilayahName(data.kecamatan)) && (
                                        <option value={data.kecamatan}>{data.kecamatan}</option>
                                    )}
                                    {kecamatanList.map((k) => (
                                        <option key={k.kode} value={k.nama}>{k.nama}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kecamatan} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kelurahan" value="Kelurahan / Desa *" />
                                <select
                                    id="kelurahan"
                                    value={data.kelurahan}
                                    onChange={(e) => setData('kelurahan', e.target.value)}
                                    disabled={!data.kecamatan && !data.kelurahan}
                                    className="mt-1 block w-full text-xs font-semibold rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">-- Pilih Kelurahan --</option>
                                    {data.kelurahan && !kelurahanList.some(k => cleanWilayahName(k.nama) === cleanWilayahName(data.kelurahan)) && (
                                        <option value={data.kelurahan}>{data.kelurahan}</option>
                                    )}
                                    {kelurahanList.map((k) => (
                                        <option key={k.kode} value={k.nama}>{k.nama}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kelurahan} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kode_pos" value="Kode Pos" />
                                <TextInput
                                    id="kode_pos"
                                    type="text"
                                    value={data.kode_pos}
                                    onChange={(e) => setData('kode_pos', e.target.value)}
                                    className="mt-1 w-full text-xs font-bold rounded-xl border-gray-300"
                                    placeholder="Cth: 16110"
                                />
                                <InputError message={errors.kode_pos} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 2: UPLOAD DOKUMEN KK DENGAN ENKRIPSI */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-lg font-black">
                                    🔒
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-gray-800">
                                        Arsip Digital Kartu Keluarga (Penyimpanan Terenkripsi)
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Unggah foto/scan KK untuk verifikasi pengurus. Dokumen disimpan dengan enkripsi sistem.
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black border border-cyan-200">
                                MAX 2 MB
                            </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50/50 via-teal-50/50 to-emerald-50/50 border-2 border-dashed border-cyan-300/80 hover:border-cyan-500 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold text-gray-800">
                                            {data.file_kk ? 'File Dipilih: ' + data.file_kk.name : 'Pilih File Gambar atau PDF KK'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black">
                                            AES HASH ENCRYPTED
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Format didukung: <b>JPG, JPEG, PNG, atau PDF</b> (Maksimal ukuran file: <b>2 MB</b>).
                                    </p>
                                    {keluarga?.file_kk && !data.file_kk && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-xs text-emerald-600 font-bold">
                                                ✓ Dokumen KK saat ini sudah tersimpan di database RT
                                            </span>
                                            <a
                                                href={`/storage/${keluarga.file_kk}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-cyan-700 underline hover:text-cyan-900"
                                            >
                                                Lihat Dokumen Tersimpan
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <label
                                        htmlFor="file_kk"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-cyan-50 text-cyan-800 font-extrabold text-xs border border-cyan-300 shadow-sm transition-all cursor-pointer"
                                    >
                                        <span>📂</span>
                                        <span>{data.file_kk ? 'Ganti File KK' : 'Pilih File KK'}</span>
                                        <input
                                            id="file_kk"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file && file.size > 2 * 1024 * 1024) {
                                                    alert('Ukuran file melebihi batas maksimal 2MB!');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                setData('file_kk', file);
                                            }}
                                        />
                                    </label>
                                    {data.file_kk && (
                                        <button
                                            type="button"
                                            onClick={() => setData('file_kk', null)}
                                            className="px-3 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all"
                                        >
                                            Batal
                                        </button>
                                    )}
                                </div>
                            </div>
                            <InputError message={errors.file_kk} className="mt-2" />
                        </div>
                    </div>

                    {/* BAGIAN 3: DAFTAR ANGGOTA KELUARGA (16 KOLOM INDONESIA) */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-black">
                                    👥
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-gray-800">
                                        Daftar Anggota Keluarga (Sensus Warga)
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Isi data setiap anggota keluarga sesuai urutan di Kartu Keluarga (KK) yang berlaku di Indonesia
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setData('anggota', sortAnggotaByHubungan(data.anggota))}
                                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs border border-purple-200 transition-all cursor-pointer"
                                    title="Urutkan posisi baris sesuai aturan Kartu Keluarga (Kepala, Istri, Anak, dst)"
                                >
                                    <span>🔄</span>
                                    <span>Urutkan Hierarki KK</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddAnggota}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
                                >
                                    <span>➕</span>
                                    <span>Tambah Anggota Keluarga</span>
                                </button>
                            </div>
                        </div>

                        {/* DESKTOP TABLE VIEW */}
                        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-inner bg-gray-50/40">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-100/80 text-gray-700 font-black uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3 py-3 text-center w-10">No</th>
                                        <th className="px-3 py-3 text-left min-w-[170px]">NIK & Nama Lengkap</th>
                                        <th className="px-3 py-3 text-left min-w-[120px]">Hubungan & Status</th>
                                        <th className="px-3 py-3 text-left min-w-[150px]">Tempat & Tgl Lahir</th>
                                        <th className="px-3 py-3 text-left min-w-[110px]">L/P & Agama</th>
                                        <th className="px-3 py-3 text-left min-w-[140px]">Pendidikan & Pekerjaan</th>
                                        <th className="px-3 py-3 text-left min-w-[130px]">Nama Orang Tua</th>
                                        <th className="px-3 py-3 text-left min-w-[100px]">No. HP & Wn</th>
                                        <th className="px-3 py-3 text-center w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {data.anggota.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                            {/* NO */}
                                            <td className="px-3 py-3 text-center font-bold text-gray-500">
                                                {idx + 1}
                                            </td>

                                            {/* NIK & NAMA */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <TextInput
                                                    type="text"
                                                    maxLength={16}
                                                    value={item.nik}
                                                    onChange={(e) => handleAnggotaChange(idx, 'nik', e.target.value)}
                                                    placeholder="16 Digit NIK"
                                                    className="w-full text-xs font-mono font-bold py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                />
                                                <TextInput
                                                    type="text"
                                                    value={item.nama_lengkap}
                                                    onChange={(e) => handleAnggotaChange(idx, 'nama_lengkap', e.target.value.toUpperCase())}
                                                    placeholder="Nama Lengkap"
                                                    className="w-full text-xs font-bold uppercase py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                />
                                            </td>

                                            {/* HUBUNGAN & STATUS PERKAWINAN */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <select
                                                    value={item.status_hubungan_keluarga}
                                                    onChange={(e) => handleAnggotaChange(idx, 'status_hubungan_keluarga', e.target.value)}
                                                    className="w-full text-xs font-extrabold py-1 px-2 rounded-lg border-gray-300 text-emerald-800 bg-emerald-50/50"
                                                    required
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
                                                <select
                                                    value={item.status_perkawinan}
                                                    onChange={(e) => handleAnggotaChange(idx, 'status_perkawinan', e.target.value)}
                                                    className="w-full text-xs font-semibold py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                >
                                                    <option value="Belum Kawin">Belum Kawin</option>
                                                    <option value="Kawin">Kawin</option>
                                                    <option value="Cerai Hidup">Cerai Hidup</option>
                                                    <option value="Cerai Mati">Cerai Mati</option>
                                                </select>
                                            </td>

                                            {/* TEMPAT & TANGGAL LAHIR */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <TextInput
                                                    type="text"
                                                    value={item.tempat_lahir}
                                                    onChange={(e) => handleAnggotaChange(idx, 'tempat_lahir', e.target.value)}
                                                    placeholder="Tempat Lahir"
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                />
                                                <TextInput
                                                    type="date"
                                                    value={item.tanggal_lahir}
                                                    onChange={(e) => handleAnggotaChange(idx, 'tanggal_lahir', e.target.value)}
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                />
                                            </td>

                                            {/* JENIS KELAMIN & AGAMA */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <select
                                                    value={item.jenis_kelamin}
                                                    onChange={(e) => handleAnggotaChange(idx, 'jenis_kelamin', e.target.value)}
                                                    className="w-full text-xs font-semibold py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                >
                                                    <option value="Laki-laki">Laki-laki</option>
                                                    <option value="Perempuan">Perempuan</option>
                                                </select>
                                                <select
                                                    value={item.agama}
                                                    onChange={(e) => handleAnggotaChange(idx, 'agama', e.target.value)}
                                                    className="w-full text-xs font-semibold py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                >
                                                    <option value="Islam">Islam</option>
                                                    <option value="Kristen">Kristen</option>
                                                    <option value="Katolik">Katolik</option>
                                                    <option value="Hindu">Hindu</option>
                                                    <option value="Buddha">Buddha</option>
                                                    <option value="Konghucu">Konghucu</option>
                                                </select>
                                            </td>

                                            {/* PENDIDIKAN & PEKERJAAN */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <select
                                                    value={item.pendidikan}
                                                    onChange={(e) => handleAnggotaChange(idx, 'pendidikan', e.target.value)}
                                                    className="w-full text-xs font-semibold py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                >
                                                    <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                                                    <option value="Belum Tamat SD/Sederajat">Belum Tamat SD/Sederajat</option>
                                                    <option value="Tamat SD/Sederajat">Tamat SD/Sederajat</option>
                                                    <option value="SLTP/Sederajat">SLTP/Sederajat</option>
                                                    <option value="SLTA/Sederajat">SLTA/Sederajat</option>
                                                    <option value="D1/D2/D3">D1/D2/D3</option>
                                                    <option value="S1/Diploma IV">S1/Diploma IV</option>
                                                    <option value="S2">S2</option>
                                                    <option value="S3">S3</option>
                                                </select>
                                                <TextInput
                                                    type="text"
                                                    value={item.pekerjaan}
                                                    onChange={(e) => handleAnggotaChange(idx, 'pekerjaan', e.target.value)}
                                                    placeholder="Pekerjaan"
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-gray-300"
                                                    required
                                                />
                                            </td>

                                            {/* NAMA ORANG TUA */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <TextInput
                                                    type="text"
                                                    value={item.nama_ayah}
                                                    onChange={(e) => handleAnggotaChange(idx, 'nama_ayah', e.target.value)}
                                                    placeholder="Nama Ayah"
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-gray-300"
                                                />
                                                <TextInput
                                                    type="text"
                                                    value={item.nama_ibu}
                                                    onChange={(e) => handleAnggotaChange(idx, 'nama_ibu', e.target.value)}
                                                    placeholder="Nama Ibu"
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-gray-300"
                                                />
                                            </td>

                                            {/* NO. HP & KEWARGANEGARAAN */}
                                            <td className="px-3 py-3 space-y-1.5">
                                                <TextInput
                                                    type="text"
                                                    value={item.no_hp}
                                                    onChange={(e) => handleAnggotaChange(idx, 'no_hp', e.target.value)}
                                                    placeholder="0812..."
                                                    className="w-full text-xs py-1 px-2 rounded-lg border-gray-300"
                                                />
                                                <select
                                                    value={item.kewarganegaraan}
                                                    onChange={(e) => handleAnggotaChange(idx, 'kewarganegaraan', e.target.value)}
                                                    className="w-full text-xs font-semibold py-1 px-2 rounded-lg border-gray-300"
                                                >
                                                    <option value="WNI">WNI</option>
                                                    <option value="WNA">WNA</option>
                                                </select>
                                            </td>

                                            {/* AKSI */}
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAnggota(idx)}
                                                    title="Hapus baris ini"
                                                    className="p-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition-all"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-gray-500">
                                Total Anggota Terdaftar: <b>{data.anggota.length}</b> Orang
                            </span>
                            <button
                                type="button"
                                onClick={handleAddAnggota}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold transition-all"
                            >
                                <span>➕</span>
                                <span>Tambah Anggota Keluarga Lagi</span>
                            </button>
                        </div>
                    </div>

                    {/* STICKY BOTTOM BAR AXI SIMPAN */}
                    <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                                💾
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm sm:text-base">
                                    Konfirmasi Pengkinian Data Sensus
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Pastikan seluruh NIK & identitas sesuai Kartu Keluarga asli.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={handleClearForm}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
                                title="Bersihkan seluruh kolom isian sebelum input data baru"
                            >
                                <span>🗑️</span>
                                <span>Clear / Bersihkan Form</span>
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                                <span>✨</span>
                                <span>{processing ? 'Menyimpan & Memverifikasi...' : 'Simpan & Perbarui Data Keluarga'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* MODAL SCANNER AI OCR */}
            <KKScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                file={data.file_kk}
                onApply={handleApplyOCRData}
            />

            {/* MODAL PANDUAN PENGKINIAN DATA */}
            {showGuideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <span className="text-xl">ℹ️</span>
                                <h3 className="font-black text-base sm:text-lg">Panduan Pengkinian Data Mandiri</h3>
                            </div>
                            <button
                                onClick={() => setShowGuideModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                            <p>
                                <b>1. Scan OCR Otomatis:</b> Gunakan tombol <span className="text-emerald-700 font-bold">⚡ Scan KK (OCR AI)</span> untuk memindai dokumen KK Anda agar sistem mengisi nomor KK, alamat, dan anggota keluarga secara otomatis.
                            </p>
                            <p>
                                <b>2. Format Enkripsi Aman:</b> Dokumen scan Kartu Keluarga yang Anda unggah dilindungi oleh enkripsi hash server RT dan tidak dapat diakses oleh pihak yang tidak berwenang.
                            </p>
                            <p>
                                <b>3. Kolom Standar Indonesia:</b> Lengkapi 16 kolom data anggota keluarga dari <i>Kepala Keluarga, Istri, Anak</i> hingga informasi pekerjaan dan kewarganegaraan.
                            </p>
                            <p>
                                <b>4. Sensus Lingkungan:</b> Data yang sudah disimpan akan otomatis masuk dalam rekapitulasi data kependudukan RT untuk mendukung penyaluran Bansos & layanan publik.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowGuideModal(false)}
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all"
                        >
                            Mengerti & Mulai Mengisi Data
                        </button>
                    </div>
                </div>
            )}
        </WargaLayout>
    );
}
