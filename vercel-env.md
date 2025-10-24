# Vercel Environment Variables Setup

Untuk deployment ke Vercel, Anda perlu mengatur environment variables berikut:

## Environment Variables yang Diperlukan

### 1. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Cara Mengatur di Vercel Dashboard

1. **Login ke Vercel Dashboard**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan akun GitHub Anda

2. **Pilih Project**
   - Klik pada project "stock-obat-hewan"
   - Atau buat project baru jika belum ada

3. **Pergi ke Settings**
   - Klik tab "Settings" di project dashboard
   - Pilih "Environment Variables" di sidebar

4. **Tambahkan Environment Variables**
   - Klik "Add New"
   - Masukkan nama variable dan value
   - Pilih environment (Production, Preview, Development)
   - Klik "Save"

### 3. Cara Mengatur via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### 4. Cara Mendapatkan Supabase Credentials

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda

2. **Pergi ke Settings > API**
   - Copy "Project URL" untuk `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy "service_role" key untuk `SUPABASE_SERVICE_ROLE_KEY`

### 5. Verifikasi Setup

Setelah mengatur environment variables:

1. **Redeploy Project**
   - Klik "Redeploy" di Vercel dashboard
   - Atau push commit baru ke GitHub

2. **Test Aplikasi**
   - Buka URL aplikasi yang di-deploy
   - Test login dengan akun sample
   - Verifikasi semua fitur berfungsi

### 6. Troubleshooting

**Error: "Your project's URL and API key are required"**
- Pastikan semua environment variables sudah diatur
- Pastikan tidak ada typo dalam nama variable
- Redeploy project setelah mengatur variables

**Error: "Failed to fetch"**
- Periksa Supabase project status
- Pastikan RLS policies sudah diatur dengan benar
- Periksa network connectivity

**Error: "User not found"**
- Jalankan setup script untuk membuat user sample
- Periksa Supabase Auth settings
- Pastikan user sudah dibuat dengan benar

### 7. Production Checklist

- [ ] Environment variables sudah diatur
- [ ] Supabase project sudah aktif
- [ ] Database schema sudah dijalankan
- [ ] Sample data sudah dimasukkan
- [ ] RLS policies sudah diatur
- [ ] Aplikasi sudah di-deploy
- [ ] Login test berhasil
- [ ] Semua fitur berfungsi

## Support

Jika mengalami masalah:
1. Periksa Vercel deployment logs
2. Periksa Supabase dashboard
3. Test environment variables
4. Hubungi support jika diperlukan
