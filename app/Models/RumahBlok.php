<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class RumahBlok extends Model
{
    use HasFactory;

    protected $fillable = ['blok', 'nomor_rumah', 'status_hunian'];

    public function keluargas(): HasMany
    {
        return $this->hasMany(Keluarga::class);
    }

    public function wargas(): HasManyThrough
    {
        return $this->hasManyThrough(Warga::class, Keluarga::class);
    }
}
