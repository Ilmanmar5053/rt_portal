<?php

use App\Http\Controllers\Admin\WargaController;
use App\Http\Controllers\Admin\IuranKasController;
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

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'profil' => $profil
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
        $totalWarga = \App\Models\Warga::count();
        $totalKK = \App\Models\Keluarga::count();
        $rumahKosong = \App\Models\RumahBlok::where('status_hunian', 'Kosong')->count();
        $rumahDihuni = \App\Models\RumahBlok::where('status_hunian', 'Diisi')->count();
        $kasBulanIni = \App\Models\IuranKas::where('periode_bulan', date('m'))
            ->where('periode_tahun', date('Y'))
            ->where('status_pembayaran', 'Approved')
            ->sum('jumlah_bayar');

        $adminPengaduans = \App\Models\Pengaduan::with('warga')->latest()->take(5)->get()->map(function($p) {
            return [
                'id' => $p->id,
                'warga' => $p->warga ? $p->warga->nama_lengkap : 'Unknown',
                'judul' => $p->judul,
                'status' => $p->status_progres,
                'tanggal' => $p->created_at->format('d M Y')
            ];
        });

        return Inertia::render('Dashboard', [
            'adminStats' => [
                'total_warga' => number_format($totalWarga, 0, ',', '.'),
                'total_kk' => number_format($totalKK, 0, ',', '.'),
                'rumah_dihuni' => number_format($rumahDihuni, 0, ',', '.'),
                'rumah_kosong' => number_format($rumahKosong, 0, ',', '.'),
                'kas_bulan_ini' => 'Rp ' . number_format($kasBulanIni, 0, ',', '.')
            ],
            'adminPengaduans' => $adminPengaduans
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

    Route::post('warga/{warga}/generate-account', [WargaController::class, 'generateAccount'])->name('warga.generate-account')->middleware('module.access:data_warga');
    Route::resource('warga', WargaController::class)->middleware('module.access:data_warga');
    Route::resource('keluarga', App\Http\Controllers\Admin\KeluargaController::class)->middleware('module.access:data_keluarga');
    Route::resource('rumah', \App\Http\Controllers\Admin\RumahBlokController::class)->middleware('module.access:data_rumah');
    
    // Iuran Kas specific routes
    Route::post('iuran/generate', [IuranKasController::class, 'generate'])->name('iuran.generate')->middleware('module.access:iuran_kas');
    Route::post('iuran/bulk-action', [IuranKasController::class, 'bulkAction'])->name('iuran.bulk-action')->middleware('module.access:iuran_kas');
    Route::patch('iuran/{iuran}/toggle-lunas', [IuranKasController::class, 'toggleLunas'])->name('iuran.toggle-lunas')->middleware('module.access:iuran_kas');
    Route::resource('iuran', IuranKasController::class)->middleware('module.access:iuran_kas');
    Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
    
    Route::post('pengaduan/{pengaduan}/comment', [PengaduanController::class, 'addComment'])->name('pengaduan.comment');
    Route::resource('pengaduan', PengaduanController::class)->middleware('module.access:pengaduan');
    Route::resource('surat', SuratPengantarController::class)->middleware('module.access:surat_pengantar');
    
    // Transaksi Arus Kas
    Route::resource('transaksi-kas', \App\Http\Controllers\Admin\TransaksiKasController::class)->middleware('module.access:transaksi_kas');
    
    // Program & Kegiatan
    Route::resource('program-kegiatan', \App\Http\Controllers\Admin\ProgramKegiatanController::class)->middleware('module.access:program_kegiatan');

    // Profil RT routes
    Route::get('profil', [ProfilRtController::class, 'edit'])->name('profil.edit');
    Route::post('profil', [ProfilRtController::class, 'update'])->name('profil.update');
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

        return Inertia::render('Dashboard', [
            'iurans' => $iurans,
            'surats' => $surats,
            'pengaduans' => $pengaduans,
            'warga' => $warga
        ]);
    })->name('warga.dashboard');

    Route::get('/warga/iuran/{id}', function ($id) {
        $user = auth()->user();
        $warga = \App\Models\Warga::where('user_id', $user->id)->firstOrFail();
        
        $iuran = \App\Models\IuranKas::with('warga.rumahBlok')
            ->where('id', $id)
            ->where('warga_id', $warga->id)
            ->firstOrFail();

        return Inertia::render('Admin/IuranKas/Show', [
            'iuran' => $iuran
        ]);
    })->name('warga.iuran.show');

    // Warga Module Routes (dilindungi middleware module.access agar toggle hak akses berlaku)
    Route::middleware('module.access:pengaduan')->group(function () {
        Route::get('/warga/pengaduan', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'index'])->name('warga.pengaduan.index');
        Route::get('/warga/pengaduan/create', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'create'])->name('warga.pengaduan.create');
        Route::post('/warga/pengaduan', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'store'])->name('warga.pengaduan.store');
        Route::get('/warga/pengaduan/{id}', [\App\Http\Controllers\Warga\PengaduanWargaController::class, 'show'])->name('warga.pengaduan.show');
    });

    Route::middleware('module.access:surat_pengantar')->group(function () {
        Route::get('/warga/surat', [\App\Http\Controllers\Warga\SuratWargaController::class, 'index'])->name('warga.surat.index');
        Route::get('/warga/surat/create', [\App\Http\Controllers\Warga\SuratWargaController::class, 'create'])->name('warga.surat.create');
        Route::post('/warga/surat', [\App\Http\Controllers\Warga\SuratWargaController::class, 'store'])->name('warga.surat.store');
        Route::get('/warga/surat/{id}', [\App\Http\Controllers\Warga\SuratWargaController::class, 'show'])->name('warga.surat.show');
    });

    Route::middleware('module.access:iuran_kas')->group(function () {
        Route::get('/warga/iuran', [\App\Http\Controllers\Warga\IuranWargaController::class, 'index'])->name('warga.iuran.index');
    });

    Route::middleware('module.access:program_kegiatan')->group(function () {
        Route::get('/warga/program-kegiatan', [\App\Http\Controllers\Warga\ProgramKegiatanWargaController::class, 'index'])->name('warga.program-kegiatan.index');
        Route::get('/warga/program-kegiatan/{id}', [\App\Http\Controllers\Warga\ProgramKegiatanWargaController::class, 'show'])->name('warga.program-kegiatan.show');
    });
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
