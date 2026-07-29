import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Edit({ rumah }) {
    const { data, setData, put, processing, errors } = useForm({
        blok: rumah.blok || '',
        nomor_rumah: rumah.nomor_rumah || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.rumah.update', rumah.id));
    };

    return (
        <AdminLayout header="Edit Master Rumah">
            <Head title="Edit Data Rumah" />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-6">
                        
                        <div>
                            <InputLabel htmlFor="blok" value="Blok Rumah" />
                            <TextInput
                                id="blok"
                                type="text"
                                name="blok"
                                value={data.blok}
                                className="mt-1 block w-full uppercase"
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
                                name="nomor_rumah"
                                value={data.nomor_rumah}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('nomor_rumah', e.target.value)}
                                placeholder="Cth: 12, 14A"
                                required
                            />
                            <InputError message={errors.nomor_rumah} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Status Hunian (Otomatis)" />
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${rumah.status_hunian === 'Kosong' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {rumah.status_hunian}
                                </span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700 flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span><strong>Info:</strong> Status hunian diatur otomatis oleh sistem berdasarkan data KK yang terdaftar di blok rumah ini.</span>
                            </p>
                        </div>
                        
                    </div>

                    <div className="flex items-center justify-end mt-8 border-t border-gray-100 pt-5">
                        <Link href={route('admin.rumah.index')} className="text-gray-600 hover:text-gray-900 font-medium mr-4">
                            Batal
                        </Link>
                        <PrimaryButton className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
