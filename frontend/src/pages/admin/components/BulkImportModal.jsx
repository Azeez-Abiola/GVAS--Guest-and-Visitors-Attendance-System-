import React, { useState, useRef } from 'react';
import { Dialog, DialogPanel, Button, Title, Text, Metric, ProgressBar, Badge, Callout } from '@tremor/react';
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';
import ApiService from '../../../services/api';
import { generateSecurePassword } from '../../../utils/auth';
import showToast from '../../../utils/toast';

const BulkImportModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState('upload'); // upload, processing, results
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState({ success: [], error: [] });
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const resetState = () => {
        setStep('upload');
        setFile(null);
        setParsedData([]);
        setProgress(0);
        setResults({ success: [], error: [] });
        setIsProcessing(false);
    };

    const handleClose = () => {
        if (isProcessing) return; // Prevent closing while processing
        resetState();
        onClose();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                showToast('Please upload a valid CSV file', 'error');
                return;
            }
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    showToast('CSV file is empty', 'error');
                    setFile(null);
                    return;
                }

                // Basic validation of headers
                const requiredHeaders = ['Full Name', 'Email', 'Role'];
                const headers = results.meta.fields;
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    showToast(`Missing required headers: ${missingHeaders.join(', ')}`, 'error');
                    setFile(null);
                    return;
                }

                setParsedData(results.data);
            },
            error: (error) => {
                showToast(`Error parsing CSV: ${error.message}`, 'error');
                setFile(null);
            }
        });
    };

    const processBatch = async () => {
        setIsProcessing(true);
        setStep('processing');

        const successList = [];
        const errorList = [];
        const total = parsedData.length;

        // Process in chunks to avoid rate limiting
        const CHUNK_SIZE = 2; // Conservative batch size

        for (let i = 0; i < total; i += CHUNK_SIZE) {
            const chunk = parsedData.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (row) => {
                try {
                    // Validate row data
                    if (!row['Email'] || !row['Full Name'] || !row['Role']) {
                        throw new Error('Missing required fields');
                    }

                    // Generate password
                    const password = generateSecurePassword(12);

                    // Map CSV fields to API expected format
                    const userData = {
                        full_name: row['Full Name'],
                        email: row['Email'],
                        role: row['Role'].toLowerCase(),
                        phone: row['Phone'] || '',
                        is_active: true,
                        password: password,
                        // Handle floors
                        assigned_floors: row['Assigned Floors'] ? row['Assigned Floors'].split(',').map(f => f.trim()) : [],
                        // Host specific
                        floor_number: row['Floor Number'] || null,
                        office_number: row['Office Number'] || ''
                    };

                    // Validate role
                    const validRoles = ['admin', 'host', 'reception', 'security'];
                    if (!validRoles.includes(userData.role)) {
                        throw new Error(`Invalid role: ${userData.role}`);
                    }

                    await ApiService.createUser(userData);

                    successList.push({
                        ...userData,
                        status: 'Success'
                    });
                } catch (err) {
                    errorList.push({
                        ...row,
                        error: err.message || 'Failed to create user',
                        status: 'Failed'
                    });
                }
            }));

            // Update progress
            setProgress(Math.round(((i + chunk.length) / total) * 100));

            // Small delay between chunks
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setResults({ success: successList, error: errorList });
        setStep('results');
        setIsProcessing(false);
        if (onComplete) onComplete();
    };

    const downloadTemplate = () => {
        const headers = ['Full Name', 'Email', 'Role', 'Phone', 'Floor Number', 'Assigned Floors', 'Office Number'];
        const sample = ['John Doe', 'john@example.com', 'host', '+1234567890', '5', '', 'Room 501'];
        const csvContent = [headers.join(','), sample.join(',')].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadResults = () => {
        // Combine inputs with results/passwords
        // We only show passwords for successful creations
        const headers = ['Full Name', 'Email', 'Role', 'Password', 'Status', 'Message'];

        const successRows = results.success.map(u => [
            `"${u.full_name}"`,
            u.email,
            u.role,
            u.password,
            'Success',
            'User created'
        ]);

        const errorRows = results.error.map(u => [
            `"${u['Full Name'] || ''}"`,
            u['Email'] || '',
            u['Role'] || '',
            '', // No password for failed
            'Failed',
            `"${u.error}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...successRows.map(r => r.join(',')),
            ...errorRows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `import_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} static={isProcessing}>
            <DialogPanel className="sm:max-w-2xl w-full mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 text-white px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <CloudArrowUpIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <Title className="text-white">Bulk User Import</Title>
                            <Text className="text-slate-300">Upload a CSV file to create multiple users at once</Text>
                        </div>
                        {!isProcessing && (
                            <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <Button
                                    variant="secondary"
                                    icon={DocumentTextIcon}
                                    onClick={downloadTemplate}
                                    className="text-sm"
                                >
                                    Download Template
                                </Button>
                            </div>

                            <div
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const droppedFile = e.dataTransfer.files[0];
                                    if (droppedFile) {
                                        if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
                                            showToast('Please upload a valid CSV file', 'error');
                                            return;
                                        }
                                        setFile(droppedFile);
                                        parseCSV(droppedFile);
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="space-y-3">
                                        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                                        <Text className="font-bold text-lg text-slate-900 dark:text-white">{file.name}</Text>
                                        <Text className="text-slate-500">{parsedData.length} records found</Text>
                                        <Button
                                            size="xs"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setParsedData([]);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <CloudArrowUpIcon className="w-12 h-12 text-slate-400 mx-auto" />
                                        <Text className="font-bold text-lg text-slate-900 dark:text-white">Click or Drop CSV file here</Text>
                                        <Text className="text-slate-500 text-sm">Required columns: Full Name, Email, Role</Text>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                                <Button
                                    onClick={processBatch}
                                    disabled={!file || parsedData.length === 0}
                                    color="blue"
                                >
                                    Import {parsedData.length > 0 ? `${parsedData.length} Users` : ''}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-10 text-center space-y-6">
                            <div className="w-full max-w-md mx-auto">
                                <ProgressBar value={progress} color="blue" className="mt-3" />
                                <div className="flex justify-between text-sm mt-2">
                                    <Text>{progress}% Complete</Text>
                                    <Text className="animate-pulse">Processing...</Text>
                                </div>
                            </div>
                            <Text className="text-slate-500">
                                Creating users and generating secure passwords.<br />
                                Please do not close this window.
                            </Text>
                        </div>
                    )}

                    {step === 'results' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Callout
                                    title="Successful"
                                    icon={CheckCircleIcon}
                                    color="green"
                                >
                                    {results.success.length} users created successfully
                                </Callout>
                                <Callout
                                    title="Failed"
                                    icon={ExclamationCircleIcon}
                                    color="red"
                                >
                                    {results.error.length} failed
                                </Callout>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <ExclamationCircleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800 dark:text-amber-300">Important: Download Credentials</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                            The system generated unique passwords for each new user.
                                            You must download the results file to see these passwords and distribute them to your users.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={handleClose}>Close</Button>
                                <Button
                                    icon={DocumentTextIcon}
                                    onClick={downloadResults}
                                    color="green"
                                >
                                    Download Results & Passwords
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogPanel>
        </Dialog>
    );
};

export default BulkImportModal;
