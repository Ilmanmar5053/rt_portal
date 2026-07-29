<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\IuranKas;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IuranWargaController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        if (!$warga) {
            return Inertia::render('Warga/Iuran/Index', [
                'iurans' => ['data' => [], 'links' => [], 'from' => 0, 'to' => 0, 'total' => 0],
                'filters' => ['status' => 'Semua'],
            ]);
        }

        $query = IuranKas::where('warga_id', $warga->id)
            ->orderBy('periode_tahun', 'desc')
            ->orderBy('periode_bulan', 'desc');

        if ($request->has('status') && $request->status != 'Semua') {
            $query->where('status_pembayaran', $request->status);
        }

        $iurans = $query->paginate(10)->withQueryString();

        return Inertia::render('Warga/Iuran/Index', [
            'iurans' => $iurans,
            'filters' => [
                'status' => $request->status ?? 'Semua',
            ],
            'warga' => $warga,
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->firstOrFail();

        $iuran = IuranKas::with('warga.keluarga.rumahBlok')
            ->where('id', $id)
            ->where('warga_id', $warga->id)
            ->firstOrFail();

        return Inertia::render('Warga/Iuran/Show', [
            'iuran' => $iuran,
        ]);
    }
}
