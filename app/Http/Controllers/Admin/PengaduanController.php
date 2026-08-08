<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\PengaduanLog;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengaduanController extends Controller
{
    public function index(Request $request)
    {
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        $query = Pengaduan::with('warga')->orderBy($sortField, $sortDirection);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhereHas('warga', function($q2) use ($search) {
                      $q2->where('nama_lengkap', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status != 'Semua') {
            $query->where('status_progres', $request->status);
        }

        $pengaduans = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Pengaduan::count(),
            'baru' => Pengaduan::where('status_progres', 'Diajukan')->count(),
            'diproses' => Pengaduan::where('status_progres', 'Diproses')->count(),
            'selesai' => Pengaduan::where('status_progres', 'Selesai')->count(),
        ];

        return Inertia::render('Admin/Pengaduan/Index', [
            'pengaduans' => $pengaduans,
            'stats' => $stats,
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
        return Inertia::render('Admin/Pengaduan/Create', [
            'wargas' => $wargas
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warga_id' => 'required|exists:wargas,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'kategori' => 'required|string|in:Keamanan,Fasilitas,Kebersihan,Lainnya',
            'is_anonim' => 'boolean',
            'status_progres' => 'required|string|in:Diajukan,Diproses,Selesai',
        ]);

        $validated['is_anonim'] = $request->boolean('is_anonim');

        Pengaduan::create($validated);

        return redirect()->route('admin.pengaduan.index')->with('success', 'Pengaduan berhasil ditambahkan.');
    }

    public function show($id)
    {
        $pengaduan = Pengaduan::with(['warga.keluarga.rumahBlok', 'logs.user'])->findOrFail($id);
        return Inertia::render('Admin/Pengaduan/Show', [
            'pengaduan' => $pengaduan
        ]);
    }

    /**
     * Tambah komentar / catatan oleh admin (satu arah)
     */
    public function addComment(Request $request, $id)
    {
        $pengaduan = Pengaduan::with('warga.user')->findOrFail($id);

        $validated = $request->validate([
            'komentar' => 'required|string|max:2000'
        ]);

        PengaduanLog::create([
            'pengaduan_id' => $pengaduan->id,
            'user_id' => auth()->id(),
            'komentar' => $validated['komentar']
        ]);

        // Trigger Notifikasi Realtime untuk Warga
        if ($pengaduan->warga && $pengaduan->warga->user_id) {
            \App\Models\Notifikasi::create([
                'user_id' => $pengaduan->warga->user_id,
                'target_role' => 'warga',
                'type' => 'tanggapan_pengaduan',
                'title' => '💬 Tanggapan Baru dari Pengurus RT!',
                'message' => 'Pengurus RT menanggapi pengaduan Anda: "' . $pengaduan->judul . '"',
                'url' => route('warga.pengaduan.show', $pengaduan->id),
                'is_read' => false,
                'meta_data' => [
                    'pengaduan_id' => $pengaduan->id,
                    'status' => $pengaduan->status_progres,
                ]
            ]);
        }

        // Record Audit Trail Log Aktivitas Realtime
        \App\Services\AuditLogService::log(
            'COMMENT',
            'Pengaduan',
            (auth()->user() ? auth()->user()->name : 'Admin') . ' memberikan tanggapan resmi pada pengaduan: "' . $pengaduan->judul . '"',
            null,
            ['komentar' => $validated['komentar']],
            auth()->id()
        );

        return redirect()->route('admin.pengaduan.show', $pengaduan->id)->with('success', 'Tanggapan berhasil dikirim.');
    }

    public function edit($id)
    {
        $pengaduan = Pengaduan::findOrFail($id);
        $wargas = Warga::with('keluarga:id,no_kk')->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'keluarga_id']);
        
        return Inertia::render('Admin/Pengaduan/Edit', [
            'pengaduan' => $pengaduan,
            'wargas' => $wargas
        ]);
    }

    public function update(Request $request, $id)
    {
        $pengaduan = Pengaduan::with('warga.user')->findOrFail($id);
        $oldStatus = $pengaduan->status_progres;

        $validated = $request->validate([
            'warga_id' => 'required|exists:wargas,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'kategori' => 'required|string|in:Keamanan,Fasilitas,Kebersihan,Lainnya',
            'is_anonim' => 'boolean',
            'status_progres' => 'required|string|in:Diajukan,Diproses,Selesai',
            'komentar' => 'nullable|string|max:2000', // komentar admin (opsional)
        ]);

        $validated['is_anonim'] = $request->boolean('is_anonim');

        // Update pengaduan fields (exclude komentar)
        $updateData = collect($validated)->except(['komentar'])->toArray();
        $pengaduan->update($updateData);

        // Record Audit Trail Log Aktivitas Realtime
        \App\Services\AuditLogService::log(
            'UPDATE',
            'Pengaduan',
            (auth()->user() ? auth()->user()->name : 'Admin') . ' memperbarui status pengaduan "' . $pengaduan->judul . '" dari [' . $oldStatus . '] menjadi [' . $validated['status_progres'] . ']',
            ['status_progres' => $oldStatus],
            $validated,
            auth()->id()
        );

        // Jika admin mengirim komentar, simpan ke pengaduan_logs (PengaduanLog) & kirim notifikasi
        if (!empty($validated['komentar'])) {
            PengaduanLog::create([
                'pengaduan_id' => $pengaduan->id,
                'user_id' => auth()->id(),
                'komentar' => $validated['komentar']
            ]);

            if ($pengaduan->warga && $pengaduan->warga->user_id) {
                \App\Models\Notifikasi::create([
                    'user_id' => $pengaduan->warga->user_id,
                    'target_role' => 'warga',
                    'type' => 'tanggapan_pengaduan',
                    'title' => '💬 Tanggapan Baru dari Pengurus RT!',
                    'message' => 'Pengurus RT menanggapi pengaduan Anda: "' . $pengaduan->judul . '"',
                    'url' => route('warga.pengaduan.show', $pengaduan->id),
                    'is_read' => false,
                    'meta_data' => [
                        'pengaduan_id' => $pengaduan->id,
                        'status' => $pengaduan->status_progres,
                    ]
                ]);
            }
        }

        return redirect()->route('admin.pengaduan.index')->with('success', 'Pengaduan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $pengaduan = Pengaduan::findOrFail($id);
        $pengaduan->delete();

        return redirect()->route('admin.pengaduan.index')->with('success', 'Pengaduan berhasil dihapus.');
    }
}
