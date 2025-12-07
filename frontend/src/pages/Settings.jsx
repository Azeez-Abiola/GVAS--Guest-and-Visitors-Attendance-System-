import { useState } from 'react'
import { Card, Title, Text } from '@tremor/react'
import { Settings as SettingsIcon, Bell, Shield, User, Lock, Mail, Building } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

const Settings = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account and system preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:w-64 h-fit p-2 rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>

          {/* Content Area */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-900/20">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
                        <p className="text-gray-500">{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <User size={16} className="text-gray-400" /> Full Name
                        </label>
                        <input 
                          type="text" 
                          disabled
                          value={profile?.full_name || ''}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" /> Email Address
                        </label>
                        <input 
                          type="email" 
                          disabled
                          value={profile?.email || ''}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Shield size={16} className="text-gray-400" /> Role
                        </label>
                        <input 
                          type="text" 
                          disabled
                          value={profile?.role || ''}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed capitalize"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Building size={16} className="text-gray-400" /> Tenant ID
                        </label>
                        <input 
                          type="text" 
                          disabled
                          value={profile?.tenant_id || ''}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-mono text-sm"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Bell className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                      <p className="text-sm text-gray-500">Manage how you receive alerts and updates</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {['Visitor Check-in Alerts', 'Approval Requests', 'Security Alerts', 'Weekly Reports'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="font-medium text-gray-900">{item}</h3>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Lock className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
                      <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                      <Shield className="text-amber-600 shrink-0" size={20} />
                      <div>
                        <h3 className="font-medium text-amber-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-amber-700 mt-1">Add an extra layer of security to your account by enabling 2FA.</p>
                        <button className="mt-3 text-sm font-medium text-amber-700 hover:text-amber-900 underline">Enable 2FA</button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Change Password</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <input 
                          type="password" 
                          placeholder="Current Password"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                        />
                        <input 
                          type="password" 
                          placeholder="New Password"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                        />
                        <input 
                          type="password" 
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings
