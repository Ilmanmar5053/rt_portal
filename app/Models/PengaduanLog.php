<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengaduanLog extends Model
{
    use HasFactory;

    protected $table = 'pengaduan_logs';

    protected $fillable = [
        'pengaduan_id',
        'user_id',
        'komentar',
    ];

    public function pengaduan()
    {
        return $this->belongsTo(Pengaduan::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
