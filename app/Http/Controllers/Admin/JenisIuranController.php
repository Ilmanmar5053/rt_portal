<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JenisIuran;
use Illuminate\Http\Request;

class JenisIuranController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_iuran' => 'required|string|max:100|unique:jenis_iurans,nama_iuran',
            'nominal_default' => 'required|numeric|min:0',
            'kategori' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);

        $urutan = $validated['urutan'] ?? (JenisIuran::max('urutan') + 1);

        JenisIuran::create([
            'nama_iuran' => $validated['nama_iuran'],
            'nominal_default' => $validated['nominal_default'],
            'kategori' => $validated['kategori'] ?? 'Umum',
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
            'urutan' => (int) $urutan,
        ]);

        return redirect()->back()->with('success', 'Jenis iuran baru berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $jenisIuran = JenisIuran::findOrFail($id);

        $validated = $request->validate([
            'nama_iuran' => 'required|string|max:100|unique:jenis_iurans,nama_iuran,' . $id,
            'nominal_default' => 'required|numeric|min:0',
            'kategori' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);

        $jenisIuran->update([
            'nama_iuran' => $validated['nama_iuran'],
            'nominal_default' => $validated['nominal_default'],
            'kategori' => $validated['kategori'] ?? $jenisIuran->kategori,
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : $jenisIuran->is_active,
            'urutan' => (int) ($validated['urutan'] ?? $jenisIuran->urutan),
        ]);

        return redirect()->back()->with('success', 'Jenis iuran berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $jenisIuran = JenisIuran::findOrFail($id);
        $jenisIuran->delete();

        return redirect()->back()->with('success', 'Jenis iuran berhasil dihapus.');
    }
}
