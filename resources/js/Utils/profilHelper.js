/**
 * Ekstraksi nama perumahan yang bersih dari alamat di modul Profil Lingkungan.
 * Contoh: "Perum Puri Delta Kiara Blok BB No. 21" -> "Puri Delta Kiara"
 */
export function getNamaPerumahan(profil) {
    if (profil && profil.alamat) {
        const firstLine = profil.alamat.split('\n')[0].replace(/\r/g, '').trim();
        const match = firstLine.match(/(?:Perumahan|Perum|Komplek|Komp\.?)?\s*([^,]+?)(?:\s+Blok|\s+No\.?|\s*,|$)/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        return firstLine;
    }
    return 'Puri Delta Kiara';
}

/**
 * Ekstraksi nama RT/RW dari modul Profil Lingkungan.
 * Contoh: "RT 009 / RW 006"
 */
export function getNamaRt(profil) {
    return profil?.nama_rt || 'RT 009 / RW 006';
}
