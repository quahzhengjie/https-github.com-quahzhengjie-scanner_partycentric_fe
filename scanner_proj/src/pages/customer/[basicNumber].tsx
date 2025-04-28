import DocumentUploader from '@/components/DocumentUploader';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    styled,
    TextField,
    Dialog,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Avatar,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Badge,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import Header from '@/components/Header';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUploadRounded';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import { Customer, CustomerLifecycleStatus } from '@/types/customer';
import { Document } from '@/types/document';
import AccountsTab from '@/components/AccountsTab';
import AccountSummary from '@/components/AccountSummary';

import { ApiService } from '@/services/ApiService';
import axios from 'axios';

// Styled components
const DetailContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  }
}));

const DetailItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
  },
  transition: 'background-color 0.2s ease'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    '& input': {
      color: theme.palette.text.primary,
      padding: theme.spacing(1.5, 2),
    },
    '& fieldset': {
      borderColor: theme.palette.divider,
      transition: 'all 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));

const PrettyButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1, 3),
  transition: 'all 0.2s ease',
  textTransform: 'none',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem'
}));

const FieldValue = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.text.primary,
  fontSize: '1rem'
}));

const StatusCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    minWidth: 100,
    fontWeight: 500,
    fontSize: '0.9rem',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(1),
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
  borderRadius: '0 4px 4px 0',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  }
}));

// Types for our summary data
interface CustomerSummaryData {
  totalDocuments: number;
  pendingDocuments: number;
  customerSince: string;
  riskRating: string;
  amlStatus: string;
  lastUpdate: string;
  accountManager: string;
  customerType: string;
  lifecycleStatus: string;
}

// Types for our activity data
interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
  time: string;
  icon: React.ReactNode;
}

// Type for document uploader configuration
interface DocumentUploaderConfig {
  isOpen: boolean;
  mode: 'full' | 'single';
  documentName?: string;
  category?: string;
}

const CustomerDetail: React.FC = () => {
    const router = useRouter();
    const { basicNumber } = router.query;
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
    const [hasOutstandingDocuments, setHasOutstandingDocuments] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [documentCategory, setDocumentCategory] = useState("all");
    const [customerSummaryData, setCustomerSummaryData] = useState<CustomerSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
    
    // Document uploader configuration
    const [documentUploaderConfig, setDocumentUploaderConfig] = useState<DocumentUploaderConfig>({
      isOpen: false,
      mode: 'full',
      documentName: undefined,
      category: undefined
    });
    
    // State for uploaded files
    const [uploadedFiles, setUploadedFiles] = useState<Document[]>([]);
    
    // Load customer documents
    const loadCustomerDocuments = useCallback(async () => {
      if (!basicNumber) return [];
      
      try {
        const documents = await ApiService.getDocumentsForCustomer(basicNumber as string);
        // Filter to only show uploaded documents
        const uploaded = documents.filter(doc => doc.status === "Uploaded");
        setUploadedFiles(uploaded);
        return documents;
      } catch (err) {
        console.error('Error loading documents:', err);
        return [];
      }
    }, [basicNumber]);

    // Generate customer summary from customer data and documents
    const getCustomerSummary = useCallback((customerData: Customer, documents: Document[]): CustomerSummaryData => {
        const totalDocs = documents.length;
        const pendingDocs = documents.filter(doc => doc.status === "Pending").length;
        
        return {
            totalDocuments: totalDocs,
            pendingDocuments: pendingDocs,
            customerSince: customerData.lifecycleStatusDate || new Date(Date.now() - 7776000000).toLocaleDateString(),
            riskRating: customerData.riskRating || "Low",
            amlStatus: customerData.amlStatus || "Pending",
            lastUpdate: customerData.lifecycleStatusDate || new Date(Date.now() - 604800000).toLocaleDateString(),
            accountManager: customerData.relationshipManager || "Sarah Johnson",
            customerType: customerData.customerType || "Individual",
            lifecycleStatus: customerData.lifecycleStatus || "Onboarding"
        };
    }, []);
    
    // Initialize customer data
    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!basicNumber) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Get customer data
                const foundCustomer = await ApiService.getCustomerByBasicNumber(basicNumber as string);
                setCustomer(foundCustomer);
                setEditedCustomer(foundCustomer);
                
                // Check document status
                const hasOutstanding = await ApiService.hasOutstandingDocuments(foundCustomer.basicNumber);
                setHasOutstandingDocuments(hasOutstanding);
                
                // Load documents
                const documents = await loadCustomerDocuments();
                
                // Get list of outstanding documents if there are any
                let missingDocs: string[] = [];
                if (hasOutstanding) {
                    try {
                        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
                        const outstandingUrl = `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`;
                        const response = await axios.get(outstandingUrl);
                        missingDocs = response.data || [];
                        setMissingDocuments(missingDocs);
                    } catch (listError) {
                        console.error('Error fetching missing documents list:', listError);
                    }
                }
                
                // Initialize customer summary with accurate document counts
                const totalUploaded = documents.filter(doc => doc.status === "Uploaded").length;
                const totalRequired = totalUploaded + missingDocs.length;
                
                const summary = {
                    ...getCustomerSummary(foundCustomer, documents),
                    pendingDocuments: missingDocs.length,
                    totalDocuments: totalRequired > 0 ? totalRequired : documents.length // Ensure we don't have 0 if there are documents
                };
                
                setCustomerSummaryData(summary);
            } catch (err) {
                console.error('Error loading customer data:', err);
                setError('Failed to load customer data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchCustomerData();
    }, [basicNumber, getCustomerSummary, loadCustomerDocuments]);

    // Update customer summary when customer data changes
    useEffect(() => {
        if (customer) {
            loadCustomerDocuments().then(documents => {
               // const hasOutstanding = hasOutstandingDocuments;
                
                // Use the correct document counts
                const summary = {
                    ...getCustomerSummary(customer, documents),
                    pendingDocuments: missingDocuments.length,
                    totalDocuments: documents.length + (missingDocuments.length > 0 ? 
                        missingDocuments.length - documents.filter(d => d.status === "Pending").length : 0)
                };
                
                setCustomerSummaryData(summary);
            });
        }
    }, [customer, getCustomerSummary, loadCustomerDocuments, hasOutstandingDocuments, missingDocuments]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedCustomer(customer);
    };

    const handleSave = async () => {
        if (!editedCustomer) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Set the last update timestamp
            const customerWithUpdatedTimestamp = {
                ...editedCustomer,
                lifecycleStatusDate: new Date().toISOString().slice(0, 10)
            };
            
            const updated = await ApiService.updateCustomer(customerWithUpdatedTimestamp);
            setCustomer(updated);
            setEditedCustomer(updated);
            setIsEditing(false);
            setSuccess("Customer information updated successfully");
        } catch (err) {
            console.error('Error updating customer:', err);
            setError('Failed to update customer information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof Customer) => (e: {target: {value: string} }) => {
        setEditedCustomer(prev => prev ? {
            ...prev,
            [field]: e.target.value
        } : null);
    };
    
    // Handle changes on select elements
    const handleSelectChange = (field: keyof Customer) => (event: SelectChangeEvent<string>) => {
        const newValue = event.target.value;
        setEditedCustomer(prev => {
            if (!prev) return null;
            
            // Create the updated customer with proper typing
            const updated: Customer = {
                ...prev,
                [field]: newValue
            };
            
            // Update lifecycle status date if changing lifecycle status
            if (field === 'lifecycleStatus') {
                updated.lifecycleStatusDate = new Date().toISOString().slice(0, 10);
            }
            
            return updated;
        });
    };

    // Open document uploader in full mode
    const handleOpenDocumentUploader = () => {
        setDocumentUploaderConfig({
            isOpen: true,
            mode: 'full'
        });
    };
    
    // Open document uploader for a specific document
    const handleUploadSpecificDocument = (documentName: string, category?: string) => {
        setDocumentUploaderConfig({
            isOpen: true,
            mode: 'single',
            documentName,
            category
        });
    };

    // Handle document uploader close
    const handleDocumentUploaderClose = async () => {
        setDocumentUploaderConfig({
            ...documentUploaderConfig,
            isOpen: false
        });
        
        // Refresh document data
        if (basicNumber) {
            try {
                // Check document status
                const hasOutstanding = await ApiService.hasOutstandingDocuments(basicNumber as string);
                setHasOutstandingDocuments(hasOutstanding);
                
                // Reload documents
                const documents = await loadCustomerDocuments();
                
                // Get list of outstanding documents if there are any
                let missingDocs: string[] = [];
                if (hasOutstanding) {
                    try {
                        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
                        const outstandingUrl = `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`;
                        const response = await axios.get(outstandingUrl);
                        missingDocs = response.data || [];
                        setMissingDocuments(missingDocs);
                    } catch (listError) {
                        console.error('Error fetching missing documents list:', listError);
                    }
                } else {
                    setMissingDocuments([]);
                }
                
                // Update summary with accurate document count information
                if (customer) {
                    const totalUploaded = documents.filter(doc => doc.status === "Uploaded").length;
                    const totalRequired = totalUploaded + missingDocs.length;
                    
                    setCustomerSummaryData({
                        ...getCustomerSummary(customer, documents),
                        pendingDocuments: missingDocs.length,
                        totalDocuments: totalRequired > 0 ? totalRequired : documents.length
                    });
                }
            } catch (err) {
                console.error('Error refreshing document data:', err);
                setError('Failed to refresh document data');
            }
        }
    };
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };
    
    // Handle document deletion
    const handleDeleteDocument = async (document: Document) => {
        if (!basicNumber || !document) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Set document back to pending status
            const success = await ApiService.updateDocumentStatus(
                basicNumber as string,
                document.filename,
                "Pending"
            );
            
            if (success) {
                // Reload documents
                const documents = await loadCustomerDocuments();
                
                // Update outstanding documents flag and list
                const hasOutstanding = await ApiService.hasOutstandingDocuments(basicNumber as string);
                setHasOutstandingDocuments(hasOutstanding);
                
                // Get list of outstanding documents if there are any
                let missingDocs: string[] = [];
                if (hasOutstanding) {
                    try {
                        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
                        const outstandingUrl = `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`;
                        const response = await axios.get(outstandingUrl);
                        missingDocs = response.data || [];
                        setMissingDocuments(missingDocs);
                    } catch (listError) {
                        console.error('Error fetching missing documents list:', listError);
                    }
                } else {
                    setMissingDocuments([]);
                }
                
                // Update summary data with accurate counts
                if (customer) {
                    const totalUploaded = documents.filter(doc => doc.status === "Uploaded").length;
                    const totalRequired = totalUploaded + missingDocs.length;
                    
                    setCustomerSummaryData({
                        ...getCustomerSummary(customer, documents),
                        pendingDocuments: missingDocs.length,
                        totalDocuments: totalRequired > 0 ? totalRequired : documents.length
                    });
                }
                
                setSuccess("Document deleted successfully");
            } else {
                setError("Failed to delete document");
            }
        } catch (err) {
            console.error('Error deleting document:', err);
            setError('Failed to delete document');
        } finally {
            setLoading(false);
        }
    };
    
    // Mock recent activities
    // In the future, this would come from an API call
    const recentActivities: Activity[] = [
        { 
            id: 1, 
            type: "Document Upload", 
            description: "Passport Copy was uploaded",
            date: new Date(Date.now() - 3600000 * 24).toLocaleDateString(),
            time: "14:30",
            icon: <DescriptionIcon />
        },
        { 
            id: 2, 
            type: "Customer Update", 
            description: "Phone number was updated",
            date: new Date(Date.now() - 3600000 * 72).toLocaleDateString(),
            time: "10:15",
            icon: <EditIcon />
        },
        { 
            id: 3, 
            type: "AML Check", 
            description: "AML verification completed",
            date: new Date(Date.now() - 3600000 * 120).toLocaleDateString(),
            time: "09:45",
            icon: <CheckCircleIcon />
        },
        { 
            id: 4, 
            type: "Customer Created", 
            description: "Customer account was created",
            date: new Date(Date.now() - 3600000 * 240).toLocaleDateString(),
            time: "11:20",
            icon: <PersonIcon />
        }
    ];
    
    // Status chips renderer
    const renderStatusChip = (status: string) => {
        switch(status) {
            case 'Approved':
                return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
            case 'Pending':
                return <Chip icon={<AccessTimeIcon />} label="Pending" color="warning" size="small" />;
            case 'Rejected':
                return <Chip icon={<ErrorIcon />} label="Rejected" color="error" size="small" />;
            case 'Active':
                return <Chip icon={<CheckCircleIcon />} label="Active" color="success" size="small" />;
            case 'Onboarding':
                return <Chip icon={<TimelineIcon />} label="Onboarding" color="info" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };
    
    // Document compliance calculation - improved with proper handling
    const documentsCompliance = customerSummaryData && customerSummaryData.totalDocuments > 0 ? 
        Math.round(((customerSummaryData.totalDocuments - customerSummaryData.pendingDocuments) / customerSummaryData.totalDocuments) * 100) : 
        100; // If no documents required, show 100% compliant

    if (loading && !customer) {
        return (
            <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
                <Header />
                <Container maxWidth="lg" className="py-8">
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 2 }}>
                        <CircularProgress />
                        <Typography variant="h6">
                            Loading customer data...
                        </Typography>
                    </Box>
                </Container>
            </div>
        );
    }

    if (error && !customer) {
        return (
            <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
                <Header />
                <Container maxWidth="lg" className="py-8">
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: 2 }}>
                        <ErrorIcon color="error" sx={{ fontSize: 60 }} />
                        <Typography variant="h6" color="error">
                            {error}
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => router.push('/kyc')}
                            startIcon={<ArrowBackIosRoundedIcon />}
                        >
                            Back to Search
                        </Button>
                    </Box>
                </Container>
            </div>
        );
    }

    if (!customer || !editedCustomer || !customerSummaryData) {
        return (
            <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
                <Header />
                <Container maxWidth="lg" className="py-8">
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <Typography variant="h6">
                            No customer data found
                        </Typography>
                    </Box>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
            <Header />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 4 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PrettyButton
                            variant="outlined"
                            color="info"
                            startIcon={<ArrowBackIosRoundedIcon />}
                            onClick={() => router.push('/kyc')}
                        >
                            Back to Search
                        </PrettyButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {!isEditing && (
                            <PrettyButton
                                variant="contained" 
                                color="primary"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleOpenDocumentUploader}
                                disabled={loading}
                            >
                                Manage Documents
                                {hasOutstandingDocuments && (
                                    <Box 
                                        component="span" 
                                        sx={{ 
                                            ml: 1, 
                                            bgcolor: 'error.main', 
                                            color: 'white', 
                                            borderRadius: '50%', 
                                            width: 20, 
                                            height: 20,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {missingDocuments.length || "!"}
                                    </Box>
                                )}
                            </PrettyButton>
                        )}
                        {isEditing ? (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <PrettyButton
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CloseIcon />}
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </PrettyButton>
                                <PrettyButton
                                    variant="contained"
                                    color="success"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </PrettyButton>
                            </Box>
                        ) : (
                        <PrettyButton
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                            disabled={loading}
                        >
                            Edit Details
                        </PrettyButton>
                        )}
                    </Box>
                </Box>

                {/* Customer Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar 
                        sx={{ 
                            width: 80, 
                            height: 80, 
                            bgcolor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        {customer.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography 
                            variant="h4" 
                            sx={{
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            {customer.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                                label={customer.basicNumber} 
                                color="primary" 
                                size="small"
                            />
                            {renderStatusChip(customerSummaryData.lifecycleStatus ?? 'Unknown')}
                            <Chip 
                                icon={customerSummaryData.customerType === 'Individual' ? <PersonIcon /> : <BusinessIcon />} 
                                label={customerSummaryData.customerType} 
                                variant="outlined" 
                                size="small" 
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Add Account Summary if we're looking at an existing customer */}
                {basicNumber && (
                    <AccountSummary customerBasicNumber={basicNumber as string} />
                )}

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <StatusCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Customer Status
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    {isEditing ? (
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={editedCustomer?.lifecycleStatus as CustomerLifecycleStatus || 'Onboarding'}
                                                        onChange={handleSelectChange('lifecycleStatus')}
                                                        sx={{ fontWeight: 500, fontSize: '1.1rem' }}
                                                        disabled={loading}
                                                    >
                                                        <MenuItem value="Prospective">Prospective</MenuItem>
                                                        <MenuItem value="Onboarding">Onboarding</MenuItem>
                                                        <MenuItem value="Active">Active</MenuItem>
                                                        <MenuItem value="Dormant">Dormant</MenuItem>
                                                        <MenuItem value="Suspended">Suspended</MenuItem>
                                                        <MenuItem value="Closed">Closed</MenuItem>
                                                        <MenuItem value="Rejected">Rejected</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {customerSummaryData.lifecycleStatus}
                                            </Typography>
                                            {renderStatusChip(customerSummaryData.lifecycleStatus ?? 'Unknown')}
                                        </>
                                    )}
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Customer since: {customerSummaryData.customerSince}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Last updated: {customerSummaryData.lastUpdate}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Account Manager:
                                    </Typography>
                                    {isEditing ? (
                                        <StyledTextField
                                            size="small"
                                            value={editedCustomer?.relationshipManager || customerSummaryData.accountManager}
                                            onChange={handleChange('relationshipManager')}
                                            sx={{ mt: 1, maxWidth: '100%' }}
                                            disabled={loading}
                                        />
                                    ) : (
                                        <Typography variant="body2">
                                            {customerSummaryData.accountManager}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </StatusCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatusCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Compliance Status
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    {isEditing ? (
                                        <Box sx={{ width: '100%' }}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={editedCustomer?.amlStatus || customerSummaryData.amlStatus}
                                                    onChange={handleSelectChange('amlStatus')}
                                                    sx={{ fontWeight: 500, fontSize: '1.1rem' }}
                                                    disabled={loading}
                                                >
                                                    <MenuItem value="Pending">Pending</MenuItem>
                                                    <MenuItem value="Approved">Approved</MenuItem>
                                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                                    <MenuItem value="Not Required">Not Required</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    ) : (
                                        <>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                AML {customerSummaryData.amlStatus}
                                            </Typography>
                                            {renderStatusChip(customerSummaryData.amlStatus)}
                                        </>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Risk Rating:
                                    </Typography>
                                    {isEditing ? (
                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                            <Select
                                                value={editedCustomer?.riskRating || customerSummaryData.riskRating}
                                                onChange={handleSelectChange('riskRating')}
                                                disabled={loading}
                                            >
                                                <MenuItem value="Low">Low</MenuItem>
                                                <MenuItem value="Medium">Medium</MenuItem>
                                                <MenuItem value="High">High</MenuItem>
                                                <MenuItem value="Extreme">Extreme</MenuItem>
                                            </Select>
                                      </FormControl>
                                    ) : (
                                        <Chip 
                                            label={customerSummaryData.riskRating} 
                                            size="small"
                                            color={
                                                customerSummaryData.riskRating === "Low" ? "success" :
                                                customerSummaryData.riskRating === "Medium" ? "info" :
                                                customerSummaryData.riskRating === "High" ? "warning" : "error"
                                            }
                                        />
                                    )}
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            Document Compliance
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {documentsCompliance}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={documentsCompliance} 
                                        color={documentsCompliance === 100 ? "success" : "warning"}
                                        sx={{ height: 6, borderRadius: 1 }}
                                    />
                                </Box>
                            </CardContent>
                        </StatusCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatusCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Document Summary
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                                    {customerSummaryData.totalDocuments - customerSummaryData.pendingDocuments} of {customerSummaryData.totalDocuments} Completed
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Uploaded Documents
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {customerSummaryData.totalDocuments - customerSummaryData.pendingDocuments}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Pending Documents
                                    </Typography>
                                    <StyledBadge badgeContent={customerSummaryData.pendingDocuments} color="error">
                                        <Typography variant="body2" fontWeight="medium">
                                            {customerSummaryData.pendingDocuments}
                                        </Typography>
                                    </StyledBadge>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <PrettyButton
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        startIcon={<CloudUploadIcon />}
                                        onClick={handleOpenDocumentUploader}
                                        disabled={loading}
                                    >
                                        Manage Documents
                                    </PrettyButton>
                                </Box>
                            </CardContent>
                        </StatusCard>
                    </Grid>
                </Grid>

                {/* Tabs for different sections */}
                <StyledTabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    aria-label="customer tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Personal Details" />
                    <Tab label="Accounts" />
                    <Tab label="Documents" />
                    <Tab label="Activity" />
                </StyledTabs>

                {/* Tab Content */}
                {activeTab === 0 && (
                    <DetailContainer elevation={3}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                            <Box>
                                <DetailItem>
                                    <FieldLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon fontSize="small" color="primary" />
                                            Customer Name
                                        </Box>
                                    </FieldLabel>
                                    {isEditing ? (
                                        <StyledTextField 
                                            fullWidth
                                            size="small"
                                            value={editedCustomer.name}
                                            onChange={handleChange('name')}
                                            disabled={loading}
                                        />
                                    ) : (
                                        <FieldValue>
                                            {customer.name}
                                        </FieldValue>
                                    )}
                                </DetailItem>

                                <DetailItem>
                                    <FieldLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon fontSize="small" color="primary" />
                                            Email Address
                                        </Box>
                                    </FieldLabel>
                                    {isEditing ? (
                                        <StyledTextField 
                                            fullWidth
                                            size="small"
                                            value={editedCustomer.email}
                                            onChange={handleChange('email')}
                                            disabled={loading}
                                        />
                                    ) : (
                                        <FieldValue>
                                            {customer.email}
                                        </FieldValue>
                                    )}
                                </DetailItem>

                                <DetailItem>
                                    <FieldLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon fontSize="small" color="primary" />
                                            Phone Number
                                        </Box>
                                    </FieldLabel>
                                    {isEditing ? (
                                        <StyledTextField 
                                            fullWidth
                                            size="small"
                                            value={editedCustomer.phoneNumber}
                                            onChange={handleChange('phoneNumber')}
                                            disabled={loading}
                                        />
                                    ) : (
                                        <FieldValue>
                                            {customer.phoneNumber}
                                        </FieldValue>
                                    )}
                                </DetailItem>
                            </Box>

                            <Box>
                                <DetailItem>
                                    <FieldLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon fontSize="small" color="primary" />
                                            Address
                                        </Box>
                                    </FieldLabel>
                                    {isEditing ? (
                                        <StyledTextField 
                                            fullWidth
                                            size="small"
                                            value={editedCustomer.address}
                                            onChange={handleChange('address')}
                                            multiline
                                            rows={2}
                                            disabled={loading}
                                        />
                                    ) : (
                                        <FieldValue>
                                            {customer.address}
                                        </FieldValue>
                                    )}
                                </DetailItem>
                                <DetailItem>
                                    <FieldLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CardMembershipIcon fontSize="small" color="primary" />
                                            Passport No.
                                        </Box>
                                    </FieldLabel>
                                    {isEditing ? (
                                        <StyledTextField 
                                            fullWidth
                                            size="small"
                                            value={editedCustomer.passport}
                                            onChange={handleChange('passport')}
                                            disabled={loading}
                                        />
                                    ) : (
                                        <FieldValue>
                                            {customer.passport}
                                        </FieldValue>
                                    )}
                                </DetailItem>
                                
                                {/* Additional fields */}
                                {customerSummaryData.customerType !== 'Individual' && (
                                    <DetailItem>
                                        <FieldLabel>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <BusinessIcon fontSize="small" color="primary" />
                                                Registration Number
                                            </Box>
                                        </FieldLabel>
                                        {isEditing ? (
                                            <StyledTextField 
                                                fullWidth
                                                size="small"
                                                value={editedCustomer.incorporationNumber || ""}
                                                onChange={handleChange('incorporationNumber')}
                                                disabled={loading}
                                            />
                                        ) : (
                                            <FieldValue>
                                                {customer.incorporationNumber || "Not provided"}
                                            </FieldValue>
                                        )}
                                    </DetailItem>
                                )}
                            </Box>
                        </Box>
                    </DetailContainer>
                )}

                {activeTab === 1 && (
                    <DetailContainer elevation={3}>
                        <AccountsTab customerBasicNumber={basicNumber as string} />
                    </DetailContainer>
                )}

                {activeTab === 2 && (
                    <DetailContainer elevation={3}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    Customer Documents
                                </Typography>
                                <PrettyButton
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={handleOpenDocumentUploader}
                                    size="small"
                                    disabled={loading}
                                >
                                    Upload New Document
                                </PrettyButton>
                            </Box>
                            
                            <Typography variant="body2" color="textSecondary" paragraph>
                                View and manage all documents associated with this customer. Documents are categorized to help you quickly find what you need.
                            </Typography>

                            {/* Document status summary */}
                            <Box sx={{ mt: 2, mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip 
                                        icon={<DescriptionIcon />}
                                        label={`Total: ${customerSummaryData.totalDocuments}`}
                                        variant="outlined"
                                    />
                                    <Chip 
                                        icon={<CheckCircleIcon />}
                                        label={`Completed: ${customerSummaryData.totalDocuments - customerSummaryData.pendingDocuments}`}
                                        color="success"
                                        variant="outlined"
                                    />
                                    {customerSummaryData.pendingDocuments > 0 && (
                                        <Chip 
                                            icon={<WarningIcon />}
                                            label={`Pending: ${customerSummaryData.pendingDocuments}`}
                                            color="warning"
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Categorized document tabs */}
                        <Tabs
                            value={documentCategory === "all" ? 0 : 
                                documentCategory === "Identification" ? 1 : 
                                documentCategory === "Financial" ? 2 : 
                                documentCategory === "Legal" ? 3 :
                                documentCategory === "Tax" ? 4 : 0}
                            onChange={(e, newValue) => {
                                const categories = ["all", "Identification", "Financial", "Legal", "Tax"];
                                setDocumentCategory(categories[newValue]);
                            }}
                            sx={{ mb: 2 }}
                        >
                            <Tab label="All Documents" />
                            <Tab label="Identification" />
                            <Tab label="Financial" />
                            <Tab label="Legal" />
                            <Tab label="Tax" />
                        </Tabs>

                        {/* Uploaded documents table */}
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
                            <Table size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Document Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Uploaded Name</TableCell>
                                        <TableCell>Expiry Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : uploadedFiles.length > 0 ? (
                                        uploadedFiles
                                            .filter(file => 
                                                documentCategory === "all" || 
                                                file.category === documentCategory
                                            )
                                            .map((file, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{file.filename}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={file.category} 
                                                        size="small" 
                                                        color={
                                                            file.category === 'KYC' ? 'primary' : 
                                                            file.category === 'Financial' ? 'info' : 
                                                            file.category === 'Legal' ? 'success' : 'default'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{file.uploadedName || "N/A"}</TableCell>
                                                <TableCell>{file.expiryDate || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={file.status} 
                                                        size="small" 
                                                        color={file.status === "Uploaded" ? "success" : "warning"} 
                                                        icon={file.status === "Uploaded" ? <CheckCircleIcon /> : <WarningIcon />} 
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <Tooltip title="View Document">
                                                            <IconButton 
                                                                size="small" 
                                                                color="primary"
                                                                disabled={!file.uploadedFile}
                                                            >
                                                                <DescriptionIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {isEditing && (
                                                            <Tooltip title="Delete">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={() => handleDeleteDocument(file)}
                                                                    disabled={loading}
                                                                >
                                                                    <CloseIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                    <DescriptionIcon color="disabled" sx={{ fontSize: 48 }} />
                                                    <Typography color="textSecondary">
                                                        No documents uploaded yet
                                                    </Typography>
                                                    <PrettyButton
                                                        variant="outlined"
                                                        startIcon={<CloudUploadIcon />}
                                                        onClick={handleOpenDocumentUploader}
                                                        size="small"
                                                        disabled={loading}
                                                    >
                                                        Upload First Document
                                                    </PrettyButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Required documents */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                                Required Documents
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                                <Table size="medium">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Document Name</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                        <CircularProgress size={24} />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ) : missingDocuments.length > 0 ? (
                                            // Show the actual missing documents list from the API
                                            missingDocuments
                                                .filter(docName => 
                                                    documentCategory === "all" || 
                                                    docName.includes(documentCategory)
                                                )
                                                .map((docName, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{docName}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={docName.includes('ID') || docName.includes('Passport') ? 'Identification' : 
                                                                  docName.includes('Financial') ? 'Financial' : 
                                                                  docName.includes('Legal') ? 'Legal' : 
                                                                  docName.includes('Tax') ? 'Tax' : 'Other'} 
                                                            size="small" 
                                                            color={
                                                                docName.includes('ID') || docName.includes('Passport') ? 'primary' : 
                                                                docName.includes('Financial') ? 'info' : 
                                                                docName.includes('Legal') ? 'success' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label="Required" 
                                                            size="small" 
                                                            color="warning" 
                                                            icon={<WarningIcon />} 
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <PrettyButton
                                                            variant="outlined"
                                                            startIcon={<CloudUploadIcon />}
                                                            onClick={() => handleUploadSpecificDocument(docName, 
                                                                docName.includes('ID') || docName.includes('Passport') ? 'Identification' : 
                                                                docName.includes('Financial') ? 'Financial' : 
                                                                docName.includes('Legal') ? 'Legal' : 
                                                                docName.includes('Tax') ? 'Tax' : 'Other'
                                                            )}
                                                            size="small"
                                                            disabled={loading}
                                                        >
                                                            Upload
                                                        </PrettyButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            // Fallback to the existing document list if there's no missing documents
                                            (uploadedFiles.length > 0 ? uploadedFiles : [])
                                                .filter(doc => 
                                                    documentCategory === "all" || 
                                                    doc.category === documentCategory
                                                )
                                                .map((doc, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{doc.filename}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={doc.category} 
                                                            size="small" 
                                                            color={
                                                                doc.category === 'KYC' ? 'primary' : 
                                                                doc.category === 'Financial' ? 'info' : 
                                                                doc.category === 'Legal' ? 'success' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {doc.status === "Uploaded" ? (
                                                            <Chip 
                                                                label="Uploaded" 
                                                                size="small" 
                                                                color="success" 
                                                                icon={<CheckCircleIcon />} 
                                                            />
                                                        ) : (
                                                            <Chip 
                                                                label="Required" 
                                                                size="small" 
                                                                color="warning" 
                                                                icon={<WarningIcon />} 
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {doc.status === "Pending" && (
                                                            <PrettyButton
                                                                variant="outlined"
                                                                startIcon={<CloudUploadIcon />}
                                                                onClick={() => handleUploadSpecificDocument(doc.filename, doc.category)}
                                                                size="small"
                                                                disabled={loading}
                                                            >
                                                                Upload
                                                            </PrettyButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </DetailContainer>
                )}

                {activeTab === 3 && (
                    <DetailContainer elevation={3}>
                        <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>
                            Customer Activity Timeline
                        </Typography>
                        
                        <List sx={{ width: '100%' }}>
                            {recentActivities.map((activity) => (
                                <ActivityItem key={activity.id}>
                                    <ListItemIcon>
                                        <Box sx={{ 
                                            bgcolor: 'primary.main', 
                                            borderRadius: '50%', 
                                            width: 36, 
                                            height: 36, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {activity.icon}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                {activity.type}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2">{activity.description}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {activity.date} at {activity.time}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ActivityItem>
                            ))}
                        </List>
                    </DetailContainer>
                )}

                {/* Enhanced Document Uploader Dialog */}
                <Dialog
                    open={documentUploaderConfig.isOpen}
                    onClose={handleDocumentUploaderClose}
                    maxWidth="xl"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 2 }
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>
                        <DocumentUploader 
                            basicNumber={basicNumber as string}
                            onClose={handleDocumentUploaderClose}
                            mode={documentUploaderConfig.mode}
                            initialDocument={documentUploaderConfig.documentName}
                            initialCategory={documentUploaderConfig.category}
                        />
                    </DialogContent>
                </Dialog>
                
                {/* Success Snackbar */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSuccess(null)} severity="success" variant="filled">
                        {success}
                    </Alert>
                </Snackbar>
                
                {/* Error Snackbar */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setError(null)} severity="error" variant="filled">
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </div>
    );
}

export default CustomerDetail;