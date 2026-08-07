<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KKScanController extends Controller
{
    /**
     * Scan Kartu Keluarga image/PDF using Google Gemini Multimodal AI Vision
     */
    public function scanAi(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
            'api_key' => 'nullable|string',
        ]);

        $apiKey = trim($request->input('api_key') ?: env('GEMINI_API_KEY', ''));

        $base64Image = $request->input('image');
        $mimeType = 'image/jpeg';

        if (preg_match('/^data:(image\/\w+);base64,/', $base64Image, $type)) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            $mimeType = strtolower($type[1]);
        }

        $base64Image = str_replace(' ', '+', $base64Image);

        // Prompt for Gemini AI Vision model
        $prompt = "Anda adalah sistem OCR AI Multimodal presisi tinggi untuk dokumen resmi Kartu Keluarga (KK) Republik Indonesia.\n\n" .
            "Tugas Anda: Baca dan ekstrak SELURUH informasi dari gambar Kartu Keluarga ini secara teliti tanpa ada yang terlewat.\n\n" .
            "WAJIB mengembalikan HANYA JSON murni tanpa format markdown (tanpa ```json atau ```). Format JSON persis seperti berikut:\n" .
            "{\n" .
            "  \"no_kk\": \"16 digit nomor KK\",\n" .
            "  \"alamat_lengkap\": \"Alamat jalan / blok / rumah\",\n" .
            "  \"rt\": \"nomor RT 3 digit (contoh: 005)\",\n" .
            "  \"rw\": \"nomor RW 3 digit (contoh: 008)\",\n" .
            "  \"kelurahan\": \"Nama Desa atau Kelurahan\",\n" .
            "  \"kecamatan\": \"Nama Kecamatan\",\n" .
            "  \"kabupaten_kota\": \"Nama Kabupaten atau Kota\",\n" .
            "  \"provinsi\": \"Nama Provinsi\",\n" .
            "  \"anggota\": [\n" .
            "    {\n" .
            "      \"nik\": \"16 digit NIK anggota\",\n" .
            "      \"nama\": \"NAMA LENGKAP KAPITAL\",\n" .
            "      \"jk\": \"Laki-laki atau Perempuan\",\n" .
            "      \"tempat_lahir\": \"Kota tempat lahir\",\n" .
            "      \"tanggal_lahir\": \"DD-MM-YYYY\",\n" .
            "      \"status_hubungan_keluarga\": \"Kepala Keluarga / Istri / Anak / Orang Tua / Mertua / Cucu / Famili Lain\"\n" .
            "    }\n" .
            "  ]\n" .
            "}";

        if (!empty($apiKey)) {
            $modelsToTry = [
                'gemini-1.5-flash',
                'gemini-2.0-flash',
                'gemini-1.5-pro'
            ];

            foreach ($modelsToTry as $modelName) {
                try {
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$apiKey}";

                    $response = Http::timeout(45)->post($url, [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt],
                                    [
                                        'inline_data' => [
                                            'mime_type' => $mimeType,
                                            'data' => $base64Image,
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'temperature' => 0.1,
                            'maxOutputTokens' => 4096,
                        ]
                    ]);

                    if ($response->successful()) {
                        $resData = $response->json();
                        $rawText = $resData['candidates'][0]['content']['parts'][0]['text'] ?? '';

                        // Robust Substring JSON Extraction
                        $parsedJson = null;
                        $firstBrace = strpos($rawText, '{');
                        $lastBrace = strrpos($rawText, '}');

                        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
                            $jsonSub = substr($rawText, $firstBrace, $lastBrace - $firstBrace + 1);
                            $parsedJson = json_decode($jsonSub, true);
                        }

                        if (!$parsedJson) {
                            $jsonString = trim(preg_replace('/^```(?:json)?|```$/m', '', trim($rawText)));
                            $parsedJson = json_decode($jsonString, true);
                        }

                        if ($parsedJson && is_array($parsedJson)) {
                            return response()->json([
                                'status' => 'success',
                                'source' => "Google {$modelName} AI Vision",
                                'data' => $parsedJson,
                            ]);
                        }
                    } else {
                        Log::warning("Gemini API {$modelName} Response Error: " . $response->body());
                    }
                } catch (\Exception $e) {
                    Log::error("Gemini API {$modelName} Exception: " . $e->getMessage());
                }
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses dengan Gemini AI API. Pastikan API key Anda aktif di Google AI Studio.',
            ], 200);
        }

        // Return HTTP 200 with guidance so fetch doesn't throw catch error
        return response()->json([
            'status' => 'key_required',
            'message' => 'Silakan masukkan Gemini API Key gratis di menu "🔑 API Key AI" untuk memproses gambar/PDF dengan Visi AI.',
        ], 200);
    }
}
