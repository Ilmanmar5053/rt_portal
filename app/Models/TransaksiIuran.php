<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiIuran extends Model
{
    use HasFactory;

    protected $table = 'transaksi_iurans';

    protected $fillable = [
        'nomor_kwitansi',
        'kategori_penyerahan',
        'tanggal_penyerahan',
        'periode',
        'jumlah_dana',
        'penerima_nama',
        'penerima_instansi',
        'penerima_jabatan',
        'penyerah_nama',
        'penyerah_jabatan',
        'metode_pembayaran',
        'catatan',
        'bukti_transfer',
        'status',
        'created_by',
    ];

    protected $casts = [
        'tanggal_penyerahan' => 'date',
        'jumlah_dana' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate Nomor Kwitansi Otomatis KWT-YYYYMM-XXXX
     */
    public static function generateNomorKwitansi(): string
    {
        $prefix = 'KWT-' . date('Ym') . '-';
        $lastRecord = self::where('nomor_kwitansi', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastRecord) {
            return $prefix . '0001';
        }

        $lastNum = (int) substr($lastRecord->nomor_kwitansi, -4);
        $nextNum = str_pad($lastNum + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $nextNum;
    }
}
