import WargaLayout from '@/Layouts/WargaLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { debounce } from 'lodash';

export default function Index({ bansos, stats = {}, chartData = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [sumberDana, setSumberDana] = useState(filters.sumber_dana || 'Semua');
    const [status, setStatus] = useState(filters.status || 'Semua');
    const [tahun, setTahun] = useState(filters.tahun || new Date().getFullYear());
    const [activeTab, setActiveTab] = useState('data'); // 'data' | 'info'

    const handleSearch = debounce((val) => {
        setSearch(val);
        router.get(
            route('warga.bansos.index'),
            { search: val, sumber_dana: sumberDana, status, tahun },
            { preserveState: true, replace: true }
        );
    }, 400);

    const handleFilterChange = (key, value) => {
        let newSumber = sumberDana;
        let newStatus = status;
        let newTahun = tahun;

        if (key === 'sumber_dana') {
            setSumberDana(value);
            newSumber = value;
        } else if (key === 'status') {
            setStatus(value);
            newStatus = value;
        } else if (key === 'tahun') {
            setTahun(value);
            newTahun = value;
        }

        router.get(
            route('warga.bansos.index'),
            { search, sumber_dana: newSumber, status: newStatus, tahun: newTahun },
            { preserveState: true, replace: true }
        );
    };

    const formatCurrency = (val) => {
        if (!val || isNaN(val)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const getStatusBadge = (statusVal) => {
        switch (statusVal) {
            case 'Usulan / Pendataan':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
                        <span>📝 Usulan RT</span>
                    </span>
                );
            case 'Verifikasi Musdes':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold border border-blue-300">
                        <span>🏛️ Verifikasi Musdes</span>
                    </span>
                );
            case 'Terdaftar Resmi':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold border border-indigo-300">
                        <span>📑 Terdaftar DTSEN</span>
                    </span>
                );
            case 'Disalurkan':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300 shadow-sm">
                        <span>🎁 Disalurkan</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-extrabold border border-gray-300">
                        {statusVal}
                    </span>
                );
        }
    };

    const maxChartValue = useMemo(() => {
        if (!chartData || chartData.length === 0) return 10;
        const maxVal = Math.max(...chartData.map(d => d.total || 0));
        return maxVal > 0 ? maxVal : 10;
    }, [chartData]);

    return (
        <WargaLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 leading-tight flex items-center gap-2">
                            <span>🎁 Transparansi Bantuan Sosial (Bansos) RT</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Informasi publik penerima manfaat, jenis program, dan alur pengusulan bantuan
                        </p>
                    </div>

                    {/* Tabs switch: Data Transparansi vs Panduan Alur */}
                    <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                                activeTab === 'data'
                                    ? 'bg-white text-emerald-800 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            📊 Data & Statistik
                        </button>
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                                activeTab === 'info'
                                    ? 'bg-white text-emerald-800 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            ℹ️ Panduan & Alur
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Transparansi Bantuan Sosial Warga" />

            {activeTab === 'info' ? (
                /* ── TAB PANDUAN, KATEGORI & ALUR PENGUSULAN BANSOS ── */
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* 3 Kategori Sumber Dana Bansos */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                            <span>💡 Jenis & Sumber Bantuan Sosial di Lingkungan RT/RW</span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            Bantuan sosial disalurkan dari 3 jenjang pemerintahan untuk mendukung kesejahteraan warga
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 1. Dana Desa */}
                            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <span className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                                            🏛️
                                        </span>
                                        <div>
                                            <h4 className="font-black text-teal-900 text-sm">1. Pemerintah Desa</h4>
                                            <p className="text-[11px] text-teal-700 font-bold">Sumber Dana Desa (APBDes)</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-xs text-teal-950 font-medium">
                                        <li className="flex items-start gap-2">
                                            <span className="text-teal-600 font-bold">•</span>
                                            <span><strong>BLT Dana Desa:</strong> Tunai bagi warga miskin ekstrem yang belum tersentuh bantuan pusat/daerah.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-teal-600 font-bold">•</span>
                                            <span><strong>PMT Stunting & Kesehatan:</strong> Susu, telur, dan makanan gizi untuk ibu hamil, balita, atau lansia.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-teal-600 font-bold">•</span>
                                            <span><strong>Ketahanan Pangan:</strong> Bibit tanaman, benih ikan, atau pupuk untuk kelompok warga.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* 2. Dana Daerah */}
                            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <span className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                                            🏢
                                        </span>
                                        <div>
                                            <h4 className="font-black text-blue-900 text-sm">2. Pemerintah Daerah</h4>
                                            <p className="text-[11px] text-blue-700 font-bold">Kabupaten / Kota (APBD)</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-xs text-blue-950 font-medium">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span><strong>Bansos APBD:</strong> Tunai / sembako saat situasi krisis ekonomi atau bencana lokal.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span><strong>Beasiswa KIP-D / Daerah:</strong> Bantuan pendidikan bagi siswa/mahasiswa berprestasi dari keluarga tidak mampu.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span><strong>Bantuan RTLH:</strong> Bedah rumah tidak layak huni agar memenuhi standar keselamatan.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* 3. Dana Pusat */}
                            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <span className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                                            🇮🇩
                                        </span>
                                        <div>
                                            <h4 className="font-black text-rose-900 text-sm">3. Pemerintah Pusat</h4>
                                            <p className="text-[11px] text-rose-700 font-bold">APBN / Kemensos RI</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-xs text-rose-950 font-medium">
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-600 font-bold">•</span>
                                            <span><strong>PKH (Keluarga Harapan):</strong> Bantuan bersyarat untuk komponen kesehatan, pendidikan, dan kesejahteraan sosial.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-600 font-bold">•</span>
                                            <span><strong>BPNT / Sembako:</strong> Bantuan pangan non-tunai melalui Kartu Keluarga Sejahtera.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-600 font-bold">•</span>
                                            <span><strong>PBI-JK BPJS:</strong> Iuran BPJS Kesehatan gratis dibayarkan penuh oleh negara.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alur Pengusulan & Verifikasi RT/RW */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                            <span>🔄 Alur Pengusulan & Verifikasi Bantuan Sosial</span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            Bagaimana alur agar warga yang membutuhkan dapat terdata dan diverifikasi secara transparan
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 relative">
                                <span className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center shadow">
                                    1
                                </span>
                                <h4 className="font-extrabold text-amber-900 text-sm mt-1 mb-1">Pendataan & Pengajuan RT</h4>
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    Warga melaporkan kondisi ke RT/RW dengan membawa KTP, KK, SKTM, dan foto kondisi rumah untuk dicatat dalam daftar usulan.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 relative">
                                <span className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow">
                                    2
                                </span>
                                <h4 className="font-extrabold text-blue-900 text-sm mt-1 mb-1">Musyawarah Desa (Musdes)</h4>
                                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                    Usulan dibahas secara terbuka dalam Musyawarah Desa / Kelurahan bersama RT, RW, dan tokoh masyarakat untuk menilai kelayakan.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 relative">
                                <span className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow">
                                    3
                                </span>
                                <h4 className="font-extrabold text-indigo-900 text-sm mt-1 mb-1">Penetapan & DTSEN</h4>
                                <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                                    Daftar warga yang lolos verifikasi dimasukkan ke dalam Data Terpadu Kesejahteraan Sosial (DTSEN / SIKS-NG) secara resmi.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 relative">
                                <span className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow">
                                    4
                                </span>
                                <h4 className="font-extrabold text-emerald-900 text-sm mt-1 mb-1">Penyaluran Bantuan</h4>
                                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                                    Bantuan disalurkan langsung kepada Keluarga Penerima Manfaat (KPM) baik berupa tunai, sembako, atau transfer rekening.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── TAB DATA & STATISTIK TRANSPARANSI BANSOS ── */
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* 5 DASHBOARD CARDS STATISTIK */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-lg border border-emerald-600/40 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Total KPM Terdata</span>
                                <span className="text-2xl">🎁</span>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-white">{stats.total_penerima || 0}</div>
                                <p className="text-[11px] text-emerald-100 mt-0.5">Keluarga / Warga Penerima</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-teal-800 via-emerald-800 to-cyan-900 text-white p-5 shadow-lg border border-teal-600/40 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">Sumber Dana Desa</span>
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-white">{stats.bantuan_desa || 0}</div>
                                <p className="text-[11px] text-teal-100 mt-0.5">BLT Desa, PMT, Pangan</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-blue-800 via-indigo-800 to-blue-900 text-white p-5 shadow-lg border border-blue-600/40 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Sumber Daerah</span>
                                <span className="text-2xl">🏢</span>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-white">{stats.bantuan_daerah || 0}</div>
                                <p className="text-[11px] text-blue-100 mt-0.5">APBD, Beasiswa KIP-D, RTLH</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-rose-800 via-red-800 to-rose-900 text-white p-5 shadow-lg border border-rose-600/40 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Sumber APBN Pusat</span>
                                <span className="text-2xl">🇮🇩</span>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-white">{stats.bantuan_pusat || 0}</div>
                                <p className="text-[11px] text-rose-100 mt-0.5">PKH, BPNT, Beras, BPJS</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900 text-white p-5 shadow-lg border border-amber-600/40 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Total Penyaluran Tunai</span>
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-black text-white truncate">{formatCurrency(stats.total_tunai || 0)}</div>
                                <p className="text-[11px] text-amber-100 mt-0.5">Akumulasi dana tunai disalurkan</p>
                            </div>
                        </div>
                    </div>

                    {/* GRAFIK INTERAKTIF SVG (3 SUMBER DANA) */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <span>📊 Grafik Transparansi Penyaluran Bansos RT (Tahun {tahun})</span>
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Sebaran penerima bantuan per bulan dari 3 tingkat pemerintahan
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold">
                                <span className="inline-flex items-center gap-1.5 text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Dana Desa
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Dana Daerah
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Dana Pusat
                                </span>
                            </div>
                        </div>

                        <div className="h-56 w-full relative">
                            <div className="grid grid-cols-12 gap-2 h-full items-end pb-8 pt-4">
                                {chartData.map((d, idx) => {
                                    const heightDesa = Math.round((d.desa / maxChartValue) * 100);
                                    const heightDaerah = Math.round((d.daerah / maxChartValue) * 100);
                                    const heightPusat = Math.round((d.pusat / maxChartValue) * 100);

                                    return (
                                        <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] rounded-lg py-1.5 px-2.5 pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                                <div className="font-bold border-b border-gray-700 pb-0.5 mb-0.5">{d.bulan}</div>
                                                <div>Desa: {d.desa} | Daerah: {d.daerah} | Pusat: {d.pusat}</div>
                                                <div className="font-bold text-amber-300">Total: {d.total} KPM</div>
                                            </div>

                                            <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                                                <div
                                                    style={{ height: `${Math.max(heightDesa, 5)}%` }}
                                                    className="w-1/3 bg-gradient-to-t from-teal-700 to-emerald-500 rounded-t-md transition-all duration-500"
                                                ></div>
                                                <div
                                                    style={{ height: `${Math.max(heightDaerah, 5)}%` }}
                                                    className="w-1/3 bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-md transition-all duration-500"
                                                ></div>
                                                <div
                                                    style={{ height: `${Math.max(heightPusat, 5)}%` }}
                                                    className="w-1/3 bg-gradient-to-t from-rose-700 to-red-500 rounded-t-md transition-all duration-500"
                                                ></div>
                                            </div>

                                            <span className="text-[11px] font-extrabold text-gray-600 mt-2">{d.bulan}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* FILTER & TABEL DAFTAR KPM */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        defaultValue={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Cari Nama / Jenis Bantuan..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 bg-gray-50 font-medium"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                                </div>

                                <select
                                    value={sumberDana}
                                    onChange={(e) => handleFilterChange('sumber_dana', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-gray-50 font-semibold text-gray-700"
                                >
                                    <option value="Semua">Semua Sumber Dana</option>
                                    <option value="Dana Desa">Dana Desa</option>
                                    <option value="Dana Daerah">Dana Daerah</option>
                                    <option value="Dana Pusat">Dana Pusat</option>
                                </select>

                                <select
                                    value={status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-gray-50 font-semibold text-gray-700"
                                >
                                    <option value="Semua">Semua Status</option>
                                    <option value="Usulan / Pendataan">Usulan / Pendataan</option>
                                    <option value="Verifikasi Musdes">Verifikasi Musdes</option>
                                    <option value="Terdaftar Resmi">Terdaftar Resmi</option>
                                    <option value="Disalurkan">Disalurkan</option>
                                </select>

                                <select
                                    value={tahun}
                                    onChange={(e) => handleFilterChange('tahun', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-gray-50 font-semibold text-gray-700"
                                >
                                    <option value="Semua">Semua Tahun</option>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>

                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                🔒 Informasi Publik Read-Only
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600 border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-extrabold">No</th>
                                        <th className="px-4 py-3 font-extrabold">Nama Penerima</th>
                                        <th className="px-4 py-3 font-extrabold">Sumber Dana</th>
                                        <th className="px-4 py-3 font-extrabold">Jenis Program</th>
                                        <th className="px-4 py-3 font-extrabold">Periode</th>
                                        <th className="px-4 py-3 font-extrabold">Bentuk Bantuan</th>
                                        <th className="px-4 py-3 font-extrabold text-right">Status Alur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bansos.data.length > 0 ? (
                                        bansos.data.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-4 py-3.5 font-bold text-gray-500">
                                                    {(bansos.current_page - 1) * bansos.per_page + index + 1}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="font-extrabold text-gray-900">{item.nama_penerima}</div>
                                                    <div className="text-[11px] font-semibold text-gray-400 mt-0.5">
                                                        RT/RW Lingkungan Setempat
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                                        item.sumber_dana === 'Dana Desa' ? 'bg-teal-100 text-teal-800' :
                                                        item.sumber_dana === 'Dana Daerah' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {item.sumber_dana === 'Dana Desa' && '🏛️'}
                                                        {item.sumber_dana === 'Dana Daerah' && '🏢'}
                                                        {item.sumber_dana === 'Dana Pusat' && '🇮🇩'}
                                                        {item.sumber_dana}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-bold text-gray-800">
                                                    {item.jenis_bantuan}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="font-bold text-gray-900">{item.periode_tahun}</div>
                                                    <div className="text-xs text-gray-500">{item.periode_bulan}</div>
                                                </td>
                                                <td className="px-4 py-3.5 font-extrabold text-emerald-700">
                                                    {item.bentuk_bantuan || (item.nominal_tunai > 0 ? formatCurrency(item.nominal_tunai) : '-')}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    {getStatusBadge(item.status_penyaluran)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-bold">
                                                📭 Belum ada data penerima Bantuan Sosial terdaftar untuk filter ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {bansos.links && bansos.links.length > 3 && (
                            <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-100 text-sm">
                                <div className="text-gray-500 font-medium">
                                    Menampilkan <span className="font-bold">{bansos.from || 0}</span> - <span className="font-bold">{bansos.to || 0}</span> dari <span className="font-bold">{bansos.total}</span> data
                                </div>
                                <div className="flex gap-1">
                                    {bansos.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                                                link.active
                                                    ? 'bg-emerald-700 text-white shadow-sm'
                                                    : link.url
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </WargaLayout>
    );
}
