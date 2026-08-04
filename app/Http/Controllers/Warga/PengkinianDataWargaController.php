<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Keluarga;
use App\Models\RumahBlok;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengkinianDataWargaController extends Controller
{
    /**
     * Tampilkan halaman pengkinian data dan sensus mandiri warga.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        $keluarga = null;
        if ($warga && $warga->keluarga_id) {
            $keluarga = Keluarga::with([
                'rumahBlok',
                'wargas' => function ($query) {
                    $query->orderByRaw("FIELD(status_hubungan_keluarga, 'Kepala Keluarga', 'Istri', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Lainnya'), tanggal_lahir ASC");
                },
                'kepalaKeluarga'
            ])->find($warga->keluarga_id);
        }

        return Inertia::render('Warga/PengkinianData/Index', [
            'warga' => $warga,
            'keluarga' => $keluarga,
        ]);
    }

    /**
     * Simpan atau perbarui data Kartu Keluarga dan Anggota Keluarga secara mandiri.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $warga = Warga::where('user_id', $user->id)->first();

        $validated = $request->validate([
            'no_kk' => 'required|string|digits:16',
            'blok' => 'required|string|max:10',
            'nomor_rumah' => 'required|string|max:20',
            'alamat_lengkap' => 'required|string|max:255',
            'rt' => 'required|string|max:5',
            'rw' => 'required|string|max:5',
            'provinsi' => 'required|string|max:100',
            'kabupaten_kota' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
            'kelurahan' => 'required|string|max:100',
            'kode_pos' => 'nullable|string|max:10',
            'file_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'anggota' => 'required|array|min:1',
            'anggota.*.nik' => 'required|string|digits:16',
            'anggota.*.nama_lengkap' => 'required|string|max:255',
            'anggota.*.tempat_lahir' => 'required|string|max:100',
            'anggota.*.tanggal_lahir' => 'required|date',
            'anggota.*.jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
            'anggota.*.agama' => 'required|string|max:50',
            'anggota.*.pendidikan' => 'required|string|max:100',
            'anggota.*.pekerjaan' => 'required|string|max:100',
            'anggota.*.status_perkawinan' => 'required|string|max:50',
            'anggota.*.status_hubungan_keluarga' => 'required|string|max:50',
            'anggota.*.kewarganegaraan' => 'required|string|max:10',
            'anggota.*.nama_ayah' => 'nullable|string|max:255',
            'anggota.*.nama_ibu' => 'nullable|string|max:255',
            'anggota.*.no_hp' => 'nullable|string|max:20',
            'anggota.*.status_hidup' => 'nullable|string|in:Hidup,Meninggal,Pindah',
        ], [
            'no_kk.required' => 'Nomor Kartu Keluarga wajib diisi (16 digit).',
            'no_kk.digits' => 'Nomor Kartu Keluarga harus tepat 16 digit angka.',
            'file_kk.max' => 'Ukuran file Kartu Keluarga maksimal 2MB.',
            'file_kk.mimes' => 'Format file KK harus berupa PDF, JPG, JPEG, atau PNG.',
            'anggota.min' => 'Minimal harus ada 1 anggota keluarga yang didaftarkan.',
            'anggota.*.nik.required' => 'NIK setiap anggota keluarga wajib diisi.',
            'anggota.*.nik.digits' => 'NIK anggota keluarga harus tepat 16 digit angka.',
        ]);

        DB::beginTransaction();
        try {
            // 1. Cari atau buat rumah blok
            $rumahBlok = RumahBlok::firstOrCreate(
                ['blok' => $validated['blok'], 'nomor_rumah' => $validated['nomor_rumah']],
                ['status_hunian' => 'Diisi']
            );

            // 2. Tentukan atau buat entitas Keluarga
            $keluarga = null;
            if ($warga && $warga->keluarga_id) {
                $keluarga = Keluarga::find($warga->keluarga_id);
            }

            if (!$keluarga) {
                $keluarga = Keluarga::where('no_kk', $validated['no_kk'])->first();
            }

            $keluargaData = [
                'no_kk' => $validated['no_kk'],
                'rumah_blok_id' => $rumahBlok->id,
                'alamat_lengkap' => $validated['alamat_lengkap'],
                'rt' => $validated['rt'],
                'rw' => $validated['rw'],
                'provinsi' => $validated['provinsi'],
                'kabupaten_kota' => $validated['kabupaten_kota'],
                'kecamatan' => $validated['kecamatan'],
                'kelurahan' => $validated['kelurahan'],
                'kode_pos' => $validated['kode_pos'] ?? null,
            ];

            // 3. Simpan file KK dengan enkripsi hash filename oleh Laravel filesystem storage
            if ($request->hasFile('file_kk')) {
                // Simpan dengan hash aman
                $path = $request->file('file_kk')->store('dokumen/kk', 'public');
                $keluargaData['file_kk'] = $path;
            }

            if ($keluarga) {
                $keluarga->update($keluargaData);
            } else {
                $keluarga = Keluarga::create($keluargaData);
            }

            // 4. Proses simpan/update daftar Anggota Keluarga
            $kepalaKeluargaId = null;
            $kepalaKeluargaNama = null;
            $updatedWargaIds = [];
            $kepalaKeluargaCount = 0;
            $seenNikInBatch = [];
            $seenNameInBatch = [];

            foreach ($validated['anggota'] as $item) {
                // Cegah duplikat dalam satu form submission yang sama
                $nikKey = trim($item['nik']);
                $nameKey = strtolower(trim($item['nama_lengkap']));

                if (in_array($nikKey, $seenNikInBatch) || in_array($nameKey, $seenNameInBatch)) {
                    continue;
                }
                $seenNikInBatch[] = $nikKey;
                $seenNameInBatch[] = $nameKey;

                // Pastikan hanya boleh ada maksimal 1 Kepala Keluarga
                if (($item['status_hubungan_keluarga'] ?? '') === 'Kepala Keluarga') {
                    $kepalaKeluargaCount++;
                    if ($kepalaKeluargaCount > 1) {
                        $item['status_hubungan_keluarga'] = 'Famili Lain';
                    }
                }

                $wargaMember = null;

                // 1. Cari berdasarkan ID jika dikirim
                if (!empty($item['id'])) {
                    $wargaMember = Warga::find($item['id']);
                }

                // 2. Jika tidak ditemukan berdasar ID, cari di dalam keluarga yang sama berdasarkan NIK
                if (!$wargaMember && !empty($item['nik'])) {
                    $wargaMember = Warga::where('nik', trim($item['nik']))->first();
                }

                // 3. Jika tidak ditemukan juga, cari di dalam KELUARGA YANG SAMA berdasarkan NAMA LENGKAP (case-insensitive) agar tidak pernah terjadi double nama
                if (!$wargaMember && $keluarga) {
                    $wargaMember = Warga::where('keluarga_id', $keluarga->id)
                        ->whereRaw('LOWER(nama_lengkap) = ?', [$nameKey])
                        ->first();
                }

                // 4. Jika masih tidak ditemukan tapi dia berstatus Kepala Keluarga dan sudah ada Kepala Keluarga di KK tersebut, update Kepala Keluarga yang ada
                if (!$wargaMember && $keluarga && ($item['status_hubungan_keluarga'] ?? '') === 'Kepala Keluarga') {
                    $wargaMember = Warga::where('keluarga_id', $keluarga->id)
                        ->where('status_hubungan_keluarga', 'Kepala Keluarga')
                        ->first();
                }

                // 5. Jika masih tidak ditemukan juga dan nama sesuai dengan user yang sedang login, gunakan relasi milik user ini
                if (!$wargaMember && $user && $nameKey === strtolower(trim($user->name))) {
                    $wargaMember = Warga::where('user_id', $user->id)->first();
                }

                $dataWarga = [
                    'keluarga_id' => $keluarga->id,
                    'nama_lengkap' => strtoupper(trim($item['nama_lengkap'])),
                    'tempat_lahir' => trim($item['tempat_lahir']),
                    'tanggal_lahir' => $item['tanggal_lahir'],
                    'jenis_kelamin' => $item['jenis_kelamin'],
                    'agama' => $item['agama'] ?? 'Islam',
                    'pendidikan' => $item['pendidikan'] ?? 'SLTA/Sederajat',
                    'pekerjaan' => $item['pekerjaan'] ?? 'Karyawan Swasta',
                    'status_perkawinan' => $item['status_perkawinan'] ?? 'Belum Kawin',
                    'status_hubungan_keluarga' => $item['status_hubungan_keluarga'] ?? 'Anak',
                    'kewarganegaraan' => $item['kewarganegaraan'] ?? 'WNI',
                    'nama_ayah' => !empty($item['nama_ayah']) ? trim($item['nama_ayah']) : '-',
                    'nama_ibu' => !empty($item['nama_ibu']) ? trim($item['nama_ibu']) : '-',
                    'no_hp' => $item['no_hp'] ?? null,
                    'status_hidup' => $item['status_hidup'] ?? 'Hidup',
                ];

                if ($wargaMember) {
                    $wargaMember->update(array_merge($dataWarga, [
                        'nik' => trim($item['nik']),
                    ]));
                } else {
                    $wargaMember = Warga::create(array_merge($dataWarga, [
                        'nik' => trim($item['nik']),
                    ]));
                }

                $updatedWargaIds[] = $wargaMember->id;

                // Cek jika warga ini adalah pengguna yang sedang login (sync akun)
                if ($wargaMember->nik === ($warga->nik ?? '') || strtolower(trim($wargaMember->nama_lengkap)) === strtolower(trim($user->name))) {
                    $wargaMember->update(['user_id' => $user->id]);
                    $warga = $wargaMember;
                }

                // Tentukan kepala keluarga
                if ($item['status_hubungan_keluarga'] === 'Kepala Keluarga') {
                    $kepalaKeluargaId = $wargaMember->id;
                    $kepalaKeluargaNama = $wargaMember->nama_lengkap;
                }
            }

            // Bersihkan jika masih ada duplikat nama atau duplikat Kepala Keluarga dalam KK ini (garansi 100% bebas double)
            if ($keluarga) {
                $kkMembers = Warga::where('keluarga_id', $keluarga->id)->orderBy('id', 'asc')->get();
                $seenMemberNames = [];
                $seenKepala = false;

                foreach ($kkMembers as $m) {
                    $mNameKey = strtolower(trim($m->nama_lengkap));
                    if (in_array($mNameKey, $seenMemberNames)) {
                        // Hapus baris duplikat nama
                        $m->delete();
                        continue;
                    }
                    $seenMemberNames[] = $mNameKey;

                    if ($m->status_hubungan_keluarga === 'Kepala Keluarga') {
                        if ($seenKepala && $kepalaKeluargaId !== $m->id) {
                            $m->update(['status_hubungan_keluarga' => 'Famili Lain']);
                        } else {
                            $seenKepala = true;
                        }
                    }
                }
            }

            // Update relasi Kepala Keluarga pada tabel keluargas
            if ($kepalaKeluargaId) {
                $keluarga->update([
                    'kepala_keluarga_id' => $kepalaKeluargaId,
                    'kepala_keluarga_nama' => null, // clear manual fallback karena sudah terelasi
                ]);
            } elseif ($kepalaKeluargaNama) {
                $keluarga->update([
                    'kepala_keluarga_nama' => $kepalaKeluargaNama,
                ]);
            }

            // Jika user belum memiliki relasi warga sama sekali, jadikan anggota pertama sebagai akunnya
            if (!$warga && count($updatedWargaIds) > 0) {
                $firstWarga = Warga::find($updatedWargaIds[0]);
                if ($firstWarga && !$firstWarga->user_id) {
                    $firstWarga->update(['user_id' => $user->id]);
                }
            }

            DB::commit();

            return redirect()->route('warga.pengkinian-data.index')
                ->with('message', 'Data Kartu Keluarga & Anggota Keluarga berhasil diperbarui! Terima kasih telah melakukan pengkinian data mandiri.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error Pengkinian Data Warga: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Gagal memperbarui data keluarga: ' . $e->getMessage()]);
        }
    }

    /**
     * Hapus satu anggota keluarga yang ada dalam Kartu Keluarga.
     */
    public function destroyAnggota($id)
    {
        $user = auth()->user();
        $wargaLogin = Warga::where('user_id', $user->id)->first();

        if (!$wargaLogin || !$wargaLogin->keluarga_id) {
            return back()->withErrors(['error' => 'Anda tidak memiliki hak akses untuk menghapus data ini.']);
        }

        $wargaTarget = Warga::where('id', $id)
            ->where('keluarga_id', $wargaLogin->keluarga_id)
            ->first();

        if (!$wargaTarget) {
            return back()->withErrors(['error' => 'Anggota keluarga tidak ditemukan.']);
        }

        // Jangan izinkan hapus diri sendiri jika akun ini satu-satunya
        if ($wargaTarget->id === $wargaLogin->id) {
            return back()->withErrors(['error' => 'Anda tidak dapat menghapus data profil utama akun Anda sendiri.']);
        }

        $wargaTarget->delete();

        return back()->with('message', 'Anggota keluarga berhasil dihapus.');
    }
}
