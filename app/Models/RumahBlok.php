<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class RumahBlok extends Model
{
    use HasFactory;

    protected $fillable = [
        'blok',
        'nomor_rumah',
        'status_hunian',
        'coord_x',
        'coord_y',
        'pin_label',
        'pin_color',
    ];

    public function keluargas(): HasMany
    {
        return $this->hasMany(Keluarga::class);
    }

    public function wargas(): HasManyThrough
    {
        return $this->hasManyThrough(Warga::class, Keluarga::class);
    }

    /**
     * Otomatis melakukan sinkronisasi status hunian (Diisi vs Kosong) 
     * berdasarkan apakah ada Kartu Keluarga terhubung.
     */
    public static function syncStatusHunianAll(): void
    {
        foreach (static::withCount('keluargas')->get() as $rumah) {
            $expected = $rumah->keluargas_count > 0 ? 'Diisi' : 'Kosong';
            if ($rumah->status_hunian !== $expected) {
                $rumah->update(['status_hunian' => $expected]);
            }
        }
    }
}
