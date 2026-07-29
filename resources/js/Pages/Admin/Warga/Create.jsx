import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Create({ keluargas }) {
    const { data, setData, post, processing, errors } = useForm({
        keluarga_id: '',
        nik: '',
        nama_lengkap: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki',
        agama: 'Islam',
        pendidikan: '',
        pekerjaan: '',
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
        post(route('admin.warga.store'));
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Anggota Keluarga (Warga)</h2>}
        >
            <Head title="Tambah Warga" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 p-8">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div className="border-b border-gray-100 pb-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Data Keluarga (No KK)</h3>
                                <p className="text-sm text-gray-500 mt-1">Pilih Kartu Keluarga tempat anggota ini terdaftar.</p>
                                <div className="mt-4">
                                    <select
                                        id="keluarga_id"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.keluarga_id}
                                        onChange={(e) => setData('keluarga_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Kartu Keluarga --</option>
                                        {keluargas.map(kk => (
                                            <option key={kk.id} value={kk.id}>
                                                {kk.no_kk} - {kk.kepala_keluarga ? `Kepala: ${kk.kepala_keluarga.nama_lengkap}` : 'Belum ada Kepala Keluarga'}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.keluarga_id} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="nik" value="NIK" />
                                    <TextInput
                                        id="nik"
                                        type="text"
                                        name="nik"
                                        value={data.nik}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nik', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nik} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" />
                                    <TextInput
                                        id="nama_lengkap"
                                        type="text"
                                        name="nama_lengkap"
                                        value={data.nama_lengkap}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nama_lengkap} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="tempat_lahir" value="Tempat Lahir" />
                                    <TextInput
                                        id="tempat_lahir"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.tempat_lahir}
                                        onChange={(e) => setData('tempat_lahir', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tempat_lahir} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tanggal_lahir" value="Tanggal Lahir" />
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

                                <div>
                                    <InputLabel htmlFor="jenis_kelamin" value="Jenis Kelamin" />
                                    <select
                                        id="jenis_kelamin"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                    <InputError message={errors.jenis_kelamin} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="agama" value="Agama" />
                                    <select
                                        id="agama"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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
                                    <InputLabel htmlFor="pendidikan" value="Pendidikan" />
                                    <TextInput
                                        id="pendidikan"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.pendidikan}
                                        placeholder="Cth: SLTA / SEDERAJAT"
                                        onChange={(e) => setData('pendidikan', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <InputError message={errors.pendidikan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pekerjaan" value="Pekerjaan" />
                                    <TextInput
                                        id="pekerjaan"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.pekerjaan}
                                        placeholder="Cth: WIRASWASTA"
                                        onChange={(e) => setData('pekerjaan', e.target.value.toUpperCase())}
                                        required
                                    />
                                    <InputError message={errors.pekerjaan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status_perkawinan" value="Status Perkawinan" />
                                    <select
                                        id="status_perkawinan"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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
                                    <InputLabel htmlFor="status_hubungan_keluarga" value="Status Hubungan Keluarga" />
                                    <select
                                        id="status_hubungan_keluarga"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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

                                <div>
                                    <InputLabel htmlFor="kewarganegaraan" value="Kewarganegaraan" />
                                    <select
                                        id="kewarganegaraan"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.kewarganegaraan}
                                        onChange={(e) => setData('kewarganegaraan', e.target.value)}
                                    >
                                        <option value="WNI">WNI</option>
                                        <option value="WNA">WNA</option>
                                    </select>
                                    <InputError message={errors.kewarganegaraan} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="no_hp" value="Nomor HP" />
                                    <TextInput
                                        id="no_hp"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.no_hp}
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                    />
                                    <InputError message={errors.no_hp} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama_ayah" value="Nama Ayah" />
                                    <TextInput
                                        id="nama_ayah"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.nama_ayah}
                                        onChange={(e) => setData('nama_ayah', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nama_ayah} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama_ibu" value="Nama Ibu" />
                                    <TextInput
                                        id="nama_ibu"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.nama_ibu}
                                        onChange={(e) => setData('nama_ibu', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nama_ibu} className="mt-2" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center mb-4">
                                    <input
                                        id="buat_akun"
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        checked={data.buat_akun}
                                        onChange={(e) => setData('buat_akun', e.target.checked)}
                                    />
                                    <label htmlFor="buat_akun" className="ms-2 text-sm font-medium text-gray-900">
                                        Buatkan Akun Login untuk warga ini (Password default adalah NIK)
                                    </label>
                                </div>
                                {data.buat_akun && (
                                    <div className="mb-4">
                                        <InputLabel htmlFor="email" value="Email Akun Login" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full max-w-md"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required={data.buat_akun}
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Tagihan Iuran Awal (Opsional)</h3>
                                <p className="text-sm text-gray-500 mb-4">Centang jenis iuran yang ingin langsung ditagihkan kepada warga ini untuk bulan berjalan.</p>
                                
                                <div className="space-y-4">
                                    {iuranOptions.map((opt, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center min-w-[200px]">
                                                <input
                                                    id={`iuran_${index}`}
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                                                    checked={opt.checked}
                                                    onChange={(e) => handleIuranChange(index, 'checked', e.target.checked)}
                                                />
                                                <label htmlFor={`iuran_${index}`} className="ms-3 text-sm font-medium text-gray-900">
                                                    {opt.jenis}
                                                </label>
                                            </div>
                                            
                                            {opt.checked && (
                                                <div className="flex-1 max-w-[200px] flex items-center">
                                                    <span className="text-gray-500 text-sm mr-2">Rp</span>
                                                    <TextInput
                                                        type="number"
                                                        value={opt.nominal}
                                                        className="block w-full text-sm py-1.5"
                                                        onChange={(e) => handleIuranChange(index, 'nominal', e.target.value)}
                                                        required={opt.checked}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                                <Link href={route('admin.warga.index')} className="text-gray-600 hover:text-gray-900 font-medium">Batal</Link>
                                <PrimaryButton className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl" disabled={processing}>
                                    Simpan Data
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
