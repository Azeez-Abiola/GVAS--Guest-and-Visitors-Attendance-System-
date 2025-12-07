import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import ApiService from '../../services/api';
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
  PlusIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Load incidents from database
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'red';
      case 'investigating': return 'yellow';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security': return <ShieldExclamationIcon className="h-5 w-5" />;
      case 'visitor': return <UserIcon className="h-5 w-5" />;
      case 'emergency': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const IncidentForm = ({ incident, onClose, onSave }) => {
    const [formData, setFormData] = useState(
      incident || {
        title: '',
        description: '',
        type: 'security',
        severity: 'medium',
        location: '',
        assignedTo: ''
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      if (incident) {
        setIncidents(incidents.map(inc => 
          inc.id === incident.id ? { ...inc, ...formData, updatedAt: new Date().toISOString() } : inc
        ));
      } else {
        const newIncident = {
          ...formData,
          id: Date.now(),
          status: 'open',
          reportedBy: 'current.user@company.com',
          reportedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: [{
            time: new Date().toISOString(),
            action: 'Incident created',
            user: 'current.user@company.com'
          }]
        };
        setIncidents([newIncident, ...incidents]);
      }
      onClose();
    };

    return (
      <DialogPanel className="max-w-2xl">
        <Title className="mb-4">
          {incident ? 'Edit Incident' : 'Create New Incident'}
        </Title>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Text className="mb-2">Title</Text>
            <TextInput
              placeholder="Enter incident title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Text className="mb-2">Description</Text>
            <Textarea
              placeholder="Describe the incident in detail"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-2">Type</Text>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="visitor">Visitor Related</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </Select>
            </div>

            <div>
              <Text className="mb-2">Severity</Text>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </Select>
            </div>
          </div>

          <div>
            <Text className="mb-2">Location</Text>
            <TextInput
              placeholder="Enter incident location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div>
            <Text className="mb-2">Assigned To</Text>
            <TextInput
              placeholder="Enter assignee email"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </div>

          <Flex justifyContent="end" className="mt-6 space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {incident ? 'Update' : 'Create'} Incident
            </Button>
          </Flex>
        </form>
      </DialogPanel>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-500">Track and manage security incidents and events</p>
        </div>
        <button 
          onClick={() => setIsCreateIncidentOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create Incident
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
          <TabList className="border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
            <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 first:rounded-tl-xl hover:text-gray-900 transition-colors">
              Active Incidents
            </Tab>
            <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 hover:text-gray-900 transition-colors">
              Incident Analytics
            </Tab>
            <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 hover:text-gray-900 transition-colors">
              Response Protocols
            </Tab>
            <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 last:rounded-tr-xl hover:text-gray-900 transition-colors">
              Incident History
            </Tab>
          </TabList>

        <TabPanels>
          {/* Active Incidents Tab */}
          <TabPanel>
            {/* Statistics Cards */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-6 mb-6">
              <Card className="p-6">
                <Flex alignItems="start">
                  <div>
                    <Text>Total Incidents</Text>
                    <Metric>{incidents.length}</Metric>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-gray-500" />
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex alignItems="start">
                  <div>
                    <Text>Open</Text>
                    <Metric>{incidents.filter(inc => inc.status === 'open').length}</Metric>
                  </div>
                  <ClockIcon className="h-8 w-8 text-red-500" />
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex alignItems="start">
                  <div>
                    <Text>Investigating</Text>
                    <Metric>{incidents.filter(inc => inc.status === 'investigating').length}</Metric>
                  </div>
                  <EyeIcon className="h-8 w-8 text-yellow-500" />
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex alignItems="start">
                  <div>
                    <Text>Resolved</Text>
                    <Metric>{incidents.filter(inc => inc.status === 'resolved').length}</Metric>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex alignItems="start">
                  <div>
                    <Text>High Priority</Text>
                    <Metric>{incidents.filter(inc => inc.severity === 'high' || inc.severity === 'critical').length}</Metric>
                  </div>
                  <ShieldExclamationIcon className="h-8 w-8 text-orange-500" />
                </Flex>
              </Card>
            </Grid>

            {/* Filters */}
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text className="mb-2">Search</Text>
                  <TextInput
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <Text className="mb-2">Status</Text>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </Select>
                </div>

                <div>
                  <Text className="mb-2">Severity</Text>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Incidents Table */}
            <Card className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <Text className="text-gray-500">Loading incidents...</Text>
                  </div>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <ShieldExclamationIcon />
                  </div>
                  <Title className="mb-2">No Incidents Found</Title>
                  <Text className="text-gray-500 mb-6">
                    {incidents.length === 0 
                      ? "No incidents have been reported yet. Security incidents will appear here."
                      : "No incidents match your current filters. Try adjusting your search criteria."
                    }
                  </Text>
                  <Button
                    icon={PlusIcon}
                    onClick={() => setIsCreateIncidentOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    Report New Incident
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHead className="bg-gray-50">
                      <TableRow>
                        <TableHeaderCell className="font-semibold text-gray-700">Incident</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Type</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Severity</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Status</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Location</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Assigned To</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Reported</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-gray-700">Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredIncidents.map(incident => (
                        <TableRow key={incident.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div>
                              <Text className="font-medium text-gray-900">{incident.title}</Text>
                              <Text className="text-sm text-gray-500">
                                {incident.description?.substring(0, 60)}...
                              </Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(incident.type || incident.category)}
                              <Text className="text-sm capitalize text-gray-700">{incident.type || incident.category}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge color={getSeverityColor(incident.severity)}>
                              {incident.severity?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge color={getStatusColor(incident.status)}>
                          {incident.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <Text className="text-sm text-gray-700">{incident.location}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Text className="text-sm text-gray-700">{incident.assigned_to || incident.assignedTo}</Text>
                      </TableCell>
                      <TableCell>
                        <Text className="text-sm text-gray-700">
                          {new Date(incident.reported_at || incident.reportedAt || incident.created_at).toLocaleDateString()}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="xs"
                            variant="secondary"
                            icon={EyeIcon}
                            onClick={() => {
                              setSelectedIncident(incident);
                              setIsViewDetailsOpen(true);
                            }}
                            className="hover:bg-slate-900 hover:text-white transition-colors"
                          >
                            View
                          </Button>
                          <Button
                            size="xs"
                            variant="secondary"
                            icon={PencilIcon}
                            className="hover:bg-slate-900 hover:text-white transition-colors"
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
              )}
            </Card>
          </TabPanel>

          {/* Incident Analytics Tab */}
          <TabPanel>
            <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
              <Card className="p-6">
                <Title className="mb-4">Incidents by Type</Title>
                <div className="space-y-4">
                  {['security', 'visitor', 'emergency', 'maintenance'].map(type => {
                    const count = incidents.filter(inc => inc.type === type).length;
                    const percentage = incidents.length ? (count / incidents.length) * 100 : 0;
                    return (
                      <div key={type}>
                        <Flex justifyContent="between" className="mb-1">
                          <Text className="capitalize">{type}</Text>
                          <Text>{count} incidents</Text>
                        </Flex>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-slate-900 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <Title className="mb-4">Resolution Time</Title>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <Text>{'< 1 hour'}</Text>
                    <Badge color="green">Fast Response</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <Text>1-4 hours</Text>
                    <Badge color="yellow">Standard</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <Text>{'> 4 hours'}</Text>
                    <Badge color="red">Delayed</Badge>
                  </div>
                </div>
              </Card>
            </Grid>

            <Card className="p-6">
              <Title className="mb-4">Recent Incident Trends</Title>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="p-4 bg-gray-50 rounded">
                    <Text className="text-sm font-medium">{day}</Text>
                    <Metric className="mt-2">{Math.floor(Math.random() * 10)}</Metric>
                  </div>
                ))}
              </div>
            </Card>
          </TabPanel>

          {/* Response Protocols Tab */}
          <TabPanel>
            <div className="space-y-6">
              <Card className="p-6">
                <Title className="mb-4">Security Incident Protocol</Title>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <div>
                      <Text className="font-medium">Immediate Response</Text>
                      <Text className="text-sm text-gray-600">Secure the area and assess the threat level</Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <div>
                      <Text className="font-medium">Notification</Text>
                      <Text className="text-sm text-gray-600">Alert security team and relevant stakeholders</Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <div>
                      <Text className="font-medium">Investigation</Text>
                      <Text className="text-sm text-gray-600">Gather evidence and interview witnesses</Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                    <div>
                      <Text className="font-medium">Resolution</Text>
                      <Text className="text-sm text-gray-600">Implement corrective actions and document findings</Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Title className="mb-4">Emergency Contacts</Title>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Role</TableHeaderCell>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Phone</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><Badge color="red">Security Manager</Badge></TableCell>
                      <TableCell>John Smith</TableCell>
                      <TableCell>+1-555-0101</TableCell>
                      <TableCell>security.manager@company.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge color="blue">Facilities</Badge></TableCell>
                      <TableCell>Jane Doe</TableCell>
                      <TableCell>+1-555-0102</TableCell>
                      <TableCell>facilities@company.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge color="green">IT Support</Badge></TableCell>
                      <TableCell>Mike Johnson</TableCell>
                      <TableCell>+1-555-0103</TableCell>
                      <TableCell>it.support@company.com</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabPanel>

          {/* Incident History Tab */}
          <TabPanel>
            <Card className="p-6">
              <Title className="mb-4">All Incidents</Title>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Reported Date</TableHeaderCell>
                    <TableHeaderCell>Resolved Date</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map(incident => (
                    <TableRow key={incident.id}>
                      <TableCell>#{incident.id}</TableCell>
                      <TableCell>{incident.title}</TableCell>
                      <TableCell className="capitalize">{incident.type}</TableCell>
                      <TableCell>
                        <Badge color={getStatusColor(incident.status)}>
                          {incident.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(incident.reportedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {incident.status === 'resolved' ? new Date(incident.updatedAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="xs" variant="secondary" icon={EyeIcon}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
        </TabPanels>
        </TabGroup>
      </div>

      {/* Create Incident Dialog */}
      <Dialog open={isCreateIncidentOpen} onClose={() => setIsCreateIncidentOpen(false)}>
        <IncidentForm
          onClose={() => setIsCreateIncidentOpen(false)}
          onSave={() => setIsCreateIncidentOpen(false)}
        />
      </Dialog>

      {/* View Incident Details Dialog */}
      <Dialog open={isViewDetailsOpen} onClose={() => setIsViewDetailsOpen(false)}>
        <DialogPanel className="max-w-4xl">
          {selectedIncident && (
            <>
              <Title className="mb-4">Incident Details</Title>
              
              <div className="space-y-6">
                {/* Header Info */}
                <Card className="p-4">
                  <Flex justifyContent="between" className="mb-4">
                    <div>
                      <Title className="mb-2">{selectedIncident.title}</Title>
                      <Text className="text-sm text-gray-600">
                        Incident #{selectedIncident.id} • Reported {new Date(selectedIncident.reportedAt).toLocaleString()}
                      </Text>
                    </div>
                    <div className="flex space-x-2">
                      <Badge color={getSeverityColor(selectedIncident.severity)}>
                        {selectedIncident.severity.toUpperCase()}
                      </Badge>
                      <Badge color={getStatusColor(selectedIncident.status)}>
                        {selectedIncident.status.toUpperCase()}
                      </Badge>
                    </div>
                  </Flex>
                  
                  <Text className="mb-4">{selectedIncident.description}</Text>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Text className="font-medium">Location</Text>
                      <Text>{selectedIncident.location}</Text>
                    </div>
                    <div>
                      <Text className="font-medium">Reported By</Text>
                      <Text>{selectedIncident.reportedBy}</Text>
                    </div>
                    <div>
                      <Text className="font-medium">Assigned To</Text>
                      <Text>{selectedIncident.assignedTo}</Text>
                    </div>
                  </div>
                </Card>

                {/* Timeline */}
                <Card className="p-4">
                  <Title className="mb-4">Timeline</Title>
                  <div className="space-y-3">
                    {selectedIncident.timeline?.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <Text className="text-sm font-medium">{event.action}</Text>
                          <Text className="text-xs text-gray-500">
                            {new Date(event.time).toLocaleString()} • {event.user}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Evidence */}
                {selectedIncident.evidence && (
                  <Card className="p-4">
                    <Title className="mb-4">Evidence</Title>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.evidence.map((item, index) => (
                        <Badge key={index} color="blue">{item}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <Flex justifyContent="end" className="mt-6">
                <Button onClick={() => setIsViewDetailsOpen(false)}>
                  Close
                </Button>
              </Flex>
            </>
          )}
        </DialogPanel>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default IncidentManagement;