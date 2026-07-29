<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Warga;
use App\Models\Keluarga;
use App\Models\RumahBlok;
use App\Models\IuranKas;
use App\Models\Pengaduan;
use App\Models\SuratPengantar;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Pak RT (Admin)',
            'email' => 'admin@rt.com',
            'role' => 'rt',
        ]);

        $wargaUser = User::factory()->create([
            'name' => 'Warga Tester',
            'email' => 'warga@rt.com',
            'role' => 'warga_kk',
        ]);

        // Generate Rumah Bloks
        $rumahBloks = RumahBlok::factory(10)->create();

        // Generate Keluargas & Wargas
        foreach ($rumahBloks as $index => $blok) {
            $keluarga = Keluarga::factory()->create([
                'rumah_blok_id' => $blok->id,
            ]);

            // Kepala Keluarga
            $kepalaKeluarga = Warga::factory()->create([
                'keluarga_id' => $keluarga->id,
                'status_hubungan_keluarga' => 'Kepala Keluarga',
                'jenis_kelamin' => 'Laki-laki',
                'user_id' => $index === 0 ? $wargaUser->id : null,
                'nama_lengkap' => $index === 0 ? $wargaUser->name : fake('id_ID')->name('male'),
            ]);

            // Update Keluarga with kepala_keluarga_id
            $keluarga->update(['kepala_keluarga_id' => $kepalaKeluarga->id]);

            // Istri
            if (rand(1, 100) > 20) {
                Warga::factory()->create([
                    'keluarga_id' => $keluarga->id,
                    'status_hubungan_keluarga' => 'Istri',
                    'jenis_kelamin' => 'Perempuan',
                ]);
            }

            // Anak
            $jmlAnak = rand(0, 3);
            for ($i = 0; $i < $jmlAnak; $i++) {
                Warga::factory()->create([
                    'keluarga_id' => $keluarga->id,
                    'status_hubungan_keluarga' => 'Anak',
                ]);
            }

            // Generate transactions for the Kepala Keluarga (since Iuran/Surat is usually per Warga, we use the Head)
            IuranKas::factory()->create([
                'warga_id' => $kepalaKeluarga->id,
                'periode_bulan' => rand(1, 12),
                'periode_tahun' => 2026,
            ]);

            if (rand(1, 100) > 50) {
                Pengaduan::factory()->create(['warga_id' => $kepalaKeluarga->id]);
            }
            if (rand(1, 100) > 40) {
                SuratPengantar::factory()->create(['warga_id' => $kepalaKeluarga->id]);
            }
        }
    }
}
