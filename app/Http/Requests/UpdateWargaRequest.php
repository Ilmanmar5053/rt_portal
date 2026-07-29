<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $wargaModel = $this->route('warga');
        if (is_string($wargaModel) || is_numeric($wargaModel)) {
            $wargaModel = \App\Models\Warga::find($wargaModel);
        }
        
        $wargaId = $wargaModel ? $wargaModel->id : null;
        $userId = $wargaModel ? $wargaModel->user_id : null;

        return [
            'keluarga_id' => ['required', 'exists:keluargas,id'],
            'nik' => ['required', 'string', 'max:20', Rule::unique('wargas')->ignore($wargaId)],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['required', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:Laki-laki,Perempuan'],
            'agama' => ['required', 'string', 'max:50'],
            'pendidikan' => ['required', 'string', 'max:100'],
            'pekerjaan' => ['required', 'string', 'max:100'],
            'status_perkawinan' => ['required', 'in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati'],
            'status_hubungan_keluarga' => [
                'required',
                'in:Kepala Keluarga,Istri,Anak,Menantu,Cucu,Orang Tua,Mertua,Famili Lain,Lainnya',
                function ($attribute, $value, $fail) use ($wargaId) {
                    if ($value === 'Kepala Keluarga') {
                        $keluargaId = request()->input('keluarga_id');
                        if ($keluargaId) {
                            $exists = \App\Models\Warga::where('keluarga_id', $keluargaId)
                                ->where('status_hubungan_keluarga', 'Kepala Keluarga')
                                ->where('id', '!=', $wargaId)
                                ->exists();
                            if ($exists) {
                                $fail('Keluarga ini sudah memiliki Kepala Keluarga.');
                            }
                        }
                    }
                },
            ],
            'kewarganegaraan' => ['required', 'in:WNI,WNA'],
            'nama_ayah' => ['required', 'string', 'max:255'],
            'nama_ibu' => ['required', 'string', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'status_hidup' => ['required', 'in:Hidup,Meninggal'],
            'buat_akun' => ['nullable', 'boolean'],
            'email' => ['nullable', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($userId)],
            'generate_iuran' => ['nullable', 'array'],
            'generate_iuran.*.jenis' => ['required', 'string'],
            'generate_iuran.*.nominal' => ['required', 'numeric', 'min:0'],
        ];
    }
}
