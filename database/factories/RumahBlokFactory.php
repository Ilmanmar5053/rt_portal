<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RumahBlok>
 */
class RumahBlokFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'blok' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E']),
            'nomor_rumah' => (string) $this->faker->unique()->numberBetween(1, 9999),
            'status_hunian' => $this->faker->randomElement(['Diisi', 'Diisi', 'Diisi', 'Kosong']),
        ];
    }
}
