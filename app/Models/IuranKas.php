<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IuranKas extends Model
{
    use HasFactory;

    protected $fillable = [
        'warga_id', 'jenis_iuran', 'periode_bulan', 'periode_tahun', 
        'jumlah_bayar', 'status_pembayaran', 'bukti_transfer'
    ];

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class);
    }
}
