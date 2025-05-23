# Shayna Cosmetic E-Commerce

## Deskripsi

Proyek ini adalah aplikasi e-commerce cosmetic dengan frontend menggunakan TypeScript + Vite dan backend menggunakan Laravel + Filament sebagai admin panel.

---

## Struktur Folder

- `/cosmetic-frontend` : Frontend aplikasi
- `/cosmetic-backend` : Backend Laravel & Filament

---

## Cara Setup

### Frontend

1. Masuk ke folder frontend
   ```bash
   cd cosmetic-frontend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Jalankan development server
   ```bash
   npm run dev
   ```
   Frontend berjalan di `http://localhost:5173`

---

### Backend

1. Masuk ke folder backend
   ```bash
   cd cosmetic-backend
   ```
2. Install dependencies PHP
   ```bash
   composer install
   ```
3. Copy file environment
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Atur konfigurasi database di file `.env`
5. Jalankan migrasi database
   ```bash
   php artisan migrate
   ```
6. Buat user admin Filament
   ```bash
   php artisan make:filament-user
   ```
7. Jalankan backend server
   ```bash
   php artisan serve
   ```
   Backend berjalan di `http://localhost:8000`

---

## Cara Login Admin Panel

Buka browser ke:

```
http://localhost:8000/admin/login
```

Gunakan user admin yang sudah dibuat lewat perintah `php artisan make:filament-user`.

---

## Catatan

- Jangan commit file `.env` dan folder `node_modules` atau `vendor`
- Jalankan frontend dan backend di terminal berbeda
- Proyek ini dibuat untuk portofolio

---

## Keterangan

Proyek ini dibuat untuk keperluan pembelajaran dan portofolio pribadi. Semua konten dapat disesuaikan melalui database, termasuk informasi pada halaman beranda, berita, dan pengumuman.

## Lisensi

Bebas digunakan untuk keperluan pembelajaran dan pengembangan pribadi.

Terima kasih sudah melihat proyek ini!
