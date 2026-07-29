import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        jenis_surat: 'Surat Keterangan Domisili',
        keperluan: '',
        keterangan_tambahan: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('warga.surat.store'));
    };

    return (
        <WargaLayout header="Ajukan Surat Pengantar">
            <Head title="Ajukan Surat" />
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="jenis_surat" value="Jenis Surat" />
                        <select id="jenis_surat" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" value={data.jenis_surat} onChange={(e) => setData('jenis_surat', e.target.value)}>
                            <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                            <option value="Surat Pindah">Surat Pindah</option>
                            <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu</option>
                            <option value="Surat Keterangan Usaha">Surat Keterangan Usaha</option>
                        </select>
                        <InputError message={errors.jenis_surat} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="keperluan" value="Keperluan" />
                        <textarea id="keperluan" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="4" value={data.keperluan} onChange={(e) => setData('keperluan', e.target.value)} required></textarea>
                        <InputError message={errors.keperluan} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="keterangan_tambahan" value="Keterangan Tambahan (Opsional)" />
                        <textarea id="keterangan_tambahan" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="3" value={data.keterangan_tambahan} onChange={(e) => setData('keterangan_tambahan', e.target.value)}></textarea>
                        <InputError message={errors.keterangan_tambahan} className="mt-2" />
                    </div>
                    <div className="flex items-center justify-end border-t border-gray-100 pt-5">
                        <Link href={route('warga.surat.index')} className="text-gray-600 hover:text-gray-900 font-medium mr-4 text-sm">Batal</Link>
                        <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">Ajukan Surat</button>
                    </div>
                </form>
            </div>
        </WargaLayout>
    );
}
