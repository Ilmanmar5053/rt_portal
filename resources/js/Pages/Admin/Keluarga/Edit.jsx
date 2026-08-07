import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Edit({ keluarga, rumahBloks, wargas }) {
    // Parse initial Blok & Nomor Rumah from DB relation or fallback to parsing alamat_lengkap
    let initialBlok = keluarga.rumah_blok?.blok || keluarga.blok || '';
    let initialNoRumah = keluarga.rumah_blok?.nomor_rumah || keluarga.nomor_rumah || '';

    if (!initialBlok || !initialNoRumah) {
        const alamat = keluarga.alamat_lengkap || '';
        const blokMatch = alamat.match(/BLOK\.?\s*([A-Za-z0-9]+)/i);
        const noMatch = alamat.match(/NO\.?\s*([A-Za-z0-9]+)/i);
        if (!initialBlok && blokMatch) initialBlok = `BLOK ${blokMatch[1]}`.toUpperCase();
        if (!initialNoRumah && noMatch) initialNoRumah = noMatch[1];
    }

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        no_kk: keluarga.no_kk || '',
        kepala_keluarga_id: keluarga.kepala_keluarga_id || '',
        kepala_keluarga_nama: keluarga.kepala_keluarga?.nama_lengkap || keluarga.kepala_keluarga_nama || '',
        blok: initialBlok,
        nomor_rumah: initialNoRumah,
        alamat_lengkap: keluarga.alamat_lengkap || '',
        rt: keluarga.rt || '005',
        rw: keluarga.rw || '008',
        provinsi: keluarga.provinsi || 'Banten',
        kabupaten_kota: keluarga.kabupaten_kota || 'Kabupaten Serang',
        kecamatan: keluarga.kecamatan || 'Pontang',
        kelurahan: keluarga.kelurahan || 'Pontang',
        kode_pos: keluarga.kode_pos || '42135',
        file_kk: null,
        file_ktp_kepala: null,
    });

    const hasWargas = wargas && wargas.length > 0;
    const [showManualInput, setShowManualInput] = useState(!hasWargas);

    const handleSelectKepala = (e) => {
        const id = e.target.value;
        if (id === '__manual') {
            setShowManualInput(true);
            setData('kepala_keluarga_id', '');
            return;
        }
        const selected = wargas.find(w => String(w.id) === String(id));
        setData(prev => ({
            ...prev,
            kepala_keluarga_id: id,
            kepala_keluarga_nama: selected ? selected.nama_lengkap : '',
        }));
        setShowManualInput(false);
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
        if (data.provinsi && provinsiList.length > 0) {
            let selectedProv = provinsiList.find(p => p.nama === data.provinsi) ||
                provinsiList.find(p => p.nama.toUpperCase() === data.provinsi.toUpperCase());

            if (!selectedProv) {
                const cleanTarget = cleanWilayahName(data.provinsi);
                selectedProv = provinsiList.find(p => cleanWilayahName(p.nama) === cleanTarget);
            }

            if (selectedProv) {
                if (data.provinsi !== selectedProv.nama && !provinsiList.some(p => p.nama === data.provinsi)) {
                    setData('provinsi', selectedProv.nama);
                }
                axios.get(`/api/wilayah/kabupaten/${selectedProv.kode}`).then(res => {
                    setKabupatenList(res.data);
                });
            }
        } else if (!data.provinsi) {
            setKabupatenList([]);
        }
    }, [data.provinsi, provinsiList]);

    // Fetch Kecamatan when Kabupaten changes & auto-align target string
    useEffect(() => {
        if (data.kabupaten_kota && kabupatenList.length > 0) {
            let selectedKab = kabupatenList.find(k => k.nama === data.kabupaten_kota) ||
                kabupatenList.find(k => k.nama.toUpperCase() === data.kabupaten_kota.toUpperCase());

            if (!selectedKab) {
                const cleanTarget = cleanWilayahName(data.kabupaten_kota);
                const isKota = data.kabupaten_kota.toUpperCase().includes('KOTA');
                selectedKab = kabupatenList.find(k => {
                    const kClean = cleanWilayahName(k.nama);
                    const kIsKota = k.nama.toUpperCase().includes('KOTA');
                    return kClean === cleanTarget && isKota === kIsKota;
                }) || kabupatenList.find(k => cleanWilayahName(k.nama) === cleanTarget);
            }

            if (selectedKab) {
                if (data.kabupaten_kota !== selectedKab.nama && !kabupatenList.some(k => k.nama === data.kabupaten_kota)) {
                    setData('kabupaten_kota', selectedKab.nama);
                }
                axios.get(`/api/wilayah/kecamatan/${selectedKab.kode}`).then(res => {
                    setKecamatanList(res.data);
                });
            }
        } else if (!data.kabupaten_kota) {
            setKecamatanList([]);
        }
    }, [data.kabupaten_kota, kabupatenList]);

    // Fetch Kelurahan when Kecamatan changes & auto-align target string
    useEffect(() => {
        if (data.kecamatan && kecamatanList.length > 0) {
            let selectedKec = kecamatanList.find(k => k.nama === data.kecamatan) ||
                kecamatanList.find(k => k.nama.toUpperCase() === data.kecamatan.toUpperCase());

            if (!selectedKec) {
                const cleanTarget = cleanWilayahName(data.kecamatan);
                selectedKec = kecamatanList.find(k => cleanWilayahName(k.nama) === cleanTarget);
            }

            if (selectedKec) {
                if (data.kecamatan !== selectedKec.nama && !kecamatanList.some(k => k.nama === data.kecamatan)) {
                    setData('kecamatan', selectedKec.nama);
                }
                axios.get(`/api/wilayah/kelurahan/${selectedKec.kode}`).then(res => {
                    setKelurahanList(res.data);
                });
            }
        } else if (!data.kecamatan) {
            setKelurahanList([]);
        }
    }, [data.kecamatan, kecamatanList]);

    // Auto-align Kelurahan target string
    useEffect(() => {
        if (data.kelurahan && kelurahanList.length > 0) {
            let selectedKel = kelurahanList.find(k => k.nama === data.kelurahan) ||
                kelurahanList.find(k => k.nama.toUpperCase() === data.kelurahan.toUpperCase());

            if (!selectedKel) {
                const cleanTarget = cleanWilayahName(data.kelurahan);
                selectedKel = kelurahanList.find(k => cleanWilayahName(k.nama) === cleanTarget);
            }

            if (selectedKel && data.kelurahan !== selectedKel.nama && !kelurahanList.some(k => k.nama === data.kelurahan)) {
                setData('kelurahan', selectedKel.nama);
            }
        }
    }, [data.kelurahan, kelurahanList]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.keluarga.update', keluarga.id));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="text-xl">✏️</span>
                    <h2 className="text-lg font-black leading-tight text-gray-800 tracking-tight">
                        Edit Kartu Keluarga (KK)
                    </h2>
                </div>
            }
        >
            <Head title={`Edit KK - ${keluarga.no_kk}`} />

            <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">

                {/* Hero Header Banner */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white rounded-3xl p-5 shadow-lg border border-emerald-500/30 relative overflow-hidden flex items-center justify-between gap-4">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/20">
                            ✏️ PEMBARUAN DATA KK
                        </span>
                        <h2 className="text-lg sm:text-xl font-black tracking-wide">
                            Edit Kartu Keluarga: {keluarga.no_kk}
                        </h2>
                        <p className="text-xs text-emerald-100 font-medium">
                            Perbarui nomor resmi KK, penentuan Kepala Keluarga, alamat domisili, atau lampiran file.
                        </p>
                    </div>

                    <Link
                        href={route('admin.keluarga.index')}
                        className="relative z-10 inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-extrabold px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 transition-all text-xs shrink-0"
                    >
                        <span>📌</span>
                        <span>Kembali</span>
                    </Link>
                </div>

                {/* MAIN FORM EDIT */}
                <form onSubmit={submit} className="space-y-5">

                    {/* SECTION 1: Identitas & Kepala Keluarga */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black">
                                📋
                            </span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Identitas KK & Pemegang Kepala Keluarga
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Pilih Kepala Keluarga dari anggota warga yang sudah terdaftar di KK ini
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="no_kk" value="Nomor Kartu Keluarga (KK) 16 Digit *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                        🔢
                                    </span>
                                    <TextInput
                                        id="no_kk"
                                        type="text"
                                        maxLength="16"
                                        className="pl-10 block w-full font-mono font-black text-sm tracking-wider rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50"
                                        value={data.no_kk}
                                        onChange={(e) => setData('no_kk', e.target.value)}
                                        placeholder="3604..."
                                        required
                                    />
                                </div>
                                <InputError message={errors.no_kk} className="mt-1" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel htmlFor="kepala_keluarga_id" value="Kepala Keluarga *" />
                                    {hasWargas && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowManualInput(!showManualInput);
                                                if (!showManualInput) setData('kepala_keluarga_id', '');
                                            }}
                                            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                                        >
                                            {showManualInput ? '📋 Pilih dari List Warga' : '✏️ Input Manual'}
                                        </button>
                                    )}
                                </div>

                                {!showManualInput && hasWargas ? (
                                    <div className="mt-1">
                                        <select
                                            id="kepala_keluarga_id"
                                            value={data.kepala_keluarga_id || '__manual'}
                                            onChange={handleSelectKepala}
                                            className="block w-full text-xs font-bold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm bg-white py-2.5"
                                        >
                                            <option value="">-- Pilih Kepala Keluarga --</option>
                                            {wargas.map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.nama_lengkap} — NIK: {w.nik}
                                                </option>
                                            ))}
                                            <option value="__manual">✏️ + Input Manual Nama Baru</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <TextInput
                                            id="kepala_keluarga_nama"
                                            type="text"
                                            className="block w-full font-extrabold text-xs uppercase rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={data.kepala_keluarga_nama}
                                            onChange={(e) => setData('kepala_keluarga_nama', e.target.value.toUpperCase())}
                                            placeholder="NAMA KEPALA KELUARGA"
                                            required={showManualInput}
                                        />
                                    </div>
                                )}
                                <InputError message={errors.kepala_keluarga_id || errors.kepala_keluarga_nama} className="mt-1" />
                            </div>
                        </div>

                        {/* Blok & Nomor Rumah */}
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
                                        className="pl-10 block w-full font-bold text-sm uppercase rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
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
                                        className="pl-10 block w-full font-bold text-sm rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
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

                    {/* SECTION 2: Alamat & Wilayah */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 space-y-4">
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
                                        {data.provinsi && !provinsiList.some(p => cleanWilayahName(p.nama) === cleanWilayahName(data.provinsi)) && (
                                            <option value={data.provinsi}>{data.provinsi}</option>
                                        )}
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
                                        disabled={!data.provinsi && kabupatenList.length === 0}
                                    >
                                        <option value="">-- Pilih Kab/Kota --</option>
                                        {data.kabupaten_kota && !kabupatenList.some(k => cleanWilayahName(k.nama) === cleanWilayahName(data.kabupaten_kota)) && (
                                            <option value={data.kabupaten_kota}>{data.kabupaten_kota}</option>
                                        )}
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
                                        disabled={!data.kabupaten_kota && kecamatanList.length === 0}
                                    >
                                        <option value="">-- Pilih Kecamatan --</option>
                                        {data.kecamatan && !kecamatanList.some(k => cleanWilayahName(k.nama) === cleanWilayahName(data.kecamatan)) && (
                                            <option value={data.kecamatan}>{data.kecamatan}</option>
                                        )}
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
                                        disabled={!data.kecamatan && kelurahanList.length === 0}
                                    >
                                        <option value="">-- Pilih Kelurahan --</option>
                                        {data.kelurahan && !kelurahanList.some(k => cleanWilayahName(k.nama) === cleanWilayahName(data.kelurahan)) && (
                                            <option value={data.kelurahan}>{data.kelurahan}</option>
                                        )}
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
                                        maxLength="5"
                                        className="mt-1 block w-full font-mono font-bold text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        value={data.kode_pos}
                                        onChange={(e) => setData('kode_pos', e.target.value)}
                                        placeholder="Cth: 15310"
                                    />
                                    <InputError message={errors.kode_pos} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Lampiran File Dokumen */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center text-sm font-black">
                                📎
                            </span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Unggah / Perbarui Dokumen Lampiran (Opsional)
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Format didukung: JPG, PNG, atau PDF (Maksimal 2 MB per file)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="file_kk" value="File Softcopy Kartu Keluarga (KK)" />
                                <input
                                    id="file_kk"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setData('file_kk', e.target.files[0])}
                                    className="mt-1 block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                />
                                {keluarga.file_kk_path && (
                                    <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
                                        ✓ File KK tersimpan. Upload baru untuk mengganti.
                                    </p>
                                )}
                                <InputError message={errors.file_kk} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="file_ktp_kepala" value="File KTP Kepala Keluarga" />
                                <input
                                    id="file_ktp_kepala"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setData('file_ktp_kepala', e.target.files[0])}
                                    className="mt-1 block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
                                />
                                {keluarga.file_ktp_kepala_path && (
                                    <p className="mt-1 text-[11px] text-cyan-700 font-semibold">
                                        ✓ File KTP tersimpan. Upload baru untuk mengganti.
                                    </p>
                                )}
                                <InputError message={errors.file_ktp_kepala} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* BOTTON ACTION BAR */}
                    <div className="flex items-center justify-between pt-2">
                        <Link
                            href={route('admin.keluarga.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
                        >
                            <span>✕</span>
                            <span>Batal</span>
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                        >
                            <span>💾</span>
                            <span>{processing ? 'Menyimpan Perubahan...' : 'Simpan Perubahan KK'}</span>
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
