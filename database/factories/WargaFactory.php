<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Warga>
 */
class WargaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = $this->faker->randomElement(['male', 'female']);
        $jenisKelamin = $gender === 'male' ? 'Laki-laki' : 'Perempuan';

        return [
            // 'keluarga_id' -> will be assigned in Seeder
            'nik' => $this->faker->unique()->numerify('################'),
            'nama_lengkap' => $this->faker->name($gender),
            'tempat_lahir' => $this->faker->city(),
            'tanggal_lahir' => $this->faker->date('Y-m-d', '-20 years'),
            'jenis_kelamin' => $jenisKelamin,
            'agama' => $this->faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
            'pendidikan' => $this->faker->randomElement(['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3']),
            'pekerjaan' => $this->faker->jobTitle(),
            'status_perkawinan' => $this->faker->randomElement(['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']),
            'status_hubungan_keluarga' => 'Lainnya', // Will be overridden in Seeder
            'kewarganegaraan' => 'WNI',
            'nama_ayah' => $this->faker->name('male'),
            'nama_ibu' => $this->faker->name('female'),
            'no_hp' => $this->faker->phoneNumber(),
            'status_hidup' => 'Hidup',
        ];
    }
}
