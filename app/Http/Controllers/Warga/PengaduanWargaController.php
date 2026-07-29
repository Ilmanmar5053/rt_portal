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

        return Inertia::render('Warga/Pengaduan/Index', [
            'pengaduans' => $pengaduans,
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

        Pengaduan::create($validated);

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
