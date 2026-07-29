<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SuratPengantar;
use App\Models\Warga;
use App\Models\ProfilRt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuratPengantarController extends Controller
{
    public function index(Request $request)
    {
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        $query = SuratPengantar::with('warga')->orderBy($sortField, $sortDirection);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('jenis_surat', 'like', "%{$search}%")
                  ->orWhereHas('warga', function($q2) use ($search) {
                      $q2->where('nama_lengkap', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('jenis_surat') && $request->jenis_surat != 'Semua') {
            if ($request->jenis_surat === 'Lainnya') {
                $query->whereNotIn('jenis_surat', ['Surat Keterangan Domisili', 'Surat Pindah', 'Surat Keterangan Tidak Mampu', 'Surat Keterangan Usaha']);
            } else {
                $query->where('jenis_surat', $request->jenis_surat);
            }
        }

        if ($request->has('status') && $request->status != 'Semua') {
            $query->where('status', $request->status);
        }

        $surats = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/SuratPengantar/Index', [
            'surats' => $surats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'Semua',
                'jenis_surat' => $request->jenis_surat ?? 'Semua',
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection
            ]
        ]);
    }

    public function create()
    {
        $wargas = Warga::with('keluarga:id,no_kk')->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'keluarga_id']);
        return Inertia::render('Admin/SuratPengantar/Create', [
            'wargas' => $wargas
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warga_id' => 'required|exists:wargas,id',
            'jenis_surat' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'keterangan_tambahan' => 'nullable|string',
            'status' => 'required|string|in:Pending RT,Pending RW,Disetujui,Ditolak',
        ]);

        SuratPengantar::create($validated);

        return redirect()->route('admin.surat.index')->with('success', 'Pengajuan surat berhasil ditambahkan.');
    }

    public function show($id)
    {
        $surat = SuratPengantar::with('warga.keluarga.rumahBlok')->findOrFail($id);
        $profil = ProfilRt::first();
        return Inertia::render('Admin/SuratPengantar/Show', [
            'surat' => $surat,
            'profil' => $profil
        ]);
    }

    public function edit($id)
    {
        $surat = SuratPengantar::findOrFail($id);
        $wargas = Warga::with('keluarga:id,no_kk')->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'keluarga_id']);
        
        return Inertia::render('Admin/SuratPengantar/Edit', [
            'surat' => $surat,
            'wargas' => $wargas
        ]);
    }

    public function update(Request $request, $id)
    {
        $surat = SuratPengantar::findOrFail($id);

        $validated = $request->validate([
            'warga_id' => 'required|exists:wargas,id',
            'jenis_surat' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'keterangan_tambahan' => 'nullable|string',
            'status' => 'required|string|in:Pending RT,Pending RW,Disetujui,Ditolak',
        ]);

        $surat->update($validated);

        return redirect()->route('admin.surat.index')->with('success', 'Pengajuan surat berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $surat = SuratPengantar::findOrFail($id);
        $surat->delete();

        return redirect()->route('admin.surat.index')->with('success', 'Pengajuan surat berhasil dihapus.');
    }
}
