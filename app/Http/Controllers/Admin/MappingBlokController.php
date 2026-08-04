<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProfilRt;
use App\Models\RumahBlok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MappingBlokController extends Controller
{
    /**
     * Tampilkan Halaman Pemetaan Blok Rumah (Citra Satelit HD + Pin Interaktif).
     */
    public function index(Request $request)
    {
        RumahBlok::syncStatusHunianAll();
        $profil = ProfilRt::first();

        // Load semua data rumah beserta informasi Kartu Keluarga yang menempatinya
        $rumahBloks = RumahBlok::with([
            'keluargas.kepalaKeluarga',
            'keluargas.wargas'
        ])
        ->orderBy('blok')
        ->orderBy('nomor_rumah')
        ->get();

        return Inertia::render('Admin/MappingBlok/Index', [
            'profil' => $profil,
            'rumahBloks' => $rumahBloks,
        ]);
    }

    /**
     * Upload / Perbarui Gambar Citra Satelit HD untuk Pemetaan Blok Rumah.
     */
    public function uploadMap(Request $request)
    {
        $request->validate([
            'map_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:15360', // Maks 15MB resolusi HD
        ], [
            'map_image.required' => 'Silakan pilih gambar citra satelit pemetaan rumah terlebih dahulu.',
            'map_image.image' => 'File harus berupa gambar.',
            'map_image.max' => 'Ukuran gambar maksimal adalah 15 MB agar resolusi tetap HD.',
        ]);

        $profil = ProfilRt::first();
        if (!$profil) {
            $profil = new ProfilRt();
        }

        if ($request->hasFile('map_image')) {
            if ($profil->map_image_path) {
                Storage::disk('public')->delete($profil->map_image_path);
            }

            $path = $request->file('map_image')->store('maps', 'public');
            $profil->map_image_path = $path;
            $profil->save();
        }

        return redirect()->back()->with('success', 'Citra satelit HD pemetaan blok rumah berhasil disimpan!');
    }

    /**
     * Simpan / Perbarui Posisi Tanda Pin Rumah dan Label Informatif.
     */
    public function updatePin(Request $request, RumahBlok $rumahBlok)
    {
        $validated = $request->validate([
            'coord_x' => 'required|string',
            'coord_y' => 'required|string',
            'pin_label' => 'nullable|string|max:255',
            'pin_color' => 'nullable|string|max:50',
        ], [
            'coord_x.required' => 'Koordinat X tidak boleh kosong.',
            'coord_y.required' => 'Koordinat Y tidak boleh kosong.',
        ]);

        $rumahBlok->update($validated);

        return redirect()->back()->with('success', "Tanda pin untuk Blok {$rumahBlok->blok} No. {$rumahBlok->nomor_rumah} berhasil dipasang di peta!");
    }

    /**
     * Hapus Tanda Pin dari Peta (Kembalikan koordinat menjadi null).
     */
    public function deletePin(RumahBlok $rumahBlok)
    {
        $rumahBlok->update([
            'coord_x' => null,
            'coord_y' => null,
            'pin_label' => null,
            'pin_color' => null,
        ]);

        return redirect()->back()->with('success', "Tanda pin untuk Blok {$rumahBlok->blok} No. {$rumahBlok->nomor_rumah} berhasil dihapus dari peta.");
    }
}
