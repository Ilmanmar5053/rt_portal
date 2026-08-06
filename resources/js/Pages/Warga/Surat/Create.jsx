import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const suratCategories = [
    {
        name: 'Kependudukan & Identitas',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        items: [
            { id: 'Surat Pengantar Pembuatan KTP & KK', title: 'Pembuatan KTP & KK', icon: '💳', placeholder: 'Contoh: Pembuatan e-KTP baru karena hilang / Perubahan KK', help: 'Sertakan keterangan kehilangan jika karena hilang' },
            { id: 'Surat Pengantar Pindah Datang / Pindah Keluar', title: 'Pindah Domisili', icon: '🚚', placeholder: 'Contoh: Pindah ke kota Bandung / Pindah datang dari Jakarta', help: 'Tuliskan alamat tujuan pindah dengan lengkap' },
            { id: 'Surat Keterangan Domisili', title: 'Domisili', icon: '🏠', placeholder: 'Contoh: Syarat melamar pekerjaan / Buka rekening Bank', help: 'Sebutkan instansi yang meminta surat domisili' },
        ]
    },
    {
        name: 'Sosial & Kesejahteraan',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        items: [
            { id: 'Surat Keterangan Tidak Mampu (SKTM)', title: 'SKTM', icon: '🤝', placeholder: 'Contoh: Syarat beasiswa KIP / Keringanan biaya RS', help: 'Sebutkan tujuan penggunaan SKTM' },
            { id: 'Surat Pengantar Kematian', title: 'Kematian', icon: '🕊️', placeholder: 'Contoh: Nama Almarhum: Budi, Meninggal di RSUD', help: 'Tuliskan Nama Almarhum, Waktu, dan Tempat Meninggal' },
            { id: 'Surat Pengantar Kelahiran', title: 'Kelahiran', icon: '🍼', placeholder: 'Contoh: Nama Anak: Siti, Lahir di Bidan', help: 'Tuliskan Nama Anak, Waktu, dan Tempat Lahir' },
        ]
    },
    {
        name: 'Ekonomi & Perizinan',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        items: [
            { id: 'Surat Keterangan Usaha (SKU)', title: 'Keterangan Usaha', icon: '🏪', placeholder: 'Contoh: Usaha Warung Sembako, Pengajuan KUR BRI', help: 'Sebutkan jenis usaha dan lokasinya' },
            { id: 'Surat Izin Keramaian', title: 'Izin Keramaian', icon: '🎪', placeholder: 'Contoh: Hajatan Pernikahan pada Sabtu 12 Agustus', help: 'Sebutkan jenis acara, waktu pelaksaan, dan estimasi massa' },
        ]
    },
    {
        name: 'Pernikahan & Keluarga',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        items: [
            { id: 'Surat Pengantar Nikah (NA)', title: 'Pengantar Nikah', icon: '💍', placeholder: 'Contoh: Persyaratan form N1-N4 ke KUA', help: 'Sebutkan nama calon pasangan jika diperlukan' },
            { id: 'Surat Keterangan Belum Menikah / Status Janda/Duda', title: 'Status Pernikahan', icon: '👤', placeholder: 'Contoh: Syarat daftar CPNS / TNI / Polri', help: 'Sebutkan status yang akan diterangkan (Belum Menikah/Janda/Duda)' },
        ]
    },
    {
        name: 'Kepolisian & Hukum',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        items: [
            { id: 'Surat Pengantar Kelakuan Baik', title: 'Kelakuan Baik', icon: '⚖️', placeholder: 'Contoh: Syarat pembuatan SKCK di Polres', help: 'Sebutkan instansi tujuan SKCK' },
            { id: 'Surat Pengantar Kehilangan', title: 'Kehilangan', icon: '🔍', placeholder: 'Contoh: Kehilangan Dompet & KTP di sekitar jalan Mawar', help: 'Sebutkan barang yang hilang dan lokasi/waktu perkiraan' },
        ]
    }
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        jenis_surat: 'Surat Keterangan Domisili',
        keperluan: '',
        keterangan_tambahan: '',
    });

    const [activeLabelInfo, setActiveLabelInfo] = useState(suratCategories[0].items[2]); // Default Domisili

    useEffect(() => {
        let found = null;
        for (const cat of suratCategories) {
            const item = cat.items.find(i => i.id === data.jenis_surat);
            if (item) found = item;
        }
        if (found) setActiveLabelInfo(found);
    }, [data.jenis_surat]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('warga.surat.store'));
    };

    return (
        <WargaLayout header="Ajukan Surat Pengantar">
            <Head title="Ajukan Surat" />
            
            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8">
                            
                            {/* Jenis Surat Selector (Dropdown) */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">Pilih Jenis Surat *</label>
                                <select
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={data.jenis_surat}
                                    onChange={e => setData('jenis_surat', e.target.value)}
                                    required
                                >
                                    {suratCategories.map((category, idx) => (
                                        <optgroup key={idx} label={category.name}>
                                            {category.items.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.icon} {item.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {errors.jenis_surat && <p className="mt-1 text-sm text-red-600 font-medium">{errors.jenis_surat}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6">
                                {/* Keperluan Dinamis */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center justify-between">
                                        Rincian & Keperluan *
                                        <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                            💡 {activeLabelInfo?.help}
                                        </span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder={activeLabelInfo?.placeholder}
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={data.keperluan}
                                        onChange={e => setData('keperluan', e.target.value)}
                                        required
                                    />
                                    {errors.keperluan && <p className="mt-1 text-sm text-red-600 font-medium">{errors.keperluan}</p>}
                                </div>

                                {/* Keterangan Tambahan */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1">Keterangan Tambahan <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                    <textarea
                                        rows="2"
                                        placeholder="Catatan tambahan yang ingin dimasukkan ke dalam surat (jika ada)..."
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={data.keterangan_tambahan}
                                        onChange={e => setData('keterangan_tambahan', e.target.value)}
                                    />
                                    {errors.keterangan_tambahan && <p className="mt-1 text-sm text-red-600 font-medium">{errors.keterangan_tambahan}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href={route('warga.surat.index')}
                                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-bold transition-all text-sm shadow-sm"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-blue-600 border border-transparent rounded-xl font-black text-white hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                    Ajukan Surat
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </WargaLayout>
    );
}
