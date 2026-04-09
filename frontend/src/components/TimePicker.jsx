import { useState, useRef, useEffect } from 'react'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'

/**
 * Universal TimePicker component for GVAS
 *
 * Props:
 *   value    - time string in "HH:mm" 24h format (e.g. "09:00", "14:30")
 *   onChange  - callback with new time string in "HH:mm" 24h format
 *   label     - optional label text
 *   required  - show required asterisk
 *   placeholder - placeholder text
 *   className - additional wrapper classes
 *   size      - "sm" | "md" (default "md")
 */
const TimePicker = ({ value = '', onChange, label, required, placeholder = 'Select time', className = '', size = 'md' }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Parse value into hour, minute, period
  const parseTime = (val) => {
    if (!val) return { hour: 9, minute: 0, period: 'AM' }
    const [h, m] = val.split(':').map(Number)
    return {
      hour: h === 0 ? 12 : h > 12 ? h - 12 : h,
      minute: m || 0,
      period: h >= 12 ? 'PM' : 'AM'
    }
  }

  const { hour, minute, period } = parseTime(value)

  const to24h = (h, m, p) => {
    let h24 = h
    if (p === 'AM' && h === 12) h24 = 0
    else if (p === 'PM' && h !== 12) h24 = h + 12
    return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const updateTime = (newHour, newMinute, newPeriod) => {
    onChange(to24h(newHour, newMinute, newPeriod))
  }

  const cycleHour = (dir) => {
    let h = hour + dir
    if (h > 12) h = 1
    if (h < 1) h = 12
    updateTime(h, minute, period)
  }

  const cycleMinute = (dir) => {
    let m = minute + dir * 15
    if (m >= 60) m = 0
    if (m < 0) m = 45
    updateTime(hour, m, period)
  }

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM'
    updateTime(hour, minute, newPeriod)
  }

  const selectQuickTime = (timeStr) => {
    onChange(timeStr)
    setOpen(false)
  }

  // Format display
  const displayTime = value
    ? `${hour}:${String(minute).padStart(2, '0')} ${period}`
    : ''

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const quickTimes = [
    { label: '8:00 AM', value: '08:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '1:00 PM', value: '13:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '6:00 PM', value: '18:00' },
  ]

  const isSmall = size === 'sm'

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label className={`block font-medium text-gray-600 dark:text-gray-400 mb-1 ${isSmall ? 'text-xs' : 'text-sm'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-left transition-all
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-gray-400 dark:hover:border-slate-500
          ${isSmall ? 'px-3 py-2 text-sm' : 'px-4 py-2.5'}
          ${open ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
      >
        <Clock className={`text-gray-400 dark:text-gray-500 flex-shrink-0 ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        {displayTime ? (
          <span className="text-gray-900 dark:text-white font-medium">{displayTime}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Spinner Controls */}
          <div className="p-4">
            <div className="flex items-center justify-center gap-2">
              {/* Hour */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => cycleHour(1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <div className="w-14 h-14 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-xl text-2xl font-bold text-gray-900 dark:text-white">
                  {String(hour).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => cycleHour(-1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mt-[-2px]">:</span>

              {/* Minute */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => cycleMinute(1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <div className="w-14 h-14 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-xl text-2xl font-bold text-gray-900 dark:text-white">
                  {String(minute).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => cycleMinute(-1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* AM/PM Toggle */}
              <div className="flex flex-col items-center ml-2">
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <div
                  onClick={togglePeriod}
                  className="w-14 h-14 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-xl text-lg font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors select-none"
                >
                  {period}
                </div>
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-slate-700" />

          {/* Quick Select Grid */}
          <div className="p-3">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 px-1">Quick select</p>
            <div className="grid grid-cols-4 gap-1.5">
              {quickTimes.map((qt) => (
                <button
                  key={qt.value}
                  type="button"
                  onClick={() => selectQuickTime(qt.value)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${value === qt.value
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <div className="border-t border-gray-100 dark:border-slate-700 p-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimePicker
