<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IuranKas;
use App\Models\Keluarga;
use App\Models\Pengaduan;
use App\Models\RumahBlok;
use App\Models\SuratPengantar;
use App\Models\TransaksiKas;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    private const TABS = [
        'warga',
        'keluarga',
        'rumah',
        'iuran',
        'pengaduan',
        'surat',
        'transaksi',
        'users',
    ];

    public function index(Request $request)
    {
        $activeTab = $request->query('tab', 'warga');
        if (!in_array($activeTab, self::TABS, true)) {
            $activeTab = 'warga';
        }

        $search = $request->query('search');

        $query = $this->buildQuery($activeTab);

        if ($search) {
            $query = $this->applySearch($activeTab, $query, $search);
        }

        $exportQuery = clone $query;

        $reports = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $exportRows = $exportQuery->orderBy('created_at', 'desc')->get();

        $sortField = $request->query('sort_field');
        $sortDirection = $request->query('sort_direction', 'asc');

        return Inertia::render('Admin/Laporan/Index', [
            'activeTab' => $activeTab,
            'reports' => $reports,
            'exportRows' => $exportRows,
            'filters' => [
                'search' => $search,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
            'reportCounts' => [
                'warga' => Warga::count(),
                'keluarga' => Keluarga::count(),
                'rumah' => RumahBlok::count(),
                'iuran' => IuranKas::count(),
                'pengaduan' => Pengaduan::count(),
                'surat' => SuratPengantar::count(),
                'transaksi' => TransaksiKas::count(),
                'users' => User::count(),
            ],
        ]);
    }

    private function buildQuery(string $tab)
    {
        return match ($tab) {
            'keluarga' => Keluarga::with(['rumahBlok', 'kepalaKeluarga']),
            'rumah' => RumahBlok::withCount('keluargas'),
            'iuran' => IuranKas::with(['warga.keluarga']),
            'pengaduan' => Pengaduan::with('warga'),
            'surat' => SuratPengantar::with(['warga.keluarga']),
            'transaksi' => TransaksiKas::with('creator'),
            'users' => User::with('warga'),
            default => Warga::with('keluarga'),
        };
    }

    private function applySearch(string $tab, $query, string $search)
    {
        return match ($tab) {
            'keluarga' => $query->where(function ($q) use ($search) {
                $q->where('no_kk', 'like', "%{$search}%")
                    ->orWhere('rt', 'like', "%{$search}%")
                    ->orWhere('rw', 'like', "%{$search}%")
                    ->orWhere('alamat_lengkap', 'like', "%{$search}%")
                    ->orWhereHas('rumahBlok', function ($q2) use ($search) {
                        $q2->where('blok', 'like', "%{$search}%")
                            ->orWhere('nomor_rumah', 'like', "%{$search}%");
                    })
                    ->orWhereHas('kepalaKeluarga', function ($q2) use ($search) {
                        $q2->where('nama_lengkap', 'like', "%{$search}%");
                    });
            }),
            'rumah' => $query->where(function ($q) use ($search) {
                $q->where('blok', 'like', "%{$search}%")
                    ->orWhere('nomor_rumah', 'like', "%{$search}%")
                    ->orWhere('status_hunian', 'like', "%{$search}%");
            }),
            'iuran' => $query->where(function ($q) use ($search) {
                $q->where('jenis_iuran', 'like', "%{$search}%")
                    ->orWhere('status_pembayaran', 'like', "%{$search}%")
                    ->orWhere('periode_bulan', 'like', "%{$search}%")
                    ->orWhere('periode_tahun', 'like', "%{$search}%")
                    ->orWhereHas('warga', function ($q2) use ($search) {
                        $q2->where('nama_lengkap', 'like', "%{$search}%")
                            ->orWhere('nik', 'like', "%{$search}%")
                            ->orWhereHas('keluarga', function ($q3) use ($search) {
                                $q3->where('no_kk', 'like', "%{$search}%");
                            });
                    });
            }),
            'pengaduan' => $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhere('status_progres', 'like', "%{$search}%")
                    ->orWhere('isi_laporan', 'like', "%{$search}%")
                    ->orWhereHas('warga', function ($q2) use ($search) {
                        $q2->where('nama_lengkap', 'like', "%{$search}%")
                            ->orWhere('nik', 'like', "%{$search}%");
                    });
            }),
            'surat' => $query->where(function ($q) use ($search) {
                $q->where('jenis_surat', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%")
                    ->orWhereHas('warga', function ($q2) use ($search) {
                        $q2->where('nama_lengkap', 'like', "%{$search}%")
                            ->orWhere('nik', 'like', "%{$search}%")
                            ->orWhereHas('keluarga', function ($q3) use ($search) {
                                $q3->where('no_kk', 'like', "%{$search}%");
                            });
                    });
            }),
            'transaksi' => $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                    ->orWhere('kategori', 'like', "%{$search}%")
                    ->orWhere('jenis', 'like', "%{$search}%")
                    ->orWhere('referensi', 'like', "%{$search}%");
            }),
            'users' => $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhereHas('warga', function ($q2) use ($search) {
                        $q2->where('nik', 'like', "%{$search}%")
                            ->orWhere('nama_lengkap', 'like', "%{$search}%");
                    });
            }),
            default => $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('status_hubungan_keluarga', 'like', "%{$search}%")
                    ->orWhereHas('keluarga', function ($q2) use ($search) {
                        $q2->where('no_kk', 'like', "%{$search}%");
                    });
            }),
        };
    }
}
