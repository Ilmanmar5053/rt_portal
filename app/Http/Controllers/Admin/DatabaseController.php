<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DatabaseController extends Controller
{
    /**
     * Tampilkan halaman manajemen database & backup (khusus superadmin).
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'superadmin') {
            abort(403, 'Akses ditolak. Menu ini khusus untuk Administrator (Superadmin).');
        }

        // Statistik jumlah data per tabel (Tabel Dilindungi vs Operasional)
        $stats = [
            'protected' => [
                'users'            => ['label' => 'Akun Login & Pengurus (users)',          'count' => $this->getTableCount('users'),            'icon' => '👥', 'desc' => 'Akun admin, ketua RT/RW, dan akses login'],
                'profil_rts'       => ['label' => 'Profil Lingkungan RT (profil_rts)',       'count' => $this->getTableCount('profil_rts'),       'icon' => '🏘️', 'desc' => 'Nama RT, RW, alamat, dan tanda tangan'],
                'rumah_bloks'      => ['label' => 'Master Rumah & Blok (rumah_bloks)',       'count' => $this->getTableCount('rumah_bloks'),      'icon' => '🏠', 'desc' => 'Data perumahan, blok, dan status hunian'],
                'role_permissions' => ['label' => 'Matriks Hak Akses (role_permissions)',  'count' => $this->getTableCount('role_permissions'), 'icon' => '🔐', 'desc' => 'Hak akses modul per role pengurus'],
                'jenis_iurans'     => ['label' => 'Master Jenis Iuran (jenis_iurans)',     'count' => $this->getTableCount('jenis_iurans'),     'icon' => '💵', 'desc' => 'Kategori dan nominal iuran default'],
                'struktur_rts'     => ['label' => 'Struktur Organisasi RT (struktur_rts)', 'count' => $this->getTableCount('struktur_rts'),     'icon' => '👔', 'desc' => 'Data pengurus dan jabatan RT'],
            ],
            'operasional' => [
                'wargas'            => ['label' => 'Data Warga / Anggota (wargas)',        'count' => $this->getTableCount('wargas'),            'icon' => '👤', 'desc' => 'Data penduduk dan anggota keluarga'],
                'keluargas'         => ['label' => 'Data Kartu Keluarga (keluargas)',      'count' => $this->getTableCount('keluargas'),         'icon' => '📑', 'desc' => 'Data nomor KK dan kepala keluarga'],
                'iuran_kas'         => ['label' => 'Tagihan & Iuran Kas (iuran_kas)',      'count' => $this->getTableCount('iuran_kas'),         'icon' => '💰', 'desc' => 'Riwayat tagihan iuran warga'],
                'transaksi_iurans'  => ['label' => 'Riwayat Pembayaran (transaksi_iurans)','count' => $this->getTableCount('transaksi_iurans'),  'icon' => '💳', 'desc' => 'Transaksi pembayaran iuran per warga'],
                'transaksi_kas'     => ['label' => 'Arus Kas Keuangan (transaksi_kas)',    'count' => $this->getTableCount('transaksi_kas'),     'icon' => '📊', 'desc' => 'Pencatatan pemasukan & pengeluaran kas'],
                'program_kegiatans' => ['label' => 'Program & Kegiatan (program_kegiatans)','count' => $this->getTableCount('program_kegiatans'),'icon' => '🗓️', 'desc' => 'Agenda, jadwal, dan e-flyer RT'],
                'bantuan_sosials'   => ['label' => 'Bantuan Sosial (bantuan_sosials)',     'count' => $this->getTableCount('bantuan_sosials'),   'icon' => '🎁', 'desc' => 'Penerima dan penyaluran bansos warga'],
                'pengaduans'        => ['label' => 'Pengaduan Warga (pengaduans)',         'count' => $this->getTableCount('pengaduans'),        'icon' => '📢', 'desc' => 'Laporan, aduan, dan aspirasi warga'],
                'surat_pengantars'  => ['label' => 'Surat Pengantar (surat_pengantars)',   'count' => $this->getTableCount('surat_pengantars'),  'icon' => '📄', 'desc' => 'Permohonan surat pengantar warga'],
                'pengaduan_logs'    => ['label' => 'Log Pengaduan (pengaduan_logs)',       'count' => $this->getTableCount('pengaduan_logs'),    'icon' => '💬', 'desc' => 'Riwayat komentar dan progres aduan'],
            ]
        ];

        // Info database & file dump lokal
        $dumpPath = base_path('database/dump/rt_portal_dump.sql');
        $dumpExists = file_exists($dumpPath);

        $dbInfo = [
            'database_name' => config('database.connections.mysql.database'),
            'driver'        => config('database.default'),
            'server_version'=> $this->getMysqlVersion(),
            'dump_file'     => [
                'exists' => $dumpExists,
                'size'   => $dumpExists ? $this->formatBytes(filesize($dumpPath)) : '0 B',
                'time'   => $dumpExists ? date('d-m-Y | H:i:s', filemtime($dumpPath)) : '-',
            ]
        ];

        return Inertia::render('Admin/Database/Index', [
            'stats'  => $stats,
            'dbInfo' => $dbInfo,
        ]);
    }

    /**
     * Download backup SQL Dump langsung dari PHP (kompatibel di semua hosting).
     */
    public function backupSql(Request $request)
    {
        if ($request->user()->role !== 'superadmin') {
            abort(403);
        }

        $dbName = config('database.connections.mysql.database');
        $fileName = 'backup_' . $dbName . '_' . date('Y-m-d_H-i-s') . '.sql';

        $tables = $this->getAllTables();

        $callback = function () use ($tables, $dbName) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "-- ==========================================================\n");
            fwrite($handle, "-- Portal RT Digital SQL Backup\n");
            fwrite($handle, "-- Database: {$dbName}\n");
            fwrite($handle, "-- Generated At: " . date('Y-m-d H:i:s') . "\n");
            fwrite($handle, "-- ==========================================================\n\n");
            fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n\n");

            foreach ($tables as $table) {
                if (!Schema::hasTable($table)) continue;

                fwrite($handle, "--\n-- Structure & Data for table `{$table}`\n--\n");
                fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");

                try {
                    $createStmt = DB::selectOne("SHOW CREATE TABLE `{$table}`");
                    $createSql = $createStmt->{'Create Table'} ?? null;
                    if ($createSql) {
                        fwrite($handle, $createSql . ";\n\n");
                    }
                } catch (\Exception $e) {
                    // Ignore if SHOW CREATE TABLE is not available
                }

                $rows = DB::table($table)->get();
                if ($rows->count() > 0) {
                    foreach ($rows as $row) {
                        $values = [];
                        foreach ((array) $row as $val) {
                            if (is_null($val)) {
                                $values[] = 'NULL';
                            } else {
                                $values[] = "'" . addslashes((string) $val) . "'";
                            }
                        }
                        $valStr = implode(', ', $values);
                        fwrite($handle, "INSERT INTO `{$table}` VALUES ({$valStr});\n");
                    }
                    fwrite($handle, "\n");
                }
            }

            fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
            fclose($handle);
        };

        return response()->streamDownload($callback, $fileName, [
            'Content-Type' => 'application/sql',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    /**
     * Download backup snapshot JSON seluruh tabel database.
     */
    public function backupJson(Request $request)
    {
        if ($request->user()->role !== 'superadmin') {
            abort(403);
        }

        $dbName = config('database.connections.mysql.database');
        $fileName = 'snapshot_' . $dbName . '_' . date('Y-m-d_H-i-s') . '.json';
        $tables = $this->getAllTables();

        $data = [];
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                $data[$table] = DB::table($table)->get();
            }
        }

        $export = [
            'app_name'     => config('app.name', 'Portal RT Digital'),
            'database'     => $dbName,
            'generated_at' => date('c'),
            'tables'       => $data,
        ];

        return response()->json($export, 200, [
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    /**
     * Hapus / Bersihkan data operasional database (dengan konfirmasi password & pengecualian tabel penting).
     */
    public function reset(Request $request)
    {
        if ($request->user()->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'password' => 'required|string',
            'targets'  => 'required|array|min:1',
            'targets.*'=> 'string|in:warga,keuangan,program,layanan,bansos',
        ], [
            'password.required' => 'Password konfirmasi harus diisi.',
            'targets.required'  => 'Pilih minimal satu kategori data yang ingin dibersihkan.',
            'targets.min'       => 'Pilih minimal satu kategori data yang ingin dibersihkan.',
        ]);

        // Verifikasi password admin
        if (!Hash::check($request->password, $request->user()->password)) {
            return back()->withErrors([
                'password' => 'Password konfirmasi salah! Pembersihan data dibatalkan demi keamanan.'
            ]);
        }

        // Tentukan tabel target berdasarkan kategori yang dipilih
        $tablesToClear = [];
        if (in_array('warga', $request->targets)) {
            $tablesToClear[] = 'wargas';
            $tablesToClear[] = 'keluargas';
        }
        if (in_array('keuangan', $request->targets)) {
            $tablesToClear[] = 'iuran_kas';
            $tablesToClear[] = 'transaksi_iurans';
            $tablesToClear[] = 'transaksi_kas';
        }
        if (in_array('program', $request->targets)) {
            $tablesToClear[] = 'program_kegiatans';
        }
        if (in_array('layanan', $request->targets)) {
            $tablesToClear[] = 'pengaduan_logs';
            $tablesToClear[] = 'pengaduans';
            $tablesToClear[] = 'surat_pengantars';
        }
        if (in_array('bansos', $request->targets)) {
            $tablesToClear[] = 'bantuan_sosials';
        }

        // DOUBLE GUARD: Tabel yang TIDAK BOLEH dihapus (kecuali data profil, user, dan data profile perumahan. jangan dihapus!)
        $protectedTables = [
            'users',
            'profil_rts',
            'rumah_bloks',
            'role_permissions',
            'jenis_iurans',
            'struktur_rts',
            'wilayah',
            'migrations',
            'cache',
            'cache_locks',
            'jobs',
            'job_batches',
            'failed_jobs',
            'sessions',
            'password_reset_tokens'
        ];

        // Buang tabel dilindungi jika sampai tercampur
        $tablesToClear = array_diff($tablesToClear, $protectedTables);

        DB::beginTransaction();
        try {
            Schema::disableForeignKeyConstraints();

            $deletedCounts = [];
            foreach ($tablesToClear as $table) {
                if (Schema::hasTable($table)) {
                    $count = DB::table($table)->count();
                    DB::table($table)->truncate();
                    $deletedCounts[$table] = $count;
                }
            }

            Schema::enableForeignKeyConstraints();
            DB::commit();

            $totalRows = array_sum($deletedCounts);
            return redirect()->route('admin.database.index')
                ->with('success', "Pembersihan database berhasil! Total {$totalRows} baris data operasional telah dikosongkan. Data profil, user, dan perumahan tetap aman.");
        } catch (\Exception $e) {
            DB::rollBack();
            Schema::enableForeignKeyConstraints();
            return back()->withErrors([
                'error' => 'Gagal memproses pembersihan data: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Helper get total baris tabel jika ada
     */
    private function getTableCount($tableName)
    {
        try {
            if (Schema::hasTable($tableName)) {
                return DB::table($tableName)->count();
            }
        } catch (\Exception $e) {
            // Abaikan error jika tabel belum dimigrasikan
        }
        return 0;
    }

    /**
     * Helper get MySQL Version
     */
    private function getMysqlVersion()
    {
        try {
            $result = DB::selectOne('select version() as version');
            return $result->version ?? 'MySQL';
        } catch (\Exception $e) {
            return 'MySQL';
        }
    }

    /**
     * Helper list semua nama tabel di database
     */
    private function getAllTables()
    {
        try {
            $dbName = config('database.connections.mysql.database');
            $tables = DB::select('SHOW TABLES');
            $colName = 'Tables_in_' . $dbName;
            $result = [];
            foreach ($tables as $t) {
                if (isset($t->{$colName})) {
                    $result[] = $t->{$colName};
                } else {
                    $array = (array) $t;
                    $result[] = reset($array);
                }
            }
            return $result;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Helper format file size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
