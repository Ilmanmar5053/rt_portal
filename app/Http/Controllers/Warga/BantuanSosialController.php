<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\BantuanSosial;
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

        // ── STATISTIK 5 KARTU ──
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

        // ── GRAFIK INTERAKTIF ──
        $selectedYear = $tahun !== 'Semua' ? (int)$tahun : (int)date('Y');
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agt',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        $chartData = [];
        $allYearBansos = BantuanSosial::where('periode_tahun', $selectedYear)->get();

        foreach ($months as $num => $label) {
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

        return Inertia::render('Warga/BantuanSosial/Index', [
            'bansos'    => $bansos,
            'stats'     => $stats,
            'chartData' => $chartData,
            'filters'   => [
                'search'      => $search,
                'sumber_dana' => $sumberDana,
                'status'      => $status,
                'tahun'       => $tahun,
                'sort_field'  => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }
}
