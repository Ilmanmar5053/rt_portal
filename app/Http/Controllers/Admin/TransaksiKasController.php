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
            ],
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
