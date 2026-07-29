<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiKas extends Model
{
    use HasFactory;

    protected $table = 'transaksi_kas';

    protected $fillable = [
        'tanggal',
        'jenis',
        'kategori',
        'keterangan',
        'jumlah',
        'saldo_setelah',
        'referensi',
        'created_by',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'decimal:2',
        'saldo_setelah' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get current total balance
     */
    public static function getSaldo(): float
    {
        $last = self::orderBy('tanggal', 'desc')->orderBy('id', 'desc')->first();
        return $last ? (float) $last->saldo_setelah : 0;
    }

    /**
     * Recalculate saldo_setelah for all records in order
     */
    public static function recalculateSaldo(): void
    {
        $saldo = 0;
        self::orderBy('tanggal')->orderBy('id')->each(function ($t) use (&$saldo) {
            if ($t->jenis === 'Pemasukan') {
                $saldo += (float) $t->jumlah;
            } else {
                $saldo -= (float) $t->jumlah;
            }
            $t->saldo_setelah = $saldo;
            $t->save();
        });
    }

    public static function getKategoriPemasukan(): array
    {
        return ['Iuran Wajib', 'Iuran Sukarela', 'Dana Sosial', 'Bantuan Pemerintah', 'Sumbangan', 'Lainnya'];
    }

    public static function getKategoriPengeluaran(): array
    {
        return ['Operasional', 'Pemeliharaan', 'Kegiatan', 'Administrasi', 'Kebersihan', 'Keamanan', 'Sosial', 'Lainnya'];
    }
}
