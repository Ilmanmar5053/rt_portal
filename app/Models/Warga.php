<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warga extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'keluarga_id', 'nik', 'nama_lengkap', 
        'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 
        'pendidikan', 'pekerjaan', 'status_perkawinan', 
        'status_hubungan_keluarga', 'kewarganegaraan', 'nama_ayah', 'nama_ibu',
        'no_hp', 'status_hidup'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }

    public function iuranKas(): HasMany
    {
        return $this->hasMany(IuranKas::class);
    }

    public function pengaduans(): HasMany
    {
        return $this->hasMany(Pengaduan::class);
    }

    public function suratPengantars(): HasMany
    {
        return $this->hasMany(SuratPengantar::class);
    }
}
