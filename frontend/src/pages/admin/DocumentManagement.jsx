import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import ApiService from '../../services/api';
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
  TabGroup,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Dialog,
  DialogPanel,
  Flex,
  Grid,
  ProgressBar
} from '@tremor/react';
import {
  DocumentPlusIcon,
  FolderIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  FunnelIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load documents from database/storage
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Note: Document management typically requires file storage (like Supabase Storage)
      // For now, we'll set up the UI structure
      setDocuments([]);
      setCategories([
        { id: 'policies', name: 'Policies & Procedures', count: 0, color: 'blue' },
        { id: 'forms', name: 'Forms & Templates', count: 0, color: 'green' },
        { id: 'reports', name: 'Reports', count: 0, color: 'purple' },
        { id: 'contracts', name: 'Contracts', count: 0, color: 'orange' },
        { id: 'certificates', name: 'Certificates', count: 0, color: 'red' },
        { id: 'other', name: 'Other', count: 0, color: 'gray' }
      ]);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsUploadOpen(false);
          // Add uploaded files to documents list
          const newDocuments = files.map((file, index) => ({
            id: documents.length + index + 1,
            name: file.name,
            category: 'other',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadDate: new Date().toISOString(),
            uploadedBy: 'current@user.com',
            downloads: 0,
            lastAccessed: new Date().toISOString(),
            description: `Uploaded file: ${file.name}`,
            tags: ['uploaded'],
            permissions: {
              canView: ['admin'],
              canEdit: ['admin'],
              canDelete: ['admin']
            },
            version: '1.0',
            status: 'active'
          }));
          setDocuments(prev => [...prev, ...newDocuments]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownload = (document) => {
    // Simulate download
    console.log('Downloading:', document.name);
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === document.id
          ? { ...doc, downloads: doc.downloads + 1, lastAccessed: new Date().toISOString() }
          : doc
      )
    );
  };

  const handleDelete = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <DocumentIcon className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <DocumentIcon className="h-8 w-8 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <DocumentIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getCategoryBadge = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? (
      <Badge color={category.color}>{category.name}</Badge>
    ) : (
      <Badge color="gray">Unknown</Badge>
    );
  };

  const FileUploadDialog = () => (
    <Dialog open={isUploadOpen} onClose={() => setIsUploadOpen(false)}>
      <DialogPanel className="max-w-md">
        <Title className="mb-4">Upload Documents</Title>
        
        <div className="space-y-4">
          <div>
            <Text className="mb-2">Select files to upload</Text>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            />
          </div>
          
          <div>
            <Text className="mb-2">Category</Text>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white">
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Text className="mb-2">Description</Text>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
              rows="3"
              placeholder="Enter document description..."
            />
          </div>

          {isUploading && (
            <div>
              <Text className="mb-2">Upload Progress</Text>
              <ProgressBar value={uploadProgress} className="mb-2" />
              <Text className="text-sm text-gray-600">{uploadProgress}% complete</Text>
            </div>
          )}
        </div>

        <Flex justifyContent="end" className="mt-6 space-x-2">
          <Button 
            variant="secondary" 
            onClick={() => setIsUploadOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            icon={CloudArrowUpIcon}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );

  const DocumentViewer = () => (
    <Dialog open={isViewerOpen} onClose={() => setIsViewerOpen(false)}>
      <DialogPanel className="max-w-4xl">
        {selectedDocument && (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <Title>{selectedDocument.name}</Title>
                <Text className="text-gray-600">{selectedDocument.description}</Text>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={ArrowDownTrayIcon}
                  onClick={() => handleDownload(selectedDocument)}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={ShareIcon}
                >
                  Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div>
                <Text className="font-medium text-gray-700">Category</Text>
                {getCategoryBadge(selectedDocument.category)}
              </div>
              <div>
                <Text className="font-medium text-gray-700">Size</Text>
                <Text>{selectedDocument.size}</Text>
              </div>
              <div>
                <Text className="font-medium text-gray-700">Version</Text>
                <Text>v{selectedDocument.version}</Text>
              </div>
              <div>
                <Text className="font-medium text-gray-700">Uploaded By</Text>
                <Text>{selectedDocument.uploadedBy}</Text>
              </div>
              <div>
                <Text className="font-medium text-gray-700">Downloads</Text>
                <Text>{selectedDocument.downloads}</Text>
              </div>
              <div>
                <Text className="font-medium text-gray-700">Last Accessed</Text>
                <Text>{new Date(selectedDocument.lastAccessed).toLocaleDateString()}</Text>
              </div>
            </div>

            <div className="mb-4">
              <Text className="font-medium text-gray-700 mb-2">Tags</Text>
              <div className="flex flex-wrap gap-2">
                {selectedDocument.tags.map((tag, index) => (
                  <Badge key={index} color="gray">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Document preview would go here */}
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              {getFileIcon(selectedDocument.name)}
              <Text className="mt-2 text-gray-600">Document preview not available</Text>
              <Text className="text-sm text-gray-500">Click download to view the full document</Text>
            </div>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-500">Manage and organize documents with access controls</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <DocumentPlusIcon className="h-4 w-4" />
            Upload Document
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
              </div>
              <DocumentIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
              </div>
              <FolderIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
                </p>
              </div>
              <ArrowDownTrayIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-semibold text-gray-900">24.8 GB</p>
              </div>
              <CloudArrowUpIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
            <TabList className="border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
              <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 first:rounded-tl-xl hover:text-gray-900 transition-colors">
                All Documents
              </Tab>
              <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 hover:text-gray-900 transition-colors">
                Categories
              </Tab>
              <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 hover:text-gray-900 transition-colors">
                Recent Activity
              </Tab>
              <Tab className="px-6 py-4 text-sm font-medium text-gray-600 data-[selected]:text-slate-900 data-[selected]:bg-white data-[selected]:border-b-2 data-[selected]:border-slate-900 last:rounded-tr-xl hover:text-gray-900 transition-colors">
                Permissions
              </Tab>
            </TabList>

            <TabPanels>
              {/* All Documents Tab */}
              <TabPanel className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search documents by name, description, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white min-w-[180px]"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                      <Text className="text-gray-500">Loading documents...</Text>
                    </div>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-16">
                    <DocumentIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <Title className="mb-2">No Documents Found</Title>
                    <Text className="text-gray-500 mb-6">
                      {documents.length === 0 
                        ? "No documents have been uploaded yet. Upload your first document to get started."
                        : "No documents match your current filters. Try adjusting your search criteria."
                      }
                    </Text>
                    <Button
                      icon={DocumentPlusIcon}
                      onClick={() => setIsUploadOpen(true)}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      Upload Document
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHead className="bg-gray-50">
                        <TableRow>
                          <TableHeaderCell className="font-semibold text-gray-700">Document</TableHeaderCell>
                          <TableHeaderCell className="font-semibold text-gray-700">Category</TableHeaderCell>
                          <TableHeaderCell className="font-semibold text-gray-700">Size</TableHeaderCell>
                          <TableHeaderCell className="font-semibold text-gray-700">Uploaded By</TableHeaderCell>
                          <TableHeaderCell className="font-semibold text-gray-700">Uploaded</TableHeaderCell>
                          <TableHeaderCell className="font-semibold text-gray-700">Actions</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDocuments.map(document => (
                          <TableRow key={document.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {getFileIcon(document.name)}
                                <div>
                                  <Text className="font-medium text-gray-900">{document.name}</Text>
                                  <Text className="text-sm text-gray-500 truncate max-w-xs">
                                    {document.description}
                                  </Text>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getCategoryBadge(document.category)}
                            </TableCell>
                            <TableCell>
                              <Text className="text-gray-700">{document.size}</Text>
                            </TableCell>
                            <TableCell>
                              <Text className="text-gray-700">{document.uploadedBy || document.uploaded_by}</Text>
                            </TableCell>
                            <TableCell>
                              <Text className="text-gray-700">
                                {new Date(document.uploadDate || document.created_at).toLocaleDateString()}
                              </Text>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setIsViewerOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                                  title="View"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDownload(document)}
                                  className="text-green-600 hover:text-green-800 p-1 transition-colors"
                                  title="Download"
                                >
                                  <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-600 hover:text-gray-800 p-1 transition-colors"
                                  title="Share"
                                >
                                  <ShareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(document.id)}
                                  className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabPanel>

              {/* Categories Tab */}
              <TabPanel className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(category => (
                    <div key={category.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <FolderIcon className={`h-8 w-8 text-${category.color}-500`} />
                          <div>
                            <Text className="font-medium">{category.name}</Text>
                            <Text className="text-sm text-gray-500">{category.count} documents</Text>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {documents
                          .filter(doc => doc.category === category.id)
                          .slice(0, 3)
                          .map(doc => (
                            <div key={doc.id} className="flex items-center space-x-2 text-sm">
                              <DocumentIcon className="h-4 w-4 text-gray-400" />
                              <Text className="truncate">{doc.name}</Text>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabPanel>

              {/* Recent Activity Tab */}
              <TabPanel className="p-6">
                <div className="space-y-4">
                  {documents
                    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
                    .slice(0, 10)
                    .map(document => (
                      <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getFileIcon(document.name)}
                          <div>
                            <Text className="font-medium">{document.name}</Text>
                            <Text className="text-sm text-gray-500">
                              Last accessed: {new Date(document.lastAccessed).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                        <Badge color="blue">{document.downloads} downloads</Badge>
                      </div>
                    ))}
                </div>
              </TabPanel>

              {/* Permissions Tab */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Permissions</h3>
                    <p className="text-gray-500 mb-6">Manage access permissions for different user roles</p>
                  </div>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Document</TableHeaderCell>
                        <TableHeaderCell>View Access</TableHeaderCell>
                        <TableHeaderCell>Edit Access</TableHeaderCell>
                        <TableHeaderCell>Delete Access</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.slice(0, 5).map(document => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {getFileIcon(document.name)}
                              <Text className="font-medium">{document.name}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {document.permissions.canView.map(role => (
                                <Badge key={role} color="green" size="sm">{role}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {document.permissions.canEdit.map(role => (
                                <Badge key={role} color="yellow" size="sm">{role}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {document.permissions.canDelete.map(role => (
                                <Badge key={role} color="red" size="sm">{role}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <button className="text-blue-600 hover:text-blue-800 p-1">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      {/* Dialogs */}
      <FileUploadDialog />
      <DocumentViewer />
    </DashboardLayout>
  );
};

export default DocumentManagement;