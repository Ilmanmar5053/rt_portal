<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WilayahController extends Controller
{
    public function provinsi()
    {
        $provinsi = DB::table('wilayah')
            ->whereRaw('LENGTH(kode) = 2')
            ->orderBy('nama')
            ->get();
        return response()->json($provinsi);
    }

    public function kabupaten($provinsi_kode)
    {
        $kabupaten = DB::table('wilayah')
            ->whereRaw('LENGTH(kode) = 5')
            ->where('kode', 'like', $provinsi_kode . '.%')
            ->orderBy('nama')
            ->get();
        return response()->json($kabupaten);
    }

    public function kecamatan($kabupaten_kode)
    {
        $kecamatan = DB::table('wilayah')
            ->whereRaw('LENGTH(kode) = 8')
            ->where('kode', 'like', $kabupaten_kode . '.%')
            ->orderBy('nama')
            ->get();
        return response()->json($kecamatan);
    }

    public function kelurahan($kecamatan_kode)
    {
        $kelurahan = DB::table('wilayah')
            ->whereRaw('LENGTH(kode) = 13')
            ->where('kode', 'like', $kecamatan_kode . '.%')
            ->orderBy('nama')
            ->get();
        return response()->json($kelurahan);
    }
}
