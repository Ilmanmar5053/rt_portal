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

    protected static function booted()
    {
        static::retrieved(function ($program) {
            $program->syncStatusByDate();
        });
    }

    public static function syncAllStatuses(): void
    {
        $programs = self::where('status', '!=', 'Dibatalkan')->get();
        foreach ($programs as $program) {
            $program->syncStatusByDate();
        }
    }

    public function syncStatusByDate(): void
    {
        if ($this->status === 'Dibatalkan') {
            return;
        }

        $now = now();
        $end = $this->tanggal_selesai 
            ? \Carbon\Carbon::parse($this->tanggal_selesai)->endOfDay() 
            : \Carbon\Carbon::parse($this->tanggal_mulai)->endOfDay();

        if ($now->greaterThan($end)) {
            if ($this->status !== 'Selesai') {
                $this->status = 'Selesai';
                $this->saveQuietly();
            }
            return;
        }

        $start = \Carbon\Carbon::parse($this->tanggal_mulai)->startOfDay();
        if ($now->between($start, $end)) {
            if ($this->status !== 'Sedang Berjalan') {
                $this->status = 'Sedang Berjalan';
                $this->saveQuietly();
            }
            return;
        }

        if ($now->lessThan($start)) {
            if ($this->status !== 'Direncanakan') {
                $this->status = 'Direncanakan';
                $this->saveQuietly();
            }
            return;
        }
    }

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
