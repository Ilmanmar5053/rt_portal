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

                    {/* Paper Document A4 Portrait (Printable Area) */}
                    <div id="print-area" className="bg-white shadow-xl border border-gray-300 mx-auto" style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '1.2cm 2.5cm 2.5cm 2.5cm',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '12pt',
                        lineHeight: '1.6',
                        color: '#000'
                    }}>
                        
                        {/* KOP SURAT */}
                        <div className="border-b-2 border-black pb-2 mb-4" style={{ marginTop: '0', paddingTop: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '90px', verticalAlign: 'middle', textAlign: 'center' }}>
                                            {profil?.logo_path ? (
                                                <img src={`/storage/${profil.logo_path}`} alt="Logo" style={{ width: '84px', height: '84px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ width: '84px', height: '84px', border: '1px solid #ccc', margin: '0 auto' }}></div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 8px' }}>
                                            <h1 style={{ fontSize: '15pt', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px', lineHeight: '1.2' }}>
                                                {profil?.nama_rt || 'LINGKUNGAN PERUMAHAN RT 009 / RW 006'}
                                            </h1>
                                            <p style={{ fontSize: '12pt', margin: '2px 0', lineHeight: '1.35', fontWeight: 'bold' }}>
                                                {profil?.alamat || 'Perum Puri Delta Kiara Blok BB No. 21 Kel. Kiara Kec. Walantaka Kota. Serang Banten'}
                                            </p>
                                            <p style={{ fontSize: '12pt', margin: '2px 0', fontWeight: 'bold' }}>
                                                Layanan Warga (WA): {profil?.nomor_wa || '085210454561'}
                                            </p>
                                        </td>
                                        <td style={{ width: '90px' }}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* JUDUL SURAT */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
                                {surat.jenis_surat.toUpperCase()}
                            </h2>
                            <p style={{ fontSize: '11pt', margin: '0' }}>
                                Nomor: {new Date().getFullYear()}/RT01/RW02/{String(surat.id).padStart(3, '0')}
                            </p>
                        </div>

                        {/* ISI SURAT */}
                        <div style={{ textAlign: 'justify', marginBottom: '32px' }}>
                            <p style={{ marginBottom: '16px', textIndent: '48px' }}>
                                {template.pembuka}
                            </p>
                            
                            <table style={{ width: '100%', marginLeft: '48px', marginBottom: '16px', fontSize: '11pt', lineHeight: '1.8' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '160px', verticalAlign: 'top' }}>Nama Lengkap</td>
                                        <td style={{ width: '20px', verticalAlign: 'top' }}>:</td>
                                        <td>{surat.warga?.nama_lengkap || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>Nomor KK</td>
                                        <td style={{ verticalAlign: 'top' }}>:</td>
                                        <td>{surat.warga?.keluarga?.no_kk || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>Nomor HP</td>
                                        <td style={{ verticalAlign: 'top' }}>:</td>
                                        <td>{surat.warga?.no_hp || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>Alamat / Blok</td>
                                        <td style={{ verticalAlign: 'top' }}>:</td>
                                        <td>
                                            Perumahan RT/RW Portal, Blok {surat.warga?.keluarga?.rumah_blok?.blok || '-'} Nomor {surat.warga?.keluarga?.rumah_blok?.nomor_rumah || '-'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <p style={{ marginBottom: '16px', textIndent: '48px', whiteSpace: 'pre-wrap' }}>
                                {template.isi}
                            </p>
                            
                            <p style={{ marginTop: '16px', textIndent: '48px' }}>
                                Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
                            </p>
                        </div>

                        {/* TANDA TANGAN */}
                        <div style={{ marginTop: '72px', paddingBottom: '24px' }}>
                            <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                                <p style={{ margin: '0', fontSize: '11pt' }}>
                                    Kota Serang, {template.tanggal}
                                </p>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'center', paddingTop: '24px' }}>
                                            <div style={{ minHeight: '92px' }}>
                                                <p style={{ margin: '0 0 8px 0' }}>Mengetahui,</p>
                                                <p style={{ margin: '0 0 4px 0' }}>Sekretaris</p>
                                            </div>
                                            
                                            {/* Tanda Tangan Sekretaris */}
                                            <div style={{ height: '96px', margin: '8px 0 8px 0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {profil?.ttd_sekretaris_path ? (
                                                    <img 
                                                        src={`/storage/${profil.ttd_sekretaris_path}`} 
                                                        alt="TTD Sekretaris" 
                                                        style={{ maxHeight: '96px', maxWidth: '140px', objectFit: 'contain' }}
                                                    />
                                                ) : null}
                                            </div>
                                            
                                            <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', textDecoration: 'underline' }}>
                                                {sekretaris}
                                            </p>
                                        </td>
                                        <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'center', paddingTop: '24px' }}>
                                            <div style={{ minHeight: '92px' }}>
                                                <p style={{ margin: '0 0 4px 0' }}>Ketua RT</p>
                                            </div>
                                            
                                            {/* Tanda Tangan Ketua */}
                                            <div style={{ height: '96px', margin: '8px 0 8px 0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {profil?.ttd_ketua_path ? (
                                                    <img 
                                                        src={`/storage/${profil.ttd_ketua_path}`} 
                                                        alt="TTD Ketua" 
                                                        style={{ maxHeight: '96px', maxWidth: '140px', objectFit: 'contain' }}
                                                    />
                                                ) : null}
                                            </div>
                                            
                                            <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', textDecoration: 'underline' }}>
                                                {ketuaRt}
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>
            
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
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
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 3cm 3cm 3cm 3cm !important;
                        box-shadow: none !important;
                        border: none !important;
                        font-family: Arial, sans-serif !important;
                        font-size: 12pt !important;
                        line-height: 1.6 !important;
                        color: #000 !important;
                        background: white !important;
                    }
                }
                
                @media screen {
                    #print-area {
                        box-sizing: border-box;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
