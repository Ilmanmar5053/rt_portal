import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Edit({ keluarga, rumahBloks, wargas }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        no_kk: keluarga.no_kk || '',
        kepala_keluarga_id: keluarga.kepala_keluarga_id || '',
        kepala_keluarga_nama: keluarga.kepala_keluarga?.nama_lengkap || keluarga.kepala_keluarga_nama || '',
        blok: keluarga.rumah_blok?.blok || '',
        nomor_rumah: keluarga.rumah_blok?.nomor_rumah || '',
        alamat_lengkap: keluarga.alamat_lengkap || '',
        rt: keluarga.rt || '005',
        rw: keluarga.rw || '008',
        provinsi: keluarga.provinsi || '',
        kabupaten_kota: keluarga.kabupaten_kota || '',
        kecamatan: keluarga.kecamatan || '',
        kelurahan: keluarga.kelurahan || '',
        kode_pos: keluarga.kode_pos || '',
        file_kk: null,
        file_ktp_kepala: null,
    });

    // Smart kepala keluarga: jika wargas ada, deteksi dari list; jika tidak → input manual
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

    // Fetch Kabupaten when Provinsi changes
    useEffect(() => {
        if (data.provinsi) {
            const selectedProv = provinsiList.find(p => p.nama === data.provinsi);
            if (selectedProv) {
                axios.get(`/api/wilayah/kabupaten/${selectedProv.kode}`).then(res => {
                    setKabupatenList(res.data);
                });
            }
        } else {
            setKabupatenList([]);
        }
    }, [data.provinsi, provinsiList]);

    // Fetch Kecamatan when Kabupaten changes
    useEffect(() => {
        if (data.kabupaten_kota) {
            const selectedKab = kabupatenList.find(k => k.nama === data.kabupaten_kota);
            if (selectedKab) {
                axios.get(`/api/wilayah/kecamatan/${selectedKab.kode}`).then(res => {
                    setKecamatanList(res.data);
                });
            }
        } else {
            setKecamatanList([]);
        }
    }, [data.kabupaten_kota, kabupatenList]);

    // Fetch Kelurahan when Kecamatan changes
    useEffect(() => {
        if (data.kecamatan) {
            const selectedKec = kecamatanList.find(k => k.nama === data.kecamatan);
            if (selectedKec) {
                axios.get(`/api/wilayah/kelurahan/${selectedKec.kode}`).then(res => {
                    setKelurahanList(res.data);
                });
            }
        } else {
            setKelurahanList([]);
        }
    }, [data.kecamatan, kecamatanList]);

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

            {/* Container Compact & Presisi (max-w-3xl agar rapat, tidak terlalu lebar dan lebih fokus) */}
            <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">

                {/* 1. Hero Header Banner (Warna Senada Emerald-Teal) */}
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
                        href={route('admin.keluarga.show', keluarga.id)}
                        className="relative z-10 inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-extrabold px-4 py-2 rounded-xl border border-white/20 transition-all text-xs flex-shrink-0"
                    >
                        <span>⬅️</span>
                        <span>Kembali</span>
                    </Link>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={submit} encType="multipart/form-data" className="space-y-5">

                    {/* Section 1: 📋 Identitas & Kepala Keluarga */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
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

                        <div className="space-y-4">
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

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <InputLabel htmlFor="kepala_keluarga_id" value="Kepala Keluarga" />
                                        {hasWargas && (
                                            <button
                                                type="button"
                                                onClick={() => setShowManualInput(!showManualInput)}
                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold transition"
                                            >
                                                {showManualInput ? '📋 Pilih dari Daftar Warga' : '✏️ Input Manual'}
                                            </button>
                                        )}
                                    </div>

                                    {/* CASE 1: Ada anggota keluarga terdaftar → tampilkan dropdown */}
                                    {hasWargas && !showManualInput ? (
                                        <div className="space-y-1.5">
                                            <select
                                                id="kepala_keluarga_id"
                                                className="mt-1 block w-full text-xs font-bold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm bg-white py-2.5"
                                                value={data.kepala_keluarga_id}
                                                onChange={handleSelectKepala}
                                            >
                                                <option value="">-- Pilih Kepala Keluarga --</option>
                                                {wargas.map(w => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.nama_lengkap} &mdash; NIK: {w.nik}
                                                    </option>
                                                ))}
                                                <option value="__manual">✏️ Input Nama Manual...</option>
                                            </select>
                                            {data.kepala_keluarga_id && data.kepala_keluarga_nama && (
                                                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                                    <span>✓</span>
                                                    <span>{data.kepala_keluarga_nama}</span>
                                                    <span className="text-gray-400 font-normal">dipilih sebagai Kepala Keluarga</span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        /* CASE 2: Belum ada anggota / pilih manual */
                                        <div className="space-y-2">
                                            <div className="relative mt-1">
                                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">👤</span>
                                                <input
                                                    type="text"
                                                    id="kepala_keluarga_nama"
                                                    className="pl-10 block w-full text-xs font-bold border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm"
                                                    value={data.kepala_keluarga_nama}
                                                    onChange={(e) => setData(prev => ({ ...prev, kepala_keluarga_nama: e.target.value, kepala_keluarga_id: '' }))}
                                                    placeholder="Ketik nama Kepala Keluarga..."
                                                />
                                            </div>
                                            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 font-medium">
                                                ⚠️ {hasWargas 
                                                    ? 'Mode input manual aktif. Anda bisa memilih dari daftar warga dengan klik tombol di atas.' 
                                                    : 'Belum ada anggota warga terdaftar di KK ini. Simpan dulu, lalu tambahkan warga melalui menu Manajemen Warga.'}
                                            </p>
                                        </div>
                                    )}
                                    <InputError message={errors.kepala_keluarga_id} className="mt-1" />
                                    <InputError message={errors.kepala_keluarga_nama} className="mt-1" />
                                </div>
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

                    {/* Section 3: 🗂️ Unggah / Perbarui Dokumen Lampiran KK & KTP */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-black">
                                🗂️
                            </span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">
                                    Unggah / Perbarui Dokumen Lampiran (Opsional)
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Biarkan kosong jika tidak ingin memperbarui lampiran sebelumnya
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* File Scan KK */}
                            <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${data.file_kk ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center text-base font-black shadow-sm">
                                            📄
                                        </span>
                                        <div>
                                            <InputLabel htmlFor="file_kk" value="Scan Kartu Keluarga (KK)" />
                                            <p className="text-[10px] text-gray-400">File KK asli/fotokopi</p>
                                        </div>
                                    </div>
                                    {keluarga.file_kk && !data.file_kk && (
                                        <a href={`/storage/${keluarga.file_kk}`} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                            ✓ Ada File Lama
                                        </a>
                                    )}
                                </div>
                                <input
                                    id="file_kk"
                                    type="file"
                                    className="mt-2 block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                                    onChange={(e) => setData('file_kk', e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {data.file_kk && (
                                    <p className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                                        <span>✓ File Baru:</span>
                                        <span className="truncate">{data.file_kk.name}</span>
                                    </p>
                                )}
                                <InputError message={errors.file_kk} className="mt-1" />
                            </div>

                            {/* File KTP Kepala Keluarga */}
                            <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${data.file_ktp_kepala ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-base font-black shadow-sm">
                                            🪪
                                        </span>
                                        <div>
                                            <InputLabel htmlFor="file_ktp_kepala" value="Scan KTP Kepala Keluarga" />
                                            <p className="text-[10px] text-gray-400">KTP pemegang KK</p>
                                        </div>
                                    </div>
                                    {keluarga.file_ktp_kepala && !data.file_ktp_kepala && (
                                        <a href={`/storage/${keluarga.file_ktp_kepala}`} target="_blank" rel="noreferrer" className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                            ✓ Ada File Lama
                                        </a>
                                    )}
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
                                        <span>✓ File Baru:</span>
                                        <span className="truncate">{data.file_ktp_kepala.name}</span>
                                    </p>
                                )}
                                <InputError message={errors.file_ktp_kepala} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Action Buttons (Rapat & Intuitif) */}
                    <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <Link
                            href={route('admin.keluarga.show', keluarga.id)}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition-all"
                        >
                            <span>⬅️</span>
                            <span>Batal</span>
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                        >
                            <span>💾</span>
                            <span>{processing ? 'Memperbarui...' : 'Simpan Perubahan KK'}</span>
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
