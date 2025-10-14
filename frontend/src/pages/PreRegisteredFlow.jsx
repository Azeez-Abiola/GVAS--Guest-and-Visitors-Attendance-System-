import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, User, ArrowLeft, Search, Camera, Check, Clock } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import ApiService from '../services/api'

const PreRegisteredFlow = () => {
  const navigate = useNavigate()
  const signatureRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [guestCode, setGuestCode] = useState('')
  const [visitorData, setVisitorData] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [cameraError, setCameraError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('prompt')
  const [cameraInitializing, setCameraInitializing] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  
  // Add ref to track actual camera state
  const cameraActiveRef = useRef(false)
  
  // Custom setter that updates both state and ref
  const setCameraActiveState = (value) => {
    console.log('Setting camera active state to:', value)
    cameraActiveRef.current = value
    setCameraActive(value)
  }
  const [formData, setFormData] = useState({
    photo: '',
    signature: '',
    consentGiven: false
  })

  // Debug effect to monitor camera state changes
  useEffect(() => {
    console.log('Camera state changed:', {
      cameraActive,
      cameraActiveRef: cameraActiveRef.current,
      photoTaken,
      permissionStatus,
      cameraInitializing
    })
  }, [cameraActive, photoTaken, permissionStatus, cameraInitializing])

  const lookupGuest = async () => {
    if (!guestCode.trim()) return
    
    setLoading(true)
    try {
      const data = await ApiService.getVisitor(guestCode.toUpperCase())
      setVisitorData(data)
      setCurrentStep(2)
    } catch (error) {
      console.error('Guest lookup failed:', error)
      alert('Guest not found. Please check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    // Prevent multiple simultaneous camera initializations
    if (cameraInitializing || cameraActiveRef.current) {
      console.log('Camera already initializing or active, skipping...', {
        cameraInitializing,
        cameraActive: cameraActiveRef.current
      })
      return
    }
    
    setCameraError('')
    setCameraLoading(true)
    
    try {
      console.log('Requesting camera access...')
      setPermissionStatus('requesting')
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      console.log('Camera access granted, setting up video...')
      setPermissionStatus('granted')
      
      // CRITICAL: First activate the camera interface so the video element renders
      setCameraActiveState(true)
      setCameraLoading(false)
      
      // Then wait a bit for the video element to render and set the stream
      setTimeout(() => {
        console.log('Video ref current after render:', videoRef.current)
        if (videoRef.current) {
          console.log('Setting video stream...')
          
          // Stop any existing stream first
          if (videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
          }
          
          videoRef.current.srcObject = stream
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded - camera fully ready')
          }
          
          videoRef.current.onplaying = () => {
            console.log('Video started playing')
          }
          
          videoRef.current.onerror = (e) => {
            console.error('Video element error:', e)
            setCameraError('Video playback error')
          }
          
          // Ensure video plays
          videoRef.current.play().catch(playError => {
            console.error('Error playing video:', playError)
            // Don't throw here, video might still work
          })
        } else {
          console.error('Video ref is still null after render!')
        }
      }, 100)
      
    } catch (error) {
      console.error('Camera access failed:', error)
      setCameraLoading(false)
      setCameraActiveState(false)
      setPermissionStatus('denied')
      
      let errorMessage = 'Camera access failed. '
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permission and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this browser.'
      } else {
        errorMessage += 'Please check your camera and try again.'
      }
      
      setCameraError(errorMessage)
    }
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setFormData(prev => ({ ...prev, photo: photoDataUrl }))
      setPhotoTaken(true)
      setCountdown(0)
      
      // Stop camera
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop())
        setCameraActive(false)
      }
    }
  }

  const startCountdown = () => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          takePhoto()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const retakePhoto = () => {
    setPhotoTaken(false)
    setCountdown(0)
    setFormData(prev => ({ ...prev, photo: '' }))
    startCamera()
  }

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setFormData(prev => ({ ...prev, signature: '' }))
    }
  }

  const saveSignature = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL()
      setFormData(prev => ({ ...prev, signature: signatureData }))
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await ApiService.checkInVisitor({
        id: visitorData.id,
        ...formData,
        isPreRegistered: true
      })
      
      // Notify host
      await ApiService.notifyHost(response.id, `${visitorData.name} has arrived`)
      
      navigate('/success', { 
        state: { 
          visitorData: { ...visitorData, ...formData },
          message: 'Welcome! Check-in successful!' 
        }
      })
    } catch (error) {
      console.error('Check-in failed:', error)
      alert('Check-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="lookup"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-8"
          >
            <div className="text-center">
              <QrCode className="h-20 w-20 text-blue-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold gradient-text mb-4">
                Pre-Registered Guest
              </h2>
              <p className="text-gray-600 text-lg">
                Enter your guest code to begin express check-in
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Guest Code
                </label>
                <input
                  type="text"
                  value={guestCode}
                  onChange={(e) => setGuestCode(e.target.value.toUpperCase())}
                  className="input-field text-center text-2xl font-mono tracking-widest"
                  placeholder="ABCD1234"
                  maxLength={8}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={lookupGuest}
                className={`w-full btn-primary ${!guestCode.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!guestCode.trim() || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Looking up guest...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Find My Registration</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="confirm"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Confirm Your Details
            </h2>
            
            {visitorData && (
              <div className="glass rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm">Name</label>
                    <p className="text-gray-900 font-medium">{visitorData.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm">Email</label>
                    <p className="text-gray-900 font-medium">{visitorData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm">Host</label>
                    <p className="text-gray-900 font-medium">{visitorData.host}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm">Purpose</label>
                    <p className="text-gray-900 font-medium">{visitorData.purpose}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Please confirm these details are correct, then proceed to photo capture.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStep(3)}
                className="btn-primary"
              >
                Details are Correct - Continue
              </motion.button>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="photo"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Photo Verification
            </h2>
            
            <div className="text-center space-y-6">
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
                  Debug: cameraActive={cameraActive.toString()}, cameraActiveRef={cameraActiveRef.current.toString()}, photoTaken={photoTaken.toString()}, permissionStatus={permissionStatus}
                </div>
              )}
              
              {!cameraActive && !cameraActiveRef.current && !photoTaken && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-2xl p-8 text-center">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">We need to take your photo for security purposes</p>
                    
                    {permissionStatus === 'requesting' && (
                      <div className="mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                        <p className="text-blue-600 font-medium">Requesting camera access...</p>
                      </div>
                    )}
                    
                    {permissionStatus === 'denied' && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">Camera access denied</p>
                        <p className="text-red-600 text-sm mt-1">Please allow camera access in your browser and try again</p>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">{cameraError}</p>
                      </div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCamera}
                      className={`btn-primary mx-auto flex items-center space-x-2 ${cameraLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={cameraLoading}
                    >
                      {cameraLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Starting Camera...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5" />
                          <span>📷 Start Camera & Take Photo</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">
                      📱 Please allow camera access when prompted
                    </p>
                    <p className="text-xs text-gray-400">
                      💡 If camera doesn't work, try refreshing the page or using a different browser
                    </p>
                  </div>
                </div>
              )}
              
              {(cameraActive || cameraActiveRef.current) && (
                <div className="space-y-6">
                  <div className="bg-gray-900 rounded-2xl p-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-lg mx-auto rounded-xl border-4 border-blue-500 shadow-2xl bg-black"
                        style={{ minHeight: '360px' }}
                        onError={(e) => console.error('Video error:', e)}
                        onCanPlay={() => console.log('Video can play')}
                      />
                      
                      {/* Overlay instructions */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          📷 Position your face in the center
                        </div>
                        
                        {/* Face guide circle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-blue-400 rounded-full opacity-70 animate-pulse"></div>
                        
                        {/* Countdown overlay */}
                        {countdown > 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="text-white text-8xl font-bold animate-ping">
                              {countdown}
                            </div>
                          </div>
                        )}
                        
                        {/* Camera status */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>Camera Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={takePhoto}
                      className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
                      disabled={countdown > 0}
                    >
                      <Camera className="h-6 w-6" />
                      <span>📸 Take Photo</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCountdown}
                      className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
                      disabled={countdown > 0}
                    >
                      <Clock className="h-6 w-6" />
                      <span>⏱️ 3s Timer</span>
                    </motion.button>
                  </div>
                  
                  <p className="text-center text-gray-600 text-sm">
                    📝 Make sure your face is clearly visible and well-lit
                  </p>
                </div>
              )}
              
              {photoTaken && formData.photo && (
                <div className="space-y-4">
                  <img
                    src={formData.photo}
                    alt="Visitor photo"
                    className="w-full max-w-lg mx-auto rounded-xl border-2 border-white/30"
                  />
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={retakePhoto}
                      className="btn-secondary"
                    >
                      Retake
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(4)}
                      className="btn-primary"
                    >
                      Continue
                    </motion.button>
                  </div>
                </div>
              )}
              
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="signature"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Digital Signature
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas w-full'
                  }}
                  onEnd={saveSignature}
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSignature}
                  className="btn-secondary"
                >
                  Clear
                </motion.button>
                {formData.signature && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(5)}
                    className="btn-primary"
                  >
                    Continue
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="consent"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Final Confirmation
            </h2>
            
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 max-h-60 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Data Privacy Consent</h3>
                <div className="text-gray-700 text-sm space-y-2">
                  <p>By proceeding, you confirm consent for data collection and processing as outlined in our privacy policy.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentGiven: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-gray-900 text-sm">
                  I confirm my consent to data processing and agree to the privacy policy.
                </label>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                className={`w-full btn-primary ${!formData.consentGiven || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!formData.consentGiven || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Checking In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="h-5 w-5" />
                    <span>Complete Check-In</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/2 relative overflow-hidden">
        <img 
          src="/images/gvasblack.jpg" 
          alt="GVAS Logo" 
          className="w-full h-screen object-cover"
        />
        
        {/* Step indicator at bottom */}
        {currentStep > 1 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center z-20">
            <div className="text-gray-800 mb-2 font-semibold">Step {currentStep - 1} of 4</div>
            <div className="w-32 bg-gray-300 rounded-full h-2 mx-auto">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="w-1/2 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/kiosk')}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Kiosk</span>
            </motion.button>
            
            <h2 className="text-xl font-semibold text-gray-800">Pre-Registered Check-In</h2>
            
            <div className="text-gray-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <motion.div
              key={currentStep}
              className="bg-white rounded-xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreRegisteredFlow