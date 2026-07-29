<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Warga;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SuratPengantar>
 */
class SuratPengantarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'warga_id' => Warga::factory(),
            'jenis_surat' => $this->faker->randomElement(['Domisili', 'Keterangan Tidak Mampu', 'Keterangan Usaha', 'Lainnya']),
            'keperluan' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['Draft', 'Pending RT', 'Pending RW', 'Disetujui', 'Ditolak']),
            'nomor_surat' => null,
            'qr_code_uuid' => Str::uuid()->toString(),
        ];
    }
}
