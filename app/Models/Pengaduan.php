<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengaduan extends Model
{
    use HasFactory;

    protected $fillable = [
        'warga_id', 'judul', 'deskripsi', 'kategori',
        'status_progres', 'foto_bukti', 'is_anonim'
    ];

    protected $casts = [
        'is_anonim' => 'boolean',
    ];

    public function getFotoBuktiAttribute($value)
    {
        if (is_null($value)) {
            return [];
        }

        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return [$value];
    }

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class);
    }

    /**
     * Riwayat komentar / log pengaduan (oleh admin)
     */
    public function logs()
    {
        return $this->hasMany(PengaduanLog::class)->orderBy('created_at', 'desc');
    }
}
