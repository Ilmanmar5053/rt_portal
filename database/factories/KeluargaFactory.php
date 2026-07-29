<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Keluarga>
 */
class KeluargaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'no_kk' => $this->faker->unique()->numerify('################'),
            'alamat_lengkap' => $this->faker->streetAddress(),
            'rt' => $this->faker->numerify('00#'),
            'rw' => $this->faker->numerify('00#'),
            'kelurahan' => $this->faker->citySuffix(),
            'kecamatan' => $this->faker->citySuffix(),
            'kabupaten_kota' => $this->faker->city(),
            'provinsi' => $this->faker->state(),
            'kode_pos' => $this->faker->postcode(),
            // rumah_blok_id and kepala_keluarga_id will be assigned in DatabaseSeeder
        ];
    }
}
