import { motion } from 'framer-motion'

const ProgressBar = ({ currentStep, totalSteps, stepLabels = [], variant = 'top' }) => {
  const progressPercentage = (currentStep / totalSteps) * 100

  // Color progression: red -> yellow -> green -> blue
  const getProgressColor = () => {
    if (progressPercentage <= 25) return 'from-red-500 to-red-600'
    if (progressPercentage <= 50) return 'from-yellow-500 to-yellow-600'
    if (progressPercentage <= 75) return 'from-green-500 to-green-600'
    return 'from-blue-500 to-blue-600'
  }

  const getStepColor = (stepIndex) => {
    if (stepIndex < currentStep) {
      // Completed steps
      if (currentStep <= Math.ceil(totalSteps * 0.25)) return 'bg-red-500 border-red-500'
      if (currentStep <= Math.ceil(totalSteps * 0.5)) return 'bg-yellow-500 border-yellow-500'
      if (currentStep <= Math.ceil(totalSteps * 0.75)) return 'bg-green-500 border-green-500'
      return 'bg-blue-500 border-blue-500'
    } else if (stepIndex === currentStep - 1) {
      // Current step
      if (currentStep <= Math.ceil(totalSteps * 0.25)) return 'bg-red-500 border-red-500'
      if (currentStep <= Math.ceil(totalSteps * 0.5)) return 'bg-yellow-500 border-yellow-500'
      if (currentStep <= Math.ceil(totalSteps * 0.75)) return 'bg-green-500 border-green-500'
      return 'bg-blue-500 border-blue-500'
    }
    return 'bg-gray-200 border-gray-300'
  }

  if (variant === 'top-right') {
    // Top-right version for desk screens
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm text-gray-500">
            {stepLabels[currentStep - 1] || `Step ${currentStep}`}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
        
        {/* Step markers */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 ${getStepColor(index)}`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    // Sidebar version for left side
    return (
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-20 w-48">
        <div className="text-white mb-3 font-semibold text-sm drop-shadow-lg">
          Step {currentStep} of {totalSteps}
        </div>
        {stepLabels[currentStep - 1] && (
          <div className="text-white text-xs mb-3 opacity-90 drop-shadow-lg">
            {stepLabels[currentStep - 1]}
          </div>
        )}
        
        {/* Progress bar */}
        <div className="w-full bg-black bg-opacity-30 rounded-full h-3 mx-auto backdrop-blur-sm">
          <motion.div
            className={`bg-gradient-to-r ${getProgressColor()} h-3 rounded-full shadow-lg`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
        
        {/* Step markers */}
        <div className="flex justify-between mt-3 px-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 shadow-lg ${getStepColor(index)}`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Top version (original)
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm text-gray-500">
            {stepLabels[currentStep - 1] || `Step ${currentStep}`}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
        
        {/* Step markers */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 ${getStepColor(index)}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressBar