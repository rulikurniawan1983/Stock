# Deploy ke Vercel - Panduan Lengkap

## 🚀 **Cara Deploy Aplikasi ke Vercel**

### **📋 Prerequisites:**

- ✅ GitHub repository sudah ada
- ✅ Kode sudah di-push ke GitHub
- ✅ Supabase project sudah aktif
- ✅ Environment variables sudah siap

### **🛠️ Step-by-Step Deployment:**

#### **Step 1: Buka Vercel Dashboard**

1. **Kunjungi:** https://vercel.com/dashboard
2. **Login** dengan akun GitHub
3. **Klik "New Project"**

#### **Step 2: Connect GitHub Repository**

1. **Pilih repository:** `rulikurniawan1983/Stock`
2. **Klik "Import"**
3. **Set framework preset:** Next.js
4. **Klik "Deploy"**

#### **Step 3: Konfigurasi Project**

**Framework Preset:** Next.js
**Root Directory:** ./
**Build Command:** npm run build
**Output Directory:** .next
**Install Command:** npm install

#### **Step 4: Set Environment Variables**

**Tambahkan environment variables:**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Cara mengatur:**
1. Klik "Environment Variables"
2. Tambahkan ketiga variables di atas
3. Set Environment: Production, Preview, Development
4. Klik "Save"

#### **Step 5: Deploy Project**

1. **Klik "Deploy"**
2. **Tunggu build selesai** (5-10 menit)
3. **Periksa deployment logs**
4. **Test aplikasi**

### **🔧 Troubleshooting:**

#### **Error: DEPLOYMENT_NOT_FOUND**

**Solusi:**
1. Pastikan repository sudah terhubung
2. Periksa branch yang digunakan
3. Pastikan file ada di repository
4. Redeploy project

#### **Error: Build Failed**

**Solusi:**
1. Periksa build logs di Vercel
2. Pastikan package.json dependencies benar
3. Set environment variables
4. Redeploy project

#### **Error: Environment Variables Missing**

**Solusi:**
1. Set environment variables di Vercel dashboard
2. Pastikan nama variable benar
3. Redeploy setelah mengatur variables

### **📱 Manual Deploy Steps:**

#### **Option 1: Vercel Dashboard**

1. **Buka Vercel Dashboard**
2. **Klik "New Project"**
3. **Pilih GitHub repository**
4. **Set framework: Next.js**
5. **Set environment variables**
6. **Klik "Deploy"**

#### **Option 2: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from local
vercel

# Deploy to production
vercel --prod
```

### **🔗 Useful Links:**

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Repository](https://github.com/rulikurniawan1983/Stock)

### **📞 Support:**

Jika masih mengalami masalah:

1. **Periksa Vercel dashboard**
2. **Periksa GitHub repository**
3. **Test build lokal**
4. **Hubungi support jika diperlukan**

---

**Setelah mengikuti panduan ini, aplikasi akan berhasil di-deploy ke Vercel!** 🎉
