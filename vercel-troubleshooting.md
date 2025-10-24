# Vercel Troubleshooting Guide

## 🔧 **Error 404 NOT_FOUND - Solusi Lengkap**

### **🔍 Diagnosa Error:**

Error `404: NOT_FOUND` di Vercel biasanya disebabkan oleh:

1. **Environment Variables tidak diatur**
2. **Build error yang tidak terdeteksi**
3. **Routing issue dengan Next.js App Router**
4. **Supabase client initialization error**

### **🛠️ Solusi Step-by-Step:**

#### **Step 1: Periksa Environment Variables**

**Pastikan environment variables sudah diatur dengan benar di Vercel dashboard:**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Cara mengatur:**
1. Buka Vercel dashboard
2. Pilih project Anda
3. Pergi ke Settings > Environment Variables
4. Tambahkan ketiga variables di atas
5. Pastikan Environment: Production, Preview, Development

#### **Step 2: Periksa Build Logs**

1. **Buka Vercel Dashboard**
2. **Pilih project Anda**
3. **Klik tab "Deployments"**
4. **Klik pada deployment terbaru**
5. **Periksa build logs untuk error**

**Error yang mungkin muncul:**
- `Your project's URL and API key are required`
- `Failed to fetch`
- `User not found`
- `Permission denied`

#### **Step 3: Redeploy dengan Environment Variables**

1. **Set Environment Variables** (jika belum)
2. **Klik "Redeploy"** di Vercel dashboard
3. **Tunggu build selesai**
4. **Test aplikasi**

#### **Step 4: Periksa Supabase Configuration**

**Pastikan Supabase project sudah dikonfigurasi dengan benar:**

1. **Buka Supabase Dashboard**
2. **Pilih project Anda**
3. **Pergi ke Settings > API**
4. **Copy URL dan keys yang benar**

**URL Format:**
```
https://your-project-id.supabase.co
```

**Keys Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Step 5: Test Environment Variables**

**Buat file test untuk memverifikasi environment variables:**

```javascript
// Test di browser console
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### **🔧 Common Fixes:**

#### **Fix 1: Environment Variables Not Set**

**Error:** `Your project's URL and API key are required`

**Solusi:**
1. Pastikan environment variables sudah diatur di Vercel
2. Redeploy project setelah mengatur variables
3. Periksa tidak ada typo dalam nama variable

#### **Fix 2: Supabase Project Not Active**

**Error:** `Failed to fetch`

**Solusi:**
1. Periksa Supabase project status
2. Pastikan project tidak paused
3. Periksa network connectivity

#### **Fix 3: RLS Policies Not Set**

**Error:** `Permission denied`

**Solusi:**
1. Jalankan SQL schema di Supabase dashboard
2. Pastikan RLS policies sudah diatur
3. Periksa user permissions

#### **Fix 4: User Not Found**

**Error:** `User not found`

**Solusi:**
1. Jalankan setup script: `node scripts/setup-supabase.js`
2. Buat user manual di Supabase Auth
3. Periksa user table di database

### **📋 Deployment Checklist:**

- [ ] Environment variables sudah diatur
- [ ] Supabase project sudah aktif
- [ ] Database schema sudah dijalankan
- [ ] Sample data sudah dimasukkan
- [ ] RLS policies sudah diatur
- [ ] Build berhasil tanpa error
- [ ] Deployment berhasil
- [ ] Aplikasi dapat diakses
- [ ] Login berfungsi
- [ ] Semua fitur berfungsi

### **🚀 Quick Fix Commands:**

```bash
# Test build lokal
npm run build

# Test development server
npm run dev

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **📞 Support:**

Jika masih mengalami masalah:

1. **Periksa Vercel deployment logs**
2. **Periksa Supabase dashboard**
3. **Test environment variables**
4. **Hubungi support jika diperlukan**

### **🔗 Useful Links:**

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Repository](https://github.com/rulikurniawan1983/Stock)

---

**Setelah mengikuti panduan ini, error 404 NOT_FOUND seharusnya sudah teratasi!** 🎉

