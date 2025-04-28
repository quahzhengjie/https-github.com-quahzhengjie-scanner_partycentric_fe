import React, { useState, useMemo } from "react";
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  styled,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Badge,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  ArrowBackIosRounded, 
  ClearRounded, 
  SearchRounded, 
  AddCircleOutlineRounded,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  FolderOpen as FolderIcon,
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
  Compare as CompareIcon
} from "@mui/icons-material";
import Header from '@/components/Header';
import { Customer, CustomerLifecycleStatus } from "@/types/customer";
import { AccountDTO } from "@/types/account";
import { CustomerApiService } from "@/services/CustomerApiService";
import { DocumentApiService } from "@/services/DocumentApiService";
import { AccountApiService } from "@/services/AccountApiService";
import axios from 'axios';

// API endpoints for direct calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const DOCUMENT_API = {
  GET_OUTSTANDING_LIST: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`,
};

// Define the extended type
type CustomerWithDocStatus = Customer & { 
  hasOutstandingDocuments: boolean;
  outstandingDocumentsList?: string[];
};

// Define the extended account type
type AccountWithDocStatus = AccountDTO & {
  hasOutstandingDocuments: boolean;
  outstandingDocumentsList?: string[];
  customerName?: string; // Add customer name for reference
};

// Enhanced Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  display: 'flex',
  flexDirection: 'column',
}));

const SearchPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const ResultsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.85)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
}));

// Colour is hardcoded to black in the table cell
const StyledTableCell = styled(TableCell)(() => ({
  color: "black",
}));

// Search mode toggle styling
// Update the StyledToggleButtonGroup styling
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  '& .MuiToggleButtonGroup-grouped': {
    border: '1px solid #4281b5',  // Add a visible border
    margin: 5,
    '&.Mui-selected': {
      backgroundColor: '#4281b5',  // Use your blue color from the header
      color: 'white',  // White text for better contrast
      fontWeight: 'bold',
    },
    '&:not(.Mui-selected)': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Light background for inactive tabs
      color: '#0f2c52',  // Dark text for better visibility
    },
    '&:hover': {
      backgroundColor: 'rgba(66, 129, 181, 0.2)',  // Light blue hover effect
    },
  },
}));

// Type for dropdown options
interface OptionType {
  value: string;
  label: string;
}

const KYCPage: React.FC = () => {
  const router = useRouter();
  
  // Search Mode
  const [searchMode, setSearchMode] = useState<'customer' | 'account'>('customer');
  
  // Customer Search States
  const [basicNumber, setBasicNumber] = useState('');
  const [name, setName] = useState('');
  const [documentStatus, setDocumentStatus] = useState('all');
  const [customerType, setCustomerType] = useState('all');
  const [lifecycleStatus, setLifecycleStatus] = useState('all');
  
  // Account Search States
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [accountStatus, setAccountStatus] = useState('all');
  
  // Common States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [customerResults, setCustomerResults] = useState<CustomerWithDocStatus[]>([]);
  const [accountResults, setAccountResults] = useState<AccountWithDocStatus[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get customer type options
  const customerTypeOptions: OptionType[] = [
    { value: 'all', label: 'All Types' },
    { value: 'Individual', label: 'Individual' },
    { value: 'Corporate', label: 'Corporate' }
  ];
  
  // Get lifecycle status options
  const lifecycleStatusOptions: OptionType[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Onboarding', label: 'Onboarding' },
    { value: 'Prospective', label: 'Prospective' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Dormant', label: 'Dormant' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  
  // Get account type options
  const accountTypeOptions: OptionType[] = [
    { value: 'all', label: 'All Types' },
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'CHECKING', label: 'Checking' },
    { value: 'FIXED_DEPOSIT', label: 'Fixed Deposit' },
    { value: 'LOAN', label: 'Loan' },
    { value: 'CREDIT_CARD', label: 'Credit Card' }
  ];
  
  // Get account status options
  const accountStatusOptions: OptionType[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'FROZEN', label: 'Frozen' },
    { value: 'DORMANT', label: 'Dormant' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' }
  ];

  // Handle search mode change
  const handleSearchModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'customer' | 'account'
  ) => {
    if (newMode !== null) {
      setSearchMode(newMode);
      // Reset page when changing modes
      setPage(0);
      setHasSearched(false);
    }
  };

  // Function to get accounts with document status
  const getAccountsWithDocumentStatus = async (accounts: AccountDTO[]): Promise<AccountWithDocStatus[]> => {
    const enrichedAccounts: AccountWithDocStatus[] = [];
    
    for (const account of accounts) {
      try {
        // Check if account has outstanding documents
        const hasOutstanding = await AccountApiService.getAccountDocumentStatus(account.accountNumber);
        
        let outstandingDocs: string[] = [];
        if (hasOutstanding) {
          try {
            // Get list of missing documents
            outstandingDocs = await AccountApiService.getMissingDocuments(account.accountNumber);
          } catch (listError) {
            console.error(`Error fetching missing documents for account ${account.accountNumber}:`, listError);
          }
        }
        
        // Get customer name if needed
        let customerName = "";
        try {
          if (account.customerBasicNumber) {
            const customer = await CustomerApiService.getCustomerByBasicNumber(account.customerBasicNumber);
            customerName = customer.name;
          }
        } catch (customerError) {
          console.error(`Error fetching customer for account ${account.accountNumber}:`, customerError);
        }
        
        // Enrich account with document status and customer name
        enrichedAccounts.push({
          ...account,
          hasOutstandingDocuments: hasOutstanding,
          outstandingDocumentsList: outstandingDocs,
          customerName
        });
      } catch (err) {
        console.error(`Error checking document status for account ${account.accountNumber}:`, err);
        // Add account without document status in case of error
        enrichedAccounts.push({
          ...account,
          hasOutstandingDocuments: false,
          outstandingDocumentsList: []
        });
      }
    }
    
    return enrichedAccounts;
  };

  // Advanced Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true);
    setPage(0);
    
    try {
      if (searchMode === 'customer') {
        // Customer search
        // Get raw customer data with search filters
        const results = await CustomerApiService.searchCustomers(
          basicNumber || undefined, 
          name || undefined, 
          lifecycleStatus !== 'all' ? lifecycleStatus as CustomerLifecycleStatus : undefined
        );
        
        // Enrich with document status
        const resultsWithStatus = await Promise.all(
          results.map(async (customer) => {
            try {
              const hasOutstanding = await DocumentApiService.hasOutstandingDocuments(customer.basicNumber);
              
              let outstandingDocs: string[] = [];
              if (hasOutstanding) {
                try {
                  // Get outstanding documents list using the correct endpoint
                  const response = await axios.get(DOCUMENT_API.GET_OUTSTANDING_LIST(customer.basicNumber));
                  outstandingDocs = response.data || [];
                } catch (docError) {
                  console.error(`Error fetching outstanding documents for ${customer.basicNumber}:`, docError);
                }
              }
              
              return {
                ...customer,
                hasOutstandingDocuments: hasOutstanding,
                outstandingDocumentsList: outstandingDocs
              };
            } catch (customerError) {
              console.error(`Error checking document status for ${customer.basicNumber}:`, customerError);
              return {
                ...customer,
                hasOutstandingDocuments: false,
                outstandingDocumentsList: []
              };
            }
          })
        );
        
        // Apply additional filtering
        const filteredResults = resultsWithStatus.filter(customer => {
          // Filter by document status
          const matchesDocStatus = documentStatus === 'all' 
            ? true 
            : (documentStatus === 'pending' 
                ? customer.hasOutstandingDocuments 
                : !customer.hasOutstandingDocuments);
          
          // Filter by customer type
          const matchesCustomerType = customerType === 'all' 
            ? true 
            : customer.customerType === customerType;
          
          // Return only results that match all filters
          return matchesDocStatus && matchesCustomerType;
        });
        
        setCustomerResults(filteredResults);
        setAccountResults([]);
      } else {
        // Account search
        // First get all accounts
        let accounts: AccountDTO[] = [];
        
        if (accountNumber) {
          // If account number is provided, get specific account
          try {
            const account = await AccountApiService.getAccountByNumber(accountNumber);
            accounts = [account];
          } catch (accountError) {
            console.error(`Error fetching account ${accountNumber}:`, accountError);
            accounts = [];
          }
        } else if (basicNumber) {
          // If customer basic number is provided, get accounts for that customer
          accounts = await AccountApiService.getAccountsByCustomerNumber(basicNumber);
        } else {
          // Otherwise get all accounts
          accounts = await AccountApiService.getAllAccounts();
        }
        
        // Enrich accounts with document status
        const enrichedAccounts = await getAccountsWithDocumentStatus(accounts);
        
        // Apply filters
        const filteredAccounts = enrichedAccounts.filter(account => {
          // Filter by account type
          const matchesAccountType = accountType === 'all'
            ? true
            : account.accountType === accountType;
            
          // Filter by account status
          const matchesAccountStatus = accountStatus === 'all'
            ? true
            : account.status === accountStatus;
            
          // Filter by document status
          const matchesDocStatus = documentStatus === 'all'
            ? true
            : (documentStatus === 'pending'
                ? account.hasOutstandingDocuments
                : !account.hasOutstandingDocuments);
                
          // Filter by customer name if provided
          const matchesName = !name 
            ? true
            : account.customerName?.toLowerCase().includes(name.toLowerCase());
                
          return matchesAccountType && matchesAccountStatus && matchesDocStatus && matchesName;
        });
        
        setAccountResults(filteredAccounts);
        setCustomerResults([]);
      }
    } catch (searchError) {
      console.error("Error searching:", searchError);
      setCustomerResults([]);
      setAccountResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset Search Filters
  const handleResetFilters = () => {
    // Reset common filters
    setBasicNumber('');
    setName('');
    setDocumentStatus('all');
    
    if (searchMode === 'customer') {
      // Reset customer-specific filters
      setCustomerType('all');
      setLifecycleStatus('all');
    } else {
      // Reset account-specific filters
      setAccountNumber('');
      setAccountType('all');
      setAccountStatus('all');
    }
    
    setCustomerResults([]);
    setAccountResults([]);
    setHasSearched(false);
  };

  // Pagination Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtered and Paginated Results
  const paginatedCustomerResults = useMemo(() => {
    return customerResults.slice(
      page * rowsPerPage, 
      page * rowsPerPage + rowsPerPage
    );
  }, [customerResults, page, rowsPerPage]);
  
  const paginatedAccountResults = useMemo(() => {
    return accountResults.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [accountResults, page, rowsPerPage]);

  // Get the customer type display label
  const getCustomerTypeLabel = (type: string): string => {
    const option = customerTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  // Get the appropriate icon for customer type
  const getCustomerTypeIcon = (type: string) => {
    return type === 'Individual' ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />;
  };
  
  // Get account type label
  const getAccountTypeLabel = (type: string): string => {
    const option = accountTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };
  
  // Render status chip based on lifecycle status
  const renderCustomerStatusChip = (status: string) => {
    switch(status) {
      case 'Active':
        return <Chip icon={<CheckCircleIcon />} label="Active" color="success" size="small" />;
      case 'Onboarding':
        return <Chip icon={<TimelineIcon />} label="Onboarding" color="info" size="small" />;
      case 'Prospective':
        return <Chip icon={<AccessTimeIcon />} label="Prospective" color="primary" size="small" />;
      case 'Suspended':
        return <Chip icon={<ErrorIcon />} label="Suspended" color="error" size="small" />;
      case 'Dormant':
        return <Chip icon={<WarningIcon />} label="Dormant" color="warning" size="small" />;
      case 'Closed':
        return <Chip icon={<CloseIcon />} label="Closed" color="default" size="small" />;
      case 'Rejected':
        return <Chip icon={<CloseIcon />} label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
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
        return <Chip icon={<CloseIcon />} label="Closed" color="default" size="small" />;
      case 'PENDING_APPROVAL':
      case 'PendingApproval':
        return <Chip icon={<AccessTimeIcon />} label="Pending Approval" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Render Active Filters Chips
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    // Common filters
    if (basicNumber) {
      activeFilters.push({
        label: `${searchMode === 'customer' ? 'Basic' : 'Customer'} Number: ${basicNumber}`,
        clear: () => setBasicNumber('')
      });
    }
    
    if (name) {
      activeFilters.push({
        label: `Name: ${name}`,
        clear: () => setName('')
      });
    }
    
    if (documentStatus !== 'all') {
      activeFilters.push({
        label: `Document Status: ${documentStatus === 'pending' ? 'Pending Documents' : 'Completed'}`,
        clear: () => setDocumentStatus('all')
      });
    }
    
    // Mode-specific filters
    if (searchMode === 'customer') {
      if (customerType !== 'all') {
        activeFilters.push({
          label: `Customer Type: ${getCustomerTypeLabel(customerType)}`,
          clear: () => setCustomerType('all')
        });
      }
      
      if (lifecycleStatus !== 'all') {
        activeFilters.push({
          label: `Customer Status: ${lifecycleStatus}`,
          clear: () => setLifecycleStatus('all')
        });
      }
    } else {
      if (accountNumber) {
        activeFilters.push({
          label: `Account Number: ${accountNumber}`,
          clear: () => setAccountNumber('')
        });
      }
      
      if (accountType !== 'all') {
        activeFilters.push({
          label: `Account Type: ${getAccountTypeLabel(accountType)}`,
          clear: () => setAccountType('all')
        });
      }
      
      if (accountStatus !== 'all') {
        activeFilters.push({
          label: `Account Status: ${accountStatus}`,
          clear: () => setAccountStatus('all')
        });
      }
    }

    if (activeFilters.length === 0) return null;

    return (
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        {activeFilters.map((filter, index) => (
          <Chip 
            key={index}
            label={filter.label}
            onDelete={filter.clear}
            color="primary"
            variant="outlined"
          />
        ))}
      </Stack>
    );
  };

  // Render search form based on mode
  const renderSearchForm = () => {
    return (
      <form onSubmit={handleSearch}>
        <Box sx={{ mb: 3 }}>
          {/* Search Mode Toggle */}
          <StyledToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={handleSearchModeChange}
            aria-label="search mode"
            fullWidth
          >
            <ToggleButton value="customer" aria-label="customer search">
              <PersonIcon sx={{ mr: 1 }} />
              Customer Search
            </ToggleButton>
            <ToggleButton value="account" aria-label="account search">
              <CreditCardIcon sx={{ mr: 1 }} />
              Account Search
            </ToggleButton>
          </StyledToggleButtonGroup>

          {/* Common Fields Row */}
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', md: 'row' }} 
            gap={3} 
            alignItems="center"
            mb={3}
          >
            {searchMode === 'customer' ? (
              // Customer Search Fields
              <>
                <TextField
                  fullWidth
                  label="Basic Number"
                  variant="outlined"
                  value={basicNumber}
                  onChange={(e) => setBasicNumber(e.target.value)}
                  placeholder="Enter Basic Number"
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    sx: {
                      color: 'black',
                      '&.Mui-focused': { color: 'black' },
                    },
                  }}
                  InputProps={{
                    sx: {
                      color: 'black',
                      '& input::placeholder': {
                        color: 'black',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: 'black' },
                      '&:hover fieldset': { borderColor: 'black' },
                      '&.Mui-focused fieldset': { borderColor: 'black' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Customer Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Customer Name"
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    sx: {
                      color: 'black',
                      '&.Mui-focused': { color: 'black' },
                    },
                  }}
                  InputProps={{
                    sx: {
                      color: 'black',
                      '& input::placeholder': {
                        color: 'black',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: 'black' },
                      '&:hover fieldset': { borderColor: 'black' },
                      '&.Mui-focused fieldset': { borderColor: 'black' },
                    },
                  }}
                />
              </>
            ) : (
              // Account Search Fields
              <>
                <TextField
                  fullWidth
                  label="Account Number"
                  variant="outlined"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter Account Number"
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    sx: {
                      color: 'black',
                      '&.Mui-focused': { color: 'black' },
                    },
                  }}
                  InputProps={{
                    sx: {
                      color: 'black',
                      '& input::placeholder': {
                        color: 'black',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: 'black' },
                      '&:hover fieldset': { borderColor: 'black' },
                      '&.Mui-focused fieldset': { borderColor: 'black' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Customer Basic Number"
                  variant="outlined"
                  value={basicNumber}
                  onChange={(e) => setBasicNumber(e.target.value)}
                  placeholder="Enter Customer Basic Number"
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    sx: {
                      color: 'black',
                      '&.Mui-focused': { color: 'black' },
                    },
                  }}
                  InputProps={{
                    sx: {
                      color: 'black',
                      '& input::placeholder': {
                        color: 'black',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: 'black' },
                      '&:hover fieldset': { borderColor: 'black' },
                      '&.Mui-focused fieldset': { borderColor: 'black' },
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Customer Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Customer Name"
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    sx: {
                      color: 'black',
                      '&.Mui-focused': { color: 'black' },
                    },
                  }}
                  InputProps={{
                    sx: {
                      color: 'black',
                      '& input::placeholder': {
                        color: 'black',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: 'black' },
                      '&:hover fieldset': { borderColor: 'black' },
                      '&.Mui-focused fieldset': { borderColor: 'black' },
                    },
                  }}
                />
              </>
            )}
          </Box>

          {/* Mode-specific filters row */}
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', md: 'row' }} 
            gap={3} 
            alignItems="center"
          >
            {searchMode === 'customer' ? (
              // Customer filters
              <>
                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'black' }}>Customer Type</InputLabel>
                  <Select
                    value={customerType}
                    label="Customer Type"
                    onChange={(e) => setCustomerType(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': { color: 'black' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                    }}
                  >
                    {customerTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'black' }}>Customer Status</InputLabel>
                  <Select
                    value={lifecycleStatus}
                    label="Customer Status"
                    onChange={(e) => setLifecycleStatus(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': { color: 'black' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                    }}
                  >
                    {lifecycleStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              // Account filters
              <>
                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'black' }}>Account Type</InputLabel>
                  <Select
                    value={accountType}
                    label="Account Type"
                    onChange={(e) => setAccountType(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': { color: 'black' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                    }}
                  >
                    {accountTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'black' }}>Account Status</InputLabel>
                  <Select
                    value={accountStatus}
                    label="Account Status"
                    onChange={(e) => setAccountStatus(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': { color: 'black' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                    }}
                  >
                    {accountStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel sx={{ color: 'black' }}>Document Status</InputLabel>
              <Select
                value={documentStatus}
                label="Document Status"
                onChange={(e) => setDocumentStatus(e.target.value)}
                sx={{
                  '& .MuiSelect-select': { color: 'black' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending Documents</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <Tooltip title="Search">
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchRounded />}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Tooltip>
              <Tooltip title="Reset Filters">
                <Button 
                  variant="outlined"
                  startIcon={<ClearRounded />}
                  onClick={handleResetFilters}
                  disabled={loading}
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'common.white',
                    borderColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                      borderColor: 'secondary.dark',
                    },
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </form>
    );
  };

  // Render customer search results
  const renderCustomerSearchResults = () => {
    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Basic Number</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Customer Type</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Document Status</StyledTableCell>
                <StyledTableCell>Outstanding Documents</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <StyledTableCell colSpan={8} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body1" color="black">
                        Searching... Please wait.
                      </Typography>
                    </Box>
                  </StyledTableCell>
                </TableRow>
              ) : paginatedCustomerResults.length > 0 ? (
                paginatedCustomerResults.map((customer) => (
                  <StyledTableRow 
                    key={customer.basicNumber}
                    onClick={() => router.push(`/customer/${customer.basicNumber}`)}
                  >
                    <StyledTableCell>{customer.basicNumber}</StyledTableCell>
                    <StyledTableCell>{customer.name}</StyledTableCell>
                    <StyledTableCell>{customer.email}</StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        icon={getCustomerTypeIcon(customer.customerType)}
                        label={getCustomerTypeLabel(customer.customerType)}
                        variant="outlined"
                        size="small"
                        color={customer.customerType === 'Individual' ? 'primary' : 'secondary'}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      {renderCustomerStatusChip(customer.lifecycleStatus ?? 'Unknown')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {customer.hasOutstandingDocuments ? (
                        <Badge 
                          color="warning" 
                          badgeContent={customer.outstandingDocumentsList?.length || "!"}
                        >
                          <Chip 
                            icon={<FolderIcon />}
                            label="Pending"
                            color="warning"
                            size="small"
                          />
                        </Badge>
                      ) : (
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label="Complete"
                          color="success"
                          size="small"
                        />
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {customer.hasOutstandingDocuments && customer.outstandingDocumentsList && customer.outstandingDocumentsList.length > 0 ? (
                        <Box>
                          {customer.outstandingDocumentsList.map((docName, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DescriptionIcon fontSize="small" color="warning" />
                              {docName}
                            </Typography>
                          ))}
                        </Box>
                      ) : customer.hasOutstandingDocuments ? (
                        <Typography variant="body2" color="warning.main">Document verification required</Typography>
                      ) : null}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Tooltip title="View Customer Details">
                        <IconButton 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/customer/${customer.basicNumber}`);
                          }}
                        >
                          <AddCircleOutlineRounded />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={8} align="center">
                    <Typography variant="body1" color="black">
                      No Results Found
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {customerResults.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customerResults.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': { color: 'black' },
              '& .MuiTablePagination-selectLabel': { color: 'black' },
              '& .MuiTablePagination-displayedRows': { color: 'black' },
              '& .MuiTablePagination-select': { color: 'black' },
              '& .MuiTablePagination-selectIcon': { color: 'black' },
              '& .MuiIconButton-root': { color: 'black' },
            }}
          />
        )}
      </>
    );
  };

  // Render account search results
  const renderAccountSearchResults = () => {
    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Account Number</StyledTableCell>
                <StyledTableCell>Customer</StyledTableCell>
                <StyledTableCell>Type</StyledTableCell>
                <StyledTableCell>Currency</StyledTableCell>
                <StyledTableCell>Balance</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Document Status</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <StyledTableCell colSpan={8} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body1" color="black">
                        Searching... Please wait.
                      </Typography>
                    </Box>
                  </StyledTableCell>
                </TableRow>
              ) : paginatedAccountResults.length > 0 ? (
                paginatedAccountResults.map((account) => (
                  <StyledTableRow 
                    key={account.accountNumber}
                    onClick={() => router.push(`/accounts/${account.accountNumber}`)}
                  >
                    <StyledTableCell>{account.accountNumber}</StyledTableCell>
                    <StyledTableCell>
                      <Box>
                        <Typography variant="body2">{account.customerName}</Typography>
                        <Typography variant="caption" color="textSecondary">{account.customerBasicNumber}</Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        icon={<CreditCardIcon />}
                        label={getAccountTypeLabel(account.accountType)}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    </StyledTableCell>
                    <StyledTableCell>{account.currency}</StyledTableCell>
                    <StyledTableCell>
                      {new Intl.NumberFormat('en-SG', { 
                        style: 'currency', 
                        currency: account.currency || 'USD', 
                        minimumFractionDigits: 2 
                      }).format(account.balance || 0)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {renderAccountStatusChip(account.status || '')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {account.hasOutstandingDocuments ? (
                        <Badge 
                          color="warning" 
                          badgeContent={account.outstandingDocumentsList?.length || "!"}
                        >
                          <Chip 
                            icon={<FolderIcon />}
                            label="Pending"
                            color="warning"
                            size="small"
                          />
                        </Badge>
                      ) : (
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label="Complete"
                          color="success"
                          size="small"
                        />
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Account Details">
                          <IconButton 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/accounts/${account.accountNumber}`);
                            }}
                          >
                            <CreditCardIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Customer Details">
                          <IconButton 
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (account.customerBasicNumber) {
                                router.push(`/customer/${account.customerBasicNumber}`);
                              }
                            }}
                            disabled={!account.customerBasicNumber}
                          >
                            <PersonIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={8} align="center">
                    <Typography variant="body1" color="black">
                      No Results Found
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {accountResults.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={accountResults.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': { color: 'black' },
              '& .MuiTablePagination-selectLabel': { color: 'black' },
              '& .MuiTablePagination-displayedRows': { color: 'black' },
              '& .MuiTablePagination-select': { color: 'black' },
              '& .MuiTablePagination-selectIcon': { color: 'black' },
              '& .MuiIconButton-root': { color: 'black' },
            }}
          />
        )}
      </>
    );
  };

  return (
    <PageContainer>
      <Header />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIosRounded />}
          onClick={() => router.push('/')}
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>

        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #3494E6, #EC6EAD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          <CompareIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Enhanced Search & Compliance
        </Typography>

        <SearchPaper elevation={3}>
          {renderSearchForm()}
        </SearchPaper>

        {hasSearched && (
          <ResultsPaper elevation={3} sx={{ mt: 4 }}>
            {renderActiveFilters()}

            {/* Search Results Summary */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="black" fontWeight="bold">
                {loading 
                  ? 'Searching...' 
                  : searchMode === 'customer'
                    ? `Found ${customerResults.length} customer${customerResults.length !== 1 ? 's' : ''}`
                    : `Found ${accountResults.length} account${accountResults.length !== 1 ? 's' : ''}`}
              </Typography>
            </Box>

            {/* Results Tables */}
            {searchMode === 'customer' 
              ? renderCustomerSearchResults() 
              : renderAccountSearchResults()
            }
          </ResultsPaper>
        )}
      </Container>
    </PageContainer>
  );
};

export default KYCPage;