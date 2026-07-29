<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Warga;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IuranKas>
 */
class IuranKasFactory extends Factory
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
            'jenis_iuran' => $this->faker->randomElement(['Wajib', 'Sukarela', 'Keamanan', 'Sampah']),
            'periode_bulan' => $this->faker->numberBetween(1, 12),
            'periode_tahun' => 2026,
            'jumlah_bayar' => $this->faker->randomElement([50000, 100000, 150000]),
            'status_pembayaran' => $this->faker->randomElement(['Pending', 'Approved', 'Approved', 'Approved', 'Rejected']),
            'bukti_transfer' => null,
        ];
    }
}
