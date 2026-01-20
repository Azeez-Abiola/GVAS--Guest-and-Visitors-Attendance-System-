import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Badge,
  DatePicker,
  Flex,
  Grid
} from '@tremor/react';
import {
  UserPlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const PreRegistrationPortal = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',

    // Visit Details
    visitDate: null,
    visitTime: '',
    duration: '',
    purpose: '',
    hostName: '',
    hostEmail: '',
    department: '',

    // Additional Information
    specialRequirements: '',
    vehicleInfo: '',
    emergencyContact: '',
    emergencyPhone: '',

    // Terms and Conditions
    agreeToTerms: false,
    agreeToDataProcessing: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic details about yourself' },
    { id: 2, title: 'Visit Details', description: 'Information about your planned visit' },
    { id: 3, title: 'Additional Information', description: 'Special requirements and emergency contacts' },
    { id: 4, title: 'Review & Submit', description: 'Review your information and submit' }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (formData.phone.trim() && !/^[0-9+\-\s()]+$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        break;

      case 2:
        if (!formData.visitDate) newErrors.visitDate = 'Visit date is required';
        if (!formData.visitTime) newErrors.visitTime = 'Visit time is required';
        if (!formData.purpose.trim()) newErrors.purpose = 'Purpose of visit is required';
        // hostName and hostEmail are optional
        if (formData.hostEmail.trim() && !/\S+@\S+\.\S+/.test(formData.hostEmail)) newErrors.hostEmail = 'Host email is invalid';
        break;

      case 3:
        // Optional fields, no validation required
        break;

      case 4:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms and conditions';
        if (!formData.agreeToDataProcessing) newErrors.agreeToDataProcessing = 'You must agree to data processing';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Pre-registration submitted:', formData);
      setSubmissionSuccess(true);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <Title className="mb-2">Registration Successful!</Title>
            <Text className="mb-6 text-gray-600">
              Your pre-registration has been submitted successfully. You will receive a confirmation email shortly.
            </Text>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <Text>Reference ID:</Text>
                <Text className="font-mono">VR-{Date.now().toString().slice(-6)}</Text>
              </div>
              <div className="flex justify-between text-sm">
                <Text>Visit Date:</Text>
                <Text>{formData.visitDate ? new Date(formData.visitDate).toLocaleDateString() : '-'}</Text>
              </div>
              <div className="flex justify-between text-sm">
                <Text>Host:</Text>
                <Text>{formData.hostName}</Text>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '',
                  visitDate: null, visitTime: '', duration: '', purpose: '', hostName: '',
                  hostEmail: '', department: '', specialRequirements: '', vehicleInfo: '',
                  emergencyContact: '', emergencyPhone: '', agreeToTerms: false, agreeToDataProcessing: false
                });
                setSubmissionSuccess(false);
              }}
            >
              Register Another Visit
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <Title>Visitor Pre-Registration</Title>
              <Text>Complete your registration before your visit</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? <CheckCircleIcon className="w-5 h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-full h-1 mx-4
                    ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Title className="mb-1">{steps[currentStep - 1].title}</Title>
            <Text className="text-gray-600">{steps[currentStep - 1].description}</Text>
          </div>
        </Card>

        {/* Form Content */}
        <Card className="space-y-6 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Title className="mb-4">Personal Information</Title>

                  <Grid numItems={2} className="gap-4">
                    <div>
                      <Text className="mb-2">First Name *</Text>
                      <TextInput
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        error={!!errors.firstName}
                      />
                      {errors.firstName && (
                        <Text className="text-red-600 text-sm mt-1">{errors.firstName}</Text>
                      )}
                    </div>

                    <div>
                      <Text className="mb-2">Last Name *</Text>
                      <TextInput
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        error={!!errors.lastName}
                      />
                      {errors.lastName && (
                        <Text className="text-red-600 text-sm mt-1">{errors.lastName}</Text>
                      )}
                    </div>
                  </Grid>

                  <div>
                    <Text className="mb-2">Email Address *</Text>
                    <TextInput
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      error={!!errors.email}
                    />
                    {errors.email && (
                      <Text className="text-red-600 text-sm mt-1">{errors.email}</Text>
                    )}
                  </div>

                  <Grid numItems={2} className="gap-4">
                    <div>
                      <Text className="mb-2">Phone Number</Text>
                      <TextInput
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        error={!!errors.phone}
                      />
                      {errors.phone && (
                        <Text className="text-red-600 text-sm mt-1">{errors.phone}</Text>
                      )}
                    </div>

                    <div>
                      <Text className="mb-2">Job Title</Text>
                      <TextInput
                        placeholder="Enter your job title"
                        value={formData.jobTitle}
                        onChange={(e) => updateFormData('jobTitle', e.target.value)}
                      />
                    </div>
                  </Grid>

                  <div>
                    <Text className="mb-2">Company/Organization *</Text>
                    <TextInput
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={(e) => updateFormData('company', e.target.value)}
                      error={!!errors.company}
                    />
                    {errors.company && (
                      <Text className="text-red-600 text-sm mt-1">{errors.company}</Text>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Visit Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <Title className="mb-4">Visit Details</Title>

                  <Grid numItems={2} className="gap-4">
                    <div>
                      <Text className="mb-2">Visit Date *</Text>
                      <DatePicker
                        value={formData.visitDate}
                        onValueChange={(date) => updateFormData('visitDate', date)}
                        enableClear={false}
                      />
                      {errors.visitDate && (
                        <Text className="text-red-600 text-sm mt-1">{errors.visitDate}</Text>
                      )}
                    </div>

                    <div>
                      <Text className="mb-2">Visit Time *</Text>
                      <Select
                        value={formData.visitTime}
                        onValueChange={(value) => updateFormData('visitTime', value)}
                      >
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">01:00 PM</SelectItem>
                        <SelectItem value="14:00">02:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM</SelectItem>
                        <SelectItem value="17:00">05:00 PM</SelectItem>
                      </Select>
                      {errors.visitTime && (
                        <Text className="text-red-600 text-sm mt-1">{errors.visitTime}</Text>
                      )}
                    </div>
                  </Grid>

                  <Grid numItems={2} className="gap-4">
                    <div>
                      <Text className="mb-2">Expected Duration</Text>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => updateFormData('duration', value)}
                      >
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hour">1 hour</SelectItem>
                        <SelectItem value="2hours">2 hours</SelectItem>
                        <SelectItem value="half-day">Half day (4 hours)</SelectItem>
                        <SelectItem value="full-day">Full day (8 hours)</SelectItem>
                      </Select>
                    </div>

                    <div>
                      <Text className="mb-2">Department</Text>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => updateFormData('department', value)}
                      >
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </Select>
                    </div>
                  </Grid>

                  <div>
                    <Text className="mb-2">Purpose of Visit *</Text>
                    <Select
                      value={formData.purpose}
                      onValueChange={(value) => updateFormData('purpose', value)}
                    >
                      <SelectItem value="business-meeting">Business Meeting</SelectItem>
                      <SelectItem value="interview">Job Interview</SelectItem>
                      <SelectItem value="delivery">Delivery/Pickup</SelectItem>
                      <SelectItem value="maintenance">Maintenance/Service</SelectItem>
                      <SelectItem value="training">Training/Workshop</SelectItem>
                      <SelectItem value="tour">Office Tour</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </Select>
                    {errors.purpose && (
                      <Text className="text-red-600 text-sm mt-1">{errors.purpose}</Text>
                    )}
                  </div>

                  <Grid numItems={2} className="gap-4">
                    <div>
                      <Text className="mb-2">Host Name *</Text>
                      <TextInput
                        placeholder="Enter your host's name"
                        value={formData.hostName}
                        onChange={(e) => updateFormData('hostName', e.target.value)}
                        error={!!errors.hostName}
                      />
                      {errors.hostName && (
                        <Text className="text-red-600 text-sm mt-1">{errors.hostName}</Text>
                      )}
                    </div>

                    <div>
                      <Text className="mb-2">Host Email *</Text>
                      <TextInput
                        type="email"
                        placeholder="Enter your host's email"
                        value={formData.hostEmail}
                        onChange={(e) => updateFormData('hostEmail', e.target.value)}
                        error={!!errors.hostEmail}
                      />
                      {errors.hostEmail && (
                        <Text className="text-red-600 text-sm mt-1">{errors.hostEmail}</Text>
                      )}
                    </div>
                  </Grid>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <Title className="mb-4">Additional Information</Title>

                  <div>
                    <Text className="mb-2">Special Requirements or Accessibility Needs</Text>
                    <Textarea
                      placeholder="Please describe any special requirements or accessibility needs"
                      value={formData.specialRequirements}
                      onChange={(e) => updateFormData('specialRequirements', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Text className="mb-2">Vehicle Information</Text>
                    <TextInput
                      placeholder="License plate, make, model (if driving to the location)"
                      value={formData.vehicleInfo}
                      onChange={(e) => updateFormData('vehicleInfo', e.target.value)}
                    />
                  </div>

                  <Grid numItems={2} className="gap-4">
                    <div>
                      <Text className="mb-2">Emergency Contact Name</Text>
                      <TextInput
                        placeholder="Enter emergency contact name"
                        value={formData.emergencyContact}
                        onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                      />
                    </div>

                    <div>
                      <Text className="mb-2">Emergency Contact Phone</Text>
                      <TextInput
                        type="tel"
                        placeholder="Enter emergency contact phone"
                        value={formData.emergencyPhone}
                        onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                      />
                    </div>
                  </Grid>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Title className="mb-4">Review Your Information</Title>

                  {/* Review Cards */}
                  <div className="space-y-4">
                    <Card className="p-4">
                      <Title className="text-lg mb-3">Personal Information</Title>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Text className="font-medium">Name:</Text>
                          <Text>{formData.firstName} {formData.lastName}</Text>
                        </div>
                        <div>
                          <Text className="font-medium">Email:</Text>
                          <Text>{formData.email}</Text>
                        </div>
                        <div>
                          <Text className="font-medium">Phone:</Text>
                          <Text>{formData.phone}</Text>
                        </div>
                        <div>
                          <Text className="font-medium">Company:</Text>
                          <Text>{formData.company}</Text>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <Title className="text-lg mb-3">Visit Details</Title>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Text className="font-medium">Date & Time:</Text>
                          <Text>
                            {formData.visitDate ? new Date(formData.visitDate).toLocaleDateString() : '-'} at {formData.visitTime}
                          </Text>
                        </div>
                        <div>
                          <Text className="font-medium">Duration:</Text>
                          <Text>{formData.duration || 'Not specified'}</Text>
                        </div>
                        <div>
                          <Text className="font-medium">Purpose:</Text>
                          <Text className="capitalize">{formData.purpose?.replace('-', ' ')}</Text>
                        </div>
                        <div>
                          <Text className="font-medium">Host:</Text>
                          <Text>{formData.hostName} ({formData.hostEmail})</Text>
                        </div>
                      </div>
                    </Card>

                    {(formData.specialRequirements || formData.vehicleInfo || formData.emergencyContact) && (
                      <Card className="p-4">
                        <Title className="text-lg mb-3">Additional Information</Title>
                        <div className="space-y-2 text-sm">
                          {formData.specialRequirements && (
                            <div>
                              <Text className="font-medium">Special Requirements:</Text>
                              <Text>{formData.specialRequirements}</Text>
                            </div>
                          )}
                          {formData.vehicleInfo && (
                            <div>
                              <Text className="font-medium">Vehicle Info:</Text>
                              <Text>{formData.vehicleInfo}</Text>
                            </div>
                          )}
                          {formData.emergencyContact && (
                            <div>
                              <Text className="font-medium">Emergency Contact:</Text>
                              <Text>{formData.emergencyContact} ({formData.emergencyPhone})</Text>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <Card className="p-4">
                    <Title className="text-lg mb-4">Terms and Conditions</Title>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                          className="mt-1"
                        />
                        <Text className="text-sm">
                          I agree to the <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span> and
                          understand that I must follow all security protocols during my visit.
                        </Text>
                      </label>
                      {errors.agreeToTerms && (
                        <Text className="text-red-600 text-sm">{errors.agreeToTerms}</Text>
                      )}

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.agreeToDataProcessing}
                          onChange={(e) => updateFormData('agreeToDataProcessing', e.target.checked)}
                          className="mt-1"
                        />
                        <Text className="text-sm">
                          I consent to the processing of my personal data for visitor management purposes
                          in accordance with the <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                        </Text>
                      </label>
                      {errors.agreeToDataProcessing && (
                        <Text className="text-red-600 text-sm">{errors.agreeToDataProcessing}</Text>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Flex justifyContent="between" className="mt-8 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              )}
            </div>
          </Flex>
        </Card>

        {/* Help Information */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <Title className="text-blue-900 mb-2">Need Help?</Title>
              <Text className="text-blue-800 mb-3">
                If you have any questions or need assistance with your registration, please contact our reception team.
              </Text>
              <div className="space-y-1 text-sm">
                <Text className="text-blue-800">📞 Phone: +1 (555) 123-4567</Text>
                <Text className="text-blue-800">✉️ Email: reception@company.com</Text>
                <Text className="text-blue-800">🕒 Hours: Monday - Friday, 8:00 AM - 6:00 PM</Text>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PreRegistrationPortal;