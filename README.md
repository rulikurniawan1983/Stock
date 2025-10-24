# Stock Obat Hewan - Sistem Manajemen Stock Obat Hewan

Aplikasi web untuk manajemen stock obat hewan yang digunakan oleh Dinas Peternakan dan 6 UPT Puskeswan. Sistem ini memungkinkan dinas untuk mengelola stock obat awal dan UPT untuk melaporkan penggunaan obat dengan detail penyakit dan jenis hewan yang diobati.

## 🚀 Fitur Utama

### Dashboard Dinas
- **Overview**: Statistik total obat, stock, dan penggunaan
- **Manajemen Obat**: Tambah, lihat, dan kelola daftar obat
- **Monitoring Penggunaan**: Pantau penggunaan obat oleh UPT
- **Manajemen UPT**: Daftar 6 UPT Puskeswan
- **Pelayanan Lapangan**: Lihat semua pelayanan lapangan hewan
- **Pelayanan Klinik Hewan**: Pantau pelayanan klinik hewan dari semua UPT

### Dashboard UPT Puskeswan
- **Overview**: Statistik obat tersedia dan penggunaan
- **Daftar Obat**: Lihat stock obat yang tersedia
- **Penggunaan Obat**: Input penggunaan obat dengan detail:
  - Nama obat yang digunakan
  - Jumlah yang digunakan
  - Penyakit yang diobati
  - Jenis hewan yang diobati
  - Tanggal penggunaan
  - Catatan tambahan
- **Form Terpadu (Rekomended)**: Form gabungan pelayanan lapangan dan pelayanan klinik hewan
- **Pelayanan Lapangan**: Form pencatatan pelayanan lapangan hewan (legacy)
- **Pelayanan Klinik Hewan**: Form pelayanan klinik hewan dengan anamnesis lengkap (legacy)

### Fitur Pelayanan Klinik Hewan
- **Data Pemilik Hewan**: Nama, telepon, alamat, desa, kecamatan
- **Data Hewan**: Nama, jenis, ras, usia, jenis kelamin, berat, warna
- **Anamnesis Lengkap**: Keluhan utama, anamnesis, pemeriksaan fisik
- **Diagnosis & Pengobatan**: Diagnosis, rencana pengobatan, catatan tindak lanjut
- **Penggunaan Obat**: Multiple obat dengan dosis, cara pemberian, catatan
- **Status Pelayanan**: Selesai, rawat jalan, rawat inap, rujukan

### 🆕 Form Terpadu Pelayanan Lapangan & Pelayanan Klinik Hewan
- **Informasi Umum**: Bulan, tanggal, nama pemilik, alamat desa & kecamatan
- **Informasi Hewan**: Nama, jenis, ras, usia, jenis kelamin, berat, warna
- **Jenis Ternak**: Kuantitas per jenis (Sapi, Kerbau, Kambing, Domba, Kucing, Kelinci, Ayam, Anjing, Lainnya)
- **Gejala Klinis**: 25+ gejala dengan checkbox (Scabies, Helmintiasis, ORF, Bloat, CRD/Snot, dll.)
- **Pelayanan Klinik Hewan**: Jenis pelayanan, keluhan, anamnesis, pemeriksaan fisik, diagnosis, rencana pengobatan
- **Pengobatan**: Jenis pengobatan, dosis per ekor, petugas, status hewan
- **Penggunaan Obat**: Multiple obat dengan dosis, cara pemberian, catatan
- **Integrasi Database**: Menyimpan ke 5 tabel sekaligus (animal_owners, animals, medical_records, health_services, health_service_medicines)

### Fitur Pelayanan Lapangan (Legacy)
- **Data Pemilik**: Nama, alamat desa, alamat kecamatan
- **Data Hewan**: Jenis ternak, total hewan
- **Gejala Klinis**: Multiple gejala yang dapat dipilih
- **Pengobatan**: Jenis pengobatan, dosis per ekor
- **Petugas**: Nama petugas yang menangani
- **Status**: Aktif, Pasif, Semi Aktif

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Deployment**: Vercel
- **Version Control**: GitHub

## 📋 Prerequisites

- Node.js 18+
- npm atau yarn
- Akun Supabase
- Akun GitHub
- Akun Vercel (untuk deployment)

## 🎯 Cara Mengakses Form Terpadu

### Dari Dashboard UPT:
1. Login ke dashboard UPT
2. Klik dropdown "Kesehatan Hewan" 
3. Pilih "**Form Terpadu (Rekomended)**"

### Dari Dashboard Dinas:
1. Login ke dashboard Dinas
2. Klik dropdown "Kesehatan Hewan"
3. Pilih "**Form Terpadu (Rekomended)**"

### URL Langsung:
- `/pelayanan-terpadu`

## 🚀 Instalasi dan Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd stock-obat-hewan
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy URL dan API keys dari project settings
3. Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Setup Database
```bash
# Jalankan script setup database
node scripts/setup-supabase.js
```

**Penting**: Setelah menjalankan script setup, jalankan SQL schema di Supabase dashboard:
1. Buka Supabase dashboard
2. Pergi ke SQL Editor
3. Copy dan paste isi file `supabase/schema.sql`
4. Jalankan SQL tersebut

### 5. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 👥 Akun Sample

Setelah menjalankan setup database, Anda dapat login dengan akun berikut:

### Admin Dinas
- **Email**: admin@yankes.com
- **Password**: admin123

### UPT Puskeswan (6 UPT)
- **Email**: upt1@yankes.com - **Password**: upt123 (UPT Puskeswan 1)
- **Email**: upt2@yankes.com - **Password**: upt123 (UPT Puskeswan 2)
- **Email**: upt3@yankes.com - **Password**: upt123 (UPT Puskeswan 3)
- **Email**: upt4@yankes.com - **Password**: upt123 (UPT Puskeswan 4)
- **Email**: upt5@yankes.com - **Password**: upt123 (UPT Puskeswan 5)
- **Email**: upt6@yankes.com - **Password**: upt123 (UPT Puskeswan 6)

## 🗄️ Database Schema

### Tabel Utama

1. **users** - Data pengguna (dinas dan UPT)
2. **upt** - Data UPT Puskeswan (6 UPT)
3. **medicines** - Data obat-obatan (20 obat sampel)
4. **medicine_usage** - Riwayat penggunaan obat
5. **medical_records** - Rekam medis hewan
6. **animal_owners** - Data pemilik hewan
7. **animals** - Data hewan
8. **health_services** - Pelayanan kesehatan hewan
9. **health_service_medicines** - Obat yang digunakan dalam pelayanan

### Relasi
- `users.upt_id` → `upt.id` (untuk user UPT)
- `medicine_usage.medicine_id` → `medicines.id`
- `medicine_usage.upt_id` → `upt.id`
- `animals.owner_id` → `animal_owners.id`
- `health_services.animal_id` → `animals.id`
- `health_services.upt_id` → `upt.id`
- `health_service_medicines.health_service_id` → `health_services.id`
- `health_service_medicines.medicine_id` → `medicines.id`

## 🔐 Sistem Keamanan

- **Row Level Security (RLS)** diaktifkan untuk semua tabel
- **Role-based access control**:
  - Dinas: Akses penuh ke semua data
  - UPT: Hanya akses data UPT mereka sendiri
- **Authentication** menggunakan Supabase Auth
- **Data Isolation**: Setiap UPT hanya melihat data wilayahnya

## 🚀 Deployment

### Deploy ke Vercel

1. Push kode ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy otomatis akan berjalan

### GitHub Actions

Workflow otomatis untuk:
- Build dan test aplikasi
- Deploy ke Vercel
- Setup environment variables

## 📱 Responsive Design

Aplikasi dirancang responsive untuk:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Development

### Struktur Project
```
├── app/                           # Next.js App Router
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── dinas/                    # Dinas dashboard
│   ├── upt/                      # UPT dashboard
│   ├── rekam-medis/              # Rekam medis pages
│   └── pelayanan-kesehatan/      # Pelayanan kesehatan pages
├── components/                   # React components
│   ├── AuthProvider.tsx          # Authentication context
│   ├── DinasDashboard.tsx        # Dinas dashboard
│   ├── UPTDashboard.tsx          # UPT dashboard
│   ├── MedicalRecordForm.tsx     # Form rekam medis
│   ├── HealthServiceForm.tsx    # Form pelayanan kesehatan
│   ├── PageHeader.tsx            # Page header component
│   └── Breadcrumb.tsx            # Breadcrumb navigation
├── lib/                          # Utilities dan Supabase client
├── supabase/                     # Database schema
├── scripts/                      # Setup scripts
└── .github/                      # GitHub Actions
```

### Scripts Available
```bash
npm run dev          # Development server
npm run build        # Build production
npm run start        # Start production server
npm run lint         # ESLint
```

## 📊 Data Sampel

Aplikasi dilengkapi dengan data sampel yang lengkap:

### Obat-obatan (20 obat)
- Antibiotik: Amoxicillin, Penicillin, Tetracycline, Gentamicin, Ciprofloxacin
- Vitamin: B Kompleks, C, A, D3, E
- Antiseptik: Povidone Iodine, Chlorhexidine, Betadine, Alkohol 70%, Hidrogen Peroksida
- Obat Cacing: Albendazole, Mebendazole, Pyrantel, Ivermectin, Fenbendazole

### Data Hewan (6 hewan)
- Sapi, Kambing, Ayam, Kucing, Anjing, Domba

### Pelayanan Kesehatan (6 pelayanan)
- Pemeriksaan, Pengobatan, Vaksinasi, Operasi, Konsultasi

### Rekam Medis (6 rekam medis)
- Berbagai jenis hewan dengan gejala klinis yang berbeda

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk pertanyaan atau dukungan, silakan hubungi:
- Email: support@yankes.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## 🔄 Changelog

### v2.1.0
- ✅ **Form Terpadu Pelayanan Lapangan & Pelayanan Klinik Hewan** - Form gabungan yang efisien
- ✅ **Excel Import untuk Penggunaan Obat** - Import data bulk dengan template
- ✅ **Security Fix** - Mengganti xlsx dengan exceljs untuk keamanan
- ✅ **Enhanced Navigation** - Form terpadu sebagai opsi rekomended
- ✅ **Integrated Database** - Menyimpan ke 5 tabel sekaligus
- ✅ **25+ Gejala Klinis** - Checkbox untuk gejala yang komprehensif
- ✅ **Multiple Medicine Support** - Bisa tambah banyak obat dalam satu form
- ✅ **Color-coded Sections** - Interface yang lebih user-friendly

### v2.0.0
- ✅ Fitur Pelayanan Klinik Hewan
- ✅ Fitur Pelayanan Lapangan
- ✅ Data sampel lengkap (20 obat, 6 hewan, 6 pelayanan)
- ✅ 6 UPT Puskeswan
- ✅ Navigasi dan logout yang konsisten
- ✅ Form anamnesis lengkap
- ✅ Multiple medicine usage
- ✅ Auto-stock update

### v1.0.0
- ✅ Initial release
- ✅ Dashboard Dinas dan UPT
- ✅ Sistem autentikasi
- ✅ Manajemen stock obat
- ✅ Laporan penggunaan obat
- ✅ Integrasi Supabase
- ✅ Deployment otomatis

---

**Dibuat dengan ❤️ untuk Dinas Peternakan dan UPT Puskeswan**