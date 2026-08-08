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
        return redirect()->route('admin.rumah.index')->with('message', 'Data rumah berhasil dihapus.');
    }

    /**
     * Generate daftar Blok & Nomor Rumah secara bulk/massal
     */
    public function generateBulk(Request $request)
    {
        $validated = $request->validate([
            'blok' => 'required|string|max:50',
            'nomor_awal' => 'required|integer|min:1|max:9999',
            'nomor_akhir' => 'required|integer|min:1|max:9999|gte:nomor_awal',
            'status_hunian' => 'required|string|in:Diisi,Kosong',
            'mode' => 'required|string|in:skip,update',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $blokName = strtoupper(trim($validated['blok']));
        $nomorAwal = (int) $validated['nomor_awal'];
        $nomorAkhir = (int) $validated['nomor_akhir'];
        $statusHunian = $validated['status_hunian'];
        $mode = $validated['mode'];
        $keterangan = $validated['keterangan'] ?? null;

        $totalToGenerate = ($nomorAkhir - $nomorAwal) + 1;
        if ($totalToGenerate > 1000) {
            return redirect()->back()->withErrors(['nomor_akhir' => 'Batas maksimal generate sekali proses adalah 1000 unit rumah.']);
        }

        $createdCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        \Illuminate\Support\Facades\DB::transaction(function () use ($blokName, $nomorAwal, $nomorAkhir, $statusHunian, $mode, $keterangan, &$createdCount, &$updatedCount, &$skippedCount) {
            for ($i = $nomorAwal; $i <= $nomorAkhir; $i++) {
                $noRumah = (string) $i;
                
                $existing = RumahBlok::where('blok', $blokName)
                    ->where('nomor_rumah', $noRumah)
                    ->first();

                if ($existing) {
                    if ($mode === 'update') {
                        $existing->update([
                            'status_hunian' => $statusHunian,
                            'keterangan' => $keterangan ?: $existing->keterangan,
                        ]);
                        $updatedCount++;
                    } else {
                        $skippedCount++;
                    }
                } else {
                    RumahBlok::create([
                        'blok' => $blokName,
                        'nomor_rumah' => $noRumah,
                        'status_hunian' => $statusHunian,
                        'keterangan' => $keterangan,
                    ]);
                    $createdCount++;
                }
            }
        });

        // Audit Trail log
        \App\Services\AuditLogService::log(
            'CREATE',
            'Data Rumah',
            "Bulk Generate Data Master Rumah {$blokName} (No. {$nomorAwal} - {$nomorAkhir}). Dibuat: {$createdCount}, Diperbarui: {$updatedCount}, Dilewati: {$skippedCount}",
            null,
            $validated,
            auth()->id()
        );

        $msg = "Berhasil me-generate Master Data Rumah {$blokName} (No. {$nomorAwal} - {$nomorAkhir})! " .
               "Berhasil dibuat: {$createdCount} unit" . 
               ($updatedCount > 0 ? ", Diperbarui: {$updatedCount} unit" : "") . 
               ($skippedCount > 0 ? ", Dilewati (sudah ada): {$skippedCount} unit" : "") . ".";

        return redirect()->route('admin.rumah.index')->with('success', $msg);
    }
}
