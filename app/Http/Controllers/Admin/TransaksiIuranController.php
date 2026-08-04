<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IuranKas;
use App\Models\ProfilRt;
use App\Models\TransaksiIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TransaksiIuranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TransaksiIuran::with('creator')->orderBy('tanggal_penyerahan', 'desc')->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_kwitansi', 'like', "%{$search}%")
                  ->orWhere('penerima_nama', 'like', "%{$search}%")
                  ->orWhere('penerima_instansi', 'like', "%{$search}%")
                  ->orWhere('penyerah_nama', 'like', "%{$search}%")
                  ->orWhere('catatan', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kategori') && $request->kategori !== 'semua') {
            $query->where('kategori_penyerahan', $request->kategori);
        }

        if ($request->filled('bulan')) {
            $query->whereMonth('tanggal_penyerahan', $request->bulan);
        }

        if ($request->filled('tahun')) {
            $query->whereYear('tanggal_penyerahan', $request->tahun);
        }

        $transaksis = $query->paginate(10)->withQueryString();

        // 1. Hitung total penyerahan berdasarkan kategori
        $totalPenyerahanSampah = TransaksiIuran::where('kategori_penyerahan', 'pengelolaan_sampah')->sum('jumlah_dana');
        $totalPenyerahanDuka = TransaksiIuran::where('kategori_penyerahan', 'dana_duka')->sum('jumlah_dana');
        $totalPenyerahanLainnya = TransaksiIuran::where('kategori_penyerahan', 'lainnya')->sum('jumlah_dana');
        $totalKeseluruhan = TransaksiIuran::sum('jumlah_dana');

        // 2. Hitung estimasi penerimaan iuran dari warga bertipe 'Approved'
        $iuranApproved = IuranKas::where('status_pembayaran', 'Approved')->get();

        $totalTerkumpulKebersihan = $iuranApproved->filter(function ($i) {
            return str_contains(strtolower($i->jenis_iuran), 'kebersihan') || str_contains(strtolower($i->jenis_iuran), 'sampah');
        })->sum('jumlah');

        $totalTerkumpulDuka = $iuranApproved->filter(function ($i) {
            return str_contains(strtolower($i->jenis_iuran), 'duka') || str_contains(strtolower($i->jenis_iuran), 'kematian');
        })->sum('jumlah');

        // Profil RT untuk default data di kwitansi/form
        $profilRt = ProfilRt::first();

        return Inertia::render('Admin/TransaksiIuran/Index', [
            'transaksis' => $transaksis,
            'filters' => $request->only(['search', 'kategori', 'bulan', 'tahun']),
            'summary' => [
                'total_penyerahan_sampah' => (float) $totalPenyerahanSampah,
                'total_penyerahan_duka' => (float) $totalPenyerahanDuka,
                'total_penyerahan_lainnya' => (float) $totalPenyerahanLainnya,
                'total_keseluruhan' => (float) $totalKeseluruhan,
                'total_terkumpul_kebersihan' => (float) $totalTerkumpulKebersihan,
                'total_terkumpul_duka' => (float) $totalTerkumpulDuka,
                'sisa_dana_sampah' => (float) ($totalTerkumpulKebersihan - $totalPenyerahanSampah),
                'sisa_dana_duka' => (float) ($totalTerkumpulDuka - $totalPenyerahanDuka),
            ],
            'profilRt' => $profilRt,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_penyerahan' => 'required|in:pengelolaan_sampah,dana_duka,lainnya',
            'tanggal_penyerahan' => 'required|date',
            'periode' => 'nullable|string|max:100',
            'jumlah_dana' => 'required|numeric|min:1',
            'penerima_nama' => 'required|string|max:255',
            'penerima_instansi' => 'required|string|max:255',
            'penerima_jabatan' => 'nullable|string|max:255',
            'penyerah_nama' => 'required|string|max:255',
            'penyerah_jabatan' => 'nullable|string|max:255',
            'metode_pembayaran' => 'required|string|max:50',
            'catatan' => 'nullable|string',
            'status' => 'required|in:Draft,Diserahkan,Diterima',
            'bukti_transfer' => 'nullable|image|mimes:jpeg,png,jpg,pdf|max:3072',
        ]);

        $validated['nomor_kwitansi'] = TransaksiIuran::generateNomorKwitansi();
        $validated['created_by'] = Auth::id();

        if ($request->hasFile('bukti_transfer')) {
            $validated['bukti_transfer'] = $request->file('bukti_transfer')->store('bukti_penyerahan_iuran', 'public');
        }

        TransaksiIuran::create($validated);

        return redirect()->back()->with('success', 'Transaksi penyerahan iuran & Kwitansi Digital berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $transaksi = TransaksiIuran::findOrFail($id);

        $validated = $request->validate([
            'kategori_penyerahan' => 'required|in:pengelolaan_sampah,dana_duka,lainnya',
            'tanggal_penyerahan' => 'required|date',
            'periode' => 'nullable|string|max:100',
            'jumlah_dana' => 'required|numeric|min:1',
            'penerima_nama' => 'required|string|max:255',
            'penerima_instansi' => 'required|string|max:255',
            'penerima_jabatan' => 'nullable|string|max:255',
            'penyerah_nama' => 'required|string|max:255',
            'penyerah_jabatan' => 'nullable|string|max:255',
            'metode_pembayaran' => 'required|string|max:50',
            'catatan' => 'nullable|string',
            'status' => 'required|in:Draft,Diserahkan,Diterima',
            'bukti_transfer' => 'nullable|image|mimes:jpeg,png,jpg,pdf|max:3072',
        ]);

        if ($request->hasFile('bukti_transfer')) {
            if ($transaksi->bukti_transfer) {
                Storage::disk('public')->delete($transaksi->bukti_transfer);
            }
            $validated['bukti_transfer'] = $request->file('bukti_transfer')->store('bukti_penyerahan_iuran', 'public');
        }

        $transaksi->update($validated);

        return redirect()->back()->with('success', 'Transaksi penyerahan iuran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $transaksi = TransaksiIuran::findOrFail($id);

        if ($transaksi->bukti_transfer) {
            Storage::disk('public')->delete($transaksi->bukti_transfer);
        }

        $transaksi->delete();

        return redirect()->back()->with('success', 'Transaksi penyerahan iuran berhasil dihapus.');
    }
}
