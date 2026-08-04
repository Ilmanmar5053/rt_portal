<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\IuranKas;

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
     * Get current total balance (auto-sync first)
     */
    public static function getSaldo(): float
    {
        self::syncApprovedIuran();
        $last = self::orderBy('tanggal', 'desc')->orderBy('id', 'desc')->first();
        return $last ? (float) $last->saldo_setelah : 0;
    }

    /**
     * Sinkronkan Iuran Warga bertipe 'Kas RT' yang Approved ke Transaksi Kas (Kas RT).
     * Komponen 'Kebersihan (Sampah)' & 'Duka Cita' disalurkan ke Pihak Pengelola Sampah & DKM Masjid,
     * sehingga TIDAK dimasukkan ke dalam Saldo Kas RT.
     */
    public static function syncApprovedIuran(): void
    {
        // 1. Ambil seluruh iuran warga bertipe 'Kas RT' yang sudah 'Approved' (Lunas)
        $approvedKasRtIurans = IuranKas::with('warga')
            ->where('status_pembayaran', 'Approved')
            ->where(function ($q) {
                $q->where('jenis_iuran', 'Kas RT')
                  ->orWhere('jenis_iuran', 'like', '%Kas RT%');
            })
            ->get();

        $activeRefs = [];

        foreach ($approvedKasRtIurans as $iuran) {
            $ref = "IURAN-KASRT-" . $iuran->id;
            $activeRefs[] = $ref;

            $namaWarga = $iuran->warga ? $iuran->warga->nama_lengkap : 'Warga';
            $keterangan = "Pemasukan Iuran Kas RT - {$namaWarga} ({$iuran->periode_bulan}/{$iuran->periode_tahun})";
            $tanggal = $iuran->updated_at ? $iuran->updated_at->toDateString() : date('Y-m-d');

            self::updateOrCreate(
                ['referensi' => $ref],
                [
                    'tanggal' => $tanggal,
                    'jenis' => 'Pemasukan',
                    'kategori' => 'Iuran Wajib',
                    'keterangan' => $keterangan,
                    'jumlah' => $iuran->jumlah_bayar,
                ]
            );
        }

        // 2. Hapus transaksi kas otomatis untuk iuran RT yang statusnya sudah bukan Approved
        self::where('referensi', 'like', 'IURAN-KASRT-%')
            ->whereNotIn('referensi', $activeRefs)
            ->delete();

        // 3. Hitung ulang urutan saldo setelah transaksi
        self::recalculateSaldo();
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
