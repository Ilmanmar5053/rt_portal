<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Keluarga extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function kepalaKeluarga(): BelongsTo
    {
        return $this->belongsTo(Warga::class, 'kepala_keluarga_id');
    }

    public function wargas(): HasMany
    {
        return $this->hasMany(Warga::class);
    }

    public function rumahBlok(): BelongsTo
    {
        return $this->belongsTo(RumahBlok::class);
    }
}
