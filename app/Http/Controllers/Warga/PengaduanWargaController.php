<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengaduanWargaController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        if (!$warga) {
            return Inertia::render('Warga/Pengaduan/Index', [
                'pengaduans' => ['data' => [], 'links' => [], 'from' => 0, 'to' => 0, 'total' => 0],
                'stats' => ['total' => 0, 'baru' => 0, 'diproses' => 0, 'selesai' => 0],
                'filters' => ['search' => null, 'status' => 'Semua'],
            ]);
        }

        $query = Pengaduan::where('warga_id', $warga->id)->latest();

        if ($request->has('search')) {
            $query->where('judul', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && $request->status != 'Semua') {
            $query->where('status_progres', $request->status);
        }

        $pengaduans = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Pengaduan::where('warga_id', $warga->id)->count(),
            'baru' => Pengaduan::where('warga_id', $warga->id)->where('status_progres', 'Diajukan')->count(),
            'diproses' => Pengaduan::where('warga_id', $warga->id)->where('status_progres', 'Diproses')->count(),
            'selesai' => Pengaduan::where('warga_id', $warga->id)->where('status_progres', 'Selesai')->count(),
        ];

        return Inertia::render('Warga/Pengaduan/Index', [
            'pengaduans' => $pengaduans,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'Semua',
            ],
            'warga' => $warga,
        ]);
    }

    public function create()
    {
        return Inertia::render('Warga/Pengaduan/Create');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        if (!$warga) {
            return back()->withErrors([
                'warga' => 'Akun Anda belum terdaftar sebagai data warga. Silakan hubungi pengurus RT untuk mendaftarkan data kependudukan Anda terlebih dahulu.'
            ]);
        }

        // Validasi kontrol: pastikan warga tidak memiliki pengaduan aktif (Diajukan atau Diproses)
        $active = Pengaduan::where('warga_id', $warga->id)
            ->whereIn('status_progres', ['Diajukan', 'Diproses'])
            ->exists();

        if ($active) {
            return back()->withErrors([
                'warning' => 'Anda sudah memiliki pengaduan yang sedang ditangani (Diajukan / Diproses). Mohon tunggu hingga status menjadi "Selesai" sebelum membuat pengaduan baru.'
            ])->withInput();
        }

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'kategori' => 'required|string|in:Keamanan,Fasilitas,Kebersihan,Lainnya',
            'foto_bukti' => 'required|array|min:1|max:3',
            'foto_bukti.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_anonim' => 'boolean',
        ]);

        if ($request->hasFile('foto_bukti')) {
            $validated['foto_bukti'] = collect($request->file('foto_bukti'))
                ->map(fn ($file) => $file->store('pengaduan', 'public'))
                ->filter()
                ->values()
                ->toJson();
        }

        $validated['warga_id'] = $warga->id;
        $validated['is_anonim'] = $request->boolean('is_anonim');
        $validated['status_progres'] = 'Diajukan';

        $pengaduan = Pengaduan::create($validated);

        // Trigger Notifikasi Realtime untuk Admin Portal
        \App\Models\Notifikasi::create([
            'user_id' => null,
            'target_role' => 'admin',
            'type' => 'pengaduan_baru',
            'title' => '📢 Pengaduan Baru dari Warga!',
            'message' => ($request->boolean('is_anonim') ? 'Warga Anonim' : $warga->nama_lengkap) . ' mengajukan: "' . $validated['judul'] . '"',
            'url' => route('admin.pengaduan.show', $pengaduan->id),
            'is_read' => false,
            'meta_data' => [
                'pengaduan_id' => $pengaduan->id,
                'kategori' => $validated['kategori'],
                'nama_warga' => $request->boolean('is_anonim') ? 'Anonim' : $warga->nama_lengkap,
            ]
        ]);

        // Record Audit Trail Log Aktivitas Realtime
        \App\Services\AuditLogService::log(
            'CREATE',
            'Pengaduan',
            ($request->boolean('is_anonim') ? 'Warga (Anonim)' : $warga->nama_lengkap) . ' mengajukan pengaduan baru: "' . $validated['judul'] . '"',
            null,
            $validated,
            auth()->id()
        );

        return redirect()->route('warga.pengaduan.index')->with('success', 'Pengaduan berhasil dikirim.');
    }

    public function show($id)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->firstOrFail();

        $pengaduan = Pengaduan::with('logs.user')
            ->where('id', $id)
            ->where('warga_id', $warga->id)
            ->firstOrFail();

        return Inertia::render('Warga/Pengaduan/Show', [
            'pengaduan' => $pengaduan,
        ]);
    }
}
