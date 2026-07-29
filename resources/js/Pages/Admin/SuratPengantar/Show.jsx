import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ surat, profil }) {
    const pengurus = profil?.pengurus || [];
    const sekretaris = pengurus.find(p => p.jabatan.toLowerCase().includes('sekretaris'))?.nama || 'Bpk/Ibu Sekretaris';
    const ketuaRt = pengurus.find(p => p.jabatan.toLowerCase().includes('ketua'))?.nama || 'Bpk. Ketua RT';

    // Generate AI Template Content based on Surat Type
    const generateSuratContent = () => {
        const warga = surat.warga;
        const hariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const identitasPemohon = `
Nama Lengkap      : ${warga?.nama_lengkap || '-'}
Nomor KK          : ${warga?.keluarga?.no_kk || '-'}
Nomor HP          : ${warga?.no_hp || '-'}
Alamat / Blok     : Perumahan RT/RW Portal, Blok ${warga?.keluarga?.rumah_blok?.blok || '-'} Nomor ${warga?.keluarga?.rumah_blok?.nomor_rumah || '-'}
        `;

        let paragrafPembuka = '';
        let isiKeterangan = '';

        if (surat.jenis_surat.includes('Domisili')) {
            paragrafPembuka = `Yang bertanda tangan di bawah ini, Pengurus ${profil?.nama_rt || 'RT/RW'}, menerangkan dengan sebenarnya bahwa:`;
            isiKeterangan = `Orang tersebut di atas adalah benar-benar warga yang berdomisili dan menetap di lingkungan ${profil?.nama_rt || 'RT/RW'}. Surat ini diberikan sebagai pengantar untuk keperluan: ${surat.keperluan}.`;
        } else if (surat.jenis_surat.includes('Pindah')) {
            paragrafPembuka = `Yang bertanda tangan di bawah ini, Pengurus ${profil?.nama_rt || 'RT/RW'}, menerangkan dengan sebenarnya bahwa warga kami:`;
            isiKeterangan = `Berkenaan dengan permohonan yang bersangkutan, kami menyatakan tidak keberatan dan memberikan pengantar pindah alamat. Adapun keperluan pindah ini adalah: ${surat.keperluan}. Kami mengucapkan terima kasih atas kerjasamanya selama menjadi warga di lingkungan kami.`;
        } else if (surat.jenis_surat.includes('Tidak Mampu')) {
            paragrafPembuka = `Bersama surat ini, kami selaku Pengurus Lingkungan ${profil?.nama_rt || 'RT/RW'}, memberikan keterangan bahwa:`;
            isiKeterangan = `Berdasarkan pengamatan dan data administrasi kami, yang bersangkutan saat ini termasuk ke dalam keluarga dengan kondisi ekonomi prasejahtera (Tidak Mampu). Surat ini diterbitkan sebagai pengantar untuk keperluan: ${surat.keperluan}.`;
        } else if (surat.jenis_surat.includes('Usaha')) {
            paragrafPembuka = `Yang bertanda tangan di bawah ini menerangkan bahwa:`;
            isiKeterangan = `Warga tersebut di atas benar memiliki usaha / kegiatan ekonomi produktif di lingkungan tempat tinggalnya. Surat pengantar keterangan usaha ini diberikan khusus untuk keperluan: ${surat.keperluan}.`;
        } else {
            paragrafPembuka = `Yang bertanda tangan di bawah ini, Ketua ${profil?.nama_rt || 'RT/RW'}, menerangkan bahwa:`;
            isiKeterangan = `Surat pengantar ini diberikan kepada yang bersangkutan sehubungan dengan permohonannya untuk: ${surat.keperluan}.`;
        }

        if (surat.keterangan_tambahan) {
            isiKeterangan += `\n\nCatatan Tambahan:\n${surat.keterangan_tambahan}`;
        }

        return {
            tanggal: hariIni,
            pembuka: paragrafPembuka,
            identitas: identitasPemohon,
            isi: isiKeterangan,
        };
    };

    const template = generateSuratContent();

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pratinjau E-Surat Pintar</h2>}
        >
            <Head title={`Cetak ${surat.jenis_surat}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href={route('admin.surat.index')}
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Kembali ke Daftar
                        </Link>
                        
                        <div className="flex gap-3">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                                surat.status === 'Disetujui' ? 'bg-green-100 text-green-800' :
                                surat.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                Status: {surat.status}
                            </span>
                            <button
                                onClick={() => window.print()}
                                disabled={surat.status !== 'Disetujui'}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title={surat.status !== 'Disetujui' ? 'Surat harus disahkan (Disetujui) terlebih dahulu' : 'Cetak Surat Sekarang'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                Cetak E-Surat
                            </button>
                        </div>
                    </div>

                    {/* Paper Document (Printable Area) */}
                    <div id="print-area" className="bg-white p-12 md:p-20 shadow-xl border border-gray-200 min-h-[1056px] text-gray-900 mx-auto w-full max-w-[816px] font-serif leading-relaxed">
                        
                        {/* KOP SURAT */}
                        <div className="border-b-4 border-double border-gray-900 pb-6 mb-8 flex items-center">
                            <div className="w-24 flex-shrink-0">
                                {profil?.logo_path ? (
                                    <img src={`/storage/${profil.logo_path}`} alt="Logo RT" className="w-24 h-24 object-contain" />
                                ) : (
                                    <img src="/images/logo-rt.png" alt="Logo RT" className="w-24 h-24 object-contain" />
                                )}
                            </div>
                            <div className="flex-1 text-center pr-24">
                                <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">{profil?.nama_rt || 'RUKUN TETANGGA / RUKUN WARGA'}</h1>
                                <p className="text-sm font-medium">{profil?.alamat || 'Alamat Sekretariat Lingkungan'}</p>
                                <p className="text-sm">Layanan Warga (WA): {profil?.nomor_wa || '-'}</p>
                            </div>
                        </div>

                        {/* JUDUL SURAT */}
                        <div className="text-center mb-10">
                            <h3 className="text-xl font-bold uppercase underline underline-offset-4">{surat.jenis_surat}</h3>
                            <p className="mt-1">Nomor: {new Date().getFullYear()}/RT01/RW02/{String(surat.id).padStart(3, '0')}</p>
                        </div>

                        {/* ISI SURAT */}
                        <div className="text-justify space-y-4">
                            <p className="indent-8">{template.pembuka}</p>
                            
                            <div className="pl-12 pr-4 py-4 whitespace-pre text-sm sm:text-base">
                                {template.identitas}
                            </div>
                            
                            <p className="indent-8 whitespace-pre-wrap">{template.isi}</p>
                            
                            <p className="indent-8 mt-4">Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
                        </div>

                        {/* TANDA TANGAN */}
                        <div className="mt-16 flex justify-between px-12">
                            <div className="text-center">
                                <p className="mb-28">Sekretaris,</p>
                                <p className="font-bold underline uppercase">{sekretaris}</p>
                            </div>
                            <div className="text-center">
                                <p className="mb-1">{template.tanggal}</p>
                                <p className="mb-24">Ketua RT,</p>
                                <div className="relative inline-block">
                                    {surat.status === 'Disetujui' && (
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500/20 text-5xl border-4 border-red-500/20 rounded-full px-4 py-2 -rotate-12 pointer-events-none select-none font-sans font-black tracking-widest">
                                            SAH
                                        </div>
                                    )}
                                    <p className="font-bold underline uppercase">{ketuaRt}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
            
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
