import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useState } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        judul: '',
        deskripsi: '',
        kategori: 'Lainnya',
        foto_bukti: [],
        is_anonim: false,
    });

    const [warningMessage, setWarningMessage] = useState('');
    const [lastClickAt, setLastClickAt] = useState(null);

    const submit = (e) => {
        e.preventDefault();

        // Deteksi klik ganda cepat
        const now = Date.now();
        if (lastClickAt && now - lastClickAt < 800) {
            setWarningMessage('Masih ada pengaduan yang masih berlangsung, pengaduan hanya bisa dilakukan setelah pengaduan sebelumnya berstatus "selesai".');
            setTimeout(() => setWarningMessage(''), 5000);
            return;
        }
        setLastClickAt(now);

        post(route('warga.pengaduan.store'));
    };

    return (
        <WargaLayout header="Buat Pengaduan Baru">
            <Head title="Buat Pengaduan" />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                {warningMessage && (
                    <div className="p-4 mb-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                        {warningMessage}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                    <div>
                        <InputLabel htmlFor="judul" value="Judul Pengaduan" />
                        <input
                            id="judul"
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.judul}
                            onChange={(e) => setData('judul', e.target.value)}
                            required
                        />
                        <InputError message={errors.judul} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="kategori" value="Kategori" />
                        <select
                            id="kategori"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.kategori}
                            onChange={(e) => setData('kategori', e.target.value)}
                        >
                            <option value="Keamanan">Keamanan</option>
                            <option value="Fasilitas">Fasilitas</option>
                            <option value="Kebersihan">Kebersihan</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                        <InputError message={errors.kategori} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="deskripsi" value="Deskripsi Lengkap" />
                        <textarea
                            id="deskripsi"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="5"
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            required
                        ></textarea>
                        <InputError message={errors.deskripsi} className="mt-2" />
                    </div>
 
                    <div>
                        <InputLabel htmlFor="foto_bukti" value="Unggah Bukti Foto (1-3 gambar)" />
                        <input
                            id="foto_bukti"
                            type="file"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            multiple
                            accept="image/*"
                            onChange={(e) => setData('foto_bukti', Array.from(e.target.files))}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Unggah minimal 1 dan maksimal 3 foto untuk bukti pengaduan.</p>
                        <InputError
                            message={errors.foto_bukti || errors['foto_bukti.0'] || errors['foto_bukti.1'] || errors['foto_bukti.2']}
                            className="mt-2"
                        />
                    </div>
 
                    <div className="flex items-center gap-2">
                        <input
                            id="is_anonim"
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={data.is_anonim}
                            onChange={(e) => setData('is_anonim', e.target.checked)}
                        />
                        <label htmlFor="is_anonim" className="text-sm text-gray-600">Kirim sebagai anonim (nama tidak ditampilkan ke pengurus)</label>
                    </div>

                    <div className="flex items-center justify-end border-t border-gray-100 pt-5">
                        <Link href={route('warga.pengaduan.index')} className="text-gray-600 hover:text-gray-900 font-medium mr-4 text-sm">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            Kirim Pengaduan
                        </button>
                    </div>
                </form>
            </div>
        </WargaLayout>
    );
}
