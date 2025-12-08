import React, { useState, useEffect } from 'react'
import ApiService from '../services/api'

const FloorSelector = ({ value, onChange, label = "Floor Assignment", required = false }) => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback list
  const fallbackFloors = [
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
    { id: '10th Floor', name: '10th Floor', number: 10 },
    { id: '11th Floor', name: '11th Floor', number: 11 },
    { id: '12th Floor', name: '12th Floor', number: 12 },
    { id: '13th Floor', name: '13th Floor', number: 13 },
    { id: '14th Floor', name: '14th Floor', number: 14 },
    { id: '15th Floor', name: '15th Floor', number: 15 },
    { id: '16th Floor', name: '16th Floor', number: 16 },
    { id: '17th Floor', name: '17th Floor', number: 17 },
    { id: '18th Floor', name: '18th Floor', number: 18 },
    { id: '19th Floor', name: '19th Floor', number: 19 },
    { id: '20th Floor', name: '20th Floor', number: 20 },
  ];

  useEffect(() => {
    const loadFloors = async () => {
      try {
        const data = await ApiService.getFloors();
        if (data && data.length > 0) {
          // Format API data to match component expectation
          const formatted = data.map(f => ({
            id: f.name, // Use name as ID to match legacy behavior or unique ID? Legacy used name/string.
            name: f.name,
            number: f.number
          }));
          setFloors(formatted);
        } else {
          setFloors(fallbackFloors);
        }
      } catch (error) {
        console.error('Failed to load floors:', error);
        setFloors(fallbackFloors);
      } finally {
        setLoading(false);
      }
    };
    loadFloors();
  }, []);

  const availableFloors = floors.length > 0 ? floors : fallbackFloors;

  const handleFloorClick = (floorId) => {
    onChange(floorId)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {availableFloors.map((floor) => (
          <button
            key={floor.id}
            type="button"
            onClick={() => handleFloorClick(floor.id)}
            className={`group relative p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${value === floor.id
              ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:border-slate-700 dark:hover:border-slate-500 hover:shadow-md'
              }`}
          >
            <div className="text-center">
              <div className={`text-xs mb-1 font-medium ${value === floor.id ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
                }`}>
                Floor
              </div>
              <div className="text-lg font-bold">{floor.number === 0 ? 'G' : floor.number}</div>
              <div className={`text-xs mt-1 ${value === floor.id ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'
                }`}>
                {floor.name}
              </div>
            </div>

            {/* Checkmark for selected */}
            {value === floor.id && (
              <div className="absolute top-1 right-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
                <svg className="w-3 h-3 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Select the floor where the visitor will be located
      </p>
    </div>
  )
}

export default FloorSelector
