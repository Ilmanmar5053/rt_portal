<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\ProgramKegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramKegiatanWargaController extends Controller
{
    public function index(Request $request)
    {
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

        $programs = $query->orderBy('tanggal_mulai', 'desc')->paginate(9)->withQueryString();

        return Inertia::render('Warga/ProgramKegiatan/Index', [
            'programs' => $programs,
            'filters' => [
                'search' => $request->search ?? '',
                'kategori' => $request->kategori ?? 'Semua',
                'status' => $request->status ?? 'Semua',
            ],
            'kategoriList' => ProgramKegiatan::getKategoriList(),
            'statusList' => ProgramKegiatan::getStatusList(),
        ]);
    }

    public function show($id)
    {
        $program = ProgramKegiatan::with('creator')->findOrFail($id);

        return Inertia::render('Warga/ProgramKegiatan/Show', [
            'program' => $program,
        ]);
    }
}
