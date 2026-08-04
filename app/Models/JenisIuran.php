<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisIuran extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_iuran',
        'nominal_default',
        'kategori',
        'is_active',
        'urutan',
    ];

    protected $casts = [
        'nominal_default' => 'float',
        'is_active' => 'boolean',
        'urutan' => 'integer',
    ];
}
