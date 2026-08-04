<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProgramKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProgramKegiatanController extends Controller
{
    public function index(Request $request)
    {
        ProgramKegiatan::syncAllStatuses();

        $query = ProgramKegiatan::with('creator');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_program', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%")
                  ->orWhere('pic_nama', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kategori') && $request->kategori !== 'Semua') {
            $query->where('kategori', $request->kategori);
        }

        if ($request->filled('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        $programs = $query->orderBy('tanggal_mulai', 'desc')->paginate(10)->withQueryString();

        // Summary metrics
        $allPrograms = ProgramKegiatan::all();
        $summary = [
            'total_program' => $allPrograms->count(),
            'direncanakan' => $allPrograms->where('status', 'Direncanakan')->count(),
            'sedang_berjalan' => $allPrograms->where('status', 'Sedang Berjalan')->count(),
            'selesai' => $allPrograms->where('status', 'Selesai')->count(),
            'total_anggaran' => (float) $allPrograms->sum('estimasi_anggaran'),
        ];

        return Inertia::render('Admin/ProgramKegiatan/Index', [
            'programs' => $programs,
            'summary' => $summary,
            'filters' => [
                'search' => $request->search ?? '',
                'kategori' => $request->kategori ?? 'Semua',
                'status' => $request->status ?? 'Semua',
            ],
            'kategoriList' => ProgramKegiatan::getKategoriList(),
            'statusList' => ProgramKegiatan::getStatusList(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ProgramKegiatan/Create', [
            'kategoriList' => ProgramKegiatan::getKategoriList(),
            'statusList' => ProgramKegiatan::getStatusList(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_program' => 'required|string|max:255',
            'kategori' => 'required|string|in:Program,Kegiatan,Informasi,Lain-lain',
            'status' => 'nullable|string|in:Direncanakan,Sedang Berjalan,Selesai,Dibatalkan',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'waktu' => 'nullable|string|max:100',
            'lokasi' => 'required|string|max:255',
            'pic_nama' => 'required|string|max:150',
            'pic_kontak' => 'nullable|string|max:50',
            'estimasi_anggaran' => 'nullable|numeric|min:0',
            'realisasi_anggaran' => 'nullable|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'eflyer' => 'nullable|image|max:2048',
        ]);

        $eflyerPath = null;
        if ($request->hasFile('eflyer')) {
            $eflyerPath = '/storage/' . $request->file('eflyer')->store('eflyers', 'public');
        }

        $program = ProgramKegiatan::create([
            'nama_program' => $validated['nama_program'],
            'kategori' => $validated['kategori'],
            'status' => $validated['status'] ?? 'Direncanakan',
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'] ?? null,
            'waktu' => $validated['waktu'] ?? null,
            'lokasi' => $validated['lokasi'],
            'pic_nama' => $validated['pic_nama'],
            'pic_kontak' => $validated['pic_kontak'] ?? null,
            'estimasi_anggaran' => $validated['estimasi_anggaran'] ?? 0,
            'realisasi_anggaran' => $validated['realisasi_anggaran'] ?? 0,
            'deskripsi' => $validated['deskripsi'] ?? null,
            'eflyer_path' => $eflyerPath,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.program-kegiatan.index')->with('success', 'Program & Kegiatan baru berhasil ditambahkan!');
    }

    public function show($id)
    {
        $program = ProgramKegiatan::with('creator')->findOrFail($id);

        return Inertia::render('Admin/ProgramKegiatan/Show', [
            'program' => $program,
        ]);
    }

    public function edit($id)
    {
        $program = ProgramKegiatan::findOrFail($id);

        return Inertia::render('Admin/ProgramKegiatan/Edit', [
            'program' => $program,
            'kategoriList' => ProgramKegiatan::getKategoriList(),
            'statusList' => ProgramKegiatan::getStatusList(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $program = ProgramKegiatan::findOrFail($id);

        $validated = $request->validate([
            'nama_program' => 'required|string|max:255',
            'kategori' => 'required|string|in:Program,Kegiatan,Informasi,Lain-lain',
            'status' => 'required|string|in:Direncanakan,Sedang Berjalan,Selesai,Dibatalkan',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'waktu' => 'nullable|string|max:100',
            'lokasi' => 'required|string|max:255',
            'pic_nama' => 'required|string|max:150',
            'pic_kontak' => 'nullable|string|max:50',
            'estimasi_anggaran' => 'nullable|numeric|min:0',
            'realisasi_anggaran' => 'nullable|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'eflyer' => 'nullable|image|max:2048',
        ]);

        $eflyerPath = $program->eflyer_path;
        if ($request->hasFile('eflyer')) {
            // hapus lama jika ada dan ada di storage public
            if ($eflyerPath && str_starts_with($eflyerPath, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $eflyerPath));
            }
            $eflyerPath = '/storage/' . $request->file('eflyer')->store('eflyers', 'public');
        }

        $program->update([
            'nama_program' => $validated['nama_program'],
            'kategori' => $validated['kategori'],
            'status' => $validated['status'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'] ?? null,
            'waktu' => $validated['waktu'] ?? null,
            'lokasi' => $validated['lokasi'],
            'pic_nama' => $validated['pic_nama'],
            'pic_kontak' => $validated['pic_kontak'] ?? null,
            'estimasi_anggaran' => $validated['estimasi_anggaran'] ?? 0,
            'realisasi_anggaran' => $validated['realisasi_anggaran'] ?? 0,
            'deskripsi' => $validated['deskripsi'] ?? null,
            'eflyer_path' => $eflyerPath,
        ]);

        return redirect()->route('admin.program-kegiatan.index')->with('success', 'Program & Kegiatan berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $program = ProgramKegiatan::findOrFail($id);

        if ($program->eflyer_path && str_starts_with($program->eflyer_path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $program->eflyer_path));
        }

        $program->delete();

        return redirect()->route('admin.program-kegiatan.index')->with('success', 'Program & Kegiatan berhasil dihapus!');
    }
}
