import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanels,
  TabPanel,
  TextInput,
  Switch,
  NumberInput,
  Grid,
  Flex,
  Button,
  Dialog,
  DialogPanel
} from '@tremor/react';
import {
  CogIcon,
  BuildingOfficeIcon,
  MapIcon,
  ShieldCheckIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
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

  // Floor Management State
  const [floors, setFloors] = useState([]);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [newFloor, setNewFloor] = useState({ name: '', number: '', type: 'general' });
  const [addingFloor, setAddingFloor] = useState(false);

  // Floor Detail Modal State
  const [isFloorDetailOpen, setIsFloorDetailOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [floorHosts, setFloorHosts] = useState([]);
  const [floorReceptionists, setFloorReceptionists] = useState([]);
  const [loadingFloorDetails, setLoadingFloorDetails] = useState(false);

  // Floor Delete Modal State
  const [isDeleteFloorOpen, setIsDeleteFloorOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);

  const fetchFloors = async () => {
    try {
      setLoadingFloors(true);
      const data = await ApiService.getFloors();
      setFloors(data || []);
    } catch (error) {
      console.error('Failed to fetch floors:', error);
    } finally {
      setLoadingFloors(false);
    }
  };

  useEffect(() => {
    if (activeTab === 2) { // Assuming Floors is the 3rd tab (index 2)
      fetchFloors();
    }
  }, [activeTab]);

  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!newFloor.name || newFloor.number === '') return;

    try {
      setAddingFloor(true);
      await ApiService.createFloor({
        ...newFloor,
        number: parseInt(newFloor.number)
      });
      setNewFloor({ name: '', number: '', type: 'general' });
      fetchFloors();
      setSavedMessage('Floor added successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add floor:', error);
      if (error.code === '23505' || (error.message && error.message.includes('unique constraint'))) {
        alert('A floor with this number already exists. Please choose a different number.');
      } else {
        alert(error.message || 'Failed to add floor');
      }
    } finally {
      setAddingFloor(false);
    }
  };

  const handleViewFloor = async (floor) => {
    setSelectedFloor(floor);
    setIsFloorDetailOpen(true);
    setLoadingFloorDetails(true);
    try {
      const [allHosts, allUsers] = await Promise.all([
        ApiService.getHosts(),
        ApiService.getUsers({ role: 'reception' })
      ]);

      // Filter hosts for this floor
      // floor.number is integer from DB. Host floor_number should match.
      const hostsOnFloor = allHosts.filter(h => h.floor_number === floor.number);
      setFloorHosts(hostsOnFloor);

      // Filter receptionists for this floor
      // assigned_floors is an array of floor numbers.
      const receptionistsForFloor = allUsers.filter(u =>
        u.role === 'reception' &&
        Array.isArray(u.assigned_floors) &&
        u.assigned_floors.some(f => parseInt(f) === floor.number)
      );
      setFloorReceptionists(receptionistsForFloor);

    } catch (error) {
      console.error('Failed to load floor details:', error);
    } finally {
      setLoadingFloorDetails(false);
    }
  };

  const confirmDeleteFloor = (floor) => {
    setFloorToDelete(floor);
    setIsDeleteFloorOpen(true);
  };

  const executeDeleteFloor = async () => {
    if (!floorToDelete) return;
    try {
      await ApiService.deleteFloor(floorToDelete.id);
      fetchFloors();
      setSavedMessage('Floor deleted successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
      setIsDeleteFloorOpen(false);
      setFloorToDelete(null);
    } catch (error) {
      console.error('Failed to delete floor:', error);
      alert('Failed to delete floor');
    }
  };

  const tabsConfig = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'badges', label: 'Badges', icon: BuildingOfficeIcon },
    { id: 'floors', label: 'Floors', icon: MapIcon },
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg border-2 border-green-200 dark:border-green-700 shadow-sm"
              >
                <CheckIcon className="h-5 w-5" />
                <span className="text-sm font-semibold">{savedMessage}</span>
              </motion.div>
            )}
            <button
              onClick={loadSettings}
              disabled={isLoading}
              className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border-2 border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <CheckIcon className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 border-gray-100 dark:border-slate-800">
          <TabGroup index={activeTab} onIndexChange={setActiveTab}>
            <TabList className="border-b-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 rounded-t-xl">
              {tabsConfig.map((tab, index) => (
                <Tab
                  key={tab.id}
                  className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 data-[selected]:text-slate-900 dark:data-[selected]:text-white data-[selected]:bg-white dark:data-[selected]:bg-slate-900 data-[selected]:border-b-2 data-[selected]:border-slate-900 dark:data-[selected]:border-blue-400 first:rounded-tl-xl last:rounded-tr-xl hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
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
                  <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-white dark:text-slate-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Organization Information</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Configure your organization's basic information</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={settings.general.organizationName}
                          onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-medium"
                          placeholder="Your organization name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={settings.general.email}
                          onChange={(e) => updateSetting('general', 'email', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-medium"
                          placeholder="contact@organization.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={settings.general.phone}
                          onChange={(e) => updateSetting('general', 'phone', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-medium"
                          placeholder="+234-123-456-7890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-semibold cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
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
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Organization Address
                      </label>
                      <textarea
                        value={settings.general.address}
                        onChange={(e) => updateSetting('general', 'address', e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all resize-none font-medium"
                        placeholder="Organization address"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Business Hours & Limits</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Configure operating hours and system limits</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Business Start Time
                        </label>
                        <input
                          type="time"
                          value={settings.general.businessHours.start}
                          onChange={(e) => updateNestedSetting('general', 'businessHours', 'start', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Business End Time
                        </label>
                        <input
                          type="time"
                          value={settings.general.businessHours.end}
                          onChange={(e) => updateNestedSetting('general', 'businessHours', 'end', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-semibold"
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Badge Configuration</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Configure badge generation and management settings</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Auto-generate Badge IDs</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Automatically generate unique badge IDs for visitors</Text>
                      </div>
                      <Switch
                        checked={settings.badges.autoGenerateId}
                        onChange={(value) => updateSetting('badges', 'autoGenerateId', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Require Photo</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Require visitor photo for badge generation</Text>
                      </div>
                      <Switch
                        checked={settings.badges.requirePhoto}
                        onChange={(value) => updateSetting('badges', 'requirePhoto', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Print on Check-in</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Automatically print badges when visitors check in</Text>
                      </div>
                      <Switch
                        checked={settings.badges.printOnCheckIn}
                        onChange={(value) => updateSetting('badges', 'printOnCheckIn', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Floor Management */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Floor Management</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Manage building floors and levels</p>
                    </div>
                  </div>

                  {/* Add Floor Form */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add New Floor</h4>
                    <form onSubmit={handleAddFloor} className="flex gap-4 items-end flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                          Floor Name
                        </label>
                        <TextInput
                          placeholder="e.g. 21st Floor"
                          value={newFloor.name}
                          onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                          Number
                        </label>
                        <NumberInput
                          placeholder="21"
                          value={newFloor.number}
                          onChange={(e) => setNewFloor({ ...newFloor, number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                          Type
                        </label>
                        <select
                          className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-[38px]"
                          value={newFloor.type}
                          onChange={(e) => setNewFloor({ ...newFloor, type: e.target.value })}
                        >
                          <option value="general">General</option>
                          <option value="vip">VIP</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="parking">Parking</option>
                        </select>
                      </div>
                      <Button
                        loading={addingFloor}
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                        icon={PlusIcon}
                      >
                        Add Floor
                      </Button>
                    </form>
                  </div>

                  {/* Floors List */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                          {loadingFloors ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading floors...</td>
                            </tr>
                          ) : floors.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                No floors defined. Please ask admin to run SQL migration or add one above.
                              </td>
                            </tr>
                          ) : (
                            floors.map((floor) => (
                              <tr
                                key={floor.id}
                                className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                onClick={() => handleViewFloor(floor)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {floor.number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {floor.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  <span className="capitalize px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {floor.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      confirmDeleteFloor(floor);
                                    }}
                                    className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    title="Delete Floor"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Security Settings */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Configuration</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Configure security and access control settings</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Require Host Approval</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">All visitors must be approved by their host</Text>
                      </div>
                      <Switch
                        checked={settings.security.requireApproval}
                        onChange={(value) => updateSetting('security', 'requireApproval', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Blacklist Check</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Check visitors against security blacklist</Text>
                      </div>
                      <Switch
                        checked={settings.security.blacklistCheck}
                        onChange={(value) => updateSetting('security', 'blacklistCheck', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Multi-Factor Authentication</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Enable MFA for admin users</Text>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Configure how system notifications are delivered</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Email Notifications</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Send notifications via email</Text>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(value) => updateSetting('notifications', 'emailNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">SMS Notifications</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Send notifications via SMS</Text>
                      </div>
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onChange={(value) => updateSetting('notifications', 'smsNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Push Notifications</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Send push notifications to mobile devices</Text>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Configuration</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Configure emergency evacuation and safety settings</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <Text className="font-medium dark:text-white">Enable Evacuation Mode</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Allow emergency evacuation procedures</Text>
                      </div>
                      <Switch
                        checked={settings.emergency.evacuationEnabled}
                        onChange={(value) => updateSetting('emergency', 'evacuationEnabled', value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Auto-refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        value={settings.emergency.autoRefreshInterval}
                        onChange={(e) => updateSetting('emergency', 'autoRefreshInterval', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
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

      {/* Floor Detail Modal */}
      <Dialog open={isFloorDetailOpen} onClose={() => setIsFloorDetailOpen(false)} static={true}>
        <DialogPanel className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl ring-1 ring-gray-950/5 dark:ring-white/10 z-50">
          {selectedFloor && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Title className="text-xl">Floor {selectedFloor.number}: {selectedFloor.name}</Title>
                  <Text className="capitalize text-blue-600">{selectedFloor.type} Floor</Text>
                </div>
                <button
                  onClick={() => setIsFloorDetailOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingFloorDetails ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
                  <Text>Loading floor details...</Text>
                </div>
              ) : (
                <Grid numItems={1} numItemsMd={2} className="gap-6">
                  {/* Hosts Section */}
                  <Card>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Title>Assigned Hosts</Title>
                        <Text>{floorHosts.length} hosts on this floor</Text>
                      </div>
                    </div>

                    {floorHosts.length > 0 ? (
                      <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                        {floorHosts.map(host => (
                          <div key={host.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{host.name}</div>
                              <div className="text-xs text-gray-500">{host.email}</div>
                            </div>
                            {host.office_number && (
                              <div className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-mono border border-gray-200 dark:border-slate-600">
                                {host.office_number}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
                        <Text>No hosts assigned to this floor</Text>
                      </div>
                    )}
                  </Card>

                  {/* Receptionists Section */}
                  <Card>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Title>Managing Receptionists</Title>
                        <Text>{floorReceptionists.length} receptionists covering this floor</Text>
                      </div>
                    </div>

                    {floorReceptionists.length > 0 ? (
                      <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                        {floorReceptionists.map(receptionist => (
                          <div key={receptionist.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                              {receptionist.full_name?.charAt(0) || 'R'}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{receptionist.full_name}</div>
                              <div className="text-xs text-gray-500">{receptionist.phone || 'No phone'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
                        <Text>No specific receptionists assigned</Text>
                      </div>
                    )}
                  </Card>
                </Grid>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={() => setIsFloorDetailOpen(false)}>
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogPanel>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteFloorOpen} onClose={() => setIsDeleteFloorOpen(false)}>
        <DialogPanel className="max-w-md mx-auto bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl ring-1 ring-gray-950/5 dark:ring-white/10 z-50">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <Title className="mb-2">Delete Floor?</Title>
            <Text className="mb-6">
              Are you sure you want to delete <strong>{floorToDelete?.name}</strong>?
              This action cannot be undone and might affect hosts assigned to this floor.
            </Text>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteFloorOpen(false)}>
                Cancel
              </Button>
              <Button color="red" onClick={executeDeleteFloor}>
                Delete Floor
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </DashboardLayout>
  );
};

export default SystemSettings;
