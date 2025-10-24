'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  uptId: string
}

interface ImportData {
  nama_obat: string
  jumlah_digunakan: number
  penyakit_diobati: string
  jenis_hewan: string
  tanggal_penggunaan: string
  catatan?: string
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess, uptId }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResults(null)
    }
  }

  const parseExcelFile = (file: File): Promise<ImportData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          const parsedData: ImportData[] = jsonData.map((row: any) => ({
            nama_obat: row['Nama Obat'] || row['nama_obat'] || '',
            jumlah_digunakan: parseInt(row['Jumlah Digunakan'] || row['jumlah_digunakan'] || '0'),
            penyakit_diobati: row['Penyakit Diobati'] || row['penyakit_diobati'] || '',
            jenis_hewan: row['Jenis Hewan'] || row['jenis_hewan'] || '',
            tanggal_penggunaan: row['Tanggal Penggunaan'] || row['tanggal_penggunaan'] || '',
            catatan: row['Catatan'] || row['catatan'] || ''
          }))

          resolve(parsedData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsBinaryString(file)
    })
  }

  const validateData = (data: ImportData[]): string[] => {
    const errors: string[] = []
    
    data.forEach((row, index) => {
      if (!row.nama_obat) {
        errors.push(`Baris ${index + 2}: Nama obat harus diisi`)
      }
      if (!row.jumlah_digunakan || row.jumlah_digunakan <= 0) {
        errors.push(`Baris ${index + 2}: Jumlah digunakan harus lebih dari 0`)
      }
      if (!row.penyakit_diobati) {
        errors.push(`Baris ${index + 2}: Penyakit diobati harus diisi`)
      }
      if (!row.jenis_hewan) {
        errors.push(`Baris ${index + 2}: Jenis hewan harus diisi`)
      }
      if (!row.tanggal_penggunaan) {
        errors.push(`Baris ${index + 2}: Tanggal penggunaan harus diisi`)
      }
    })

    return errors
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setImportResults(null)

    try {
      // Parse Excel file
      const parsedData = await parseExcelFile(file)
      
      // Validate data
      const validationErrors = validateData(parsedData)
      if (validationErrors.length > 0) {
        setImportResults({
          success: 0,
          errors: validationErrors
        })
        setImporting(false)
        return
      }

      // Get medicines mapping
      const { data: medicines } = await supabase
        .from('medicines')
        .select('id, name')

      if (!medicines) {
        throw new Error('Tidak dapat mengambil data obat')
      }

      const medicineMap = new Map(medicines.map(m => [m.name.toLowerCase(), m.id]))
      const errors: string[] = []
      let successCount = 0

      // Import data
      for (const row of parsedData) {
        try {
          const medicineId = medicineMap.get(row.nama_obat.toLowerCase())
          if (!medicineId) {
            errors.push(`Obat "${row.nama_obat}" tidak ditemukan dalam database`)
            continue
          }

          const { error } = await supabase
            .from('medicine_usage')
            .insert({
              medicine_id: medicineId,
              upt_id: uptId,
              quantity_used: row.jumlah_digunakan,
              disease_treated: row.penyakit_diobati,
              animal_type: row.jenis_hewan,
              usage_date: row.tanggal_penggunaan,
              notes: row.catatan || null
            })

          if (error) {
            errors.push(`Gagal menyimpan data: ${error.message}`)
          } else {
            successCount++
          }
        } catch (error) {
          errors.push(`Error processing row: ${error}`)
        }
      }

      setImportResults({
        success: successCount,
        errors
      })

      if (successCount > 0) {
        onSuccess()
      }

    } catch (error) {
      setImportResults({
        success: 0,
        errors: [`Error parsing file: ${error}`]
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nama Obat': 'Amoxicillin',
        'Jumlah Digunakan': 10,
        'Penyakit Diobati': 'Infeksi saluran pernapasan',
        'Jenis Hewan': 'Sapi',
        'Tanggal Penggunaan': '2024-01-15',
        'Catatan': 'Pengobatan rutin'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    
    XLSX.writeFile(workbook, 'template_penggunaan_obat.xlsx')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Data Penggunaan Obat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Template Excel</h3>
            <p className="text-sm text-blue-700 mb-3">
              Download template Excel untuk format data yang benar
            </p>
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 mb-2">Pilih file Excel (.xlsx, .xls)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Pilih File
            </button>
            {file && (
              <p className="text-sm text-green-600 mt-2">
                File terpilih: {file.name}
              </p>
            )}
          </div>

          {/* Import Button */}
          {file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mengimport...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Data
                </>
              )}
            </button>
          )}

          {/* Results */}
          {importResults && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Hasil Import</h3>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">
                  Berhasil: {importResults.success} data
                </span>
              </div>
              {importResults.errors.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Error: {importResults.errors.length} data</span>
                  </div>
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700 max-h-32 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}