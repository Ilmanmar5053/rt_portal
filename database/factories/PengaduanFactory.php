<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Warga;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pengaduan>
 */
class PengaduanFactory extends Factory
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
            'judul' => $this->faker->sentence(4),
            'deskripsi' => $this->faker->paragraph(),
            'kategori' => $this->faker->randomElement(['Keamanan', 'Fasilitas', 'Kebersihan', 'Lainnya']),
            'status_progres' => $this->faker->randomElement(['Diajukan', 'Diproses', 'Selesai']),
            'is_anonim' => $this->faker->boolean(20),
        ];
    }
}
