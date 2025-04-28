import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Badge,
  Alert,
  styled,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBackIosRounded,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  FolderOpen as FolderIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Header from '@/components/Header';
import { AccountDTO } from '@/types/account';
import { Customer } from '@/types/customer';
import { AccountApiService } from '@/services/AccountApiService';
import { CustomerApiService } from '@/services/CustomerApiService';
import { ApiService } from '@/services/ApiService';
import DocumentUploaderAccountLevel from '@/components/DocumentUploaderAccountLevel';

import axios from 'axios';

// API base URL for direct calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Define extended types for accounts and customers with document status
type AccountWithDocuments = AccountDTO & {
  hasOutstandingDocuments: boolean;
  outstandingDocumentsList?: string[];
  jointHolders?: string[]; // Add jointHolders array
};

type CustomerWithDocuments = Customer & {
  hasOutstandingDocuments: boolean;
  outstandingDocumentsList?: string[];
  isPrimary?: boolean; // Flag to indicate primary account holder
};

// Styled components
const DetailPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const AccountDetailPage: React.FC = () => {
  const router = useRouter();
  const { accountNumber } = router.query;
  
  // State variables
  const [account, setAccount] = useState<AccountWithDocuments | null>(null);
  const [accountOwners, setAccountOwners] = useState<CustomerWithDocuments[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for document uploader dialog
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Add state for account holder management
  const [addHolderDialogOpen, setAddHolderDialogOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [removeHolderDialogOpen, setRemoveHolderDialogOpen] = useState(false);
  const [customerToRemove, setCustomerToRemove] = useState<CustomerWithDocuments | null>(null);
  const [isJointAccount, setIsJointAccount] = useState(false);
  
  // Add state for refresh control
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to fetch data
  const fetchAccountData = async () => {
    if (!accountNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching account data for:', accountNumber);
      // Get account data
      const accountData = await AccountApiService.getAccountByNumber(accountNumber as string);
      
      console.log('Account data received:', accountData);
      
      // Always get the missing documents list
      let missingDocs: string[] = [];
      try {
        missingDocs = await AccountApiService.getMissingDocuments(accountNumber as string);
      } catch (docError) {
        console.error('Error fetching missing documents:', docError);
      }
      
      // Determine outstanding document status based on missing docs list
      const hasOutstandingDocs = missingDocs.length > 0;
      
      // Check if this is a joint account
      const isJoint = accountData.isJoint || false;
      setIsJointAccount(isJoint);
      
      console.log('Joint account status:', isJoint);
      console.log('Joint holders:', accountData.jointHolders);
      
      // Create enhanced account object
      const enhancedAccount: AccountWithDocuments = {
        ...accountData,
        hasOutstandingDocuments: hasOutstandingDocs,
        outstandingDocumentsList: missingDocs,
        jointHolders: accountData.jointHolders || []
      };
      
      setAccount(enhancedAccount);
      
      // Get account owners
      const owners: CustomerWithDocuments[] = [];
      
      // Add primary owner
      if (accountData.customerBasicNumber) {
        try {
          // Get primary owner
          const primaryOwner = await CustomerApiService.getCustomerByBasicNumber(accountData.customerBasicNumber);
          
          // Check document status for owner
          const hasCustomerOutstandingDocs = await ApiService.hasOutstandingDocuments(primaryOwner.basicNumber);
          
          let customerMissingDocs: string[] = [];
          if (hasCustomerOutstandingDocs) {
            // Get list of missing documents
            const response = await axios.get(`${API_BASE_URL}/documents/customer/${primaryOwner.basicNumber}/outstanding-list`);
            customerMissingDocs = response.data || [];
          }
          
          const enhancedOwner: CustomerWithDocuments = {
            ...primaryOwner,
            hasOutstandingDocuments: hasCustomerOutstandingDocs,
            outstandingDocumentsList: customerMissingDocs,
            isPrimary: true
          };
          
          owners.push(enhancedOwner);
        } catch (customerError) {
          console.error('Error fetching primary owner data:', customerError);
        }
      }
      
      // Add joint holders if any
      if (isJoint && accountData.jointHolders && accountData.jointHolders.length > 0) {
        console.log('Fetching joint holders data...');
        for (const holderBasicNumber of accountData.jointHolders) {
          try {
            console.log('Fetching joint holder:', holderBasicNumber);
            // Get joint holder customer
            const jointHolder = await CustomerApiService.getCustomerByBasicNumber(holderBasicNumber);
            
            // Check document status for this holder
            const hasHolderOutstandingDocs = await ApiService.hasOutstandingDocuments(holderBasicNumber);
            
            let holderMissingDocs: string[] = [];
            if (hasHolderOutstandingDocs) {
              // Get list of missing documents
              const response = await axios.get(`${API_BASE_URL}/documents/customer/${holderBasicNumber}/outstanding-list`);
              holderMissingDocs = response.data || [];
            }
            
            const enhancedHolder: CustomerWithDocuments = {
              ...jointHolder,
              hasOutstandingDocuments: hasHolderOutstandingDocs,
              outstandingDocumentsList: holderMissingDocs,
              isPrimary: false
            };
            
            owners.push(enhancedHolder);
            console.log('Added joint holder to owners list:', jointHolder.name);
          } catch (holderError) {
            console.error(`Error fetching joint holder data for ${holderBasicNumber}:`, holderError);
          }
        }
      }
      
      console.log('Total account owners found:', owners.length);
      setAccountOwners(owners);
    } catch (err) {
      console.error('Error fetching account data:', err);
      setError('Failed to load account details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch account and owners data
  useEffect(() => {
    fetchAccountData();
    // Include refreshKey in dependencies to trigger re-fetch when it changes
  }, [accountNumber, refreshKey]);
  
  // Manually refresh data
  const handleRefreshData = () => {
    setRefreshing(true);
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-SG', { 
      style: 'currency', 
      currency: currency || 'USD', 
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Navigate to customer details page
  const navigateToCustomer = (basicNumber: string) => {
    router.push(`/customer/${basicNumber}`);
  };

  // Render account status chip
  const renderAccountStatusChip = (status: string) => {
    switch(status) {
      case 'ACTIVE':
      case 'Active':
        return <Chip icon={<CheckCircleIcon />} label="Active" color="success" size="small" />;
      case 'FROZEN':
      case 'Frozen':
        return <Chip icon={<ErrorIcon />} label="Frozen" color="error" size="small" />;
      case 'DORMANT':
      case 'Dormant':
        return <Chip icon={<WarningIcon />} label="Dormant" color="warning" size="small" />;
      case 'CLOSED':
      case 'Closed':
        return <Chip icon={<CreditCardIcon />} label="Closed" color="default" size="small" />;
      case 'PENDING_APPROVAL':
      case 'PendingApproval':
        return <Chip icon={<WarningIcon />} label="Pending Approval" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Document uploader functions
  const handleOpenDocumentUploader = (docName?: string, category?: string) => {
    if (docName) {
      setSelectedDocument(docName);
      setSelectedCategory(category || null);
    } else {
      // For the main "Upload Document" button, show all documents
      setSelectedDocument(null);
      setSelectedCategory(null);
    }
    setUploaderOpen(true);
  };
  
  const handleCloseDocumentUploader = () => {
    setUploaderOpen(false);
    // Refresh account data after uploader is closed to reflect any changes
    handleRefreshData();
  };
  
  // Get document category from name
  const getDocumentCategory = (docName: string): string => {
    if (docName.includes('Statement') || docName.includes('Financial')) 
      return 'Financial';
    if (docName.includes('ID') || docName.includes('Passport') || docName.includes('License')) 
      return 'Identification';
    if (docName.includes('Agreement') || docName.includes('Contract') || docName.includes('Terms')) 
      return 'Legal';
    if (docName.includes('Authorization') || docName.includes('Signature')) 
      return 'Authorization';
    if (docName.includes('KYC'))
      return 'KYC';
    
    return 'Other';
  };
  
  // Joint account holder management functions
  const handleOpenAddHolderDialog = () => {
    setCustomerSearchTerm('');
    setCustomerSearchResults([]);
    setSelectedCustomer(null);
    setAddHolderDialogOpen(true);
  };
  
  const handleCloseAddHolderDialog = () => {
    setAddHolderDialogOpen(false);
  };
  
  const handleCustomerSearch = async () => {
    if (!customerSearchTerm || customerSearchTerm.length < 2) return;
    
    try {
      // Search for customers matching the search term
      const results = await CustomerApiService.searchCustomers(customerSearchTerm);
      
      // Filter out customers who are already account holders
      const filteredResults = results.filter(customer => 
        !accountOwners.some(owner => owner.basicNumber === customer.basicNumber)
      );
      
      setCustomerSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching customers:', err);
      setCustomerSearchResults([]);
    }
  };
  
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };
  
  const handleAddJointHolder = async () => {
    if (!selectedCustomer || !account || !account.accountNumber) return;
    
    setAddingCustomer(true);
    
    try {
      console.log('Adding joint holder:', selectedCustomer.basicNumber);
      
      // Make sure we have the current joint holders list
      const currentJointHolders = account.jointHolders || [];
      
      // Don't add if already in the list
      if (currentJointHolders.includes(selectedCustomer.basicNumber)) {
        console.log('Customer already in joint holders list');
        alert('This customer is already a joint holder on this account.');
        setAddingCustomer(false);
        return;
      }
      
      // Prepare updated account data
      const updatedJointHolders = [...currentJointHolders, selectedCustomer.basicNumber];
      
      console.log('Current joint holders:', currentJointHolders);
      console.log('Updated joint holders:', updatedJointHolders);
      
      // Call API to update account
      await AccountApiService.updateAccount(account.accountNumber, {
        isJoint: true,
        jointHolders: updatedJointHolders
      });
      
      console.log('Joint holder added successfully');
      
      // Update local state directly to avoid refresh delay
      if (account) {
        // Update account joint holders
        setAccount({
          ...account,
          isJoint: true,
          jointHolders: updatedJointHolders
        });
        
        // Add the new holder to accountOwners
        const newHolder: CustomerWithDocuments = {
          ...selectedCustomer,
          hasOutstandingDocuments: false,  // We'll assume no documents required for now
          outstandingDocumentsList: [],
          isPrimary: false
        };
        
        setAccountOwners(prevOwners => [...prevOwners, newHolder]);
      }
      
      // Close dialog and refresh data
      setAddHolderDialogOpen(false);
      
      // Fetch all updated account data to make sure everything is in sync
      handleRefreshData();
      
      // Show success message
      alert(`${selectedCustomer.name} has been added as a joint account holder.`);
    } catch (err) {
      console.error('Error adding joint account holder:', err);
      alert('Failed to add joint account holder. Please try again.');
    } finally {
      setAddingCustomer(false);
    }
  };
  
  const handleOpenRemoveHolderDialog = (customer: CustomerWithDocuments) => {
    setCustomerToRemove(customer);
    setRemoveHolderDialogOpen(true);
  };
  
  const handleCloseRemoveHolderDialog = () => {
    setRemoveHolderDialogOpen(false);
    setCustomerToRemove(null);
  };
  
  const handleRemoveJointHolder = async () => {
    if (!customerToRemove || !account || !account.accountNumber) return;
    
    try {
      // Cannot remove primary account holder
      if (customerToRemove.isPrimary) {
        alert('Cannot remove primary account holder. Please update the primary holder first.');
        return;
      }
      
      console.log('Removing joint holder:', customerToRemove.basicNumber);
      
      // Get current joint holders list
      const currentJointHolders = account.jointHolders || [];
      
      // Get updated joint holders list
      const updatedJointHolders = currentJointHolders.filter(
        basicNumber => basicNumber !== customerToRemove.basicNumber
      );
      
      // Determine if this is still a joint account
      const isStillJoint = updatedJointHolders.length > 0;
      
      console.log('Current joint holders:', currentJointHolders);
      console.log('Updated joint holders:', updatedJointHolders);
      
      // Call API to update account
      await AccountApiService.updateAccount(account.accountNumber, {
        isJoint: isStillJoint,
        jointHolders: updatedJointHolders
      });
      
      console.log('Joint holder removed successfully');
      
      // Update local state directly to avoid refresh delay
      if (account) {
        // Update account joint holders
        setAccount({
          ...account,
          isJoint: isStillJoint,
          jointHolders: updatedJointHolders
        });
        
        // Remove the holder from accountOwners
        setAccountOwners(prevOwners => 
          prevOwners.filter(owner => owner.basicNumber !== customerToRemove.basicNumber)
        );
      }
      
      // Close dialog
      setRemoveHolderDialogOpen(false);
      
      // Fetch all updated account data to make sure everything is in sync
      handleRefreshData();
      
      // Show success message
      alert(`${customerToRemove.name} has been removed from this account.`);
    } catch (err) {
      console.error('Error removing joint account holder:', err);
      alert('Failed to remove joint account holder. Please try again.');
    }
  };
  
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </div>
    );
  }
  
  if (error || !account) {
    return (
      <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosRounded />}
            onClick={() => router.back()}
            sx={{ mb: 3 }}
          >
            Back
          </Button>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'Account not found'}
          </Alert>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosRounded />}
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
        
        {/* Account Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalanceIcon color="primary" />
            Account Details
            {account.hasOutstandingDocuments && (
              <Badge 
                color="warning" 
                badgeContent={account.outstandingDocumentsList?.length || "!"} 
                sx={{ ml: 2 }}
              >
                <WarningIcon color="warning" />
              </Badge>
            )}
          </Typography>
          
          <Typography variant="h6" color="textSecondary">
            {account.accountNumber}
          </Typography>
        </Box>
        
        {refreshing && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress />
          </Box>
        )}
        
        {/* Account Summary */}
        <DetailPaper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Account Type</Typography>
                <Typography variant="h6">
                  <Chip 
                    icon={<CreditCardIcon />} 
                    label={account.accountType} 
                    color="primary" 
                    sx={{ mt: 0.5 }} 
                  />
                  {isJointAccount && (
                    <Chip 
                      icon={<PersonIcon />} 
                      label="Joint Account" 
                      color="secondary" 
                      sx={{ mt: 0.5, ml: 1 }} 
                    />
                  )}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Typography variant="h6">
                  {renderAccountStatusChip(account.status || '')}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Currency</Typography>
                <Typography variant="h6">{account.currency}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Current Balance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatCurrency(account.balance || 0, account.currency || 'USD')}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Document Status</Typography>
                <Typography variant="h6">
                  {account.hasOutstandingDocuments ? (
                    <Badge 
                      color="warning" 
                      badgeContent={account.outstandingDocumentsList?.length || "!"}
                    >
                      <Chip 
                        icon={<FolderIcon />}
                        label="Pending Documents"
                        color="warning"
                      />
                    </Badge>
                  ) : (
                    <Chip 
                      icon={<CheckCircleIcon />}
                      label="Complete"
                      color="success"
                    />
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DetailPaper>
        
        {/* Tab Navigation */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Account Documents" />
          <Tab label="Account Owners" />
          <Tab label="Transactions" />
        </Tabs>
        
        {/* Account Documents Tab */}
        {activeTab === 0 && (
          <>
            <DetailPaper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Required Account Documents</Typography>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => handleOpenDocumentUploader()}
                >
                  Upload Document
                </Button>
              </Box>
              
              {!account.outstandingDocumentsList || account.outstandingDocumentsList.length === 0 ? (
                <Alert severity="success">
                  All required account documents have been submitted.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Document Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {account.outstandingDocumentsList.map((doc, index) => {
                        const category = getDocumentCategory(doc);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon color="warning" />
                                {doc}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={category} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip icon={<WarningIcon />} label="Required" color="warning" size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => handleOpenDocumentUploader(doc, category)}
                              >
                                Upload
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DetailPaper>
            
          
          </>
        )}
        
        {/* Account Owners Tab */}
        {activeTab === 1 && (
          <DetailPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Account Owners 
                {accountOwners.length > 0 && (
                  <Chip 
                    label={`${accountOwners.length} owners`} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddHolderDialog}
                color="secondary"
              >
                Add Joint Holder
              </Button>
            </Box>
            
            {accountOwners.length > 0 ? (
              <List>
                {accountOwners.map((owner, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 1
                        },
                      }}
                      onClick={() => navigateToCustomer(owner.basicNumber)}
                    >
                      <ListItemIcon>
                        {owner.customerType === 'Individual' ? (
                          <PersonIcon fontSize="large" color={owner.isPrimary ? "primary" : "inherit"} />
                        ) : (
                          <BusinessIcon fontSize="large" color={owner.isPrimary ? "primary" : "inherit"} />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{owner.name}</Typography>
                            {owner.isPrimary && (
                              <Chip size="small" label="Primary" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">{owner.basicNumber}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Chip 
                                label={owner.customerType || 'Individual'} 
                                size="small" 
                                color={owner.customerType === 'Individual' ? 'primary' : 'secondary'}
                                variant="outlined"
                              />
                              {owner.hasOutstandingDocuments ? (
                                <Badge 
                                  color="warning" 
                                  badgeContent={owner.outstandingDocumentsList?.length || "!"}
                                >
                                  <Chip 
                                    icon={<FolderIcon />}
                                    label="Pending Documents"
                                    color="warning"
                                    size="small"
                                  />
                                </Badge>
                              ) : (
                                <Chip 
                                  icon={<CheckCircleIcon />}
                                  label="Documents Complete"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRemoveHolderDialog(owner);
                          }}
                          disabled={owner.isPrimary}
                          title={owner.isPrimary ? "Cannot remove primary account holder" : "Remove joint holder"}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">No account owners found.</Alert>
            )}
            
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon fontSize="small" />
              Click on an owner to view their complete details and documents
            </Typography>
          </DetailPaper>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 2 && (
          <DetailPaper>
            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
            <Alert severity="info">
              Transaction history functionality is under development.
            </Alert>
          </DetailPaper>
        )}
        
        {/* Document Uploader Dialog */}
        <Dialog 
          open={uploaderOpen} 
          onClose={handleCloseDocumentUploader}
          maxWidth="xl"
          fullWidth
        >
          <DialogContent sx={{ p: 0, backgroundColor: '#2D2D2D' }}>
            <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
              <IconButton 
                onClick={handleCloseDocumentUploader} 
                aria-label="close"
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <DocumentUploaderAccountLevel 
              accountNumber={account.accountNumber}
              basicNumber={account.customerBasicNumber}
              onClose={handleCloseDocumentUploader}
              mode='full'
              initialDocument={selectedDocument || undefined}
              initialCategory={selectedCategory || undefined}
            />
          </DialogContent>
        </Dialog>
        
        {/* Add Joint Holder Dialog */}
        <Dialog
          open={addHolderDialogOpen}
          onClose={handleCloseAddHolderDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Add Joint Account Holder
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Search for a customer to add as a joint account holder. Joint account holders have access to manage and operate the account.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Search by Customer ID or Name"
                variant="outlined"
                fullWidth
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch()}
              />
              <Button 
                variant="contained"
                onClick={handleCustomerSearch}
                disabled={!customerSearchTerm || customerSearchTerm.length < 2}
              >
                Search
              </Button>
            </Box>
            
            {customerSearchResults.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerSearchResults.map((customer) => (
                      <TableRow key={customer.basicNumber} selected={selectedCustomer?.basicNumber === customer.basicNumber}>
                        <TableCell>{customer.basicNumber}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.customerType || 'Individual'} 
                            size="small" 
                            color={customer.customerType === 'Individual' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.lifecycleStatus || 'Active'} 
                            size="small" 
                            color={customer.lifecycleStatus === 'Active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : customerSearchTerm && customerSearchTerm.length >= 2 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No customers found matching your search criteria.
              </Alert>
            ) : null}
            
            {selectedCustomer && (
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.1)', border: '1px solid rgba(25, 118, 210, 0.3)' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Customer
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {selectedCustomer.customerType === 'Individual' ? (
                    <PersonIcon fontSize="large" color="primary" />
                  ) : (
                    <BusinessIcon fontSize="large" color="secondary" />
                  )}
                  <Box>
                    <Typography variant="h6">{selectedCustomer.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedCustomer.basicNumber} • {selectedCustomer.customerType || 'Individual'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddHolderDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              disabled={!selectedCustomer || addingCustomer} 
              onClick={handleAddJointHolder}
              startIcon={addingCustomer ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {addingCustomer ? 'Adding...' : 'Add to Account'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Remove Joint Holder Dialog */}
        <Dialog
          open={removeHolderDialogOpen}
          onClose={handleCloseRemoveHolderDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Remove Joint Account Holder
          </DialogTitle>
          <DialogContent>
            {customerToRemove && (
              <>
                <Typography variant="subtitle1" gutterBottom color="error">
                  Are you sure you want to remove this customer from the account?
                </Typography>
                <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(255, 0, 0, 0.05)', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {customerToRemove.customerType === 'Individual' ? (
                      <PersonIcon fontSize="large" color="error" />
                    ) : (
                      <BusinessIcon fontSize="large" color="error" />
                    )}
                    <Box>
                      <Typography variant="h6">{customerToRemove.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {customerToRemove.basicNumber} • {customerToRemove.customerType || 'Individual'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  This customer will no longer have access to this account. This action cannot be undone.
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRemoveHolderDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleRemoveJointHolder}
              startIcon={<DeleteIcon />}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default AccountDetailPage;