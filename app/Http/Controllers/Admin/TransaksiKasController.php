<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransaksiKasController extends Controller
{
    public function index(Request $request)
    {
        // Sinkronkan iuran Kas RT yang Approved secara otomatis
        TransaksiKas::syncApprovedIuran();

        $query = TransaksiKas::with('creator')->orderBy('tanggal', 'desc')->orderBy('id', 'desc');

        // Filter by search
        if ($request->filled('search')) {
            $query->where('keterangan', 'like', "%{$request->search}%");
        }

        // Filter by jenis
        if ($request->filled('jenis') && $request->jenis !== 'Semua') {
            $query->where('jenis', $request->jenis);
        }

        // Filter by kategori
        if ($request->filled('kategori') && $request->kategori !== 'Semua') {
            $query->where('kategori', $request->kategori);
        }

        // Filter by bulan/tahun
        if ($request->filled('bulan') && $request->bulan !== 'Semua') {
            $query->whereMonth('tanggal', $request->bulan);
        }
        if ($request->filled('tahun') && $request->tahun !== 'Semua') {
            $query->whereYear('tanggal', $request->tahun);
        }

        $transaksis = $query->paginate(15)->withQueryString();

        // Ringkasan keuangan (filtered)
        $filteredQuery = TransaksiKas::query();
        if ($request->filled('bulan') && $request->bulan !== 'Semua') {
            $filteredQuery->whereMonth('tanggal', $request->bulan);
        }
        if ($request->filled('tahun') && $request->tahun !== 'Semua') {
            $filteredQuery->whereYear('tanggal', $request->tahun);
        }

        $totalPemasukan = (clone $filteredQuery)->where('jenis', 'Pemasukan')->sum('jumlah');
        $totalPengeluaran = (clone $filteredQuery)->where('jenis', 'Pengeluaran')->sum('jumlah');
        $saldoAkhir = TransaksiKas::getSaldo();

        // Hitung total akumulasi iuran bertipe non-Kas RT (Kebersihan & Duka Cita) yang disalurkan ke Pihak Ke-3
        $totalIuranKebersihan = \App\Models\IuranKas::where('status_pembayaran', 'Approved')
            ->where(function($q) {
                $q->where('jenis_iuran', 'Kebersihan (Sampah)')
                  ->orWhere('jenis_iuran', 'like', '%Kebersihan%')
                  ->orWhere('jenis_iuran', 'like', '%Sampah%');
            })->sum('jumlah_bayar');

        $totalIuranDukaCita = \App\Models\IuranKas::where('status_pembayaran', 'Approved')
            ->where(function($q) {
                $q->where('jenis_iuran', 'Duka Cita')
                  ->orWhere('jenis_iuran', 'like', '%Duka%');
            })->sum('jumlah_bayar');

        // 2. Grafik Perbandingan Arus Kas per Bulan (Pemasukan vs Pengeluaran)
        $chartYear = $request->query('chart_year', ($request->filled('tahun') && $request->tahun !== 'Semua') ? $request->tahun : (TransaksiKas::selectRaw('MAX(YEAR(tanggal)) as max_year')->value('max_year') ?? date('Y')));
        $monthlyRaw = TransaksiKas::whereYear('tanggal', $chartYear)
            ->selectRaw('MONTH(tanggal) as bulan, jenis, SUM(jumlah) as total_nominal, COUNT(*) as total_count')
            ->groupBy('bulan', 'jenis')
            ->get();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $chartData = [
            'year' => (int) $chartYear,
            'labels' => $months,
            'pemasukan_nominal' => [],
            'pengeluaran_nominal' => [],
            'pemasukan_count' => [],
            'pengeluaran_count' => [],
        ];

        for ($m = 1; $m <= 12; $m++) {
            $pemasukan = $monthlyRaw->where('bulan', $m)->where('jenis', 'Pemasukan');
            $pengeluaran = $monthlyRaw->where('bulan', $m)->where('jenis', 'Pengeluaran');

            $chartData['pemasukan_nominal'][] = (float) $pemasukan->sum('total_nominal');
            $chartData['pengeluaran_nominal'][] = (float) $pengeluaran->sum('total_nominal');
            $chartData['pemasukan_count'][] = (int) $pemasukan->sum('total_count');
            $chartData['pengeluaran_count'][] = (int) $pengeluaran->sum('total_count');
        }

        // 3. Rekapitulasi per Kategori
        $kategoriPemasukanList = TransaksiKas::getKategoriPemasukan();
        $rekapPemasukan = [];
        foreach ($kategoriPemasukanList as $kat) {
            $queryKat = TransaksiKas::where('jenis', 'Pemasukan')->where('kategori', $kat);
            $rekapPemasukan[] = [
                'kategori' => $kat,
                'total_nominal' => (float) (clone $queryKat)->sum('jumlah'),
                'total_transaksi' => (int) (clone $queryKat)->count(),
            ];
        }
        usort($rekapPemasukan, fn($a, $b) => $b['total_nominal'] <=> $a['total_nominal']);
        $rekapPemasukan = array_slice($rekapPemasukan, 0, 5);

        $kategoriPengeluaranList = TransaksiKas::getKategoriPengeluaran();
        $rekapPengeluaran = [];
        foreach ($kategoriPengeluaranList as $kat) {
            $queryKat = TransaksiKas::where('jenis', 'Pengeluaran')->where('kategori', $kat);
            $rekapPengeluaran[] = [
                'kategori' => $kat,
                'total_nominal' => (float) (clone $queryKat)->sum('jumlah'),
                'total_transaksi' => (int) (clone $queryKat)->count(),
            ];
        }
        usort($rekapPengeluaran, fn($a, $b) => $b['total_nominal'] <=> $a['total_nominal']);
        $rekapPengeluaran = array_slice($rekapPengeluaran, 0, 5);

        // Tahun yang tersedia untuk filter
        $tahunList = TransaksiKas::selectRaw('YEAR(tanggal) as tahun')
            ->groupBy('tahun')
            ->orderBy('tahun', 'desc')
            ->pluck('tahun');

        return Inertia::render('Admin/TransaksiKas/Index', [
            'transaksis' => $transaksis,
            'summary' => [
                'total_pemasukan' => (float) $totalPemasukan,
                'total_pengeluaran' => (float) $totalPengeluaran,
                'saldo_bersih' => (float) ($totalPemasukan - $totalPengeluaran),
                'saldo_akhir' => $saldoAkhir,
                'total_kebersihan' => (float) $totalIuranKebersihan,
                'total_duka_cita' => (float) $totalIuranDukaCita,
            ],
            'chartData' => $chartData,
            'rekapPemasukan' => $rekapPemasukan,
            'rekapPengeluaran' => $rekapPengeluaran,
            'filters' => [
                'search' => $request->search,
                'jenis' => $request->jenis ?? 'Semua',
                'kategori' => $request->kategori ?? 'Semua',
                'bulan' => $request->bulan ?? 'Semua',
                'tahun' => $request->tahun ?? 'Semua',
            ],
            'tahunList' => $tahunList,
            'kategoriPemasukan' => TransaksiKas::getKategoriPemasukan(),
            'kategoriPengeluaran' => TransaksiKas::getKategoriPengeluaran(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TransaksiKas/Create', [
            'kategoriPemasukan' => TransaksiKas::getKategoriPemasukan(),
            'kategoriPengeluaran' => TransaksiKas::getKategoriPengeluaran(),
            'saldoSaatIni' => TransaksiKas::getSaldo(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jenis' => 'required|in:Pemasukan,Pengeluaran',
            'kategori' => 'required|string|max:100',
            'keterangan' => 'required|string|max:500',
            'jumlah' => 'required|numeric|min:1',
            'referensi' => 'nullable|string|max:100',
        ]);

        if ($validated['jenis'] === 'Pengeluaran') {
            $saldoSaatIni = TransaksiKas::getSaldo();
            if ($validated['jumlah'] > $saldoSaatIni) {
                return back()->withInput()->with('error', 'Saldo Tidak Cukup, Jumlah Transaksi Keluar Tidak Lebih Besar dari Saldo');
            }
        }

        $validated['created_by'] = auth()->id();

        // Calculate saldo - recalculate after insert to handle out-of-order dates
        $transaksi = TransaksiKas::create($validated);

        // Recalculate all saldos after inserting
        TransaksiKas::recalculateSaldo();

        return redirect()->route('admin.transaksi-kas.index')->with('success', 'Transaksi berhasil dicatat.');
    }

    public function show($id)
    {
        $transaksi = TransaksiKas::with('creator')->findOrFail($id);
        return Inertia::render('Admin/TransaksiKas/Show', [
            'transaksi' => $transaksi,
        ]);
    }

    public function edit($id)
    {
        $transaksi = TransaksiKas::findOrFail($id);
        return Inertia::render('Admin/TransaksiKas/Edit', [
            'transaksi' => $transaksi,
            'kategoriPemasukan' => TransaksiKas::getKategoriPemasukan(),
            'kategoriPengeluaran' => TransaksiKas::getKategoriPengeluaran(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $transaksi = TransaksiKas::findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jenis' => 'required|in:Pemasukan,Pengeluaran',
            'kategori' => 'required|string|max:100',
            'keterangan' => 'required|string|max:500',
            'jumlah' => 'required|numeric|min:1',
            'referensi' => 'nullable|string|max:100',
        ]);

        if ($validated['jenis'] === 'Pengeluaran') {
            $saldoSaatIni = TransaksiKas::getSaldo();
            // Kembalikan dana dari transaksi ini sementara untuk mendapatkan saldo murni tanpa transaksi ini
            $saldoTersedia = $saldoSaatIni;
            if ($transaksi->jenis === 'Pengeluaran') {
                $saldoTersedia += $transaksi->jumlah;
            } else {
                $saldoTersedia -= $transaksi->jumlah;
            }

            if ($validated['jumlah'] > $saldoTersedia) {
                return back()->withInput()->with('error', 'Saldo Tidak Cukup, Jumlah Transaksi Keluar Tidak Lebih Besar dari Saldo');
            }
        }

        $transaksi->update($validated);

        // Recalculate all saldos
        TransaksiKas::recalculateSaldo();

        return redirect()->route('admin.transaksi-kas.index')->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $transaksi = TransaksiKas::findOrFail($id);
        $transaksi->delete();

        // Recalculate all saldos
        TransaksiKas::recalculateSaldo();

        return redirect()->route('admin.transaksi-kas.index')->with('success', 'Transaksi berhasil dihapus.');
    }
}
