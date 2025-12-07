import React from 'react'

const FloorSelector = ({ value, onChange, label = "Floor Assignment", required = false }) => {
  const availableFloors = [
    { id: 'Ground Floor', name: 'Ground Floor', number: 0 },
    { id: '1st Floor', name: '1st Floor', number: 1 },
    { id: '2nd Floor', name: '2nd Floor', number: 2 },
    { id: '3rd Floor', name: '3rd Floor', number: 3 },
    { id: '4th Floor', name: '4th Floor', number: 4 },
    { id: '5th Floor', name: '5th Floor', number: 5 },
    { id: '6th Floor', name: '6th Floor', number: 6 },
    { id: '7th Floor', name: '7th Floor', number: 7 },
    { id: '8th Floor', name: '8th Floor', number: 8 },
    { id: '9th Floor', name: '9th Floor', number: 9 },
  ]

  const handleFloorClick = (floorId) => {
    onChange(floorId)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {availableFloors.map((floor) => (
          <button
            key={floor.id}
            type="button"
            onClick={() => handleFloorClick(floor.id)}
            className={`group relative p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
              value === floor.id
                ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                : 'border-gray-200 bg-white text-gray-700 hover:border-slate-700 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className={`text-xs mb-1 font-medium ${
                value === floor.id ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Floor
              </div>
              <div className="text-lg font-bold">{floor.number === 0 ? 'G' : floor.number}</div>
              <div className={`text-xs mt-1 ${
                value === floor.id ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {floor.name}
              </div>
            </div>
            
            {/* Checkmark for selected */}
            {value === floor.id && (
              <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Select the floor where the visitor will be located
      </p>
    </div>
  )
}

export default FloorSelector
