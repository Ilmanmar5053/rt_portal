<?php

use App\Http\Controllers\Admin\WargaController;
use App\Http\Controllers\Admin\IuranKasController;
use App\Http\Controllers\Admin\JenisIuranController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\PengaduanController;
use App\Http\Controllers\Admin\SuratPengantarController;
use App\Http\Controllers\Admin\ProfilRtController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $profil = \App\Models\ProfilRt::first() ?? new \App\Models\ProfilRt([
        'nama_rt' => 'RT 05 / RW 08',
        'alamat' => 'Komp. Griya Indah Permai Blok C, Kel. Suka Maju, Kec. Harapan',
        'nomor_wa' => '0812-3456-7890',
        'logo_path' => null,
        'pengurus' => [
            ['jabatan' => 'Ketua RT', 'nama' => 'Bpk. H. Sudirman'],
            ['jabatan' => 'Sekretaris', 'nama' => 'Bpk. Ahmad Yani'],
            ['jabatan' => 'Bendahara', 'nama' => 'Ibu Siti Aminah'],
            ['jabatan' => 'Keamanan', 'nama' => 'Bpk. Jajang']
        ]
    ]);

    \App\Models\ProgramKegiatan::syncAllStatuses();
    $activePrograms = \App\Models\ProgramKegiatan::whereIn('status', ['Sedang Berjalan', 'Direncanakan'])
        ->orderBy('tanggal_mulai', 'asc')
        ->take(10)
        ->get();
    if ($activePrograms->isEmpty()) {
        $activePrograms = \App\Models\ProgramKegiatan::where('status', '!=', 'Dibatalkan')->latest()->take(5)->get();
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'profil' => $profil,
        'activePrograms' => $activePrograms
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    if (in_array($user->role, ['superadmin', 'rw', 'rt', 'bendahara', 'sekretaris'])) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('warga.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:superadmin,rw,rt,bendahara,sekretaris'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        \App\Models\RumahBlok::syncStatusHunianAll();
        $totalWarga = \App\Models\Warga::count();
        $totalKK = \App\Models\Keluarga::count();
        $rumahKosong = \App\Models\RumahBlok::where('status_hunian', 'Kosong')->count();
        $rumahDihuni = \App\Models\RumahBlok::where('status_hunian', 'Diisi')->count();
        \App\Models\TransaksiKas::syncApprovedIuran();

        $kasBulanIni = \App\Models\IuranKas::where('periode_bulan', date('m'))
            ->where('periode_tahun', date('Y'))
            ->where('status_pembayaran', 'Approved')
            ->where(function($q) {
                $q->where('jenis_iuran', 'Kas RT')
                  ->orWhere('jenis_iuran', 'like', '%Kas RT%');
            })
            ->sum('jumlah_bayar');

        $saldoKasSaatIni = \App\Models\TransaksiKas::getSaldo();

        $adminPengaduans = \App\Models\Pengaduan::with('warga')->latest()->take(5)->get()->map(function($p) {
            return [
                'id' => $p->id,
                'warga' => ($p->is_anonim ? 'Anonim (Warga)' : ($p->warga ? $p->warga->nama_lengkap : 'Unknown')),
                'judul' => $p->judul,
                'deskripsi' => $p->deskripsi ?: 'Tidak ada rincian deskripsi.',
                'kategori' => $p->kategori ?: 'Umum / Lingkungan',
                'status' => $p->status_progres,
                'tanggal' => $p->created_at->format('d M Y'),
                'foto' => $p->foto_bukti,
            ];
        });

        $activePrograms = \App\Models\ProgramKegiatan::whereIn('status', ['Sedang Berjalan', 'Direncanakan'])
            ->orderBy('tanggal_mulai', 'asc')
            ->take(10)
            ->get();
        if ($activePrograms->isEmpty()) {
            $activePrograms = \App\Models\ProgramKegiatan::where('status', '!=', 'Dibatalkan')->latest()->take(5)->get();
        }

        $wargaPerRtData = \App\Models\Warga::select('keluargas.rt', \DB::raw('count(wargas.id) as total'))
            ->join('keluargas', 'wargas.keluarga_id', '=', 'keluargas.id')
            ->groupBy('keluargas.rt')
            ->get()
            ->pluck('total', 'rt')
            ->toArray();

        $wargaPerRt = [];
        for ($i = 1; $i <= 11; $i++) {
            $rtStr = str_pad($i, 3, '0', STR_PAD_LEFT);
            $wargaPerRt[] = [
                'rt' => 'RT ' . $rtStr,
                'total' => $wargaPerRtData[$rtStr] ?? 0
            ];
        }

        // Grafik Perbandingan Iuran per Bulan
        $chartYear = \App\Models\IuranKas::max('periode_tahun') ?? date('Y');
        $monthlyRaw = \App\Models\IuranKas::where('periode_tahun', $chartYear)
            ->selectRaw('periode_bulan, status_pembayaran, SUM(jumlah_bayar) as total_nominal, COUNT(*) as total_count')
            ->groupBy('periode_bulan', 'status_pembayaran')
            ->get();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $iuranChartData = [
            'year' => (int) $chartYear,
            'labels' => $months,
            'lunas_nominal' => [],
            'belum_lunas_nominal' => [],
        ];

        for ($m = 1; $m <= 12; $m++) {
            $lunas = $monthlyRaw->where('periode_bulan', $m)->where('status_pembayaran', 'Approved');
            $belum = $monthlyRaw->where('periode_bulan', $m)->where('status_pembayaran', '!=', 'Approved');

            $iuranChartData['lunas_nominal'][] = (float) $lunas->sum('total_nominal');
            $iuranChartData['belum_lunas_nominal'][] = (float) $belum->sum('total_nominal');
        }

        return Inertia::render('Dashboard', [
            'adminStats' => [
                'total_warga' => number_format($totalWarga, 0, ',', '.'),
                'total_kk' => number_format($totalKK, 0, ',', '.'),
                'rumah_dihuni' => number_format($rumahDihuni, 0, ',', '.'),
                'rumah_kosong' => number_format($rumahKosong, 0, ',', '.'),
                'kas_bulan_ini' => 'Rp ' . number_format($kasBulanIni, 0, ',', '.'),
                'saldo_kas_saat_ini' => 'Rp ' . number_format($saldoKasSaatIni, 0, ',', '.'),
            ],
            'adminPengaduans' => $adminPengaduans,
            'activePrograms' => $activePrograms,
            'wargaPerRt' => $wargaPerRt,
            'iuranChartData' => $iuranChartData
        ]);
    })->name('dashboard');

    // Management Hak Akses & User
    Route::get('/permissions', [\App\Http\Controllers\Admin\RolePermissionController::class, 'index'])->name('permissions.index')->middleware('role:superadmin');
    Route::post('/permissions', [\App\Http\Controllers\Admin\RolePermissionController::class, 'update'])->name('permissions.update')->middleware('role:superadmin');
    Route::put('/permissions/bulk', [\App\Http\Controllers\Admin\RolePermissionController::class, 'updateBulk'])->name('permissions.bulk')->middleware('role:superadmin');
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->middleware('role:superadmin');

    // Management Database & Backup (Khusus Superadmin)
    Route::get('/database', [\App\Http\Controllers\Admin\DatabaseController::class, 'index'])->name('database.index')->middleware('role:superadmin');
    Route::get('/database/backup/sql', [\App\Http\Controllers\Admin\DatabaseController::class, 'backupSql'])->name('database.backup.sql')->middleware('role:superadmin');
    Route::get('/database/backup/json', [\App\Http\Controllers\Admin\DatabaseController::class, 'backupJson'])->name('database.backup.json')->middleware('role:superadmin');
    Route::post('/database/reset', [\App\Http\Controllers\Admin\DatabaseController::class, 'reset'])->name('database.reset')->middleware('role:superadmin');

    // Log Aktivitas / Audit Trail (Khusus Superadmin)
    Route::get('/activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('activity-logs.index')->middleware('role:superadmin');
    Route::post('/activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'storeLog'])->name('activity-logs.store');

    // KK Multimodal AI Vision Scanner Endpoint
    Route::post('/scan-kk-ai', [\App\Http\Controllers\KKScanController::class, 'scanAi'])->name('scan-kk-ai');

    Route::post('warga/{warga}/generate-account', [WargaController::class, 'generateAccount'])->name('warga.generate-account')->middleware('module.access:data_warga');
    Route::resource('warga', WargaController::class)->middleware('module.access:data_warga');
    Route::resource('keluarga', App\Http\Controllers\Admin\KeluargaController::class)->middleware('module.access:data_keluarga');
    Route::resource('rumah', \App\Http\Controllers\Admin\RumahBlokController::class)->middleware('module.access:data_rumah');
    
    // Mapping Blok Rumah (Citra Satelit HD & Tanda Pin Rumah Terintegrasi KK)
    Route::get('/mapping-blok', [\App\Http\Controllers\Admin\MappingBlokController::class, 'index'])->name('mapping-blok.index')->middleware('module.access:data_rumah');
    Route::post('/mapping-blok/upload', [\App\Http\Controllers\Admin\MappingBlokController::class, 'uploadMap'])->name('mapping-blok.upload')->middleware('module.access:data_rumah');
    Route::put('/mapping-blok/{rumahBlok}/pin', [\App\Http\Controllers\Admin\MappingBlokController::class, 'updatePin'])->name('mapping-blok.pin.update')->middleware('module.access:data_rumah');
    Route::delete('/mapping-blok/{rumahBlok}/pin', [\App\Http\Controllers\Admin\MappingBlokController::class, 'deletePin'])->name('mapping-blok.pin.delete')->middleware('module.access:data_rumah');
    
    // Iuran Kas & Jenis Iuran specific routes
    Route::post('iuran/generate', [IuranKasController::class, 'generate'])->name('iuran.generate')->middleware('module.access:iuran_kas');
    Route::post('iuran/bulk-action', [IuranKasController::class, 'bulkAction'])->name('iuran.bulk-action')->middleware('module.access:iuran_kas');
    Route::patch('iuran/{iuran}/toggle-lunas', [IuranKasController::class, 'toggleLunas'])->name('iuran.toggle-lunas')->middleware('module.access:iuran_kas');
    Route::resource('iuran', IuranKasController::class)->middleware('module.access:iuran_kas');
    Route::post('jenis-iuran', [JenisIuranController::class, 'store'])->name('jenis-iuran.store')->middleware('module.access:iuran_kas');
    Route::put('jenis-iuran/{id}', [JenisIuranController::class, 'update'])->name('jenis-iuran.update')->middleware('module.access:iuran_kas');
    Route::delete('jenis-iuran/{id}', [JenisIuranController::class, 'destroy'])->name('jenis-iuran.destroy')->middleware('module.access:iuran_kas');
    Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
    
    Route::post('pengaduan/{pengaduan}/comment', [PengaduanController::class, 'addComment'])->name('pengaduan.comment');
    Route::resource('pengaduan', PengaduanController::class)->middleware('module.access:pengaduan');
    Route::resource('surat', SuratPengantarController::class)->middleware('module.access:surat_pengantar');
    
    // Transaksi Arus Kas & Penyerahan Iuran
    Route::resource('transaksi-kas', \App\Http\Controllers\Admin\TransaksiKasController::class)->middleware('module.access:transaksi_kas');
    Route::resource('transaksi-iuran', \App\Http\Controllers\Admin\TransaksiIuranController::class)->middleware('module.access:iuran_kas');
    
    // Program & Kegiatan
    Route::resource('program-kegiatan', \App\Http\Controllers\Admin\ProgramKegiatanController::class)->middleware('module.access:program_kegiatan');

    // Bantuan Sosial
    Route::patch('bansos/{bansos}/update-status', [\App\Http\Controllers\Admin\BantuanSosialController::class, 'updateStatus'])->name('bansos.update-status')->middleware('module.access:bansos');
    Route::resource('bansos', \App\Http\Controllers\Admin\BantuanSosialController::class)->middleware('module.access:bansos');

    // Profil RT routes
    Route::get('profil', [ProfilRtController::class, 'edit'])->name('profil.edit');
    Route::post('profil', [ProfilRtController::class, 'update'])->name('profil.update');

    // Struktur RT & Wilayah
    Route::resource('struktur-rt', \App\Http\Controllers\Admin\StrukturRtController::class)->middleware('role:superadmin,rw');

    // Monitoring API
    Route::get('/api/active-users', [\App\Http\Controllers\Admin\MonitoringController::class, 'getActiveUsers'])->name('monitoring.active-users');
});

Route::middleware(['auth', 'verified', 'role:warga_kk,warga_anggota'])->group(function () {
    Route::get('/warga/dashboard', function () {
        $user = auth()->user();
        $warga = \App\Models\Warga::where('user_id', $user->id)->first();
        
        $iurans = [];
        $surats = [];
        $pengaduans = [];
        
        if ($warga) {
            $iurans = \App\Models\IuranKas::where('warga_id', $warga->id)
                ->orderBy('periode_tahun', 'desc')
                ->orderBy('periode_bulan', 'desc')
                ->get();
                
            $surats = \App\Models\SuratPengantar::where('warga_id', $warga->id)
                ->orderBy('created_at', 'desc')
                ->get();
                
            $pengaduans = \App\Models\Pengaduan::where('warga_id', $warga->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $activePrograms = \App\Models\ProgramKegiatan::whereIn('status', ['Sedang Berjalan', 'Direncanakan'])
            ->orderBy('tanggal_mulai', 'asc')
            ->take(10)
            ->get();
        if ($activePrograms->isEmpty()) {
            $activePrograms = \App\Models\ProgramKegiatan::where('status', '!=', 'Dibatalkan')->latest()->take(5)->get();
        }

        // Fetch Data Kas RT
        $transaksiKas = \App\Models\TransaksiKas::orderBy('tanggal', 'desc')->orderBy('id', 'desc')->paginate(5);
        $saldoKasSaatIni = \App\Models\TransaksiKas::getSaldo();

        return Inertia::render('Dashboard', [
            'iurans' => $iurans,
            'surats' => $surats,
            'pengaduans' => $pengaduans,
            'warga' => $warga,
            'activePrograms' => $activePrograms,
            'transaksiKas' => $transaksiKas,
            'saldoKasSaatIni' => $saldoKasSaatIni
        ]);
    })->name('warga.dashboard');

    Route::get('/warga/iuran/{id}', function ($id) {
        $user = auth()->user();
        $warga = \App\Models\Warga::where('user_id', $user->id)->firstOrFail();
        
        $iuran = \App\Models\IuranKas::with('warga.rumahBlok')
            ->where('id', $id)
            ->where('warga_id', $warga->id)
            ->firstOrFail();

        return Inertia::render('Warga/Iuran/Show', [
            'iuran' => $iuran
        ]);
    })->name('warga.iuran.show');

    Route::middleware('module.access:iuran_kas')->group(function () {
        Route::get('/warga/iuran', [\App\Http\Controllers\Warga\IuranWargaController::class, 'index'])->name('warga.iuran.index');
        Route::post('/warga/iuran/{id}/bayar', [\App\Http\Controllers\Warga\IuranWargaController::class, 'bayar'])->name('warga.iuran.bayar');
        Route::get('/warga/iuran/{id}/kwitansi', [\App\Http\Controllers\Warga\IuranWargaController::class, 'kwitansi'])->name('warga.iuran.kwitansi');
    });

    Route::middleware('module.access:surat_pengantar')->group(function () {
        Route::get('/warga/surat', [\App\Http\Controllers\Warga\SuratWargaController::class, 'index'])->name('warga.surat.index');
        Route::get('/warga/surat/create', [\App\Http\Controllers\Warga\SuratWargaController::class, 'create'])->name('warga.surat.create');
        Route::post('/warga/surat', [\App\Http\Controllers\Warga\SuratWargaController::class, 'store'])->name('warga.surat.store');
        Route::get('/warga/surat/{id}', [\App\Http\Controllers\Warga\SuratWargaController::class, 'show'])->name('warga.surat.show');
        Route::get('/warga/surat/{id}/pdf', [\App\Http\Controllers\Warga\SuratWargaController::class, 'exportPdf'])->name('warga.surat.pdf');
    });

    Route::middleware('module.access:pengaduan')->group(function () {
        Route::get('/warga/pengaduan', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'index'])->name('warga.pengaduan.index');
        Route::get('/warga/pengaduan/create', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'create'])->name('warga.pengaduan.create');
        Route::post('/warga/pengaduan', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'store'])->name('warga.pengaduan.store');
        Route::get('/warga/pengaduan/{id}', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'show'])->name('warga.pengaduan.show');
        Route::post('/warga/pengaduan/{id}/comment', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'addComment'])->name('warga.pengaduan.comment');
    });

    Route::middleware('module.access:program_kegiatan')->group(function () {
        Route::get('/warga/program-kegiatan', [\App\Http\Controllers\Warga\ProgramKegiatanWargaController::class, 'index'])->name('warga.program-kegiatan.index');
        Route::get('/warga/program-kegiatan/{id}', [\App\Http\Controllers\Warga\ProgramKegiatanWargaController::class, 'show'])->name('warga.program-kegiatan.show');
    });

    // Bantuan Sosial (Warga) - transparansi Bansos RT
    Route::get('/warga/bansos', [\App\Http\Controllers\Warga\BantuanSosialController::class, 'index'])->name('warga.bansos.index');

    // Pengkinian Data Mandiri & Sensus KK Warga
    Route::get('/warga/pengkinian-data', [\App\Http\Controllers\Warga\PengkinianDataWargaController::class, 'index'])->name('warga.pengkinian-data.index');
    Route::post('/warga/pengkinian-data', [\App\Http\Controllers\Warga\PengkinianDataWargaController::class, 'store'])->name('warga.pengkinian-data.store');
    Route::delete('/warga/pengkinian-data/anggota/{id}', [\App\Http\Controllers\Warga\PengkinianDataWargaController::class, 'destroyAnggota'])->name('warga.pengkinian-data.destroy-anggota');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// API Routes for Wilayah
Route::prefix('api/wilayah')->group(function () {
    Route::get('/provinsi', [\App\Http\Controllers\Api\WilayahController::class, 'provinsi']);
    Route::get('/kabupaten/{provinsi_kode}', [\App\Http\Controllers\Api\WilayahController::class, 'kabupaten']);
    Route::get('/kecamatan/{kabupaten_kode}', [\App\Http\Controllers\Api\WilayahController::class, 'kecamatan']);
    Route::get('/kelurahan/{kecamatan_kode}', [\App\Http\Controllers\Api\WilayahController::class, 'kelurahan']);
});
