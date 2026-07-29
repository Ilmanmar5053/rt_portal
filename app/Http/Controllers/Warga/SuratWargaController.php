<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\SuratPengantar;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuratWargaController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        if (!$warga) {
            return Inertia::render('Warga/Surat/Index', [
                'surats' => ['data' => [], 'links' => [], 'from' => 0, 'to' => 0, 'total' => 0],
                'filters' => ['search' => null],
            ]);
        }

        $query = SuratPengantar::where('warga_id', $warga->id)->latest();

        if ($request->has('search')) {
            $query->where('jenis_surat', 'like', "%{$request->search}%");
        }

        $surats = $query->paginate(10)->withQueryString();

        return Inertia::render('Warga/Surat/Index', [
            'surats' => $surats,
            'filters' => [
                'search' => $request->search,
            ],
            'warga' => $warga,
        ]);
    }

    public function create()
    {
        return Inertia::render('Warga/Surat/Create');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        if (!$warga) {
            return back()->withErrors([
                'warga' => 'Akun Anda belum terdaftar sebagai data warga. Silakan hubungi pengurus RT terlebih dahulu.'
            ]);
        }

        $validated = $request->validate([
            'jenis_surat' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'keterangan_tambahan' => 'nullable|string',
        ]);

        $validated['warga_id'] = $warga->id;
        $validated['status'] = 'Pending RT';

        SuratPengantar::create($validated);

        return redirect()->route('warga.surat.index')->with('success', 'Pengajuan surat berhasil dikirim.');
    }

    public function show($id)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->firstOrFail();

        $surat = SuratPengantar::where('id', $id)
            ->where('warga_id', $warga->id)
            ->firstOrFail();

        return Inertia::render('Warga/Surat/Show', [
            'surat' => $surat,
        ]);
    }
}
