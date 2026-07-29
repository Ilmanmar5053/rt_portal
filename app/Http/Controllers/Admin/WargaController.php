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

        $wargas = Warga::with('keluarga')
            ->when($search, function ($query, $search) {
                $query->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                      ->orWhereHas('keluarga', function ($q) use ($search) {
                          $q->where('no_kk', 'like', "%{$search}%");
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
            ->when($status && $status !== 'Semua', function ($query, $status) {
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

        return Inertia::render('Admin/Warga/Index', [
            'wargas' => $wargas,
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

    public function create()
    {
        $keluargas = Keluarga::with('kepalaKeluarga')->orderBy('no_kk')->get();
        return Inertia::render('Admin/Warga/Create', [
            'keluargas' => $keluargas
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
        $warga->load('keluarga');
        return Inertia::render('Admin/Warga/Show', [
            'warga' => $warga
        ]);
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
