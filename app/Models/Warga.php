<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warga extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'keluarga_id', 'nik', 'nama_lengkap', 
        'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 
        'pendidikan', 'pekerjaan', 'status_perkawinan', 
        'status_hubungan_keluarga', 'kewarganegaraan', 'nama_ayah', 'nama_ibu',
        'no_hp', 'status_hidup', 'foto_profil'
    ];

    protected static function booted()
    {
        // Event saat data Warga di-update
        static::updated(function ($warga) {
            if ($warga->wasChanged('nama_lengkap') || $warga->wasChanged('status_hubungan_keluarga')) {
                if ($warga->status_hubungan_keluarga === 'Kepala Keluarga') {
                    Warga::where('keluarga_id', $warga->keluarga_id)
                        ->where('status_hubungan_keluarga', 'Anak')
                        ->update(['nama_ayah' => $warga->nama_lengkap]);
                } elseif ($warga->status_hubungan_keluarga === 'Istri') {
                    Warga::where('keluarga_id', $warga->keluarga_id)
                        ->where('status_hubungan_keluarga', 'Anak')
                        ->update(['nama_ibu' => $warga->nama_lengkap]);
                }
            }

            // Jika ada perubahan pada warga menjadi Anak, update data ortunya jika kosong
            if ($warga->wasChanged('status_hubungan_keluarga') && $warga->status_hubungan_keluarga === 'Anak') {
                $ayah = Warga::where('keluarga_id', $warga->keluarga_id)->where('status_hubungan_keluarga', 'Kepala Keluarga')->first();
                $ibu = Warga::where('keluarga_id', $warga->keluarga_id)->where('status_hubungan_keluarga', 'Istri')->first();
                $updateData = [];
                if ($ayah && !$warga->nama_ayah) $updateData['nama_ayah'] = $ayah->nama_lengkap;
                if ($ibu && !$warga->nama_ibu) $updateData['nama_ibu'] = $ibu->nama_lengkap;
                if (!empty($updateData)) {
                    Warga::where('id', $warga->id)->update($updateData);
                }
            }
        });

        // Event saat data Warga (Anak) baru dibuat
        static::created(function ($warga) {
            if ($warga->status_hubungan_keluarga === 'Anak') {
                $ayah = Warga::where('keluarga_id', $warga->keluarga_id)->where('status_hubungan_keluarga', 'Kepala Keluarga')->first();
                $ibu = Warga::where('keluarga_id', $warga->keluarga_id)->where('status_hubungan_keluarga', 'Istri')->first();
                $updateData = [];
                if ($ayah && empty($warga->nama_ayah)) $updateData['nama_ayah'] = $ayah->nama_lengkap;
                if ($ibu && empty($warga->nama_ibu)) $updateData['nama_ibu'] = $ibu->nama_lengkap;
                if (!empty($updateData)) {
                    Warga::where('id', $warga->id)->update($updateData);
                }
            } elseif ($warga->status_hubungan_keluarga === 'Kepala Keluarga') {
                Warga::where('keluarga_id', $warga->keluarga_id)
                    ->where('status_hubungan_keluarga', 'Anak')
                    ->update(['nama_ayah' => $warga->nama_lengkap]);
            } elseif ($warga->status_hubungan_keluarga === 'Istri') {
                Warga::where('keluarga_id', $warga->keluarga_id)
                    ->where('status_hubungan_keluarga', 'Anak')
                    ->update(['nama_ibu' => $warga->nama_lengkap]);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }

    public function iuranKas(): HasMany
    {
        return $this->hasMany(IuranKas::class);
    }

    public function pengaduans(): HasMany
    {
        return $this->hasMany(Pengaduan::class);
    }

    public function suratPengantars(): HasMany
    {
        return $this->hasMany(SuratPengantar::class);
    }

    public function strukturRt()
    {
        return $this->hasOne(StrukturRt::class, 'warga_id');
    }
}
