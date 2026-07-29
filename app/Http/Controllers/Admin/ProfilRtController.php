<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProfilRt;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProfilRtController extends Controller
{
    public function edit()
    {
        $profil = ProfilRt::first();

        // Default values if empty
        if (!$profil) {
            $profil = new ProfilRt([
                'nama_rt' => 'RT 01 / RW 01',
                'alamat' => '',
                'nomor_wa' => '',
                'logo_path' => null,
                'pengurus' => []
            ]);
        }

        return Inertia::render('Admin/Profil/Edit', [
            'profil' => $profil
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nama_rt' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'nomor_wa' => 'nullable|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'pengurus' => 'nullable|array',
            'pengurus.*.jabatan' => 'required|string',
            'pengurus.*.nama' => 'required|string',
        ]);

        $profil = ProfilRt::first();
        if (!$profil) {
            $profil = new ProfilRt();
        }

        $profil->nama_rt = $validated['nama_rt'];
        $profil->alamat = $validated['alamat'];
        $profil->nomor_wa = $validated['nomor_wa'];
        $profil->pengurus = $validated['pengurus'] ?? [];

        if ($request->hasFile('logo')) {
            if ($profil->logo_path) {
                Storage::disk('public')->delete($profil->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $profil->logo_path = $path;
        }

        $profil->save();

        return redirect()->back()->with('message', 'Profil RT berhasil diperbarui.');
    }
}
