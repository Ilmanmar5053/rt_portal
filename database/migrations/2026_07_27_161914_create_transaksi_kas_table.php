<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_kas', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->enum('jenis', ['Pemasukan', 'Pengeluaran']);
            $table->string('kategori', 100);
            $table->string('keterangan', 500);
            $table->decimal('jumlah', 15, 2);
            $table->decimal('saldo_setelah', 15, 2)->default(0);
            $table->string('referensi', 100)->nullable(); // no referensi/bukti
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });

        // Seed sample data
        $now = now();
        $initialSaldo = 0;
        $transactions = [
            ['tanggal' => '2026-01-05', 'jenis' => 'Pemasukan', 'kategori' => 'Iuran Wajib', 'keterangan' => 'Iuran wajib warga Januari 2026', 'jumlah' => 2500000],
            ['tanggal' => '2026-01-10', 'jenis' => 'Pengeluaran', 'kategori' => 'Operasional', 'keterangan' => 'Pembayaran listrik pos kamling Januari', 'jumlah' => 150000],
            ['tanggal' => '2026-01-15', 'jenis' => 'Pemasukan', 'kategori' => 'Dana Sosial', 'keterangan' => 'Donasi kegiatan 17 Agustus', 'jumlah' => 800000],
            ['tanggal' => '2026-01-20', 'jenis' => 'Pengeluaran', 'kategori' => 'Pemeliharaan', 'keterangan' => 'Perbaikan lampu jalan blok A', 'jumlah' => 350000],
            ['tanggal' => '2026-02-05', 'jenis' => 'Pemasukan', 'kategori' => 'Iuran Wajib', 'keterangan' => 'Iuran wajib warga Februari 2026', 'jumlah' => 2500000],
            ['tanggal' => '2026-02-14', 'jenis' => 'Pengeluaran', 'kategori' => 'Kegiatan', 'keterangan' => 'Konsumsi rapat RT Februari', 'jumlah' => 200000],
            ['tanggal' => '2026-02-20', 'jenis' => 'Pemasukan', 'kategori' => 'Iuran Sukarela', 'keterangan' => 'Sumbangan renovasi pos jaga', 'jumlah' => 1500000],
            ['tanggal' => '2026-03-05', 'jenis' => 'Pemasukan', 'kategori' => 'Iuran Wajib', 'keterangan' => 'Iuran wajib warga Maret 2026', 'jumlah' => 2500000],
            ['tanggal' => '2026-03-12', 'jenis' => 'Pengeluaran', 'kategori' => 'Pemeliharaan', 'keterangan' => 'Cat ulang pagar RT', 'jumlah' => 750000],
            ['tanggal' => '2026-03-25', 'jenis' => 'Pengeluaran', 'kategori' => 'Operasional', 'keterangan' => 'ATK administrasi RT', 'jumlah' => 120000],
        ];

        $saldo = $initialSaldo;
        foreach ($transactions as $t) {
            if ($t['jenis'] === 'Pemasukan') {
                $saldo += $t['jumlah'];
            } else {
                $saldo -= $t['jumlah'];
            }
            DB::table('transaksi_kas')->insert([
                'tanggal' => $t['tanggal'],
                'jenis' => $t['jenis'],
                'kategori' => $t['kategori'],
                'keterangan' => $t['keterangan'],
                'jumlah' => $t['jumlah'],
                'saldo_setelah' => $saldo,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_kas');
    }
};
