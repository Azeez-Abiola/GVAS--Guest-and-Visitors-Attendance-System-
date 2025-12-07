import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, User, ArrowLeft, Search, Camera, Check, Clock } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import ApiService from '../services/api'
import showToast from '../utils/toast'
import ProgressBar from '../components/ProgressBar'

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
      
      // Show success toast
      showToast(`Welcome ${visitorData.name}! Check-in successful!`, 'success');
      
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
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-blue-900 mb-4">
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
                  className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="ABCD1234"
                  maxLength={8}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={lookupGuest}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10 ${!guestCode.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
              Confirm Your Details
            </h2>
            
            {visitorData && (
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Name</label>
                    <p className="text-gray-900 font-medium text-lg">{visitorData.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Email</label>
                    <p className="text-gray-900 font-medium text-lg">{visitorData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Host</label>
                    <p className="text-gray-900 font-medium text-lg">{visitorData.host}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Purpose</label>
                    <p className="text-gray-900 font-medium text-lg">{visitorData.purpose}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Please confirm these details are correct, then proceed to photo capture.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(3)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10"
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
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
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
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-6">We need to take your photo for security purposes</p>
                    
                    {permissionStatus === 'requesting' && (
                      <div className="mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startCamera}
                      className={`w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10 flex items-center justify-center space-x-2 ${cameraLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          <span>Start Camera & Take Photo</span>
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
                  <div className="bg-slate-900 rounded-2xl p-4 shadow-xl">
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
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>Camera Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={takePhoto}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10 flex items-center space-x-2 text-lg"
                      disabled={countdown > 0}
                    >
                      <Camera className="h-6 w-6" />
                      <span>Take Photo</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startCountdown}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 text-lg"
                      disabled={countdown > 0}
                    >
                      <Clock className="h-6 w-6" />
                      <span>3s Timer</span>
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
                    className="w-full max-w-lg mx-auto rounded-xl border-4 border-blue-500 shadow-lg"
                  />
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={retakePhoto}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      Retake
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(4)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10"
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
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
              Digital Signature
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas w-full bg-gray-50 rounded-lg border border-gray-100'
                  }}
                  onEnd={saveSignature}
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearSignature}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Clear
                </motion.button>
                {formData.signature && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(5)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10"
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
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
              Final Confirmation
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-60 overflow-y-auto shadow-sm">
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckIn}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-900/10 ${!formData.consentGiven || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

  // Step labels for better UX
  const stepLabels = [
    'QR Code Scan',
    'Identity Verification', 
    'Photo Capture',
    'Digital Signature'
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/2 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="/images/gvasblack.jpg" 
          alt="GVAS Logo" 
          className="w-full h-screen object-cover"
        />
        
        {/* Powered by Hovidastechnologies - Below Logo */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="text-white/60 text-sm">
            Powered by{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://hovidastechnologies.com', '_blank')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Hovidastechnologies
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col">
        {/* Progress Bar at Top */}
        {currentStep > 1 && (
          <ProgressBar 
            currentStep={currentStep - 1} 
            totalSteps={4} 
            stepLabels={stepLabels}
            variant="top-right"
          />
        )}
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="p-6 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/desk')}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Desk</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div className="lg:hidden">
                <span className="text-blue-900 font-bold text-xl">GVAS</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Pre-Registered Check-In</h2>
            </div>
            
            <div className="text-gray-500 text-sm font-medium">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <motion.div
              key={currentStep}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
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