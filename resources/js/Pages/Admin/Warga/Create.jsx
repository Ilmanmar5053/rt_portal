import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import FormSection from '@/Components/FormSection';

export default function Create({ keluargas, default_keluarga_id }) {
    const { data, setData, post, processing, errors } = useForm({
        keluarga_id: default_keluarga_id || '',
        nik: '',
        nama_lengkap: '',
        tempat_lahir: 'SERANG',
        tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki',
        agama: 'Islam',
        pendidikan: 'SLTA/Sederajat',
        pekerjaan: 'Karyawan Swasta',
        status_perkawinan: 'Belum Kawin',
        status_hubungan_keluarga: 'Anak',
        kewarganegaraan: 'WNI',
        nama_ayah: '',
        nama_ibu: '',
        no_hp: '',
        status_hidup: 'Hidup',
        buat_akun: false,
        email: '',
        generate_iuran: [],
    });

    const [iuranOptions, setIuranOptions] = useState([
        { jenis: 'Wajib', checked: false, nominal: 50000 },
        { jenis: 'Keamanan', checked: false, nominal: 25000 },
        { jenis: 'Kebersihan', checked: false, nominal: 15000 },
        { jenis: 'Sukarela', checked: false, nominal: 10000 },
        { jenis: 'Sumbangan Duka Cita', checked: false, nominal: 10000 },
    ]);

    // Auto-fill parent info and place of birth from selected KK
    useEffect(() => {
        if (data.keluarga_id && keluargas) {
            const selectedKk = keluargas.find(k => String(k.id) === String(data.keluarga_id));
            if (selectedKk) {
                const kepalaNama = selectedKk.kepala_keluarga?.nama_lengkap || selectedKk.kepala_keluarga_nama || '';
                const istriObj = selectedKk.wargas?.find(w => w.status_hubungan_keluarga === 'Istri');
                
                setData(prev => ({
                    ...prev,
                    tempat_lahir: prev.tempat_lahir || 'SERANG',
                    nama_ayah: (prev.status_hubungan_keluarga === 'Anak' && kepalaNama) ? kepalaNama : (prev.nama_ayah || kepalaNama || ''),
                    nama_ibu: (prev.status_hubungan_keluarga === 'Anak' && istriObj) ? istriObj.nama_lengkap : (prev.nama_ibu || ''),
                }));
            }
        }
    }, [data.keluarga_id, data.status_hubungan_keluarga, keluargas]);

    useEffect(() => {
        setData('generate_iuran', iuranOptions.filter(opt => opt.checked).map(opt => ({
            jenis: opt.jenis,
            nominal: opt.nominal
        })));
    }, [iuranOptions]);

    const handleIuranChange = (index, field, value) => {
        const newOptions = [...iuranOptions];
        newOptions[index][field] = value;
        setIuranOptions(newOptions);
    };

    const submit = (e) => {
        e.preventDefault();

        if (data.nik && data.nik.length !== 16) {
            alert('NIK wajib terdiri dari tepat 16 digit angka!');
            return;
        }

        post(route('admin.warga.store'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-slate-800">
                            Tambah Anggota Warga Baru
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Lengkapi data kependudukan dan status dalam Kartu Keluarga (KK)
                        </p>
                    </div>
                    <Link
                        href={route('admin.warga.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl shadow-xs transition"
                    >
                        ← Kembali ke Daftar
                    </Link>
                </div>
            }
        >
            <Head title="Tambah Warga Baru" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl">
                    <form onSubmit={submit}>
                        
                        {/* Section 1: Kartu Keluarga & Status Hubungan */}
                        <FormSection
                            title="Kartu Keluarga & Hubungan"
                            description="Pilih Kartu Keluarga (KK) tempat anggota ini terdaftar serta status kepemimpinannya dalam keluarga."
                            color="blue"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            }
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="keluarga_id" value="Data Keluarga (Nomor KK) *" />
                                    <select
                                        id="keluarga_id"
                                        className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm font-medium"
                                        value={data.keluarga_id}
                                        onChange={(e) => setData('keluarga_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Kartu Keluarga --</option>
                                        {keluargas.map(kk => (
                                            <option key={kk.id} value={kk.id}>
                                                {kk.no_kk} - {kk.kepala_keluarga ? `Kepala: ${kk.kepala_keluarga.nama_lengkap}` : kk.kepala_keluarga_nama ? `Kepala: ${kk.kepala_keluarga_nama}` : 'Belum ada Kepala Keluarga'}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.keluarga_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status_hubungan_keluarga" value="Status Hubungan *" />
                                    <select
                                        id="status_hubungan_keluarga"
                                        className="mt-1 block w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm font-medium"
                                        value={data.status_hubungan_keluarga}
                                        onChange={(e) => setData('status_hubungan_keluarga', e.target.value)}
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
                                    <InputError message={errors.status_hubungan_keluarga} className="mt-2" />
                                </div>
                            </div>
                        </FormSection>

                        {/* Section 2: Identitas Pribadi & Kelahiran */}
                        <FormSection
                            title="Identitas Pribadi & Kelahiran"
                            description="Data NIK (Wajib 16 digit), nama lengkap sesuai KTP, dan informasi kelahiran."
                            color="emerald"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                            }
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <InputLabel htmlFor="nik" value="NIK (Nomor Induk Kependudukan) *" />
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${data.nik && data.nik.length === 16 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            {data.nik.length} / 16 Digit
                                        </span>
                                    </div>
                                    <TextInput
                                        id="nik"
                                        type="text"
                                        maxLength="16"
                                        name="nik"
                                        value={data.nik}
                                        className="mt-1 block w-full font-mono font-bold"
                                        placeholder="Cth: 3604123456780001"
                                        onChange={(e) => setData('nik', e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                    {data.nik && data.nik.length !== 16 && (
                                        <p className="text-xs text-rose-600 font-bold mt-1">
                                            ⚠️ NIK wajib terdiri dari tepat 16 digit angka (tidak boleh kurang atau lebih).
                                        </p>
                                    )}
                                    <InputError message={errors.nik} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap *" />
                                    <TextInput
                                        id="nama_lengkap"
                                        type="text"
                                        name="nama_lengkap"
                                        value={data.nama_lengkap}
                                        className="mt-1 block w-full uppercase font-bold"
                                        placeholder="Nama sesuai KTP"
                                        onChange={(e) => setData('nama_lengkap', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <InputError message={errors.nama_lengkap} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="tempat_lahir" value="Tempat Lahir *" />
                                    <TextInput
                                        id="tempat_lahir"
                                        type="text"
                                        className="mt-1 block w-full uppercase"
                                        value={data.tempat_lahir}
                                        placeholder="Cth: SERANG, JAKARTA"
                                        onChange={(e) => setData('tempat_lahir', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <InputError message={errors.tempat_lahir} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tanggal_lahir" value="Tanggal Lahir *" />
                                    <TextInput
                                        id="tanggal_lahir"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.tanggal_lahir}
                                        onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tanggal_lahir} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="jenis_kelamin" value="Jenis Kelamin *" />
                                    <select
                                        id="jenis_kelamin"
                                        className="mt-1 block w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm font-medium"
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                    <InputError message={errors.jenis_kelamin} className="mt-2" />
                                </div>
                            </div>
                        </FormSection>

                        {/* Section 3: Agama, Pendidikan & Pekerjaan (Dropdown Uniform List) */}
                        <FormSection
                            title="Agama, Pendidikan & Pekerjaan"
                            description="Pilih latar belakang pendidikan dan pekerjaan dari daftar pilihan historis resmi."
                            color="indigo"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                            }
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="agama" value="Agama *" />
                                    <select
                                        id="agama"
                                        className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm font-medium"
                                        value={data.agama}
                                        onChange={(e) => setData('agama', e.target.value)}
                                    >
                                        <option value="Islam">Islam</option>
                                        <option value="Kristen">Kristen</option>
                                        <option value="Katolik">Katolik</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Buddha">Buddha</option>
                                        <option value="Konghucu">Konghucu</option>
                                        <option value="Aliran Kepercayaan">Aliran Kepercayaan</option>
                                    </select>
                                    <InputError message={errors.agama} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pendidikan" value="Pendidikan Terakhir *" />
                                    <select
                                        id="pendidikan"
                                        className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm font-medium"
                                        value={data.pendidikan}
                                        onChange={(e) => setData('pendidikan', e.target.value)}
                                        required
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
                                    <InputError message={errors.pendidikan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pekerjaan" value="Pekerjaan *" />
                                    <select
                                        id="pekerjaan"
                                        className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm font-medium"
                                        value={data.pekerjaan}
                                        onChange={(e) => setData('pekerjaan', e.target.value)}
                                        required
                                    >
                                        <option value="Belum/Tidak Bekerja">Belum/Tidak Bekerja</option>
                                        <option value="Mengurus Rumah Tangga">Mengurus Rumah Tangga</option>
                                        <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                                        <option value="PNS">PNS</option>
                                        <option value="TNI/Polri">TNI/Polri</option>
                                        <option value="Karyawan Swasta">Karyawan Swasta</option>
                                        <option value="Karyawan BUMN">Karyawan BUMN</option>
                                        <option value="Wiraswasta">Wiraswasta</option>
                                        <option value="Petani/Pekebun">Petani/Pekebun</option>
                                        <option value="Nelayan">Nelayan</option>
                                        <option value="Buruh Harian Lepas">Buruh Harian Lepas</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    <InputError message={errors.pekerjaan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status_perkawinan" value="Status Perkawinan *" />
                                    <select
                                        id="status_perkawinan"
                                        className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm font-medium"
                                        value={data.status_perkawinan}
                                        onChange={(e) => setData('status_perkawinan', e.target.value)}
                                    >
                                        <option value="Belum Kawin">Belum Kawin</option>
                                        <option value="Kawin">Kawin</option>
                                        <option value="Cerai Hidup">Cerai Hidup</option>
                                        <option value="Cerai Mati">Cerai Mati</option>
                                    </select>
                                    <InputError message={errors.status_perkawinan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kewarganegaraan" value="Kewarganegaraan *" />
                                    <select
                                        id="kewarganegaraan"
                                        className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm font-medium"
                                        value={data.kewarganegaraan}
                                        onChange={(e) => setData('kewarganegaraan', e.target.value)}
                                    >
                                        <option value="WNI">WNI (Warga Negara Indonesia)</option>
                                        <option value="WNA">WNA (Warga Negara Asing)</option>
                                    </select>
                                    <InputError message={errors.kewarganegaraan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status_hidup" value="Status Hidup *" />
                                    <select
                                        id="status_hidup"
                                        className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm font-medium"
                                        value={data.status_hidup}
                                        onChange={(e) => setData('status_hidup', e.target.value)}
                                    >
                                        <option value="Hidup">Hidup</option>
                                        <option value="Meninggal">Meninggal</option>
                                    </select>
                                    <InputError message={errors.status_hidup} className="mt-2" />
                                </div>
                            </div>
                        </FormSection>

                        {/* Section 4: Data Orang Tua & Kontak */}
                        <FormSection
                            title="Data Orang Tua & Kontak"
                            description="Otomatis terisi dari nama Kepala Keluarga & Istri dalam KK."
                            color="purple"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            }
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="nama_ayah" value="Nama Ayah *" />
                                    <TextInput
                                        id="nama_ayah"
                                        type="text"
                                        className="mt-1 block w-full uppercase font-bold bg-slate-50"
                                        value={data.nama_ayah}
                                        placeholder="NAMA AYAH KANDUNG"
                                        onChange={(e) => setData('nama_ayah', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <InputError message={errors.nama_ayah} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama_ibu" value="Nama Ibu *" />
                                    <TextInput
                                        id="nama_ibu"
                                        type="text"
                                        className="mt-1 block w-full uppercase font-bold bg-slate-50"
                                        value={data.nama_ibu}
                                        placeholder="NAMA IBU KANDUNG"
                                        onChange={(e) => setData('nama_ibu', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <InputError message={errors.nama_ibu} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="no_hp" value="Nomor HP / WhatsApp" />
                                    <TextInput
                                        id="no_hp"
                                        type="text"
                                        className="mt-1 block w-full font-mono"
                                        value={data.no_hp}
                                        placeholder="Cth: 081234567890"
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                    />
                                    <InputError message={errors.no_hp} className="mt-2" />
                                </div>
                            </div>
                        </FormSection>

                        {/* Submit Button */}
                        <div className="mt-8 flex justify-end gap-3">
                            <Link
                                href={route('admin.warga.index')}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition"
                            >
                                Batal
                            </Link>
                            <PrimaryButton disabled={processing} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer">
                                + Simpan Data Warga
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
