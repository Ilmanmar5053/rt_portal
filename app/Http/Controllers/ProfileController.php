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

    /**
     * Upload or Update profile picture (Avatar / Foto Profil)
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $path]);

            // Sync with Warga model if linked
            if ($user->warga) {
                $user->warga->update(['foto_profil' => $path]);
            } else {
                $warga = Warga::where('nik', $user->nik ?? '')
                    ->orWhere('nama_lengkap', 'like', "%{$user->name}%")
                    ->first();
                if ($warga) {
                    $warga->update(['foto_profil' => $path]);
                }
            }
        }

        return redirect()->back()->with('message', 'Foto profil berhasil diperbarui.');
    }

    /**
     * Hapus foto profil (Reset ke inisial default)
     */
    public function deleteAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        if ($user->warga) {
            $user->warga->update(['foto_profil' => null]);
        }

        return redirect()->back()->with('message', 'Foto profil berhasil dihapus.');
    }
}
