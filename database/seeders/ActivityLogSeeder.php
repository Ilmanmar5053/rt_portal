<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $u1 = $users->first() ?? User::create(['name'=>'Super Admin Portal','email'=>'admin@portalrt.id','password'=>bcrypt('password'),'role'=>'superadmin']);
        $u2 = $users->skip(1)->first() ?? User::create(['name'=>'Budi Santoso','email'=>'budi@warga.id','password'=>bcrypt('password'),'role'=>'warga']);

        ActivityLog::create([
            'user_id' => $u1->id,
            'user_name' => $u1->name,
            'user_role' => strtoupper($u1->role ?? 'SUPERADMIN'),
            'action' => 'LOGIN',
            'module' => 'Autentikasi Akun',
            'description' => 'User berhasil login ke sistem portal admin',
            'ip_address' => '192.168.1.10',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'url' => 'http://127.0.0.1:8000/login',
            'created_at' => now()->subMinutes(120),
        ]);

        ActivityLog::create([
            'user_id' => $u1->id,
            'user_name' => $u1->name,
            'user_role' => strtoupper($u1->role ?? 'SUPERADMIN'),
            'action' => 'UPDATE',
            'module' => 'Data Anggota Warga',
            'description' => 'Mengubah data status perkawinan warga Asep Sunandar',
            'ip_address' => '192.168.1.10',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'old_values' => ['nama' => 'Asep Sunandar', 'status_perkawinan' => 'Belum Kawin', 'pekerjaan' => 'Wiraswasta'],
            'new_values' => ['nama' => 'Asep Sunandar', 'status_perkawinan' => 'Kawin', 'pekerjaan' => 'Wiraswasta'],
            'url' => 'http://127.0.0.1:8000/admin/warga/12',
            'created_at' => now()->subMinutes(115),
        ]);

        ActivityLog::create([
            'user_id' => $u1->id,
            'user_name' => $u1->name,
            'user_role' => strtoupper($u1->role ?? 'SUPERADMIN'),
            'action' => 'CREATE',
            'module' => 'Surat Pengantar',
            'description' => 'Menyetujui & memproses Surat Pengantar KTP No. 045/RT02/VIII/2026',
            'ip_address' => '192.168.1.10',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'old_values' => null,
            'new_values' => ['nomor_surat' => '045/RT02/VIII/2026', 'status' => 'disetujui', 'pemohon' => 'Budi Santoso'],
            'url' => 'http://127.0.0.1:8000/admin/surat/45/approve',
            'created_at' => now()->subMinutes(90),
        ]);

        ActivityLog::create([
            'user_id' => $u2->id,
            'user_name' => $u2->name,
            'user_role' => strtoupper($u2->role ?? 'WARGA'),
            'action' => 'LOGIN',
            'module' => 'Autentikasi Akun',
            'description' => 'Warga berhasil login melalui Safari browser',
            'ip_address' => '180.252.12.88',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
            'url' => 'http://127.0.0.1:8000/login',
            'created_at' => now()->subMinutes(45),
        ]);

        ActivityLog::create([
            'user_id' => $u2->id,
            'user_name' => $u2->name,
            'user_role' => strtoupper($u2->role ?? 'WARGA'),
            'action' => 'VIEW',
            'module' => 'Layanan Surat',
            'description' => 'Membuka form pengajuan Surat Keterangan Domisili',
            'ip_address' => '180.252.12.88',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
            'url' => 'http://127.0.0.1:8000/warga/surat/create',
            'created_at' => now()->subMinutes(40),
        ]);

        ActivityLog::create([
            'user_id' => $u2->id,
            'user_name' => $u2->name,
            'user_role' => strtoupper($u2->role ?? 'WARGA'),
            'action' => 'CREATE',
            'module' => 'Layanan Surat',
            'description' => 'Mengirim pengajuan Surat Keterangan Domisili Kos',
            'ip_address' => '180.252.12.88',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
            'old_values' => null,
            'new_values' => ['jenis_surat' => 'Surat Keterangan Domisili', 'keperluan' => 'Pendaftaran Pekerjaan', 'rt' => '003'],
            'url' => 'http://127.0.0.1:8000/warga/surat',
            'created_at' => now()->subMinutes(35),
        ]);

        ActivityLog::create([
            'user_id' => $u1->id,
            'user_name' => $u1->name,
            'user_role' => strtoupper($u1->role ?? 'SUPERADMIN'),
            'action' => 'UPDATE',
            'module' => 'Manajemen Database',
            'description' => 'Melakukan pembaruan skema tabel database dan optimasi indeks',
            'ip_address' => '192.168.1.10',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'old_values' => ['schema_version' => '2.1.0'],
            'new_values' => ['schema_version' => '2.2.0', 'updated_tables' => ['activity_logs', 'surat_pengantars', 'wargas']],
            'url' => 'http://127.0.0.1:8000/admin/database/optimize',
            'created_at' => now()->subMinutes(10),
        ]);
    }
}
