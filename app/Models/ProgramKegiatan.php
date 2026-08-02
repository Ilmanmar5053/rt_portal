<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramKegiatan extends Model
{
    use HasFactory;

    protected $table = 'program_kegiatan';

    protected $fillable = [
        'nama_program',
        'kategori',
        'status',
        'tanggal_mulai',
        'tanggal_selesai',
        'waktu',
        'lokasi',
        'pic_nama',
        'pic_kontak',
        'estimasi_anggaran',
        'realisasi_anggaran',
        'deskripsi',
        'eflyer_path',
        'created_by',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'estimasi_anggaran' => 'decimal:2',
        'realisasi_anggaran' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function getKategoriList(): array
    {
        return ['Program', 'Kegiatan', 'Informasi', 'Lain-lain'];
    }

    public static function getStatusList(): array
    {
        return ['Direncanakan', 'Sedang Berjalan', 'Selesai', 'Dibatalkan'];
    }
}
