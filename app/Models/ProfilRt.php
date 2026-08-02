<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilRt extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_rt',
        'alamat',
        'nomor_wa',
        'logo_path',
        'ttd_ketua_path',
        'ttd_sekretaris_path',
        'pengurus',
    ];

    protected $casts = [
        'pengurus' => 'array',
    ];
}
