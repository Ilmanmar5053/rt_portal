<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BantuanSosial extends Model
{
    use HasFactory;

    protected $fillable = [
        'warga_id',
        'keluarga_id',
        'nik',
        'no_kk',
        'nama_penerima',
        'sumber_dana',
        'jenis_bantuan',
        'status_penyaluran',
        'periode_tahun',
        'periode_bulan',
        'bentuk_bantuan',
        'nominal_tunai',
        'keterangan_ekonomi',
        'foto_bukti',
        'tanggal_penyaluran',
    ];

    protected $casts = [
        'nominal_tunai' => 'decimal:2',
        'tanggal_penyaluran' => 'date',
        'periode_tahun' => 'integer',
    ];

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class);
    }

    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }
}
