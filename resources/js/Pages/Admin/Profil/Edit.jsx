import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';
import { Transition } from '@headlessui/react';

export default function Edit({ auth, profil }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nama_rt: profil.nama_rt || '',
        alamat: profil.alamat || '',
        nomor_wa: profil.nomor_wa || '',
        logo: null,
        ttd_ketua: null,
        ttd_sekretaris: null,
        pengurus: profil.pengurus || [],
    });

    const [previewLogo, setPreviewLogo] = useState(
        profil.logo_path ? `/storage/${profil.logo_path}` : null
    );
    
    const [previewTtdKetua, setPreviewTtdKetua] = useState(
        profil.ttd_ketua_path ? `/storage/${profil.ttd_ketua_path}` : null
    );
    
    const [previewTtdSekretaris, setPreviewTtdSekretaris] = useState(
        profil.ttd_sekretaris_path ? `/storage/${profil.ttd_sekretaris_path}` : null
    );

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };
    
    const handleTtdKetuaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('ttd_ketua', file);
            setPreviewTtdKetua(URL.createObjectURL(file));
        }
    };
    
    const handleTtdSekretarisChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('ttd_sekretaris', file);
            setPreviewTtdSekretaris(URL.createObjectURL(file));
        }
    };

    const addPengurus = () => {
        setData('pengurus', [...data.pengurus, { jabatan: '', nama: '' }]);
    };

    const removePengurus = (index) => {
        const newPengurus = [...data.pengurus];
        newPengurus.splice(index, 1);
        setData('pengurus', newPengurus);
    };

    const updatePengurus = (index, field, value) => {
        const newPengurus = [...data.pengurus];
        newPengurus[index][field] = value;
        setData('pengurus', newPengurus);
    };

    const submit = (e) => {
        e.preventDefault();
        // Inertia uses post to upload files, even when updating
        post(route('admin.profil.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pengaturan Profil Lingkungan RT</h2>}
        >
            <Head title="Pengaturan Profil" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    Profil RT berhasil diperbarui.
                                </div>
                            </Transition>

                            <form onSubmit={submit} className="space-y-8" encType="multipart/form-data">
                                
                                {/* Bagian Informasi Umum */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Informasi Umum</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="nama_rt" value="Nama Organisasi (Misal: RT 05 / RW 08)" />
                                            <TextInput
                                                id="nama_rt"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.nama_rt}
                                                onChange={(e) => setData('nama_rt', e.target.value)}
                                                required
                                            />
                                            <InputError className="mt-2" message={errors.nama_rt} />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="nomor_wa" value="Nomor WhatsApp (Layanan Warga)" />
                                            <TextInput
                                                id="nomor_wa"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.nomor_wa}
                                                onChange={(e) => setData('nomor_wa', e.target.value)}
                                                placeholder="Contoh: 0812-3456-7890"
                                            />
                                            <InputError className="mt-2" message={errors.nomor_wa} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="alamat" value="Alamat Lengkap Lingkungan" />
                                            <textarea
                                                id="alamat"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                rows="3"
                                            ></textarea>
                                            <InputError className="mt-2" message={errors.alamat} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Logo */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Logo Organisasi</h3>
                                    <div className="flex items-center gap-6">
                                        <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                            {previewLogo ? (
                                                <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <span className="text-gray-400 text-sm">Belum ada logo</span>
                                            )}
                                        </div>
                                        <div>
                                            <input 
                                                type="file" 
                                                id="logo" 
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                            />
                                            <p className="mt-2 text-sm text-gray-500">Gunakan format PNG, JPG, atau SVG transparan agar terlihat rapi.</p>
                                            <InputError className="mt-2" message={errors.logo} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Tanda Tangan Digital */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Tanda Tangan Digital (E-Surat)</h3>
                                    <p className="text-sm text-gray-600 mb-6">Upload tanda tangan dalam format PNG dengan background transparan untuk digunakan di surat resmi.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* TTD Ketua */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h4 className="font-semibold text-gray-800 mb-4">Tanda Tangan Ketua RT</h4>
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                                    {previewTtdKetua ? (
                                                        <img src={previewTtdKetua} alt="TTD Ketua Preview" className="max-w-full max-h-full object-contain p-2" />
                                                    ) : (
                                                        <span className="text-gray-400 text-sm text-center px-4">Belum ada tanda tangan</span>
                                                    )}
                                                </div>
                                                <div className="w-full">
                                                    <input 
                                                        type="file" 
                                                        id="ttd_ketua" 
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                                        accept="image/png"
                                                        onChange={handleTtdKetuaChange}
                                                    />
                                                    <p className="mt-2 text-xs text-gray-500">Format: PNG transparan saja</p>
                                                    <InputError className="mt-2" message={errors.ttd_ketua} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* TTD Sekretaris */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h4 className="font-semibold text-gray-800 mb-4">Tanda Tangan Sekretaris</h4>
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                                    {previewTtdSekretaris ? (
                                                        <img src={previewTtdSekretaris} alt="TTD Sekretaris Preview" className="max-w-full max-h-full object-contain p-2" />
                                                    ) : (
                                                        <span className="text-gray-400 text-sm text-center px-4">Belum ada tanda tangan</span>
                                                    )}
                                                </div>
                                                <div className="w-full">
                                                    <input 
                                                        type="file" 
                                                        id="ttd_sekretaris" 
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                        accept="image/png"
                                                        onChange={handleTtdSekretarisChange}
                                                    />
                                                    <p className="mt-2 text-xs text-gray-500">Format: PNG transparan saja</p>
                                                    <InputError className="mt-2" message={errors.ttd_sekretaris} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Kepengurusan */}
                                <div>
                                    <div className="flex justify-between items-end border-b pb-2 mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Struktur Kepengurusan</h3>
                                        <button 
                                            type="button" 
                                            onClick={addPengurus}
                                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            Tambah Pengurus
                                        </button>
                                    </div>

                                    {data.pengurus.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm py-4">Belum ada data kepengurusan. Silakan tambah data.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.pengurus.map((item, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <div className="flex-1 w-full">
                                                        <InputLabel value="Jabatan (Misal: Ketua RT)" />
                                                        <TextInput
                                                            type="text"
                                                            className="mt-1 block w-full"
                                                            value={item.jabatan}
                                                            onChange={(e) => updatePengurus(index, 'jabatan', e.target.value)}
                                                            required
                                                        />
                                                        {errors[`pengurus.${index}.jabatan`] && <InputError className="mt-1" message={errors[`pengurus.${index}.jabatan`]} />}
                                                    </div>
                                                    <div className="flex-1 w-full">
                                                        <InputLabel value="Nama Lengkap" />
                                                        <TextInput
                                                            type="text"
                                                            className="mt-1 block w-full"
                                                            value={item.nama}
                                                            onChange={(e) => updatePengurus(index, 'nama', e.target.value)}
                                                            required
                                                        />
                                                        {errors[`pengurus.${index}.nama`] && <InputError className="mt-1" message={errors[`pengurus.${index}.nama`]} />}
                                                    </div>
                                                    <div className="sm:mt-6 w-full sm:w-auto">
                                                        <button 
                                                            type="button"
                                                            onClick={() => removePengurus(index)}
                                                            className="w-full sm:w-auto text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end pt-6 border-t">
                                    <PrimaryButton disabled={processing} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-sm rounded-xl">
                                        Simpan Perubahan
                                    </PrimaryButton>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
