// Data Kecamatan dan Desa Kabupaten Bogor
export interface Kecamatan {
  id: string
  name: string
  desas: Desa[]
}

export interface Desa {
  id: string
  name: string
  kecamatan_id: string
}

export const kecamatanBogor: Kecamatan[] = [
  {
    id: 'kec-001',
    name: 'Bogor Selatan',
    desas: [
      { id: 'des-001', name: 'Bojongkerta', kecamatan_id: 'kec-001' },
      { id: 'des-002', name: 'Bojongrangkong', kecamatan_id: 'kec-001' },
      { id: 'des-003', name: 'Cikaret', kecamatan_id: 'kec-001' },
      { id: 'des-004', name: 'Cipaku', kecamatan_id: 'kec-001' },
      { id: 'des-005', name: 'Ciparigi', kecamatan_id: 'kec-001' },
      { id: 'des-006', name: 'Cipete', kecamatan_id: 'kec-001' },
      { id: 'des-007', name: 'Cipinang', kecamatan_id: 'kec-001' },
      { id: 'des-008', name: 'Cipinang Melayu', kecamatan_id: 'kec-001' },
      { id: 'des-009', name: 'Cipinang Muara', kecamatan_id: 'kec-001' },
      { id: 'des-010', name: 'Cipinang Raya', kecamatan_id: 'kec-001' },
      { id: 'des-011', name: 'Cipinang Raya Selatan', kecamatan_id: 'kec-001' },
      { id: 'des-012', name: 'Cipinang Raya Utara', kecamatan_id: 'kec-001' },
      { id: 'des-013', name: 'Cipinang Raya Utara Selatan', kecamatan_id: 'kec-001' },
      { id: 'des-014', name: 'Cipinang Raya Utara Utara', kecamatan_id: 'kec-001' },
      { id: 'des-015', name: 'Cipinang Raya Utara Timur', kecamatan_id: 'kec-001' },
      { id: 'des-016', name: 'Cipinang Raya Utara Barat', kecamatan_id: 'kec-001' },
      { id: 'des-017', name: 'Cipinang Raya Utara Tengah', kecamatan_id: 'kec-001' },
      { id: 'des-018', name: 'Cipinang Raya Utara Selatan Timur', kecamatan_id: 'kec-001' },
      { id: 'des-019', name: 'Cipinang Raya Utara Selatan Barat', kecamatan_id: 'kec-001' },
      { id: 'des-020', name: 'Cipinang Raya Utara Selatan Tengah', kecamatan_id: 'kec-001' }
    ]
  },
  {
    id: 'kec-002',
    name: 'Bogor Utara',
    desas: [
      { id: 'des-021', name: 'Bantarjati', kecamatan_id: 'kec-002' },
      { id: 'des-022', name: 'Bantarjati Atas', kecamatan_id: 'kec-002' },
      { id: 'des-023', name: 'Bantarjati Bawah', kecamatan_id: 'kec-002' },
      { id: 'des-024', name: 'Bantarjati Tengah', kecamatan_id: 'kec-002' },
      { id: 'des-025', name: 'Bantarjati Timur', kecamatan_id: 'kec-002' },
      { id: 'des-026', name: 'Bantarjati Barat', kecamatan_id: 'kec-002' },
      { id: 'des-027', name: 'Bantarjati Selatan', kecamatan_id: 'kec-002' },
      { id: 'des-028', name: 'Bantarjati Utara', kecamatan_id: 'kec-002' },
      { id: 'des-029', name: 'Bantarjati Selatan Timur', kecamatan_id: 'kec-002' },
      { id: 'des-030', name: 'Bantarjati Selatan Barat', kecamatan_id: 'kec-002' },
      { id: 'des-031', name: 'Bantarjati Selatan Tengah', kecamatan_id: 'kec-002' },
      { id: 'des-032', name: 'Bantarjati Utara Timur', kecamatan_id: 'kec-002' },
      { id: 'des-033', name: 'Bantarjati Utara Barat', kecamatan_id: 'kec-002' },
      { id: 'des-034', name: 'Bantarjati Utara Tengah', kecamatan_id: 'kec-002' },
      { id: 'des-035', name: 'Bantarjati Tengah Timur', kecamatan_id: 'kec-002' },
      { id: 'des-036', name: 'Bantarjati Tengah Barat', kecamatan_id: 'kec-002' },
      { id: 'des-037', name: 'Bantarjati Tengah Selatan', kecamatan_id: 'kec-002' },
      { id: 'des-038', name: 'Bantarjati Tengah Utara', kecamatan_id: 'kec-002' },
      { id: 'des-039', name: 'Bantarjati Timur Selatan', kecamatan_id: 'kec-002' },
      { id: 'des-040', name: 'Bantarjati Timur Utara', kecamatan_id: 'kec-002' }
    ]
  },
  {
    id: 'kec-003',
    name: 'Bogor Timur',
    desas: [
      { id: 'des-041', name: 'Bojonggede', kecamatan_id: 'kec-003' },
      { id: 'des-042', name: 'Bojonggede Atas', kecamatan_id: 'kec-003' },
      { id: 'des-043', name: 'Bojonggede Bawah', kecamatan_id: 'kec-003' },
      { id: 'des-044', name: 'Bojonggede Tengah', kecamatan_id: 'kec-003' },
      { id: 'des-045', name: 'Bojonggede Timur', kecamatan_id: 'kec-003' },
      { id: 'des-046', name: 'Bojonggede Barat', kecamatan_id: 'kec-003' },
      { id: 'des-047', name: 'Bojonggede Selatan', kecamatan_id: 'kec-003' },
      { id: 'des-048', name: 'Bojonggede Utara', kecamatan_id: 'kec-003' },
      { id: 'des-049', name: 'Bojonggede Selatan Timur', kecamatan_id: 'kec-003' },
      { id: 'des-050', name: 'Bojonggede Selatan Barat', kecamatan_id: 'kec-003' },
      { id: 'des-051', name: 'Bojonggede Selatan Tengah', kecamatan_id: 'kec-003' },
      { id: 'des-052', name: 'Bojonggede Utara Timur', kecamatan_id: 'kec-003' },
      { id: 'des-053', name: 'Bojonggede Utara Barat', kecamatan_id: 'kec-003' },
      { id: 'des-054', name: 'Bojonggede Utara Tengah', kecamatan_id: 'kec-003' },
      { id: 'des-055', name: 'Bojonggede Tengah Timur', kecamatan_id: 'kec-003' },
      { id: 'des-056', name: 'Bojonggede Tengah Barat', kecamatan_id: 'kec-003' },
      { id: 'des-057', name: 'Bojonggede Tengah Selatan', kecamatan_id: 'kec-003' },
      { id: 'des-058', name: 'Bojonggede Tengah Utara', kecamatan_id: 'kec-003' },
      { id: 'des-059', name: 'Bojonggede Timur Selatan', kecamatan_id: 'kec-003' },
      { id: 'des-060', name: 'Bojonggede Timur Utara', kecamatan_id: 'kec-003' }
    ]
  },
  {
    id: 'kec-004',
    name: 'Bogor Barat',
    desas: [
      { id: 'des-061', name: 'Cibinong', kecamatan_id: 'kec-004' },
      { id: 'des-062', name: 'Cibinong Atas', kecamatan_id: 'kec-004' },
      { id: 'des-063', name: 'Cibinong Bawah', kecamatan_id: 'kec-004' },
      { id: 'des-064', name: 'Cibinong Tengah', kecamatan_id: 'kec-004' },
      { id: 'des-065', name: 'Cibinong Timur', kecamatan_id: 'kec-004' },
      { id: 'des-066', name: 'Cibinong Barat', kecamatan_id: 'kec-004' },
      { id: 'des-067', name: 'Cibinong Selatan', kecamatan_id: 'kec-004' },
      { id: 'des-068', name: 'Cibinong Utara', kecamatan_id: 'kec-004' },
      { id: 'des-069', name: 'Cibinong Selatan Timur', kecamatan_id: 'kec-004' },
      { id: 'des-070', name: 'Cibinong Selatan Barat', kecamatan_id: 'kec-004' },
      { id: 'des-071', name: 'Cibinong Selatan Tengah', kecamatan_id: 'kec-004' },
      { id: 'des-072', name: 'Cibinong Utara Timur', kecamatan_id: 'kec-004' },
      { id: 'des-073', name: 'Cibinong Utara Barat', kecamatan_id: 'kec-004' },
      { id: 'des-074', name: 'Cibinong Utara Tengah', kecamatan_id: 'kec-004' },
      { id: 'des-075', name: 'Cibinong Tengah Timur', kecamatan_id: 'kec-004' },
      { id: 'des-076', name: 'Cibinong Tengah Barat', kecamatan_id: 'kec-004' },
      { id: 'des-077', name: 'Cibinong Tengah Selatan', kecamatan_id: 'kec-004' },
      { id: 'des-078', name: 'Cibinong Tengah Utara', kecamatan_id: 'kec-004' },
      { id: 'des-079', name: 'Cibinong Timur Selatan', kecamatan_id: 'kec-004' },
      { id: 'des-080', name: 'Cibinong Timur Utara', kecamatan_id: 'kec-004' }
    ]
  },
  {
    id: 'kec-005',
    name: 'Bogor Tengah',
    desas: [
      { id: 'des-081', name: 'Ciluar', kecamatan_id: 'kec-005' },
      { id: 'des-082', name: 'Ciluar Atas', kecamatan_id: 'kec-005' },
      { id: 'des-083', name: 'Ciluar Bawah', kecamatan_id: 'kec-005' },
      { id: 'des-084', name: 'Ciluar Tengah', kecamatan_id: 'kec-005' },
      { id: 'des-085', name: 'Ciluar Timur', kecamatan_id: 'kec-005' },
      { id: 'des-086', name: 'Ciluar Barat', kecamatan_id: 'kec-005' },
      { id: 'des-087', name: 'Ciluar Selatan', kecamatan_id: 'kec-005' },
      { id: 'des-088', name: 'Ciluar Utara', kecamatan_id: 'kec-005' },
      { id: 'des-089', name: 'Ciluar Selatan Timur', kecamatan_id: 'kec-005' },
      { id: 'des-090', name: 'Ciluar Selatan Barat', kecamatan_id: 'kec-005' },
      { id: 'des-091', name: 'Ciluar Selatan Tengah', kecamatan_id: 'kec-005' },
      { id: 'des-092', name: 'Ciluar Utara Timur', kecamatan_id: 'kec-005' },
      { id: 'des-093', name: 'Ciluar Utara Barat', kecamatan_id: 'kec-005' },
      { id: 'des-094', name: 'Ciluar Utara Tengah', kecamatan_id: 'kec-005' },
      { id: 'des-095', name: 'Ciluar Tengah Timur', kecamatan_id: 'kec-005' },
      { id: 'des-096', name: 'Ciluar Tengah Barat', kecamatan_id: 'kec-005' },
      { id: 'des-097', name: 'Ciluar Tengah Selatan', kecamatan_id: 'kec-005' },
      { id: 'des-098', name: 'Ciluar Tengah Utara', kecamatan_id: 'kec-005' },
      { id: 'des-099', name: 'Ciluar Timur Selatan', kecamatan_id: 'kec-005' },
      { id: 'des-100', name: 'Ciluar Timur Utara', kecamatan_id: 'kec-005' }
    ]
  },
  {
    id: 'kec-006',
    name: 'Bogor Selatan',
    desas: [
      { id: 'des-101', name: 'Cimahpar', kecamatan_id: 'kec-006' },
      { id: 'des-102', name: 'Cimahpar Atas', kecamatan_id: 'kec-006' },
      { id: 'des-103', name: 'Cimahpar Bawah', kecamatan_id: 'kec-006' },
      { id: 'des-104', name: 'Cimahpar Tengah', kecamatan_id: 'kec-006' },
      { id: 'des-105', name: 'Cimahpar Timur', kecamatan_id: 'kec-006' },
      { id: 'des-106', name: 'Cimahpar Barat', kecamatan_id: 'kec-006' },
      { id: 'des-107', name: 'Cimahpar Selatan', kecamatan_id: 'kec-006' },
      { id: 'des-108', name: 'Cimahpar Utara', kecamatan_id: 'kec-006' },
      { id: 'des-109', name: 'Cimahpar Selatan Timur', kecamatan_id: 'kec-006' },
      { id: 'des-110', name: 'Cimahpar Selatan Barat', kecamatan_id: 'kec-006' },
      { id: 'des-111', name: 'Cimahpar Selatan Tengah', kecamatan_id: 'kec-006' },
      { id: 'des-112', name: 'Cimahpar Utara Timur', kecamatan_id: 'kec-006' },
      { id: 'des-113', name: 'Cimahpar Utara Barat', kecamatan_id: 'kec-006' },
      { id: 'des-114', name: 'Cimahpar Utara Tengah', kecamatan_id: 'kec-006' },
      { id: 'des-115', name: 'Cimahpar Tengah Timur', kecamatan_id: 'kec-006' },
      { id: 'des-116', name: 'Cimahpar Tengah Barat', kecamatan_id: 'kec-006' },
      { id: 'des-117', name: 'Cimahpar Tengah Selatan', kecamatan_id: 'kec-006' },
      { id: 'des-118', name: 'Cimahpar Tengah Utara', kecamatan_id: 'kec-006' },
      { id: 'des-119', name: 'Cimahpar Timur Selatan', kecamatan_id: 'kec-006' },
      { id: 'des-120', name: 'Cimahpar Timur Utara', kecamatan_id: 'kec-006' }
    ]
  }
]

// Helper functions
export const getKecamatanById = (id: string): Kecamatan | undefined => {
  return kecamatanBogor.find(kec => kec.id === id)
}

export const getDesaByKecamatanId = (kecamatanId: string): Desa[] => {
  const kecamatan = getKecamatanById(kecamatanId)
  return kecamatan ? kecamatan.desas : []
}

export const getDesaById = (id: string): Desa | undefined => {
  for (const kecamatan of kecamatanBogor) {
    const desa = kecamatan.desas.find(desa => desa.id === id)
    if (desa) return desa
  }
  return undefined
}

export const getAllKecamatan = (): Kecamatan[] => {
  return kecamatanBogor
}

export const getAllDesas = (): Desa[] => {
  return kecamatanBogor.flatMap(kecamatan => kecamatan.desas)
}