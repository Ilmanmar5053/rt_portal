<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Keluarga;
use App\Models\RumahBlok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class KeluargaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $noKk = $request->query('no_kk');
        $kepala = $request->query('kepala');
        $alamat = $request->query('alamat');
        $jumlahAnggota = $request->query('jumlah_anggota');
        $sortField = $request->query('sort_field', 'no_kk');
        $sortDirection = $request->query('sort_direction', 'asc');

        $allowedSortFields = ['no_kk', 'nama_lengkap', 'alamat_lengkap', 'wargas_count'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'no_kk';
        }

        if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $sortDirection = 'asc';
        }

        $keluargas = Keluarga::withCount('wargas')->with(['kepalaKeluarga', 'rumahBlok', 'wargas'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('no_kk', 'like', "%{$search}%")
                      ->orWhereHas('kepalaKeluarga', function ($q2) use ($search) {
                          $q2->where('nama_lengkap', 'like', "%{$search}%");
                      });
                });
            })
            ->when($noKk, function ($query, $noKk) {
                $query->where('no_kk', 'like', "%{$noKk}%");
            })
            ->when($kepala, function ($query, $kepala) {
                $query->whereHas('kepalaKeluarga', function ($q) use ($kepala) {
                    $q->where('nama_lengkap', 'like', "%{$kepala}%");
                });
            })
            ->when($alamat, function ($query, $alamat) {
                $query->where('alamat_lengkap', 'like', "%{$alamat}%");
            })
            ->when(is_numeric($jumlahAnggota), function ($query) use ($jumlahAnggota) {
                $query->having('wargas_count', '=', $jumlahAnggota);
            })
            ->when($sortField === 'nama_lengkap', function ($query) use ($sortDirection) {
                $query->leftJoin('wargas', 'keluargas.kepala_keluarga_id', '=', 'wargas.id')
                      ->orderBy('wargas.nama_lengkap', $sortDirection);
            }, function ($query) use ($sortField, $sortDirection) {
                $query->orderBy($sortField, $sortDirection);
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Keluarga/Index', [
            'keluargas' => $keluargas,
            'filters' => [
                'search' => $search,
                'no_kk' => $noKk,
                'kepala' => $kepala,
                'alamat' => $alamat,
                'jumlah_anggota' => $jumlahAnggota,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ]
        ]);
    }

    public function create()
    {
        $rumahBloks = RumahBlok::orderBy('blok')->orderBy('nomor_rumah')->get();
        return Inertia::render('Admin/Keluarga/Create', [
            'rumahBloks' => $rumahBloks
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_kk' => 'required|string|max:20|unique:keluargas,no_kk',
            'blok' => 'required|string',
            'nomor_rumah' => 'required|string',
            'alamat_lengkap' => 'required|string',
            'rt' => 'required|string',
            'rw' => 'required|string',
            'provinsi' => 'required|string',
            'kabupaten_kota' => 'required|string',
            'kecamatan' => 'required|string',
            'kelurahan' => 'required|string',
            'kode_pos' => 'nullable|string',
            'file_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_ktp_kepala' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $rumahBlok = RumahBlok::firstOrCreate(
            ['blok' => $validated['blok'], 'nomor_rumah' => $validated['nomor_rumah']],
            ['status_hunian' => 'Diisi']
        );

        $data = [
            'no_kk' => $validated['no_kk'],
            'rumah_blok_id' => $rumahBlok->id,
            'alamat_lengkap' => $validated['alamat_lengkap'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'provinsi' => $validated['provinsi'],
            'kabupaten_kota' => $validated['kabupaten_kota'],
            'kecamatan' => $validated['kecamatan'],
            'kelurahan' => $validated['kelurahan'],
            'kode_pos' => $validated['kode_pos'] ?? null,
        ];

        if ($request->hasFile('file_kk')) {
            $data['file_kk'] = $request->file('file_kk')->store('dokumen/kk', 'public');
        }

        if ($request->hasFile('file_ktp_kepala')) {
            $data['file_ktp_kepala'] = $request->file('file_ktp_kepala')->store('dokumen/ktp', 'public');
        }

        Keluarga::create($data);

        return redirect()->route('admin.keluarga.index')->with('message', 'Data Kartu Keluarga berhasil ditambahkan.');
    }

    public function show(Keluarga $keluarga)
    {
        $keluarga->load(['kepalaKeluarga', 'wargas', 'rumahBlok']);
        return Inertia::render('Admin/Keluarga/Show', [
            'keluarga' => $keluarga
        ]);
    }

    public function edit(Keluarga $keluarga)
    {
        $keluarga->load('kepalaKeluarga'); // load nama kepala keluarga
        $rumahBloks = RumahBlok::orderBy('blok')->orderBy('nomor_rumah')->get();
        $wargas = $keluarga->wargas()->get();
        return Inertia::render('Admin/Keluarga/Edit', [
            'keluarga' => $keluarga,
            'rumahBloks' => $rumahBloks,
            'wargas' => $wargas
        ]);
    }

    public function update(Request $request, Keluarga $keluarga)
    {
        $validated = $request->validate([
            'no_kk' => 'required|string|max:20|unique:keluargas,no_kk,' . $keluarga->id,
            'blok' => 'required|string',
            'nomor_rumah' => 'required|string',
            'alamat_lengkap' => 'required|string',
            'rt' => 'required|string',
            'rw' => 'required|string',
            'provinsi' => 'required|string',
            'kabupaten_kota' => 'required|string',
            'kecamatan' => 'required|string',
            'kelurahan' => 'required|string',
            'kode_pos' => 'nullable|string',
            'file_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_ktp_kepala' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'kepala_keluarga_id' => 'nullable|exists:wargas,id',
            'kepala_keluarga_nama' => 'nullable|string|max:255',
        ]);

        // Jika nama diinput manual (tanpa ID), cari warga berdasarkan nama di KK ini
        if (empty($validated['kepala_keluarga_id']) && !empty($validated['kepala_keluarga_nama'])) {
            $wargaDitemukan = \App\Models\Warga::where('keluarga_id', $keluarga->id)
                ->whereRaw('LOWER(nama_lengkap) = ?', [strtolower(trim($validated['kepala_keluarga_nama']))])
                ->first();
            if ($wargaDitemukan) {
                $validated['kepala_keluarga_id'] = $wargaDitemukan->id;
            }
        }

        $rumahBlok = RumahBlok::firstOrCreate(
            ['blok' => $validated['blok'], 'nomor_rumah' => $validated['nomor_rumah']],
            ['status_hunian' => 'Diisi']
        );

        $data = [
            'no_kk' => $validated['no_kk'],
            'rumah_blok_id' => $rumahBlok->id,
            'alamat_lengkap' => $validated['alamat_lengkap'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'provinsi' => $validated['provinsi'],
            'kabupaten_kota' => $validated['kabupaten_kota'],
            'kecamatan' => $validated['kecamatan'],
            'kelurahan' => $validated['kelurahan'],
            'kode_pos' => $validated['kode_pos'] ?? null,
            'kepala_keluarga_id' => $validated['kepala_keluarga_id'] ?? null,
            // Simpan nama manual sebagai fallback tampilan jika tidak ada ID warga
            'kepala_keluarga_nama' => !empty($validated['kepala_keluarga_id'])
                ? null  // kalau sudah ada ID, nama diambil dari relasi (tidak perlu dobel)
                : ($validated['kepala_keluarga_nama'] ?? null),
        ];

        if ($request->hasFile('file_kk')) {
            if ($keluarga->file_kk) { Storage::disk('public')->delete($keluarga->file_kk); }
            $data['file_kk'] = $request->file('file_kk')->store('dokumen/kk', 'public');
        }

        if ($request->hasFile('file_ktp_kepala')) {
            if ($keluarga->file_ktp_kepala) { Storage::disk('public')->delete($keluarga->file_ktp_kepala); }
            $data['file_ktp_kepala'] = $request->file('file_ktp_kepala')->store('dokumen/ktp', 'public');
        }

        $keluarga->update($data);

        if (!empty($data['kepala_keluarga_id'])) {
            \App\Models\Warga::where('keluarga_id', $keluarga->id)
                ->where('id', '!=', $data['kepala_keluarga_id'])
                ->where('status_hubungan_keluarga', 'Kepala Keluarga')
                ->update(['status_hubungan_keluarga' => 'Famili Lain']);
            
            \App\Models\Warga::where('id', $data['kepala_keluarga_id'])
                ->update(['status_hubungan_keluarga' => 'Kepala Keluarga']);
        }

        return redirect()->route('admin.keluarga.index')->with('message', 'Data Kartu Keluarga berhasil diperbarui.');
    }

    public function destroy(Keluarga $keluarga)
    {
        if ($keluarga->file_kk) { Storage::disk('public')->delete($keluarga->file_kk); }
        if ($keluarga->file_ktp_kepala) { Storage::disk('public')->delete($keluarga->file_ktp_kepala); }
        $keluarga->delete();

        return redirect()->route('admin.keluarga.index')->with('message', 'Data Kartu Keluarga berhasil dihapus.');
    }
}
