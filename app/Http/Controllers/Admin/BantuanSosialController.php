<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BantuanSosial;
use App\Models\Warga;
use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BantuanSosialController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $sumberDana = $request->query('sumber_dana', 'Semua');
        $status = $request->query('status', 'Semua');
        $tahun = $request->query('tahun', date('Y'));
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        $query = BantuanSosial::with(['warga', 'keluarga'])
            ->when($search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('nama_penerima', 'like', "%{$search}%")
                          ->orWhere('nik', 'like', "%{$search}%")
                          ->orWhere('no_kk', 'like', "%{$search}%")
                          ->orWhere('jenis_bantuan', 'like', "%{$search}%");
                });
            })
            ->when($sumberDana && $sumberDana !== 'Semua', function ($q) use ($sumberDana) {
                $q->where('sumber_dana', $sumberDana);
            })
            ->when($status && $status !== 'Semua', function ($q) use ($status) {
                $q->where('status_penyaluran', $status);
            })
            ->when($tahun && $tahun !== 'Semua', function ($q) use ($tahun) {
                $q->where('periode_tahun', $tahun);
            });

        $bansos = $query->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        // ── 1. STATISTIK 5 KARTU (Semua tahun atau berdasarkan filter) ──
        $statsQuery = BantuanSosial::query()
            ->when($tahun && $tahun !== 'Semua', function ($q) use ($tahun) {
                $q->where('periode_tahun', $tahun);
            });

        $totalPenerima = (clone $statsQuery)->count();
        $bantuanDesa = (clone $statsQuery)->where('sumber_dana', 'Dana Desa')->count();
        $bantuanDaerah = (clone $statsQuery)->where('sumber_dana', 'Dana Daerah')->count();
        $bantuanPusat = (clone $statsQuery)->where('sumber_dana', 'Dana Pusat')->count();
        $totalTunai = (clone $statsQuery)->sum('nominal_tunai');

        $stats = [
            'total_penerima' => $totalPenerima,
            'bantuan_desa'   => $bantuanDesa,
            'bantuan_daerah' => $bantuanDaerah,
            'bantuan_pusat'  => $bantuanPusat,
            'total_tunai'    => $totalTunai,
        ];

        // ── 2. DATA GRAFIK INTERAKTIF (12 BULAN x 3 SUMBER DANA) ──
        $selectedYear = $tahun !== 'Semua' ? (int)$tahun : (int)date('Y');
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agt',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        $chartData = [];
        $allYearBansos = BantuanSosial::where('periode_tahun', $selectedYear)->get();

        foreach ($months as $num => $label) {
            // Hitung berdasarkan bulan pembuatan atau tanggal_penyaluran
            $desaCount = 0;
            $daerahCount = 0;
            $pusatCount = 0;

            foreach ($allYearBansos as $item) {
                $monthMatch = false;
                if ($item->tanggal_penyaluran) {
                    $m = (int)Carbon::parse($item->tanggal_penyaluran)->format('n');
                    if ($m === $num) $monthMatch = true;
                } else {
                    $m = (int)$item->created_at->format('n');
                    if ($m === $num) $monthMatch = true;
                }

                if ($monthMatch) {
                    if ($item->sumber_dana === 'Dana Desa') $desaCount++;
                    elseif ($item->sumber_dana === 'Dana Daerah') $daerahCount++;
                    elseif ($item->sumber_dana === 'Dana Pusat') $pusatCount++;
                }
            }

            $chartData[] = [
                'bulan'  => $label,
                'desa'   => $desaCount,
                'daerah' => $daerahCount,
                'pusat'  => $pusatCount,
                'total'  => $desaCount + $daerahCount + $pusatCount,
            ];
        }

        // Daftar Warga terdaftar untuk dropdown saat tambah/edit Bansos
        $wargas = Warga::with('keluarga')->orderBy('nama_lengkap')->get()->map(function ($w) {
            return [
                'id' => $w->id,
                'keluarga_id' => $w->keluarga_id,
                'nama_lengkap' => $w->nama_lengkap,
                'nik' => $w->nik,
                'no_kk' => $w->keluarga ? $w->keluarga->no_kk : '',
            ];
        });

        return Inertia::render('Admin/BantuanSosial/Index', [
            'bansos'  => $bansos,
            'stats'   => $stats,
            'chartData' => $chartData,
            'wargas'  => $wargas,
            'filters' => [
                'search'      => $search,
                'sumber_dana' => $sumberDana,
                'status'      => $status,
                'tahun'       => $tahun,
                'sort_field'  => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warga_id'           => 'nullable|exists:wargas,id',
            'keluarga_id'        => 'nullable|exists:keluargas,id',
            'nik'                => 'nullable|string|max:20',
            'no_kk'              => 'nullable|string|max:20',
            'nama_penerima'      => 'required|string|max:150',
            'sumber_dana'        => 'required|string|max:100',
            'jenis_bantuan'      => 'required|string|max:150',
            'status_penyaluran'  => 'required|string|max:50',
            'periode_tahun'      => 'required|integer',
            'periode_bulan'      => 'required|string|max:50',
            'bentuk_bantuan'     => 'nullable|string|max:150',
            'nominal_tunai'      => 'nullable|numeric|min:0',
            'keterangan_ekonomi' => 'nullable|string',
            'foto_bukti'         => 'nullable|string',
            'tanggal_penyaluran' => 'nullable|date',
        ]);

        if (empty($validated['nominal_tunai'])) {
            $validated['nominal_tunai'] = 0;
        }

        BantuanSosial::create($validated);

        return redirect()->back()->with('message', 'Data Bantuan Sosial berhasil disimpan.');
    }

    public function update(Request $request, $id)
    {
        $bantuanSosial = BantuanSosial::findOrFail($id);

        $validated = $request->validate([
            'warga_id'           => 'nullable|exists:wargas,id',
            'keluarga_id'        => 'nullable|exists:keluargas,id',
            'nik'                => 'nullable|string|max:20',
            'no_kk'              => 'nullable|string|max:20',
            'nama_penerima'      => 'required|string|max:150',
            'sumber_dana'        => 'required|string|max:100',
            'jenis_bantuan'      => 'required|string|max:150',
            'status_penyaluran'  => 'required|string|max:50',
            'periode_tahun'      => 'required|integer',
            'periode_bulan'      => 'required|string|max:50',
            'bentuk_bantuan'     => 'nullable|string|max:150',
            'nominal_tunai'      => 'nullable|numeric|min:0',
            'keterangan_ekonomi' => 'nullable|string',
            'foto_bukti'         => 'nullable|string',
            'tanggal_penyaluran' => 'nullable|date',
        ]);

        if (empty($validated['nominal_tunai'])) {
            $validated['nominal_tunai'] = 0;
        }

        $bantuanSosial->update($validated);

        return redirect()->back()->with('message', 'Data Bantuan Sosial berhasil diperbarui.');
    }

    public function updateStatus(Request $request, $id)
    {
        $bantuanSosial = BantuanSosial::findOrFail($id);

        $validated = $request->validate([
            'status_penyaluran'  => 'required|string|max:50',
            'tanggal_penyaluran' => 'nullable|date',
        ]);

        $bantuanSosial->update($validated);

        return redirect()->back()->with('message', 'Status penyaluran berhasil diperbarui menjadi: ' . $validated['status_penyaluran']);
    }

    public function destroy($id)
    {
        $bantuanSosial = BantuanSosial::findOrFail($id);
        $bantuanSosial->delete();

        return redirect()->back()->with('message', 'Data Bantuan Sosial berhasil dihapus.');
    }
}
