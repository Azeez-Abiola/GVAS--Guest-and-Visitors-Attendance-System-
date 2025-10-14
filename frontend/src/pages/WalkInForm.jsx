import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User, Building, Phone, Mail, FileText, ArrowLeft, Check } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import ApiService from '../services/api'

const WalkInForm = () => {
  const navigate = useNavigate()
  const signatureRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [cameraError, setCameraError] = useState('')
  const [cameraLoading, setCameraLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    host: '',
    purpose: '',
    photo: '',
    signature: '',
    consentGiven: false
  })

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    try {
      const hostData = await ApiService.getHosts()
      setHosts(hostData)
    } catch (error) {
      console.error('Failed to load hosts:', error)
    }
  }

  const startCamera = async () => {
    setCameraError('')
    setCameraLoading(true)
    
    try {
      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      console.log('Camera access granted, setting up video...')
      
      // First activate the camera interface so the video element renders
      setCameraActive(true)
      setCameraLoading(false)
      
      // Then wait a bit for the video element to render and set the stream
      setTimeout(() => {
        console.log('Video ref current after render:', videoRef.current)
        if (videoRef.current) {
          console.log('Setting video stream...')
          videoRef.current.srcObject = stream
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded - camera fully ready')
          }
        } else {
          console.error('Video ref is still null after render!')
        }
      }, 100)
      
    } catch (error) {
      console.error('Camera access failed:', error)
      setCameraLoading(false)
      
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

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await ApiService.checkInVisitor({
        ...formData,
        isPreRegistered: false
      })
      
      // Notify host
      if (formData.host) {
        await ApiService.notifyHost(response.id, `${formData.name} has checked in`)
      }
      
      navigate('/success', { 
        state: { 
          visitorData: { ...formData, id: response.id },
          message: 'Check-in successful!' 
        }
      })
    } catch (error) {
      console.error('Check-in failed:', error)
      alert('Check-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
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
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="your.email@company.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="input-field"
                  placeholder="Your company name"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Visit Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Who are you visiting? *</label>
                <select
                  value={formData.host}
                  onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                  className="select-field"
                  required
                >
                  <option value="">Select your host</option>
                  {hosts.map(host => (
                    <option key={host.id} value={host.name}>
                      {host.name} - {host.company} (Office {host.office_number})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Purpose of Visit *</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="select-field"
                  required
                >
                  <option value="">Select purpose</option>
                  <option value="Business Meeting">Business Meeting</option>
                  <option value="Interview">Interview</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Personal Visit">Personal Visit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Photo Capture
            </h2>
            
            <div className="text-center space-y-6">
              {!cameraActive && !photoTaken && (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                  
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                      <p className="font-medium">⚠️ Camera Error</p>
                      <p>{cameraError}</p>
                      <button 
                        onClick={() => setCameraError('')}
                        className="mt-2 text-red-600 underline text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className={`btn-primary mx-auto flex items-center space-x-2 ${cameraLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <p className="text-gray-500 text-sm">
                    We'll take a photo for security identification purposes
                  </p>
                  
                  {/* Browser compatibility notice */}
                  <div className="text-xs text-gray-400 mt-4 space-y-1">
                    <p>💡 For best results, use Chrome or Edge browser</p>
                    <p>🔒 You may need to allow camera permission when prompted</p>
                    <button 
                      onClick={() => {
                        console.log('Camera API available:', !!navigator.mediaDevices?.getUserMedia)
                        console.log('User agent:', navigator.userAgent)
                        console.log('Protocol:', window.location.protocol)
                      }}
                      className="text-blue-500 underline text-xs"
                    >
                      🔍 Check Camera Support
                    </button>
                  </div>
                </div>
              )}
              
              {cameraActive && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-lg mx-auto rounded-xl border-2 border-blue-300 shadow-lg"
                    />
                    {/* Camera overlay with instructions */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                        📷 Position your face in the center
                      </div>
                      {/* Face detection guide */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-full opacity-50"></div>
                      
                      {/* Countdown overlay */}
                      {countdown > 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-8xl font-bold animate-ping">
                            {countdown}
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500/80 text-white px-3 py-1 rounded-full text-xs animate-pulse">
                        🟢 Camera Active - Ready to capture
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={takePhoto}
                      className="btn-primary flex items-center space-x-2"
                      disabled={countdown > 0}
                    >
                      <Camera className="h-5 w-5" />
                      <span>📸 Capture Now</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCountdown}
                      className="btn-secondary flex items-center space-x-2"
                      disabled={countdown > 0}
                    >
                      <span>⏱️</span>
                      <span>3s Timer</span>
                    </motion.button>
                  </div>
                  <p className="text-gray-500 text-sm text-center">
                    Look directly at the camera and click "Capture Now" or use the 3-second timer
                  </p>
                </div>
              )}
              
              {photoTaken && formData.photo && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={formData.photo}
                      alt="Visitor photo"
                      className="w-full max-w-lg mx-auto rounded-xl border-2 border-green-400 shadow-lg"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                      <span>✅</span>
                      <span>Photo Captured</span>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-green-600 font-medium">📸 Photo successfully captured!</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={retakePhoto}
                      className="btn-secondary"
                    >
                      🔄 Retake Photo
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
            key="step4"
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
              <p className="text-gray-600 text-center">
                Please sign below to confirm your information is accurate:
              </p>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200">
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
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step5"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
              Privacy & Consent
            </h2>
            
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 max-h-60 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Data Privacy Policy</h3>
                <div className="text-gray-600 text-sm space-y-2">
                  <p>By checking in, you consent to the collection and processing of your personal data including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name, contact information, and company details</li>
                    <li>Digital photograph for security identification</li>
                    <li>Digital signature for visit confirmation</li>
                    <li>Visit details including time, host, and purpose</li>
                  </ul>
                  <p className="mt-4">This data is used solely for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Security and access control purposes</li>
                    <li>Emergency evacuation procedures</li>
                    <li>Host notification and visitor management</li>
                    <li>Compliance with building security regulations</li>
                  </ul>
                  <p className="mt-4">Your data will be retained for the minimum period required by law and building security policies.</p>
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
                <label htmlFor="consent" className="text-gray-700 text-sm">
                  I have read and agree to the data privacy policy and consent to the collection and processing of my personal data as described above.
                </label>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== ''
      case 2:
        return formData.host.trim() !== '' && formData.purpose.trim() !== ''
      case 3:
        return photoTaken && formData.photo !== ''
      case 4:
        return formData.signature !== ''
      case 5:
        return formData.consentGiven
      default:
        return false
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
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="text-gray-800 mb-2 font-semibold">Step {currentStep} of 5</div>
          <div className="w-32 bg-gray-300 rounded-full h-2 mx-auto">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
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
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Kiosk</span>
            </motion.button>
            
            <h2 className="text-xl font-semibold text-gray-800">Walk-In Guest Registration</h2>
            
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

        {/* Navigation */}
        <div className="bg-white border-t p-6 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={currentStep === 1}
          >
            Previous
          </motion.button>
          
          {currentStep < 5 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !canProceed() 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={!canProceed()}
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !canProceed() || loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={!canProceed() || loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking In...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5" />
                  <span>Complete Check-In</span>
                </div>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalkInForm