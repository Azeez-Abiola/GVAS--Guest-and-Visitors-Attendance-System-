import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Card,
  Title,
  Text,
  TabGroup,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  TextInput,
  Textarea,
  Switch,
  NumberInput,
  Grid,
  Flex,
  Button
} from '@tremor/react';
import {
  CogIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [settings, setSettings] = useState({
    general: {
      organizationName: 'GVAS Corporation',
      email: 'admin@gvas.com',
      phone: '+234-123-456-7890',
      address: '123 Business District, Lagos, Nigeria',
      timezone: 'Africa/Lagos',
      businessHours: {
        start: '08:00',
        end: '18:00'
      },
      maxVisitorsPerDay: 500,
      maxVisitDuration: 8
    },
    badges: {
      autoGenerateId: true,
      requirePhoto: true,
      badgeValidityDays: 30,
      printOnCheckIn: true,
      badgeTemplate: 'standard'
    },
    security: {
      requireApproval: true,
      blacklistCheck: true,
      multiFactorAuth: false,
      sessionTimeout: 30,
      maxFailedAttempts: 3
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      slackIntegration: false
    },
    emergency: {
      evacuationEnabled: true,
      autoRefreshInterval: 30,
      emergencyContacts: [
        { name: 'Security Desk', phone: '+234-123-456-7891' },
        { name: 'Fire Department', phone: '199' }
      ]
    }
  });

  const tabsConfig = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'badges', label: 'Badges', icon: BuildingOfficeIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'emergency', label: 'Emergency', icon: ExclamationTriangleIcon }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (category, parentKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [key]: value
        }
      }
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-500">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-200 shadow-sm"
              >
                <CheckIcon className="h-5 w-5" />
                <span className="text-sm font-semibold">{savedMessage}</span>
              </motion.div>
            )}
            <button
              onClick={loadSettings}
              disabled={isLoading}
              className="bg-white text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <CheckIcon className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100">
          <TabGroup index={activeTab} onIndexChange={setActiveTab}>
            <TabList className="border-b-2 border-gray-100 bg-gray-50 rounded-t-xl">
              {tabsConfig.map((tab, index) => (
                <Tab
                  key={tab.id}
                  className="px-6 py-4 text-sm font-semibold text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 first:rounded-tl-xl last:rounded-tr-xl hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </div>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* General Settings */}
              <TabPanel className="p-8">
                <div className="space-y-8">
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Organization Information</h3>
                        <p className="text-gray-600 text-sm">Configure your organization's basic information</p>
                      </div>
                    </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.organizationName}
                        onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-medium"
                        placeholder="Your organization name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.email}
                        onChange={(e) => updateSetting('general', 'email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-medium"
                        placeholder="contact@organization.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.general.phone}
                        onChange={(e) => updateSetting('general', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-medium"
                        placeholder="+234-123-456-7890"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-semibold text-gray-900 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundSize: '1.5rem',
                          backgroundPosition: 'right 0.75rem center'
                        }}
                      >
                        <option value="Africa/Lagos">🌍 Africa/Lagos (WAT)</option>
                        <option value="America/New_York">🌎 America/New York (EST)</option>
                        <option value="Europe/London">🌍 Europe/London (GMT)</option>
                        <option value="Asia/Dubai">🌏 Asia/Dubai (GST)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization Address
                    </label>
                    <textarea
                      value={settings.general.address}
                      onChange={(e) => updateSetting('general', 'address', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white resize-none font-medium"
                      placeholder="Organization address"
                      rows={3}
                    />
                  </div>
                  </div>

                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Business Hours & Limits</h3>
                        <p className="text-gray-600 text-sm">Configure operating hours and system limits</p>
                      </div>
                    </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Business Start Time
                      </label>
                      <input
                        type="time"
                        value={settings.general.businessHours.start}
                        onChange={(e) => updateNestedSetting('general', 'businessHours', 'start', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Business End Time
                      </label>
                      <input
                        type="time"
                        value={settings.general.businessHours.end}
                        onChange={(e) => updateNestedSetting('general', 'businessHours', 'end', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-semibold"
                      />
                    </div>
                  </div>
                  </div>
                </div>
              </TabPanel>

              {/* Badge Settings */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Badge Configuration</h3>
                    <p className="text-gray-500 text-sm">Configure badge generation and management settings</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Auto-generate Badge IDs</Text>
                        <Text className="text-sm text-gray-600">Automatically generate unique badge IDs for visitors</Text>
                      </div>
                      <Switch 
                        checked={settings.badges.autoGenerateId}
                        onChange={(value) => updateSetting('badges', 'autoGenerateId', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Require Photo</Text>
                        <Text className="text-sm text-gray-600">Require visitor photo for badge generation</Text>
                      </div>
                      <Switch 
                        checked={settings.badges.requirePhoto}
                        onChange={(value) => updateSetting('badges', 'requirePhoto', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Print on Check-in</Text>
                        <Text className="text-sm text-gray-600">Automatically print badges when visitors check in</Text>
                      </div>
                      <Switch 
                        checked={settings.badges.printOnCheckIn}
                        onChange={(value) => updateSetting('badges', 'printOnCheckIn', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Security Settings */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
                    <p className="text-gray-500 text-sm">Configure security and access control settings</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Require Host Approval</Text>
                        <Text className="text-sm text-gray-600">All visitors must be approved by their host</Text>
                      </div>
                      <Switch 
                        checked={settings.security.requireApproval}
                        onChange={(value) => updateSetting('security', 'requireApproval', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Blacklist Check</Text>
                        <Text className="text-sm text-gray-600">Check visitors against security blacklist</Text>
                      </div>
                      <Switch 
                        checked={settings.security.blacklistCheck}
                        onChange={(value) => updateSetting('security', 'blacklistCheck', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Multi-Factor Authentication</Text>
                        <Text className="text-sm text-gray-600">Enable MFA for admin users</Text>
                      </div>
                      <Switch 
                        checked={settings.security.multiFactorAuth}
                        onChange={(value) => updateSetting('security', 'multiFactorAuth', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Notification Settings */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                    <p className="text-gray-500 text-sm">Configure how system notifications are delivered</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Email Notifications</Text>
                        <Text className="text-sm text-gray-600">Send notifications via email</Text>
                      </div>
                      <Switch 
                        checked={settings.notifications.emailNotifications}
                        onChange={(value) => updateSetting('notifications', 'emailNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">SMS Notifications</Text>
                        <Text className="text-sm text-gray-600">Send notifications via SMS</Text>
                      </div>
                      <Switch 
                        checked={settings.notifications.smsNotifications}
                        onChange={(value) => updateSetting('notifications', 'smsNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Push Notifications</Text>
                        <Text className="text-sm text-gray-600">Send push notifications to mobile devices</Text>
                      </div>
                      <Switch 
                        checked={settings.notifications.pushNotifications}
                        onChange={(value) => updateSetting('notifications', 'pushNotifications', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Emergency Settings */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Configuration</h3>
                    <p className="text-gray-500 text-sm">Configure emergency evacuation and safety settings</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Text className="font-medium">Enable Evacuation Mode</Text>
                        <Text className="text-sm text-gray-600">Allow emergency evacuation procedures</Text>
                      </div>
                      <Switch 
                        checked={settings.emergency.evacuationEnabled}
                        onChange={(value) => updateSetting('emergency', 'evacuationEnabled', value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Auto-refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        value={settings.emergency.autoRefreshInterval}
                        onChange={(e) => updateSetting('emergency', 'autoRefreshInterval', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white"
                        min="10"
                        max="300"
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
