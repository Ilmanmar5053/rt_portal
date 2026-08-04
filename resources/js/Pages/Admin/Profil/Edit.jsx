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
        rekening_bank: profil.rekening_bank || [],
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

    const addRekening = () => {
        setData('rekening_bank', [...(data.rekening_bank || []), { bank: 'BCA', nomor_rekening: '', atas_nama: '', catatan: '' }]);
    };

    const removeRekening = (index) => {
        const newRek = [...(data.rekening_bank || [])];
        newRek.splice(index, 1);
        setData('rekening_bank', newRek);
    };

    const updateRekening = (index, field, value) => {
        const newRek = [...(data.rekening_bank || [])];
        newRek[index][field] = value;
        setData('rekening_bank', newRek);
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
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-lg shadow-sm">
                            🏛️
                        </span>
                        <div>
                            <h2 className="font-black text-lg text-gray-900 leading-tight">Pengaturan Profil Lingkungan RT</h2>
                            <p className="text-xs text-gray-500 font-medium">Kelola identitas, tanda tangan digital, kepengurusan, dan rekening kas</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Profil" />

            <div className="py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 -translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-2"
                    >
                        <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 border border-emerald-200 shadow-xs">
                            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">✓</span>
                            <div>
                                <h4 className="font-extrabold text-sm">Berhasil Disimpan!</h4>
                                <p className="text-xs text-emerald-700">Profil lingkungan RT telah diperbarui dan otomatis tersinkron ke dashboard warga.</p>
                            </div>
                        </div>
                    </Transition>

                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        
                        {/* CARD 1: INFORMASI UMUM */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2.5">
                                <span className="text-base">🏛️</span>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900">Informasi Umum & Kontak</h3>
                                    <p className="text-[11px] text-gray-500">Identitas utama lingkungan dan kontak layanan warga</p>
                                </div>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="nama_rt" value="Nama Organisasi (Misal: RT 009 / RW 006)" />
                                    <TextInput
                                        id="nama_rt"
                                        type="text"
                                        className="mt-1 block w-full text-sm rounded-xl"
                                        value={data.nama_rt}
                                        onChange={(e) => setData('nama_rt', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-1.5 text-xs" message={errors.nama_rt} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nomor_wa" value="Nomor WhatsApp (Layanan Warga)" />
                                    <TextInput
                                        id="nomor_wa"
                                        type="text"
                                        className="mt-1 block w-full text-sm rounded-xl"
                                        value={data.nomor_wa}
                                        onChange={(e) => setData('nomor_wa', e.target.value)}
                                        placeholder="Contoh: 0812-3456-7890"
                                    />
                                    <InputError className="mt-1.5 text-xs" message={errors.nomor_wa} />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="alamat" value="Alamat Lengkap Lingkungan" />
                                    <textarea
                                        id="alamat"
                                        className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-xs text-sm"
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        rows="2"
                                        placeholder="Contoh: Jl. Perumahan Asri Blok C No. 1-20..."
                                    ></textarea>
                                    <InputError className="mt-1.5 text-xs" message={errors.alamat} />
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: ASSETS GRAFIS (LOGO & TTD) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base">🖼️</span>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">Aset Grafis (Logo & E-Surat)</h3>
                                        <p className="text-[11px] text-gray-500">Logo RT dan tanda tangan digital untuk dokumen & surat resmi</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                                    Format: PNG / JPG
                                </span>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Logo */}
                                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 flex flex-col items-center text-center">
                                    <div className="text-xs font-black text-gray-800 mb-2.5">Logo Lingkungan</div>
                                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden mb-3 shadow-2xs">
                                        {previewLogo ? (
                                            <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain p-1.5" />
                                        ) : (
                                            <span className="text-gray-400 text-[10px] font-medium">Belum ada</span>
                                        )}
                                    </div>
                                    <label htmlFor="logo" className="w-full cursor-pointer bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-extrabold transition text-center shadow-2xs">
                                        Pilih Logo...
                                        <input 
                                            type="file" 
                                            id="logo" 
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </label>
                                    <InputError className="mt-1 text-[11px]" message={errors.logo} />
                                </div>

                                {/* TTD Ketua */}
                                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 flex flex-col items-center text-center">
                                    <div className="text-xs font-black text-gray-800 mb-2.5">TTD Ketua RT</div>
                                    <div className="w-24 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden mb-3 shadow-2xs">
                                        {previewTtdKetua ? (
                                            <img src={previewTtdKetua} alt="TTD Ketua" className="max-w-full max-h-full object-contain p-1.5" />
                                        ) : (
                                            <span className="text-gray-400 text-[10px] font-medium">Belum ada</span>
                                        )}
                                    </div>
                                    <label htmlFor="ttd_ketua" className="w-full cursor-pointer bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-extrabold transition text-center shadow-2xs">
                                        Upload TTD Ketua...
                                        <input 
                                            type="file" 
                                            id="ttd_ketua" 
                                            className="hidden"
                                            accept="image/png"
                                            onChange={handleTtdKetuaChange}
                                        />
                                    </label>
                                    <InputError className="mt-1 text-[11px]" message={errors.ttd_ketua} />
                                </div>

                                {/* TTD Sekretaris */}
                                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 flex flex-col items-center text-center">
                                    <div className="text-xs font-black text-gray-800 mb-2.5">TTD Sekretaris</div>
                                    <div className="w-24 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden mb-3 shadow-2xs">
                                        {previewTtdSekretaris ? (
                                            <img src={previewTtdSekretaris} alt="TTD Sekretaris" className="max-w-full max-h-full object-contain p-1.5" />
                                        ) : (
                                            <span className="text-gray-400 text-[10px] font-medium">Belum ada</span>
                                        )}
                                    </div>
                                    <label htmlFor="ttd_sekretaris" className="w-full cursor-pointer bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-extrabold transition text-center shadow-2xs">
                                        Upload TTD Sekretaris...
                                        <input 
                                            type="file" 
                                            id="ttd_sekretaris" 
                                            className="hidden"
                                            accept="image/png"
                                            onChange={handleTtdSekretarisChange}
                                        />
                                    </label>
                                    <InputError className="mt-1 text-[11px]" message={errors.ttd_sekretaris} />
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: STRUKTUR KEPENGURUSAN */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base">👥</span>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">Struktur Kepengurusan RT</h3>
                                        <p className="text-[11px] text-gray-500">Daftar nama dan jabatan pengurus lingkungan</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addPengurus}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-extrabold flex items-center gap-1 shadow-2xs transition"
                                >
                                    <span>+</span>
                                    <span>Tambah Pengurus</span>
                                </button>
                            </div>

                            <div className="p-6">
                                {data.pengurus.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 italic text-xs">Belum ada data kepengurusan. Klik tombol "Tambah Pengurus" di atas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {data.pengurus.map((item, index) => (
                                            <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-200/80 items-center">
                                                <div className="sm:col-span-5">
                                                    <InputLabel value="Jabatan" className="text-[11px] text-gray-500 mb-1" />
                                                    <TextInput
                                                        type="text"
                                                        className="block w-full text-xs rounded-xl"
                                                        placeholder="Misal: Ketua RT / Bendahara"
                                                        value={item.jabatan}
                                                        onChange={(e) => updatePengurus(index, 'jabatan', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-6">
                                                    <InputLabel value="Nama Lengkap" className="text-[11px] text-gray-500 mb-1" />
                                                    <TextInput
                                                        type="text"
                                                        className="block w-full text-xs rounded-xl"
                                                        placeholder="Misal: H. Achmad S..."
                                                        value={item.nama}
                                                        onChange={(e) => updatePengurus(index, 'nama', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-1 flex justify-end sm:mt-5">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removePengurus(index)}
                                                        className="w-full sm:w-auto text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center"
                                                        title="Hapus Pengurus"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CARD 4: REKENING & INFO PEMBAYARAN IURAN */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base">💳</span>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">Rekening Bank & Kas Iuran</h3>
                                        <p className="text-[11px] text-gray-500">Tampil otomatis pada pop-up pembayaran di dashboard warga</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addRekening}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-extrabold flex items-center gap-1 shadow-2xs transition"
                                >
                                    <span>+</span>
                                    <span>Tambah Rekening</span>
                                </button>
                            </div>

                            <div className="p-6">
                                {!data.rekening_bank || data.rekening_bank.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 italic text-xs">Belum ada data rekening. Klik tombol "Tambah Rekening" di atas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {data.rekening_bank.map((item, index) => (
                                            <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-200/80 items-center">
                                                <div className="sm:col-span-3">
                                                    <InputLabel value="Bank / E-Wallet" className="text-[11px] text-gray-500 mb-1" />
                                                    <select
                                                        className="block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-xs text-xs"
                                                        value={item.bank || 'BCA'}
                                                        onChange={(e) => updateRekening(index, 'bank', e.target.value)}
                                                    >
                                                        <option value="BCA">BCA (Bank Central Asia)</option>
                                                        <option value="Mandiri">Bank Mandiri</option>
                                                        <option value="BNI">BNI</option>
                                                        <option value="BRI">BRI</option>
                                                        <option value="BSI">BSI (Syariah)</option>
                                                        <option value="Bank Jago">Bank Jago</option>
                                                        <option value="SeaBank">SeaBank</option>
                                                        <option value="DANA">DANA</option>
                                                        <option value="OVO">OVO</option>
                                                        <option value="GoPay">GoPay</option>
                                                        <option value="Lainnya">Bank / Kas Lainnya</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <InputLabel value="Nomor Rekening / HP" className="text-[11px] text-gray-500 mb-1" />
                                                    <TextInput
                                                        type="text"
                                                        className="block w-full text-xs rounded-xl font-mono"
                                                        placeholder="Contoh: 5480012345"
                                                        value={item.nomor_rekening || ''}
                                                        onChange={(e) => updateRekening(index, 'nomor_rekening', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <InputLabel value="Atas Nama (A/N)" className="text-[11px] text-gray-500 mb-1" />
                                                    <TextInput
                                                        type="text"
                                                        className="block w-full text-xs rounded-xl"
                                                        placeholder="Contoh: Pengurus RT 009"
                                                        value={item.atas_nama || ''}
                                                        onChange={(e) => updateRekening(index, 'atas_nama', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <InputLabel value="Catatan (Opsional)" className="text-[11px] text-gray-500 mb-1" />
                                                    <TextInput
                                                        type="text"
                                                        className="block w-full text-xs rounded-xl"
                                                        placeholder="Kas RT / Kebersihan"
                                                        value={item.catatan || ''}
                                                        onChange={(e) => updateRekening(index, 'catatan', e.target.value)}
                                                    />
                                                </div>
                                                <div className="sm:col-span-1 flex justify-end sm:mt-5">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeRekening(index)}
                                                        className="w-full sm:w-auto text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center"
                                                        title="Hapus Rekening"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STICKY FOOTER ACTION BAR */}
                        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-200/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <span className="text-emerald-600 font-bold">⚡ Info:</span>
                                <span>Perubahan ini langsung berlaku di dashboard utama maupun portal warga.</span>
                            </div>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span>💾</span>
                                <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
