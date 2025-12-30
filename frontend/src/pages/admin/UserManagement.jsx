import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import ApiService from '../../services/api';
import { generateSecurePassword, copyToClipboard } from '../../utils/auth';
import showToast from '../../utils/toast';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  SelectItem,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Metric,
  TabGroup,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Dialog,
  DialogPanel,
  Flex,
  Grid
} from '@tremor/react';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import BulkImportModal from './components/BulkImportModal';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);


  // Define available roles
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      color: 'blue',
      permissions: ['manage_users', 'manage_visitors', 'manage_badges', 'view_reports', 'manage_system']
    },
    {
      id: 'host',
      name: 'Host',
      color: 'blue',
      permissions: ['approve_visitors', 'view_own_visitors', 'manage_approvals']
    },
    {
      id: 'security',
      name: 'Security',
      color: 'blue',
      permissions: ['check_in_visitors', 'manage_evacuation', 'view_blacklist']
    },
    {
      id: 'reception',
      name: 'Reception',
      color: 'blue',
      permissions: ['check_in_visitors', 'manage_badges', 'view_visitors']
    }
  ];

  // Load users from database
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await ApiService.getUsers({ role: roleFilter });
      let mergedUsers = usersData || [];
      // For hosts, merge in floor_number from hosts table
      const hostUsers = mergedUsers.filter(u => u.role === 'host');
      if (hostUsers.length > 0) {
        const hostsDetails = await ApiService.getHosts();
        mergedUsers = mergedUsers.map(u => {
          if (u.role === 'host') {
            const details = hostsDetails.find(h => h.email === u.email);
            return {
              ...u,
              floor_number: details ? details.floor_number : null
            };
          }
          return u;
        });
      }
      setUsers(mergedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (is_active) => {
    return is_active ? (
      <Badge color="green">Active</Badge>
    ) : (
      <Badge color="red">Inactive</Badge>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'blue',
      host: 'blue',
      security: 'blue',
      reception: 'blue'
    };
    return <Badge color={colors[role] || 'blue'}>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A'}</Badge>;
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await ApiService.deleteUser(userToDelete.id);
      await loadUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setIsDetailModalOpen(false); // Close detail modal if open
      showToast(`User ${userToDelete.full_name} deleted successfully`, 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast('Failed to delete user. Please try again.', 'error');
    }
  };

  const UserForm = ({ user, isEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState(
      user || {
        full_name: '',
        email: '',
        role: 'reception',
        phone: '',
        is_active: true,
        assigned_floors: [],
        office_number: '',
        floor_number: null
      }
    );
    const [loading, setLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(!isEdit);
    const [passwordCopied, setPasswordCopied] = useState(false);
    const [userCreated, setUserCreated] = useState(false); // Track if user was just created

    // Dynamic Floors State
    const [floors, setFloors] = useState([]);
    const [loadingFloors, setLoadingFloors] = useState(false);

    useEffect(() => {
      const loadFloors = async () => {
        try {
          setLoadingFloors(true);
          const data = await ApiService.getFloors();
          if (data && data.length > 0) {
            // Map API data to component format
            // API returns: { id, name, number, type }
            // Component expects: { id, name } where id is floor number (API uses integer, we might need string for value match)
            const formatted = data.map(f => ({
              id: f.number, // Use number as ID for user assignment
              name: f.name,
              // Add icon logic if needed, or generic
              icon: '🏢'
            }));
            setFloors(formatted);
          } else {
            // Fallback
            setFloors([
              { id: 0, name: 'Ground Floor', icon: 'G' },
              { id: 1, name: '1st Floor', icon: '1' },
              { id: 2, name: '2nd Floor', icon: '2' },
              { id: 3, name: '3rd Floor', icon: '3' },
              { id: 4, name: '4th Floor', icon: '4' },
              { id: 5, name: '5th Floor', icon: '5' },
              { id: 6, name: '6th Floor', icon: '6' },
              { id: 7, name: '7th Floor', icon: '7' },
              { id: 8, name: '8th Floor', icon: '8' },
              { id: 9, name: '9th Floor', icon: '9' },
            ]);
          }
        } catch (error) {
          console.error('Failed to load floors:', error);
        } finally {
          setLoadingFloors(false);
        }
      };
      loadFloors();
    }, []);

    // Use dynamic floors or empty array while loading
    const availableFloors = floors;

    const handleFloorToggle = (floorId) => {
      const currentFloors = formData.assigned_floors || [];
      if (currentFloors.includes(floorId)) {
        setFormData({
          ...formData,
          assigned_floors: currentFloors.filter(f => f !== floorId)
        });
      } else {
        setFormData({
          ...formData,
          assigned_floors: [...currentFloors, floorId]
        });
      }
    };

    const handleCopyPassword = async () => {
      const success = await copyToClipboard(generatedPassword);
      if (success) {
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        let password = null;

        // Generate password for new users if auto-generate is enabled
        if (!isEdit && autoGeneratePassword) {
          password = generateSecurePassword(12);
          setGeneratedPassword(password);
          setShowPassword(true);
        }

        const userData = {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          is_active: formData.is_active,
          assigned_floors: formData.role === 'reception' ? formData.assigned_floors : []
        };

        let savedUser;
        if (isEdit) {
          await ApiService.updateUser(user.id, userData);
          savedUser = user;
        } else {
          // Create user with password handled separately
          savedUser = await ApiService.createUser({
            ...userData,
            password: password || undefined
          });
        }

        // If role is host, also create/update host record
        if (formData.role === 'host') {
          const hostData = {
            id: user?.id || savedUser?.id, // Ensure host record uses same id as user
            name: formData.full_name,
            email: formData.email,
            phone: formData.phone || '',
            office_number: formData.office_number || '',
            floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
            role: 'host',
            active: formData.is_active
          };

          if (isEdit) {
            // Update existing host record
            const { error } = await ApiService.supabase
              .from('hosts')
              .update(hostData)
              .eq('email', formData.email);

            if (error) {
              console.error('Failed to update host:', error);
              // Create if doesn't exist
              const { error: insertError } = await ApiService.supabase.from('hosts').insert(hostData);
              if (insertError) {
                console.error('Failed to create host:', insertError);
                throw new Error(`Failed to create host record: ${insertError.message}`);
              }
            }
          } else {
            // Create new host record
            const { error: insertError } = await ApiService.supabase.from('hosts').insert(hostData);
            if (insertError) {
              console.error('Failed to create host:', insertError);
              throw new Error(`Failed to create host record: ${insertError.message}`);
            }
          }
        }

        await loadUsers();

        // Show success toast
        if (isEdit) {
          showToast(`User ${formData.full_name} updated successfully`, 'success');
          onClose();
        } else {
          // Don't close modal if password was generated - let user copy it first
          if (password) {
            setUserCreated(true); // Mark user as created to show "Done" button
          } else {
            onClose();
          }
          showToast(`User ${formData.full_name} created successfully! ${password ? 'Copy the password below.' : 'Share login credentials with them.'}`, 'success');
        }
      } catch (error) {
        console.error('Failed to save user:', error);

        // Handle rate limit error specifically
        if (error.message && error.message.includes('you can only request this after')) {
          const match = error.message.match(/(\d+) seconds/);
          const seconds = match ? match[1] : '60';
          showToast(`⏱️ Rate Limit: Please wait ${seconds} seconds before creating another user.`, 'error');
        } else {
          const errorMessage = error.message || error.error?.message || 'Failed to save user. Please try again.';
          showToast(errorMessage, 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <DialogPanel className="sm:max-w-3xl w-full mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {isEdit ? 'Edit Receptionist' : 'Add New Receptionist'}
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  {isEdit ? 'Update receptionist information and floor assignments' : 'Create a new receptionist account with credentials'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-100 dark:border-slate-700">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                  <TextInput
                    placeholder="e.g., John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                  <TextInput
                    type="email"
                    placeholder="e.g., john.doe@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all disabled:bg-gray-50 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                  />
                  {isEdit && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Email cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <TextInput
                    type="tel"
                    placeholder="e.g., +1 (555) 123-4567"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role & Status Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-100 dark:border-slate-700">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role & Status</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* Role Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">User Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-medium text-gray-900 dark:text-white cursor-pointer"
                    required
                  >
                    <option value="reception">Reception - Front desk operations</option>
                    <option value="admin">Admin - Full system access</option>
                    <option value="security">Security - Security operations</option>
                    <option value="host">Host - Employee/Staff member</option>
                  </select>
                  {formData.role === 'host' && (
                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Hosts are employees who receive visitors
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Status *</label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white font-medium text-gray-900 dark:text-white cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundSize: '1.5rem',
                      backgroundPosition: 'right 0.75rem center'
                    }}
                  >
                    <option value="active">✓ Active - Can access system</option>
                    <option value="inactive">✗ Inactive - Access disabled</option>
                  </select>
                </div>

                {/* Host-specific fields */}
                {formData.role === 'host' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Office Number</label>
                      <input
                        type="text"
                        placeholder="e.g., Room 205"
                        value={formData.office_number || ''}
                        onChange={(e) => setFormData({ ...formData, office_number: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Floor Number *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {availableFloors.map((floor) => (
                          <button
                            key={floor.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, floor_number: floor.id })}
                            className={`group relative p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${formData.floor_number === floor.id
                              ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg'
                              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-1">{floor.icon}</div>
                              <div className="text-xs font-medium">{floor.name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Floor where this host/employee works</p>
                    </div>
                  </>
                )}

                {/* Floor Assignment - Only show for Receptionists */}
                {formData.role === 'reception' && (
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Assigned Floors *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {availableFloors.map((floor) => (
                        <button
                          key={floor.id}
                          type="button"
                          onClick={() => handleFloorToggle(floor.id)}
                          className={`group relative p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${(formData.assigned_floors || []).includes(floor.id)
                            ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-slate-700 dark:hover:border-slate-500 hover:shadow-md'
                            }`}
                        >
                          <div className="text-center">
                            <div className={`text-xs mb-1 font-medium ${(formData.assigned_floors || []).includes(floor.id) ? 'text-gray-300 dark:text-slate-600' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                              Floor
                            </div>
                            <div className="text-2xl font-bold">{floor.id}</div>
                            {(formData.assigned_floors || []).includes(floor.id) && (
                              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-md">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        📍 {(formData.assigned_floors || []).length} floor{(formData.assigned_floors || []).length !== 1 ? 's' : ''} selected
                        {(formData.assigned_floors || []).length > 0 && (
                          <span className="ml-2 text-slate-700 dark:text-gray-400">
                            (Floor {(formData.assigned_floors || []).sort((a, b) => a - b).join(', ')})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password Generation Section (Only for new users) */}
            {!isEdit && (
              <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100 dark:border-slate-700">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Account Security</h3>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoGeneratePassword"
                    checked={autoGeneratePassword}
                    onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                    className="w-5 h-5 text-slate-700 dark:text-blue-400 rounded border-2 border-gray-300 dark:border-slate-600 focus:ring-slate-500 focus:ring-2"
                  />
                  <label htmlFor="autoGeneratePassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Auto-generate secure password
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 ml-8">
                  A secure 12-character password will be generated and displayed after creation
                </p>
              </div>
            )}

            {/* Generated Password Display */}
            {showPassword && generatedPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-5 border-2 border-amber-300"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <Text className="font-bold text-amber-900 mb-2">Generated Password (Copy Now!)</Text>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-amber-300">
                      <code className="flex-1 font-mono text-lg font-bold text-slate-900">{generatedPassword}</code>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        {passwordCopied ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <Text className="text-xs text-amber-800 mt-2">
                      ⚠️ This password will only be shown once. Make sure to copy and share it securely with the user.
                    </Text>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t-2 border-gray-200 dark:border-slate-700">
              {!userCreated ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 text-base font-semibold bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-100 text-white dark:text-slate-900 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isEdit ? 'Update User' : 'Add User'}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done - I've Copied the Password
                </button>
              )}
            </div>
          </form >
        </motion.div >
      </DialogPanel >
    );
  };

  // User Detail Modal Component
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    const getRoleDisplay = (role) => {
      const roleInfo = roles.find(r => r.id === role);
      return roleInfo ? roleInfo.name : role;
    };

    return (
      <DialogPanel className="sm:max-w-2xl w-full mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.full_name}</h2>
                  <p className="text-white/80 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* User Information Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Role</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    {getRoleDisplay(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                {selectedUser.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Inactive
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedUser.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Last Login</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                </p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">User ID</label>
                <p className="text-gray-900 dark:text-white font-mono text-xs bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded border dark:border-slate-700">{selectedUser.id}</p>
              </div>
            </div>

            {/* Assigned Floors (for Reception role) */}
            {selectedUser.role === 'reception' && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <label className="block text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Assigned Floors</label>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.assigned_floors && selectedUser.assigned_floors.length > 0 ? (
                    selectedUser.assigned_floors.sort((a, b) => a - b).map(floor => (
                      <span key={floor} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold">
                        Floor {floor}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 text-sm">No floors assigned</span>
                  )}
                </div>
              </div>
            )}

            {/* Password Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <KeyIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">Password Information</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    Passwords are encrypted and cannot be retrieved. The user should have received their login credentials via email when their account was created.
                    {' '}If they need to reset their password, they can use the "Forgot Password" link on the login page.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Created */}
            <div className="pt-4 border-t dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Account created: {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-slate-800 px-8 py-5 flex items-center justify-end gap-3 border-t dark:border-slate-700">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsDetailModalOpen(false);
                handleEditUser(selectedUser);
              }}
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit User
            </button>
            <button
              onClick={() => handleDeleteUser(selectedUser)}
              className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete User
            </button>
          </div>
        </motion.div>
      </DialogPanel>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage user accounts, roles, and floor assignments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-200 border-2 border-slate-200 dark:border-slate-700 px-6 py-3 rounded-lg text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              Bulk Import
            </button>
            <button
              onClick={handleAddUser}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg text-base font-semibold hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              Add User
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 border-gray-100 dark:border-slate-800">
          <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
            <TabList className="border-b-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 rounded-t-xl">
              <Tab className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 data-[selected]:text-slate-900 dark:data-[selected]:text-white data-[selected]:bg-white dark:data-[selected]:bg-slate-900 data-[selected]:border-b-2 data-[selected]:border-slate-900 dark:data-[selected]:border-blue-400 first:rounded-tl-xl hover:text-slate-700 dark:hover:text-gray-300 transition-colors">
                Users Overview
              </Tab>
              <Tab className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 data-[selected]:text-slate-900 dark:data-[selected]:text-white data-[selected]:bg-white dark:data-[selected]:bg-slate-900 data-[selected]:border-b-2 data-[selected]:border-slate-900 dark:data-[selected]:border-blue-400 last:rounded-tr-xl hover:text-slate-700 dark:hover:text-gray-300 transition-colors">
                Analytics
              </Tab>
            </TabList>

            <TabPanels>
              {/* Users Overview Tab */}
              <TabPanel className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all min-w-[180px] font-semibold cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundSize: '1.5rem',
                      backgroundPosition: 'right 0.75rem center'
                    }}
                  >
                    <option value="all">📊 All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.id === 'admin' ? '👑' : role.id === 'host' ? '🏢' : role.id === 'security' ? '🛡️' : '📋'} {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <Card className="p-12 dark:bg-slate-800 dark:border-slate-700">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                    </div>
                  </Card>
                ) : filteredUsers.length === 0 ? (
                  <Card className="p-12 dark:bg-slate-800 dark:border-slate-700">
                    <div className="text-center">
                      <UserGroupIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No receptionists found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchTerm || roleFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first receptionist'}
                      </p>
                      {!searchTerm && roleFilter === 'all' && (
                        <button
                          onClick={handleAddUser}
                          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                          Add First Receptionist
                        </button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-900 text-white">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">User Details</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Assigned Floors</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Last Login</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {filteredUsers.map((user, index) => (
                            <tr
                              key={user.id}
                              onClick={() => handleViewUser(user)}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white dark:text-slate-900 font-bold text-sm">
                                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{user.full_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-gray-300 border border-slate-200 dark:border-slate-700">
                                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {user.role === 'host' ? (
                                    user.floor_number ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-gray-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                        Floor {user.floor_number}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">No floor</span>
                                    )
                                  ) : user.assigned_floors && user.assigned_floors.length > 0 ? (
                                    user.assigned_floors.sort((a, b) => a - b).map(floor => (
                                      <span key={floor} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-gray-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                        Floor {floor}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-sm">No floors</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {user.is_active ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : (
                                    <span className="text-gray-400 dark:text-gray-500">Never logged in</span>
                                  )}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditUser(user);
                                    }}
                                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-900 dark:hover:border-slate-500 transition-all inline-flex items-center gap-1.5 shadow-sm"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteUser(user);
                                    }}
                                    className="px-3 py-2 text-xs font-semibold text-white bg-red-600 border-2 border-red-600 rounded-lg hover:bg-red-700 hover:border-red-700 transition-all inline-flex items-center gap-1.5 shadow-sm"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabPanel>

              {/* Analytics Tab */}
              <TabPanel className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <UserGroupIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full">
                        <p className="text-xs font-semibold text-white/80">Total</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Total Receptionists</p>
                      <p className="text-4xl font-bold text-white">{users.length}</p>
                      <p className="text-xs text-white/60 mt-2">System-wide count</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full">
                        <p className="text-xs font-semibold text-white/80">Active</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Active Accounts</p>
                      <p className="text-4xl font-bold text-white">{users.filter(u => u.is_active).length}</p>
                      <p className="text-xs text-white/60 mt-2">{users.length > 0 ? Math.round((users.filter(u => u.is_active).length / users.length) * 100) : 0}% of total users</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <KeyIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full">
                        <p className="text-xs font-semibold text-white/80">Admin</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Administrators</p>
                      <p className="text-4xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
                      <p className="text-xs text-white/60 mt-2">Elevated privileges</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full">
                        <p className="text-xs font-semibold text-white/80">Disabled</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Inactive Accounts</p>
                      <p className="text-4xl font-bold text-white">{users.filter(u => !u.is_active).length}</p>
                      <p className="text-xs text-white/60 mt-2">Access suspended</p>
                    </div>
                  </motion.div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-100 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Distribution by Role</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Breakdown of users across different roles</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Total: <span className="font-bold text-slate-900 dark:text-white">{users.length}</span></p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {roles.map(role => {
                      const count = users.filter(u => u.role === role.id).length;
                      const percentage = users.length ? (count / users.length) * 100 : 0;
                      const colors = {
                        admin: 'bg-amber-500',
                        host: 'bg-blue-500',
                        security: 'bg-green-500',
                        reception: 'bg-slate-700'
                      };
                      return (
                        <div key={role.id} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 ${colors[role.id] || 'bg-gray-400'} rounded-full`}></div>
                              <p className="font-semibold text-gray-900 dark:text-white">{role.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white min-w-[4rem] text-right">{count} {count === 1 ? 'user' : 'users'}</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className={`${colors[role.id] || 'bg-gray-400'} h-3 rounded-full shadow-sm`}
                            ></motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onClose={() => setIsAddUserOpen(false)}>
        <UserForm
          onClose={() => setIsAddUserOpen(false)}
          onSave={() => setIsAddUserOpen(false)}
        />
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onClose={() => setIsEditUserOpen(false)}>
        <UserForm
          user={selectedUser}
          isEdit={true}
          onClose={() => setIsEditUserOpen(false)}
          onSave={() => setIsEditUserOpen(false)}
        />
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <UserDetailModal />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <DialogPanel className="sm:max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-red-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ExclamationTriangleIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">Delete User</h2>
                  <p className="text-red-100 text-sm mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <div className="mb-4">
                <p className="text-gray-700 text-base leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">{userToDelete?.full_name}</span>?
                </p>
                <p className="text-gray-600 text-sm mt-3">
                  This will permanently remove:
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Their user account and login credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>All associated permissions and access rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Related records (if role is host)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-4">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Warning:</span> This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-5 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete User
              </button>
            </div>
          </motion.div>
        </DialogPanel>
      </Dialog>


      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onComplete={() => {
          loadUsers();
          // Keep modal open to show results (it handles closing itself)
        }}
      />
    </DashboardLayout >
  );
};

export default UserManagement;










