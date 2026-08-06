<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StrukturRt extends Model
{
    use HasFactory;

    protected $fillable = [
        'rt_nomor',
        'warga_id',
        'jabatan',
        'periode_mulai',
        'periode_selesai',
        'foto_profil'
    ];

    public function warga()
    {
        return $this->belongsTo(Warga::class);
    }
}
