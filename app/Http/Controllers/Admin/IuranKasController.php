<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IuranKas;
use App\Models\Warga;
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

        $iurans = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/IuranKas/Index', [
            'iurans' => $iurans,
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
        $wargas = Warga::with('keluarga:id,no_kk')->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'keluarga_id']);
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
        $wargas = Warga::with('keluarga:id,no_kk')->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'keluarga_id']);
        
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

        $wargas = Warga::all();
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

        return redirect()->route('admin.iuran.index')->with('success', "Berhasil men-generate $generatedCount tagihan iuran baru.");
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
