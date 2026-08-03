# Database Dump

Folder ini berisi SQL dump terbaru dari database `rt_portal`.

## Cara Restore

```bash
# Pastikan database sudah dibuat terlebih dahulu
mysql -h 127.0.0.1 -P 3306 -u root -p rt_portal < database/dump/rt_portal_dump.sql
```

## Keterangan

- File dump di-generate otomatis dari database lokal menggunakan `mysqldump`
- Berisi **semua data** termasuk users, warga, keluarga, iuran, dll.
- **Jangan hapus file `.env`** — file ini tidak termasuk dalam dump
- Update dump setiap kali ada perubahan data signifikan sebelum push

## Struktur Tabel

| Tabel | Keterangan |
|---|---|
| `users` | Data login pengurus & warga |
| `wargas` | Data anggota warga |
| `keluargas` | Data kartu keluarga (KK) |
| `rumah_bloks` | Data rumah/blok |
| `iuran_kas` | Data tagihan iuran |
| `transaksi_kas` | Arus kas pemasukan/pengeluaran |
| `program_kegiatan` | Program & kegiatan RT |
| `pengaduans` | Data pengaduan warga |
| `surat_pengantars` | Data surat pengantar |
| `role_permissions` | Matriks hak akses |
| `profil_rts` | Profil & info RT |
