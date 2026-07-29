import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import axios from 'axios';

export default function Create({ rumahBloks }) {
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

    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);

    // Fetch Provinsi on mount
    useEffect(() => {
        axios.get('/api/wilayah/provinsi').then(res => {
            setProvinsiList(res.data);
        });
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
        // Only clear children if this was a user action, handled in onChange
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
        post(route('admin.keluarga.store'));
    };

    return (
        <AdminLayout header="Tambah Kartu Keluarga (KK)">
            <Head title="Tambah KK" />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-lg font-medium text-gray-900">Informasi Kartu Keluarga</h2>
                        <p className="mt-1 text-sm text-gray-500">Masukkan detail nomor KK dan alamat domisili lengkap.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="col-span-1 md:col-span-2">
                            <InputLabel htmlFor="no_kk" value="Nomor Kartu Keluarga (KK)" />
                            <TextInput
                                id="no_kk"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.no_kk}
                                onChange={(e) => setData('no_kk', e.target.value)}
                                required
                            />
                            <InputError message={errors.no_kk} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="blok" value="Blok Rumah (Domisili RT)" />
                            <TextInput
                                id="blok"
                                type="text"
                                className="mt-1 block w-full uppercase"
                                value={data.blok}
                                onChange={(e) => setData('blok', e.target.value.toUpperCase())}
                                placeholder="Cth: A, B1, C"
                                required
                            />
                            <InputError message={errors.blok} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nomor_rumah" value="Nomor Rumah" />
                            <TextInput
                                id="nomor_rumah"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.nomor_rumah}
                                onChange={(e) => setData('nomor_rumah', e.target.value)}
                                placeholder="Cth: 12, 14A"
                                required
                            />
                            <InputError message={errors.nomor_rumah} className="mt-2" />
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Alamat Sesuai KTP/KK</h3>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <InputLabel htmlFor="alamat_lengkap" value="Alamat Jalan/Dusun" />
                            <TextInput
                                id="alamat_lengkap"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.alamat_lengkap}
                                onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                required
                            />
                            <InputError message={errors.alamat_lengkap} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="rt" value="RT" />
                            <TextInput
                                id="rt"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.rt}
                                onChange={(e) => setData('rt', e.target.value)}
                                required
                            />
                            <InputError message={errors.rt} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="rw" value="RW" />
                            <TextInput
                                id="rw"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.rw}
                                onChange={(e) => setData('rw', e.target.value)}
                                required
                            />
                            <InputError message={errors.rw} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="provinsi" value="Provinsi" />
                            <select
                                id="provinsi"
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                value={data.provinsi}
                                onChange={(e) => setData(prev => ({ ...prev, provinsi: e.target.value, kabupaten_kota: '', kecamatan: '', kelurahan: '' }))}
                                required
                            >
                                <option value="">-- Pilih Provinsi --</option>
                                {provinsiList.map(prov => (
                                    <option key={prov.kode} value={prov.nama}>{prov.nama}</option>
                                ))}
                            </select>
                            <InputError message={errors.provinsi} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="kabupaten_kota" value="Kabupaten/Kota" />
                            <select
                                id="kabupaten_kota"
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm disabled:bg-gray-100"
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
                            <InputError message={errors.kabupaten_kota} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="kecamatan" value="Kecamatan" />
                            <select
                                id="kecamatan"
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm disabled:bg-gray-100"
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
                            <InputError message={errors.kecamatan} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="kelurahan" value="Kelurahan/Desa" />
                            <select
                                id="kelurahan"
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm disabled:bg-gray-100"
                                value={data.kelurahan}
                                onChange={(e) => setData('kelurahan', e.target.value)}
                                required
                                disabled={kelurahanList.length === 0}
                            >
                                <option value="">-- Pilih Kelurahan/Desa --</option>
                                {kelurahanList.map(kel => (
                                    <option key={kel.kode} value={kel.nama}>{kel.nama}</option>
                                ))}
                            </select>
                            <InputError message={errors.kelurahan} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="kode_pos" value="Kode Pos" />
                            <TextInput
                                id="kode_pos"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.kode_pos}
                                onChange={(e) => setData('kode_pos', e.target.value)}
                            />
                            <InputError message={errors.kode_pos} className="mt-2" />
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Unggah Dokumen (Opsional)</h3>
                        </div>

                        <div>
                            <InputLabel htmlFor="file_kk" value="Scan/Foto Kartu Keluarga (KK)" />
                            <input
                                id="file_kk"
                                type="file"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={(e) => setData('file_kk', e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <InputError message={errors.file_kk} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="file_ktp_kepala" value="Scan/Foto KTP Kepala Keluarga" />
                            <input
                                id="file_ktp_kepala"
                                type="file"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={(e) => setData('file_ktp_kepala', e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <InputError message={errors.file_ktp_kepala} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-8 border-t border-gray-100 pt-5">
                        <Link href={route('admin.keluarga.index')} className="text-gray-600 hover:text-gray-900 font-medium mr-4">
                            Batal
                        </Link>
                        <PrimaryButton className="ml-4 bg-blue-600 hover:bg-blue-700" disabled={processing}>
                            Simpan KK
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
