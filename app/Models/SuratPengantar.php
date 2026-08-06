<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratPengantar extends Model
{
    use HasFactory;

    protected $fillable = [
        'warga_id', 'jenis_surat', 'keperluan', 'keterangan_tambahan', 'status', 
        'nomor_surat', 'qr_code_uuid', 'pdf_path'
    ];

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class);
    }
}
