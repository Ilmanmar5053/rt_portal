<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RumahBlok;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RumahBlokController extends Controller
{
    public function index(Request $request)
    {
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
            ->when($status && $status !== 'Semua', function ($query, $status) {
                $query->where('status_hunian', $status);
            })
            ->when(is_numeric($jumlahKeluarga), function ($query) use ($jumlahKeluarga) {
                $query->having('keluargas_count', $jumlahKeluarga);
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(20)
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
            'blok' => 'required|string|max:10',
            'nomor_rumah' => 'required|string|max:10',
        ]);

        $exists = RumahBlok::where('blok', $validated['blok'])
            ->where('nomor_rumah', $validated['nomor_rumah'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'blok' => 'Kombinasi Blok dan Nomor Rumah ini sudah ada.'
            ])->withInput();
        }

        RumahBlok::create([
            'blok' => $validated['blok'],
            'nomor_rumah' => $validated['nomor_rumah'],
            'status_hunian' => 'Kosong',
        ]);

        return redirect()->route('admin.rumah.index')->with('message', 'Data Rumah berhasil ditambahkan.');
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
            'blok' => 'required|string|max:10',
            'nomor_rumah' => 'required|string|max:10',
        ]);

        $exists = RumahBlok::where('blok', $validated['blok'])
            ->where('nomor_rumah', $validated['nomor_rumah'])
            ->where('id', '!=', $rumah->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'blok' => 'Kombinasi Blok dan Nomor Rumah ini sudah terdaftar pada data lain.'
            ])->withInput();
        }

        $rumah->update($validated);

        return redirect()->route('admin.rumah.index')->with('message', 'Data Rumah berhasil diperbarui.');
    }

    public function destroy(RumahBlok $rumah)
    {
        if ($rumah->keluargas()->exists()) {
            return redirect()->route('admin.rumah.index')->with('error', 'Tidak dapat menghapus rumah yang masih didiami oleh data KK. Ubah status huniannya menjadi Kosong atau hapus/pindahkan data KK tersebut terlebih dahulu.');
        }

        $rumah->delete();

        return redirect()->route('admin.rumah.index')->with('message', 'Data Rumah berhasil dihapus.');
    }
}
