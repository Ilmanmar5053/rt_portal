<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RumahBlok;
use App\Models\Keluarga;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RumahBlokController extends Controller
{
    public function index(Request $request)
    {
        // Auto-heal any KK records that currently have no Warga members attached
        $emptyKeluargas = Keluarga::doesntHave('wargas')->get();
        foreach ($emptyKeluargas as $emptyKk) {
            $namaKepala = !empty($emptyKk->kepala_keluarga_nama) ? $emptyKk->kepala_keluarga_nama : 'KEPALA KELUARGA';
            $wargaKepala = Warga::create([
                'keluarga_id' => $emptyKk->id,
                'nik' => $emptyKk->no_kk,
                'nama_lengkap' => strtoupper($namaKepala),
                'tempat_lahir' => 'SERANG',
                'tanggal_lahir' => '1990-01-01',
                'jenis_kelamin' => 'Laki-laki',
                'agama' => 'Islam',
                'pendidikan' => 'SLTA/Sederajat',
                'pekerjaan' => 'Karyawan Swasta',
                'status_perkawinan' => 'Kawin',
                'status_hubungan_keluarga' => 'Kepala Keluarga',
                'kewarganegaraan' => 'WNI',
                'nama_ayah' => '-',
                'nama_ibu' => '-',
                'status_hidup' => 'Hidup',
            ]);
            $emptyKk->update([
                'kepala_keluarga_id' => $wargaKepala->id,
                'kepala_keluarga_nama' => null
            ]);
        }

        $search = $request->query('search');
        $blok = $request->query('blok');
        $nomorRumah = $request->query('nomor_rumah');
        $alamat = $request->query('alamat');
        $status = $request->query('status', 'Semua');
        $jumlahKeluarga = $request->query('jumlah_keluarga');
        $sortField = $request->query('sort_field', 'blok');
        $sortDirection = $request->query('sort_direction', 'asc');

        $allowedSortFields = ['blok', 'nomor_rumah', 'status_hunian', 'keluargas_count'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'blok';
        }

        if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $sortDirection = 'asc';
        }

        $rumahBloks = RumahBlok::withCount('keluargas')
            ->with(['keluargas.kepalaKeluarga', 'keluargas.wargas'])
            ->when($search, function ($query, $search) {
                $query->where('blok', 'like', "%{$search}%")
                      ->orWhere('nomor_rumah', 'like', "%{$search}%");
            })
            ->when($blok, function ($query, $blok) {
                $query->where('blok', 'like', "%{$blok}%");
            })
            ->when($nomorRumah, function ($query, $nomorRumah) {
                $query->where('nomor_rumah', 'like', "%{$nomorRumah}%");
            })
            ->when($alamat, function ($query, $alamat) {
                $query->where(function ($query) use ($alamat) {
                    $query->whereHas('keluargas', function ($q) use ($alamat) {
                        $q->where('alamat_lengkap', 'like', "%{$alamat}%");
                    })->orWhere('blok', 'like', "%{$alamat}%")
                      ->orWhere('nomor_rumah', 'like', "%{$alamat}%");
                });
            })
            ->when($status !== 'Semua', function ($query) use ($status) {
                $query->where('status_hunian', $status);
            })
            ->when(is_numeric($jumlahKeluarga), function ($query) use ($jumlahKeluarga) {
                $query->having('keluargas_count', '=', $jumlahKeluarga);
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/RumahBlok/Index', [
            'rumahBloks' => $rumahBloks,
            'filters' => [
                'search' => $search,
                'blok' => $blok,
                'nomor_rumah' => $nomorRumah,
                'alamat' => $alamat,
                'status' => $status,
                'jumlah_keluarga' => $jumlahKeluarga,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/RumahBlok/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'blok' => 'required|string|max:50',
            'nomor_rumah' => 'required|string|max:50',
            'status_hunian' => 'required|string|in:Diisi,Kosong',
            'keterangan' => 'nullable|string',
        ]);

        RumahBlok::create($validated);

        return redirect()->route('admin.rumah-blok.index')->with('message', 'Data rumah berhasil ditambahkan.');
    }

    public function edit(RumahBlok $rumah)
    {
        return Inertia::render('Admin/RumahBlok/Edit', [
            'rumah' => $rumah
        ]);
    }

    public function update(Request $request, RumahBlok $rumah)
    {
        $validated = $request->validate([
            'blok' => 'required|string|max:50',
            'nomor_rumah' => 'required|string|max:50',
            'status_hunian' => 'required|string|in:Diisi,Kosong',
            'keterangan' => 'nullable|string',
        ]);

        $rumah->update($validated);

        return redirect()->route('admin.rumah-blok.index')->with('message', 'Data rumah berhasil diperbarui.');
    }

    public function destroy(RumahBlok $rumah)
    {
        $rumah->delete();
        return redirect()->route('admin.rumah-blok.index')->with('message', 'Data rumah berhasil dihapus.');
    }
}
