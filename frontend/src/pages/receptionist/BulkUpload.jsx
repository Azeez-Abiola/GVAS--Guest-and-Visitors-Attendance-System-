import { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Download, ArrowLeft, X, Loader2, UserPlus, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import TimePicker from '../../components/TimePicker'
import ApiService from '../../services/api'

const PURPOSES = ['Business Meeting', 'Interview', 'Delivery', 'Maintenance', 'Personal Visit', 'Other']

const emptyVisitor = {
  name: '', host: '', purpose: '', email: '', phone: '', company: '', floor: '', check_in_time: '', check_out_time: ''
}

const BulkUpload = () => {
  const [mode, setMode] = useState('manual') // 'csv' or 'manual'
  const [visitDate, setVisitDate] = useState('2026-04-01')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [hosts, setHosts] = useState([])

  // CSV state
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)

  // Manual entry state
  const [visitors, setVisitors] = useState([{ ...emptyVisitor }])
  const [savedVisitors, setSavedVisitors] = useState([])

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    try {
      const data = await ApiService.getHosts()
      setHosts(data || [])
    } catch (err) {
      console.error('Failed to load hosts:', err)
    }
  }

  // --- CSV handlers ---
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }
    setFile(selectedFile)
    setError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row = {}
        headers.forEach((h, i) => { row[h] = values[i] || '' })
        return row
      })
      setPreview({ headers, rows, totalRows: lines.length - 1 })
    }
    reader.readAsText(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleCSVUpload = async () => {
    if (!file || !visitDate) {
      setError('Please select a CSV file and visit date')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await ApiService.bulkUploadVisitors(file, visitDate)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'name,host,purpose,email,phone,company,floor,check_in_time,check_out_time\nJohn Doe,Jane Smith,Business Meeting,john@email.com,08012345678,Acme Corp,3,09:00,17:00\nMary Johnson,Jane Smith,Interview,,08098765432,,3,10:30,12:00'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'visitor_upload_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Manual entry handlers ---
  const updateVisitor = (index, field, value) => {
    const updated = [...visitors]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-fill floor when host is selected
    if (field === 'host') {
      const selectedHost = hosts.find(h => h.name === value)
      if (selectedHost?.floor_number) {
        updated[index].floor = String(selectedHost.floor_number)
      }
    }

    setVisitors(updated)
  }

  const addVisitorRow = () => {
    setVisitors([...visitors, { ...emptyVisitor }])
  }

  const removeVisitorRow = (index) => {
    if (visitors.length === 1) return
    setVisitors(visitors.filter((_, i) => i !== index))
  }

  const validateVisitor = (v) => {
    return v.name.trim() && v.host.trim() && v.purpose.trim()
  }

  const handleManualSubmit = async () => {
    const validVisitors = visitors.filter(validateVisitor)
    if (validVisitors.length === 0) {
      setError('Please fill in at least one visitor with name, host, and purpose')
      return
    }
    if (!visitDate) {
      setError('Please select a visit date')
      return
    }

    // Build CSV from manual entries
    const headers = 'name,host,purpose,email,phone,company,floor,check_in_time,check_out_time'
    const rows = validVisitors.map(v =>
      `"${v.name}","${v.host}","${v.purpose}","${v.email}","${v.phone}","${v.company}","${v.floor}","${v.check_in_time}","${v.check_out_time}"`
    )
    const csvContent = [headers, ...rows].join('\n')
    const csvFile = new File([csvContent], 'manual_entry.csv', { type: 'text/csv' })

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await ApiService.bulkUploadVisitors(csvFile, visitDate)
      setResult(data)
      if (data.success > 0) {
        setSavedVisitors(prev => [...prev, ...validVisitors.map(v => ({ ...v, status: 'saved' }))])
        setVisitors([{ ...emptyVisitor }])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setPreview(null)
    setVisitors([{ ...emptyVisitor }])
    setSavedVisitors([])
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Visitor Upload</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add visitor records for a past date — type them in manually or upload a CSV file
          </p>
        </div>

        {/* Date Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Select Visit Date
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Choose the date when these visitors actually came in
          </p>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mode Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Choose Entry Method
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => { setMode('manual'); setError(null); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 transition-all ${
                mode === 'manual'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-600 dark:text-gray-400'
              }`}
            >
              <UserPlus className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Type Manually</p>
                <p className="text-xs opacity-75">Enter visitors one by one</p>
              </div>
            </button>
            <button
              onClick={() => { setMode('csv'); setError(null); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 transition-all ${
                mode === 'csv'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Upload className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Upload CSV</p>
                <p className="text-xs opacity-75">Upload a spreadsheet file</p>
              </div>
            </button>
          </div>
        </div>

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Enter Visitor Details
            </h2>

            {/* Previously saved visitors in this session */}
            {savedVisitors.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 mb-5">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Saved in this session: {savedVisitors.length} visitor(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedVisitors.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
                      {v.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {visitors.map((visitor, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-5 relative">
                  {visitors.length > 1 && (
                    <button
                      onClick={() => removeVisitorRow(index)}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {visitors.length > 1 && (
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-3">Visitor {index + 1}</p>
                  )}

                  {/* Row 1: Name, Host, Purpose */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={visitor.name}
                        onChange={(e) => updateVisitor(index, 'name', e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Host <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={visitor.host}
                        onChange={(e) => updateVisitor(index, 'host', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select host</option>
                        {hosts.map(h => (
                          <option key={h.id} value={h.name}>{h.name} — Floor {h.floor_number}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Purpose <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={visitor.purpose}
                        onChange={(e) => updateVisitor(index, 'purpose', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select purpose</option>
                        {PURPOSES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Email, Phone, Company */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={visitor.email}
                        onChange={(e) => updateVisitor(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={visitor.phone}
                        onChange={(e) => updateVisitor(index, 'phone', e.target.value)}
                        placeholder="08012345678"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={visitor.company}
                        onChange={(e) => updateVisitor(index, 'company', e.target.value)}
                        placeholder="Company name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Row 3: Floor, Check-in time, Check-out time */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Floor</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={visitor.floor}
                        onChange={(e) => updateVisitor(index, 'floor', e.target.value)}
                        placeholder="e.g. 3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <TimePicker
                      label="Check-in Time"
                      size="sm"
                      value={visitor.check_in_time}
                      onChange={(val) => updateVisitor(index, 'check_in_time', val)}
                      placeholder="Check-in"
                    />
                    <TimePicker
                      label="Check-out Time"
                      size="sm"
                      value={visitor.check_out_time}
                      onChange={(val) => updateVisitor(index, 'check_out_time', val)}
                      placeholder="Check-out"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add another + Submit */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={addVisitorRow}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Another Visitor
              </button>
              <div className="flex-1" />
              <button
                onClick={handleManualSubmit}
                disabled={loading || !visitors.some(validateVisitor)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save {visitors.filter(validateVisitor).length} Visitor(s) for {visitDate}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CSV Upload Mode */}
        {mode === 'csv' && (
          <>
            {/* CSV Instructions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Prepare Your CSV
              </h2>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Required columns:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['name', 'host', 'purpose'].map(col => (
                    <span key={col} className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-xs font-medium">
                      {col} *
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Optional columns:</p>
                <div className="flex flex-wrap gap-2">
                  {['email', 'phone', 'company', 'floor', 'check_in_time', 'check_out_time'].map(col => (
                    <span key={col} className="px-2.5 py-1 bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium">
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Times should be in HH:MM format (e.g., 09:00, 14:30). If no check-in time is provided, it defaults to 09:00.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>

            {/* CSV Upload */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Upload CSV File
              </h2>

              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
                    ${dragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  onClick={() => document.getElementById('csv-input').click()}
                >
                  <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Drag & drop your CSV file here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Only .csv files, max 5MB</p>
                  <input
                    id="csv-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB {preview && `\u2022 ${preview.totalRows} visitor(s)`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { setFile(null); setPreview(null) }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {preview && (
                    <div className="overflow-x-auto mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Preview (showing first {preview.rows.length} of {preview.totalRows} rows):
                      </p>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            {preview.headers.map((h, i) => (
                              <th key={i} className="text-left px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-slate-600">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.rows.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-slate-700">
                              {preview.headers.map((h, j) => (
                                <td key={j} className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {row[h] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button
                    onClick={handleCSVUpload}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading visitors...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload {preview?.totalRows || 0} Visitor(s) for {visitDate}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mode === 'manual' ? 'Visitors Saved' : 'Upload Complete'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{result.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.success}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Successful</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.errors?.length || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Errors:</p>
                  <ul className="space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-sm text-red-600 dark:text-red-400">
                        Row {err.row}: {err.error} ({err.data})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mode === 'manual' && result.success > 0 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  You can continue adding more visitors above, or you're done.
                </p>
              )}

              {mode === 'csv' && (
                <button
                  onClick={resetForm}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Upload Another File
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default BulkUpload
