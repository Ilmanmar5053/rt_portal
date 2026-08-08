<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Warga;
use App\Models\Keluarga;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $wargaProfile = null;
        $keluargaProfile = null;
        $anggotaKeluarga = [];

        // 1. Ambil relasi Warga pengguna
        $warga = $user->warga;

        // 2. Jika relasi belum terhubung, cari berdasarkan NIK, email, atau nama lengkap
        if (!$warga) {
            $warga = Warga::where('nik', $user->nik ?? '')
                ->orWhere('nama_lengkap', 'like', "%{$user->name}%")
                ->first();
        }

        if ($warga) {
            $wargaProfile = $warga;
            $keluarga = $warga->keluarga;
            if (!$keluarga && $warga->keluarga_id) {
                $keluarga = Keluarga::find($warga->keluarga_id);
            }

            if ($keluarga) {
                $keluargaProfile = $keluarga->load(['kepalaKeluarga', 'rumahBlok']);
                $anggotaKeluarga = Warga::where('keluarga_id', $keluarga->id)->get();
            }
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'wargaProfile' => $wargaProfile,
            'keluargaProfile' => $keluargaProfile,
            'anggotaKeluarga' => $anggotaKeluarga,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
