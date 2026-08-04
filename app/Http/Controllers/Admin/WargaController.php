<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWargaRequest;
use App\Http\Requests\UpdateWargaRequest;
use App\Models\Warga;
use App\Models\Keluarga;
use App\Models\User;
use App\Models\IuranKas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class WargaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        $nik = $request->query('nik');
        $nama = $request->query('nama');
        $kk = $request->query('kk');
        $status = $request->query('status');
        $ttl = $request->query('ttl');

        $wargas = Warga::with(['keluarga', 'user'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                      ->orWhereHas('keluarga', function ($q2) use ($search) {
                          $q2->where('no_kk', 'like', "%{$search}%");
                      });
                });
            })
            ->when($nik, function ($query, $nik) {
                $query->where('nik', 'like', "%{$nik}%");
            })
            ->when($nama, function ($query, $nama) {
                $query->where('nama_lengkap', 'like', "%{$nama}%");
            })
            ->when($kk, function ($query, $kk) {
                $query->whereHas('keluarga', function ($q) use ($kk) {
                    $q->where('no_kk', 'like', "%{$kk}%");
                });
            })
            ->when($status && $status !== 'Semua', function ($query) use ($status) {
                $query->where('status_hubungan_keluarga', $status);
            })
            ->when($ttl, function ($query, $ttl) {
                $query->where(function ($query) use ($ttl) {
                    $query->where('tempat_lahir', 'like', "%{$ttl}%")
                          ->orWhere('jenis_kelamin', 'like', "%{$ttl}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        // ── STATISTIK DEMOGRAFI & RENTANG USIA WARGA (Hitung Otomatis berdasarkan tanggal_lahir) ──
        $allWargas = Warga::select('tanggal_lahir', 'jenis_kelamin')->get();
        $totalWarga = $allWargas->count();
        $lakiLaki = 0;
        $perempuan = 0;

        $usia0_6 = 0;
        $usia6_12 = 0;
        $usia12_18 = 0;
        $usia18_25 = 0;
        $usia25_50 = 0;
        $usia50_plus = 0;

        foreach ($allWargas as $w) {
            // Jenis Kelamin
            if (stripos($w->jenis_kelamin, 'Laki') !== false) {
                $lakiLaki++;
            } elseif (stripos($w->jenis_kelamin, 'Perempuan') !== false) {
                $perempuan++;
            }

            // Hitung Usia dari tanggal_lahir
            if ($w->tanggal_lahir) {
                try {
                    $age = \Carbon\Carbon::parse($w->tanggal_lahir)->age;
                    if ($age >= 0 && $age <= 6) {
                        $usia0_6++;
                    } elseif ($age > 6 && $age <= 12) {
                        $usia6_12++;
                    } elseif ($age > 12 && $age <= 18) {
                        $usia12_18++;
                    } elseif ($age > 18 && $age <= 25) {
                        $usia18_25++;
                    } elseif ($age > 25 && $age <= 50) {
                        $usia25_50++;
                    } elseif ($age > 50) {
                        $usia50_plus++;
                    }
                } catch (\Exception $e) {
                    // Abaikan format tanggal lahir yang tidak valid
                }
            }
        }

        $stats = [
            'total_warga' => $totalWarga,
            'laki_laki'   => $lakiLaki,
            'perempuan'   => $perempuan,
            'rentang_usia'=> [
                'usia_0_6'    => ['label' => '0 – 6 Tahun',    'sub' => 'Balita & Usia Dini',   'count' => $usia0_6,    'icon' => '👶', 'bg' => 'bg-amber-100',   'text' => 'text-amber-700',   'border' => 'border-amber-200',   'cardBg' => 'from-amber-50/80 to-orange-50/40'],
                'usia_6_12'   => ['label' => '>6 – 12 Tahun',  'sub' => 'Anak-anak (SD)',       'count' => $usia6_12,   'icon' => '🧒', 'bg' => 'bg-emerald-100', 'text' => 'text-emerald-700', 'border' => 'border-emerald-200', 'cardBg' => 'from-emerald-50/80 to-teal-50/40'],
                'usia_12_18'  => ['label' => '>12 – 18 Tahun', 'sub' => 'Remaja (SMP–SMA)',     'count' => $usia12_18,  'icon' => '👦', 'bg' => 'bg-blue-100',    'text' => 'text-blue-700',    'border' => 'border-blue-200',    'cardBg' => 'from-blue-50/80 to-cyan-50/40'],
                'usia_18_25'  => ['label' => '>18 – 25 Tahun', 'sub' => 'Pemuda / Dewasa Muda', 'count' => $usia18_25,  'icon' => '🧑', 'bg' => 'bg-indigo-100',  'text' => 'text-indigo-700',  'border' => 'border-indigo-200',  'cardBg' => 'from-indigo-50/80 to-purple-50/40'],
                'usia_25_50'  => ['label' => '>25 – 50 Tahun', 'sub' => 'Dewasa Produktif',     'count' => $usia25_50,  'icon' => '👨', 'bg' => 'bg-purple-100',  'text' => 'text-purple-700',  'border' => 'border-purple-200',  'cardBg' => 'from-purple-50/80 to-fuchsia-50/40'],
                'usia_50_plus'=> ['label' => '>50 Tahun',      'sub' => 'Lansia / Senior',      'count' => $usia50_plus,'icon' => '👴', 'bg' => 'bg-rose-100',    'text' => 'text-rose-700',    'border' => 'border-rose-200',    'cardBg' => 'from-rose-50/80 to-pink-50/40'],
            ]
        ];

        return Inertia::render('Admin/Warga/Index', [
            'wargas' => $wargas,
            'stats'  => $stats,
            'filters' => [
                'search' => $search,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
                'nik' => $nik,
                'nama' => $nama,
                'kk' => $kk,
                'status' => $status,
                'ttl' => $ttl,
            ]
        ]);
    }

    public function create(\Illuminate\Http\Request $request)
    {
        $keluargas = Keluarga::with('kepalaKeluarga')->orderBy('no_kk')->get();
        return Inertia::render('Admin/Warga/Create', [
            'keluargas' => $keluargas,
            'default_keluarga_id' => $request->query('keluarga_id')
        ]);
    }

    public function store(StoreWargaRequest $request)
    {
        $validated = $request->validated();
        
        $userId = null;
        if (!empty($validated['buat_akun']) && !empty($validated['email'])) {
            $user = User::create([
                'name' => $validated['nama_lengkap'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['nik']), // Default password is NIK
                'role' => $validated['status_hubungan_keluarga'] === 'Kepala Keluarga' ? 'warga_kk' : 'warga_anggota',
            ]);
            $userId = $user->id;
        }

        $wargaData = collect($validated)->except(['buat_akun', 'email', 'generate_iuran'])->toArray();
        $wargaData['user_id'] = $userId;
        
        $newWarga = Warga::create($wargaData);

        if ($wargaData['status_hubungan_keluarga'] === 'Kepala Keluarga') {
            Keluarga::where('id', $wargaData['keluarga_id'])->update(['kepala_keluarga_id' => $newWarga->id]);
        }

        if (!empty($validated['generate_iuran'])) {
            $bulan = (int) date('m');
            $tahun = (int) date('Y');
            foreach ($validated['generate_iuran'] as $iuran) {
                IuranKas::updateOrCreate(
                    [
                        'warga_id' => $newWarga->id,
                        'jenis_iuran' => $iuran['jenis'],
                        'periode_bulan' => $bulan,
                        'periode_tahun' => $tahun,
                    ],
                    [
                        'jumlah_bayar' => $iuran['nominal'],
                        'status_pembayaran' => 'Pending',
                    ]
                );
            }
        }

        return redirect()->route('admin.warga.index')
                         ->with('message', 'Data warga berhasil ditambahkan.');
    }

    public function show(Warga $warga)
    {
        $warga->load(['keluarga', 'user']);
        return Inertia::render('Admin/Warga/Show', [
            'warga' => $warga
        ]);
    }

    public function generateAccount(Warga $warga)
    {
        if ($warga->status_hubungan_keluarga !== 'Kepala Keluarga') {
            return back()->with('error', 'Hanya warga dengan status Kepala Keluarga yang dapat dibuatkan akun login.');
        }

        $generatedEmail = "warga.{$warga->nik}@rt.com";
        $generatedPassword = $warga->nik;

        $user = null;
        if ($warga->user_id) {
            $user = User::find($warga->user_id);
        }

        if (!$user) {
            $user = User::where('email', $generatedEmail)->first();
        }

        $alreadyRegistered = $user !== null;

        if ($user) {
            $user->update([
                'name' => $warga->nama_lengkap,
                'email' => $generatedEmail,
                'password' => Hash::make($generatedPassword),
                'role' => 'warga_kk',
            ]);
        } else {
            $user = User::create([
                'name' => $warga->nama_lengkap,
                'email' => $generatedEmail,
                'password' => Hash::make($generatedPassword),
                'role' => 'warga_kk',
            ]);
        }

        $warga->update(['user_id' => $user->id]);

        if ($alreadyRegistered) {
            return back()->with('message', "Akun dari warga ini sudah terdaftar ({$generatedEmail}). Jika lupa password gunakan password general yaitu NIK ({$warga->nik}).");
        }

        return back()->with('success', "Akun login berhasil digenerate untuk {$warga->nama_lengkap}! Username (Email): {$generatedEmail} | Password: {$generatedPassword} (NIK) | Hak Akses: Warga (Kepala Keluarga)");
    }

    public function edit(Warga $warga)
    {
        $warga->load('user');
        $keluargas = Keluarga::with('kepalaKeluarga')->orderBy('no_kk')->get();
        return Inertia::render('Admin/Warga/Edit', [
            'warga' => $warga,
            'keluargas' => $keluargas
        ]);
    }

    public function update(UpdateWargaRequest $request, Warga $warga)
    {
        $validated = $request->validated();
        
        $userId = $warga->user_id;
        if (!empty($validated['buat_akun']) && !empty($validated['email'])) {
            if ($userId) {
                // Update existing user
                $user = User::find($userId);
                if ($user) {
                    $user->update([
                        'name' => $validated['nama_lengkap'],
                        'email' => $validated['email'],
                        'role' => $validated['status_hubungan_keluarga'] === 'Kepala Keluarga' ? 'warga_kk' : 'warga_anggota',
                    ]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $validated['nama_lengkap'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['nik']), // Default password is NIK
                    'role' => $validated['status_hubungan_keluarga'] === 'Kepala Keluarga' ? 'warga_kk' : 'warga_anggota',
                ]);
                $userId = $user->id;
            }
        }

        $wargaData = collect($validated)->except(['buat_akun', 'email', 'generate_iuran'])->toArray();
        $wargaData['user_id'] = $userId;
        
        $warga->update($wargaData);

        if ($wargaData['status_hubungan_keluarga'] === 'Kepala Keluarga') {
            Keluarga::where('id', $wargaData['keluarga_id'])->update(['kepala_keluarga_id' => $warga->id]);
        } else {
            $keluarga = Keluarga::find($wargaData['keluarga_id']);
            if ($keluarga && $keluarga->kepala_keluarga_id === $warga->id) {
                $keluarga->update(['kepala_keluarga_id' => null]);
            }
        }

        if (!empty($validated['generate_iuran'])) {
            $bulan = (int) date('m');
            $tahun = (int) date('Y');
            foreach ($validated['generate_iuran'] as $iuran) {
                IuranKas::updateOrCreate(
                    [
                        'warga_id' => $warga->id,
                        'jenis_iuran' => $iuran['jenis'],
                        'periode_bulan' => $bulan,
                        'periode_tahun' => $tahun,
                    ],
                    [
                        'jumlah_bayar' => $iuran['nominal'],
                        'status_pembayaran' => 'Pending',
                    ]
                );
            }
        }

        return redirect()->route('admin.warga.index')
                         ->with('message', 'Data warga berhasil diperbarui.');
    }

    public function destroy(Warga $warga)
    {
        if ($warga->status_hubungan_keluarga === 'Kepala Keluarga') {
            Keluarga::where('id', $warga->keluarga_id)->update(['kepala_keluarga_id' => null]);
        }
        $warga->delete();

        return redirect()->route('admin.warga.index')
                         ->with('message', 'Data warga berhasil dihapus.');
    }
}
