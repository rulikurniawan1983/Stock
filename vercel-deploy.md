# Vercel Deployment Guide

Panduan lengkap untuk deployment aplikasi Stock Obat Hewan ke Vercel.

## 🚀 Quick Start

### 1. Prerequisites
- [ ] Akun GitHub
- [ ] Akun Vercel
- [ ] Akun Supabase
- [ ] Repository sudah di-push ke GitHub

### 2. Setup Supabase
1. **Buat Project Supabase**
   - Buka [supabase.com](https://supabase.com)
   - Klik "New Project"
   - Pilih organization
   - Masukkan nama project: "stock-obat-hewan"
   - Masukkan database password
   - Pilih region terdekat
   - Klik "Create new project"

2. **Jalankan Database Schema**
   - Buka Supabase dashboard
   - Pergi ke "SQL Editor"
   - Copy dan paste isi file `supabase/schema.sql`
   - Klik "Run" untuk menjalankan schema

3. **Setup Sample Data**
   - Jalankan script setup: `node scripts/setup-supabase.js`
   - Atau buat user manual di Supabase Auth

### 3. Deploy ke Vercel

#### Method 1: Via Vercel Dashboard (Recommended)

1. **Import Project**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub
   - Klik "New Project"
   - Pilih repository "stock-obat-hewan"
   - Klik "Import"

2. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Set Environment Variables**
   - Klik "Environment Variables"
   - Tambahkan variables berikut:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

4. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai
   - Aplikasi akan tersedia di URL yang diberikan

#### Method 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   # Di root directory project
   vercel
   
   # Follow prompts:
   # - Set up and deploy? Y
   # - Which scope? (pilih akun Anda)
   # - Link to existing project? N
   # - What's your project's name? stock-obat-hewan
   # - In which directory is your code located? ./
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

5. **Deploy Production**
   ```bash
   vercel --prod
   ```

### 4. Post-Deployment Setup

1. **Test Aplikasi**
   - Buka URL aplikasi yang di-deploy
   - Test login dengan akun sample:
     - Admin: `admin@yankes.com` / `admin123`
     - UPT: `upt1@yankes.com` / `upt123`

2. **Verifikasi Fitur**
   - Dashboard Dinas
   - Dashboard UPT
   - Rekam Medis
   - Pelayanan Kesehatan
   - Manajemen Obat

3. **Setup Domain (Optional)**
   - Di Vercel dashboard, pergi ke "Domains"
   - Tambahkan custom domain jika diperlukan
   - Setup SSL certificate

### 5. Troubleshooting

#### Build Errors

**Error: "Your project's URL and API key are required"**
```bash
# Pastikan environment variables sudah diatur
vercel env ls
```

**Error: "Failed to fetch"**
- Periksa Supabase project status
- Pastikan RLS policies sudah diatur
- Periksa network connectivity

**Error: "User not found"**
- Jalankan setup script untuk membuat user
- Periksa Supabase Auth settings

#### Runtime Errors

**Error: "Cannot read properties of null"**
- Pastikan Supabase client terinisialisasi dengan benar
- Periksa environment variables

**Error: "Permission denied"**
- Periksa RLS policies di Supabase
- Pastikan user memiliki akses yang benar

### 6. Monitoring dan Maintenance

1. **Vercel Analytics**
   - Aktifkan Vercel Analytics di dashboard
   - Monitor performance dan errors

2. **Supabase Monitoring**
   - Monitor database usage
   - Periksa API calls
   - Setup alerts jika diperlukan

3. **Backup Database**
   - Setup regular backup di Supabase
   - Export data secara berkala

### 7. Production Checklist

- [ ] Supabase project sudah dibuat
- [ ] Database schema sudah dijalankan
- [ ] Sample data sudah dimasukkan
- [ ] Environment variables sudah diatur
- [ ] Aplikasi sudah di-deploy
- [ ] Login test berhasil
- [ ] Semua fitur berfungsi
- [ ] Domain sudah diatur (jika diperlukan)
- [ ] SSL certificate aktif
- [ ] Monitoring sudah diatur

### 8. Support dan Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Repository**: [github.com/rulikurniawan1983/Stock](https://github.com/rulikurniawan1983/Stock)

## 🎉 Congratulations!

Aplikasi Stock Obat Hewan sudah berhasil di-deploy dan siap digunakan!

**URL Aplikasi**: [https://your-app.vercel.app](https://your-app.vercel.app)

**Akun Login**:
- Admin: `admin@yankes.com` / `admin123`
- UPT: `upt1@yankes.com` - `upt6@yankes.com` / `upt123`
