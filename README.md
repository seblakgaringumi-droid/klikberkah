# Toko Berkah - WebApp Katalog Belanja & Kasir POS

Aplikasi belanja online dan katalog digital Toko Berkah dengan fitur Pesan-Antar (Delivery COD), Ambil di Toko (Pick-Up), Integrasi QRIS & WhatsApp Otomatis, serta sinkronisasi database produk dan pesanan Supabase.

---

## 📁 Struktur Konfigurasi Deployment

Project ini telah dikonfigurasi untuk kemudahan deployment otomatis ke **Cloudflare Pages** melalui GitHub:

1. **`wrangler.toml`**: Konfigurasi resmi Cloudflare Pages/Workers (`pages_build_output_dir = "dist"`).
2. **`public/_redirects`**: Menangani client-side routing Single Page Application (SPA) agar URL halaman tidak 404 saat di-refresh.
3. **`.github/workflows/deploy.yml`**: Pipeline CI/CD GitHub Actions untuk build dan deploy otomatis setiap kali ada perubahan pada branch `main`.

---

## 🚀 Panduan Deployment ke Cloudflare Pages

Anda dapat men-deploy aplikasi ini menggunakan salah satu dari dua metode berikut:

### Metode 1: Menghubungkan Git Repository Langsung via Dashboard Cloudflare (Paling Mudah)

1. **Buka Dashboard Cloudflare**:
   - Masuk ke [dash.cloudflare.com](https://dash.cloudflare.com/).
   - Di menu sebelah kiri, pilih **Workers & Pages**.
   - Klik tombol **Create application** > pilih tab **Pages** > klik **Connect to Git**.

2. **Hubungkan Akun GitHub**:
   - Pilih akun GitHub Anda dan pilih repository project Toko Berkah ini.
   - Klik **Begin setup**.

3. **Konfigurasi Build Settings**:
   - **Project Name**: `toko-berkah-pos` (atau sesuaikan)
   - **Production Branch**: `main`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Root Directory**: `/` (kosongkan / default)

4. **Memasukkan Environment Variables**:
   - Buka bagian **Environment Variables (advanced)**:
   - Tambahkan variabel berikut:
     * `NODE_VERSION` = `20` (Memastikan Cloudflare menggunakan Node.js 20 LTS & npm)
     * `VITE_SUPABASE_URL` = `https://<YOUR-PROJECT-REF>.supabase.co`
     * `VITE_SUPABASE_ANON_KEY` = `<YOUR-SUPABASE-ANON-KEY>`
     * `NEXT_PUBLIC_SUPABASE_URL` = `https://<YOUR-PROJECT-REF>.supabase.co`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<YOUR-SUPABASE-ANON-KEY>`
   - Nilai default project saat ini dapat dilihat pada file `.env.example`.

5. **Deploy**:
   - Klik **Save and Deploy**. Cloudflare Pages akan meng-clone repository, menjalankan `npm run build`, dan mempublikasikan WebApp ke domain `*.pages.dev`.

---

### Metode 2: Otomatisasi via GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

Jika ingin menggunakan pipeline GitHub Actions bawaan:

1. **Buat Cloudflare API Token**:
   - Buka [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
   - Klik **Create Token** > gunakan template **Cloudflare Pages**.
   - Simpan token yang dihasilkan.
   - Salin juga **Account ID** dari dashboard Cloudflare (Workers & Pages > Overview > Account ID di sisi kanan).

2. **Simpan Secrets di Repository GitHub**:
   - Buka repository GitHub Anda > **Settings** > **Secrets and variables** > **Actions**.
   - Klik **New repository secret** dan tambahkan:
     * `CLOUDFLARE_API_TOKEN`: Token API yang dibuat di langkah 1.
     * `CLOUDFLARE_ACCOUNT_ID`: Account ID Cloudflare Anda.
     * `VITE_SUPABASE_URL`: URL Supabase project Anda.
     * `VITE_SUPABASE_ANON_KEY`: Anon Key Supabase project Anda.

3. **Jalankan Deployment**:
   - Setiap kali Anda melakukan `git push` ke branch `main`, GitHub Actions akan otomatis menguji, meng-compile, dan mempublikasikan versi terbaru ke Cloudflare Pages.

---

## 🛠️ Pengembangan Lokal (Local Development)

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server development
npm run dev

# 3. Jalankan pengecekan TypeScript (Linter)
npm run lint

# 4. Buat file produksi (Production Build)
npm run build
```
