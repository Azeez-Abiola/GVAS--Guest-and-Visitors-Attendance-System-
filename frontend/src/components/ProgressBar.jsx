import { motion } from 'framer-motion'

const ProgressBar = ({ currentStep, totalSteps, stepLabels = [], variant = 'top' }) => {
  const progressPercentage = (currentStep / totalSteps) * 100

  // Color progression: lime -> emerald -> dark green
  const getProgressColor = () => {
    if (progressPercentage <= 25) return 'from-lime-400 to-lime-600'
    if (progressPercentage <= 50) return 'from-emerald-400 to-emerald-600'
    if (progressPercentage <= 75) return 'from-emerald-600 to-[#052e16]'
    return 'from-[#052e16] to-[#022c22]'
  }

  const getStepColor = (stepIndex) => {
    if (stepIndex < currentStep) {
      // Completed steps
      if (currentStep <= Math.ceil(totalSteps * 0.25)) return 'bg-lime-500 border-lime-500'
      if (currentStep <= Math.ceil(totalSteps * 0.5)) return 'bg-emerald-500 border-emerald-500'
      if (currentStep <= Math.ceil(totalSteps * 0.75)) return 'bg-[#052e16] border-[#052e16]'
      return 'bg-[#022c22] border-[#022c22]'
    } else if (stepIndex === currentStep - 1) {
      // Current step
      if (currentStep <= Math.ceil(totalSteps * 0.25)) return 'bg-lime-500 border-lime-500'
      if (currentStep <= Math.ceil(totalSteps * 0.5)) return 'bg-emerald-500 border-emerald-500'
      if (currentStep <= Math.ceil(totalSteps * 0.75)) return 'bg-[#052e16] border-[#052e16]'
      return 'bg-[#022c22] border-[#022c22]'
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