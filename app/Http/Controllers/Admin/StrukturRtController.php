<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StrukturRt;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class StrukturRtController extends Controller
{
    public function index(Request $request)
    {
        $activeRt = $request->query('rt', '001');

        // Get all struktur with related warga and keluarga (for address)
        $strukturRts = StrukturRt::with(['warga.keluarga'])->orderBy('rt_nomor')->get();
        
        // Get wargas for dropdown
        $wargas = Warga::select('id', 'nama_lengkap', 'nik')->orderBy('nama_lengkap')->get();

        // Get paginated warga for the selected RT
        $wargaList = Warga::with(['keluarga.rumahBlok'])
            ->whereHas('keluarga', function($q) use ($activeRt) {
                $q->where('rt', $activeRt);
            })
            ->orderBy('nama_lengkap')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/StrukturRt/Index', [
            'strukturRts' => $strukturRts,
            'wargas' => $wargas,
            'wargaList' => $wargaList,
            'activeRt' => $activeRt,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rt_nomor' => 'required|string|max:10',
            'warga_id' => 'required|exists:wargas,id',
            'jabatan' => 'required|string|max:50',
            'periode_mulai' => 'nullable|date',
            'periode_selesai' => 'nullable|date',
            'foto_profil' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('foto_profil')) {
            $path = $request->file('foto_profil')->store('struktur_rts', 'public');
            $validated['foto_profil'] = $path;
        }

        StrukturRt::create($validated);

        return redirect()->route('admin.struktur-rt.index')->with('message', 'Data pengurus berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $strukturRt = StrukturRt::findOrFail($id);

        $validated = $request->validate([
            'rt_nomor' => 'required|string|max:10',
            'warga_id' => 'required|exists:wargas,id',
            'jabatan' => 'required|string|max:50',
            'periode_mulai' => 'nullable|date',
            'periode_selesai' => 'nullable|date',
            'foto_profil' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('foto_profil')) {
            // Delete old photo
            if ($strukturRt->foto_profil) {
                Storage::disk('public')->delete($strukturRt->foto_profil);
            }
            
            $path = $request->file('foto_profil')->store('struktur_rts', 'public');
            $validated['foto_profil'] = $path;
        }

        $strukturRt->update($validated);

        return redirect()->route('admin.struktur-rt.index')->with('message', 'Data pengurus berhasil diperbarui');
    }

    public function destroy($id)
    {
        $strukturRt = StrukturRt::findOrFail($id);
        
        if ($strukturRt->foto_profil) {
            Storage::disk('public')->delete($strukturRt->foto_profil);
        }
        
        $strukturRt->delete();

        return redirect()->route('admin.struktur-rt.index')->with('message', 'Data pengurus berhasil dihapus');
    }
}
