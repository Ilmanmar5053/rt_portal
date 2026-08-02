<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IuranKas;
use App\Models\Warga;
use App\Models\Keluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IuranKasController extends Controller
{
    public function index(Request $request)
    {
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        $query = IuranKas::with('warga.keluarga.rumahBlok')->orderBy($sortField, $sortDirection);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('warga', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status != 'Semua') {
            $query->where('status_pembayaran', $request->status);
        }

        // 1. Dashboard Cards Summary berdasarkan data yang difilter
        $summaryQuery = clone $query;
        $allFiltered = $summaryQuery->get(['id', 'warga_id', 'jumlah_bayar', 'status_pembayaran']);
        $lunasData = $allFiltered->where('status_pembayaran', 'Approved');
        $belumLunasData = $allFiltered->where('status_pembayaran', '!=', 'Approved');

        $summary = [
            'total_nominal' => (float) $allFiltered->sum('jumlah_bayar'),
            'nominal_lunas' => (float) $lunasData->sum('jumlah_bayar'),
            'nominal_belum_lunas' => (float) $belumLunasData->sum('jumlah_bayar'),
            'warga_lunas' => (int) $lunasData->unique('warga_id')->count(),
            'warga_belum_lunas' => (int) $belumLunasData->unique('warga_id')->count(),
            'total_data_lunas' => (int) $lunasData->count(),
            'total_data_belum_lunas' => (int) $belumLunasData->count(),
            'total_data' => (int) $allFiltered->count(),
        ];

        // 2. Grafik Perbandingan Iuran per Bulan (Lunas vs Belum Lunas)
        $chartYear = $request->query('year', IuranKas::max('periode_tahun') ?? date('Y'));
        $monthlyRaw = IuranKas::where('periode_tahun', $chartYear)
            ->selectRaw('periode_bulan, status_pembayaran, SUM(jumlah_bayar) as total_nominal, COUNT(*) as total_count')
            ->groupBy('periode_bulan', 'status_pembayaran')
            ->get();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $chartData = [
            'year' => (int) $chartYear,
            'labels' => $months,
            'lunas_nominal' => [],
            'belum_lunas_nominal' => [],
            'lunas_count' => [],
            'belum_lunas_count' => [],
        ];

        for ($m = 1; $m <= 12; $m++) {
            $lunas = $monthlyRaw->where('periode_bulan', $m)->where('status_pembayaran', 'Approved');
            $belum = $monthlyRaw->where('periode_bulan', $m)->where('status_pembayaran', '!=', 'Approved');

            $chartData['lunas_nominal'][] = (float) $lunas->sum('total_nominal');
            $chartData['belum_lunas_nominal'][] = (float) $belum->sum('total_nominal');
            $chartData['lunas_count'][] = (int) $lunas->sum('total_count');
            $chartData['belum_lunas_count'][] = (int) $belum->sum('total_count');
        }

        // 3. Rekapitulasi Relevan (per Jenis Iuran & per Blok)
        $jenisList = ['Wajib', 'Sukarela', 'Keamanan', 'Sampah'];
        $rekapJenis = [];
        foreach ($jenisList as $jenis) {
            $queryJenis = IuranKas::where('jenis_iuran', $jenis);
            $rekapJenis[] = [
                'jenis' => $jenis,
                'total_nominal' => (float) (clone $queryJenis)->where('status_pembayaran', 'Approved')->sum('jumlah_bayar'),
                'total_transaksi' => (int) (clone $queryJenis)->count(),
                'lunas_transaksi' => (int) (clone $queryJenis)->where('status_pembayaran', 'Approved')->count(),
            ];
        }

        $allIuranForRekap = IuranKas::with('warga.keluarga.rumahBlok')->get();
        $rekapBlokMap = [];
        foreach ($allIuranForRekap as $item) {
            $blokName = $item->warga?->keluarga?->rumahBlok?->nama_blok ?? 'Tanpa Blok';
            if (!isset($rekapBlokMap[$blokName])) {
                $rekapBlokMap[$blokName] = [
                    'blok' => $blokName,
                    'total_nominal' => 0,
                    'total_transaksi' => 0,
                    'lunas_transaksi' => 0,
                ];
            }
            $rekapBlokMap[$blokName]['total_transaksi']++;
            if ($item->status_pembayaran === 'Approved') {
                $rekapBlokMap[$blokName]['total_nominal'] += $item->jumlah_bayar;
                $rekapBlokMap[$blokName]['lunas_transaksi']++;
            }
        }
        $rekapBlok = array_values($rekapBlokMap);
        usort($rekapBlok, fn($a, $b) => $b['total_nominal'] <=> $a['total_nominal']);
        $rekapBlok = array_slice($rekapBlok, 0, 5);

        $iurans = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/IuranKas/Index', [
            'iurans' => $iurans,
            'summary' => $summary,
            'chartData' => $chartData,
            'rekapJenis' => $rekapJenis,
            'rekapBlok' => $rekapBlok,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'Semua',
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection
            ]
        ]);
    }

    public function create()
    {
        $wargas = Warga::with(['keluarga.rumahBlok'])
            ->where('status_hubungan_keluarga', 'Kepala Keluarga')
            ->orWhereIn('id', Keluarga::whereNotNull('kepala_keluarga_id')->pluck('kepala_keluarga_id'))
            ->orderBy('nama_lengkap')
            ->get(['id', 'nama_lengkap', 'keluarga_id']);

        return Inertia::render('Admin/IuranKas/Create', [
            'wargas' => $wargas
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warga_id' => 'required|exists:wargas,id',
            'jenis_iuran' => 'required|string|in:Wajib,Sukarela,Keamanan,Sampah',
            'periode_bulan' => 'required|integer|min:1|max:12',
            'periode_tahun' => 'required|integer|min:2000',
            'jumlah_bayar' => 'required|numeric|min:0',
            'status_pembayaran' => 'required|string|in:Pending,Approved,Rejected',
        ]);

        IuranKas::create($validated);

        return redirect()->route('admin.iuran.index')->with('success', 'Data Iuran berhasil ditambahkan.');
    }

    public function show($id)
    {
        $iuran = IuranKas::with('warga.keluarga.rumahBlok')->findOrFail($id);
        return Inertia::render('Admin/IuranKas/Show', [
            'iuran' => $iuran
        ]);
    }

    public function edit($id)
    {
        $iuran = IuranKas::findOrFail($id);
        $wargas = Warga::with(['keluarga.rumahBlok'])
            ->where('status_hubungan_keluarga', 'Kepala Keluarga')
            ->orWhereIn('id', Keluarga::whereNotNull('kepala_keluarga_id')->pluck('kepala_keluarga_id'))
            ->orderBy('nama_lengkap')
            ->get(['id', 'nama_lengkap', 'keluarga_id']);
        
        return Inertia::render('Admin/IuranKas/Edit', [
            'iuran' => $iuran,
            'wargas' => $wargas
        ]);
    }

    public function update(Request $request, $id)
    {
        $iuran = IuranKas::findOrFail($id);

        $validated = $request->validate([
            'warga_id' => 'required|exists:wargas,id',
            'jenis_iuran' => 'required|string|in:Wajib,Sukarela,Keamanan,Sampah',
            'periode_bulan' => 'required|integer|min:1|max:12',
            'periode_tahun' => 'required|integer|min:2000',
            'jumlah_bayar' => 'required|numeric|min:0',
            'status_pembayaran' => 'required|string|in:Pending,Approved,Rejected',
        ]);

        $iuran->update($validated);

        return redirect()->route('admin.iuran.index')->with('success', 'Data Iuran berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $iuran = IuranKas::findOrFail($id);
        $iuran->delete();

        return redirect()->route('admin.iuran.index')->with('success', 'Data Iuran berhasil dihapus.');
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'jenis_iuran' => 'required|string|in:Wajib,Sukarela,Keamanan,Sampah',
            'periode_bulan' => 'required|integer|min:1|max:12',
            'periode_tahun' => 'required|integer|min:2000',
            'jumlah_bayar' => 'required|numeric|min:0',
        ]);

        // 1 KK = 1 Iuran (Hanya untuk Kepala Keluarga dari masing-masing KK / Rumah)
        $wargas = Warga::where('status_hubungan_keluarga', 'Kepala Keluarga')
            ->orWhereIn('id', Keluarga::whereNotNull('kepala_keluarga_id')->pluck('kepala_keluarga_id'))
            ->get();

        $generatedCount = 0;

        foreach ($wargas as $warga) {
            // Check if iuran already exists for this warga, type, month, year
            $exists = IuranKas::where('warga_id', $warga->id)
                ->where('jenis_iuran', $validated['jenis_iuran'])
                ->where('periode_bulan', $validated['periode_bulan'])
                ->where('periode_tahun', $validated['periode_tahun'])
                ->exists();

            if (!$exists) {
                IuranKas::create([
                    'warga_id' => $warga->id,
                    'jenis_iuran' => $validated['jenis_iuran'],
                    'periode_bulan' => $validated['periode_bulan'],
                    'periode_tahun' => $validated['periode_tahun'],
                    'jumlah_bayar' => $validated['jumlah_bayar'],
                    'status_pembayaran' => 'Pending',
                ]);
                $generatedCount++;
            }
        }

        return redirect()->route('admin.iuran.index')->with('success', "Berhasil men-generate $generatedCount tagihan iuran kas baru untuk Kartu Keluarga (Per KK / Rumah).");
    }

    public function toggleLunas($id)
    {
        $iuran = IuranKas::findOrFail($id);
        
        // Toggle the status
        if ($iuran->status_pembayaran === 'Approved') {
            $iuran->status_pembayaran = 'Pending';
        } else {
            $iuran->status_pembayaran = 'Approved';
        }
        
        $iuran->save();

        return redirect()->back()->with('success', 'Status pembayaran iuran berhasil diubah.');
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:iuran_kas,id',
        ]);

        $ids = $validated['ids'];
        $action = $validated['action'];
        $count = count($ids);

        switch ($action) {
            case 'approve':
                IuranKas::whereIn('id', $ids)->update(['status_pembayaran' => 'Approved']);
                $message = "{$count} data berhasil ditandai Lunas (Approved).";
                break;
            case 'reject':
                IuranKas::whereIn('id', $ids)->update(['status_pembayaran' => 'Rejected']);
                $message = "{$count} data berhasil ditandai Rejected.";
                break;
            case 'delete':
                IuranKas::whereIn('id', $ids)->delete();
                $message = "{$count} data berhasil dihapus.";
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}
