import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  styled,
  CircularProgress,
  Alert,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,

  Badge
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';

// Import ApiService and axios for direct calls
import { ApiService } from '@/services/ApiService';
import { AccountDTO } from '@/types/account';
import { CurrencyCode } from '@/types/accountTypes';
import axios from 'axios';

// Access to API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const DOCUMENT_API = {
  GET_OUTSTANDING_LIST: (basicNumber: string) => `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`,
};

// Styled components
const SummaryBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
}));

const AccountRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer'
  }
}));

const CurrencyAmount = styled(Typography)(({  }) => ({
  fontFamily: 'monospace',
  fontWeight: 500
}));

interface AccountSummaryProps {
  customerBasicNumber: string;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ customerBasicNumber }) => {
  // For document popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverTitle, setPopoverTitle] = useState<string>('Missing Documents');
  const [popoverType, setPopoverType] = useState<'customer' | 'account'>('customer');
  
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<Record<string, boolean>>({});
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [loadingDocStatus, setLoadingDocStatus] = useState(true);
  
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, type: 'customer' | 'account') => {
    setAnchorEl(event.currentTarget);
    setPopoverType(type);
    setPopoverTitle(type === 'customer' ? 'Customer Documents Required' : 'Account Documents Required');
  };
  
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!customerBasicNumber) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching accounts for summary, customer: ${customerBasicNumber}`);
        const accountData = await ApiService.getAccountsByCustomerNumber(customerBasicNumber);
        console.log('Summary accounts received:', accountData);
        setAccounts(accountData);
      } catch (err) {
        console.error('Error fetching accounts for summary:', err);
        setError('Failed to load account summary data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, [customerBasicNumber]);
  
  // Fetch document status for customer
  useEffect(() => {
    const fetchDocumentStatus = async () => {
      if (!customerBasicNumber || accounts.length === 0) return;
      
      setLoadingDocStatus(true);
      
      try {
        // First check if the customer has any outstanding documents
        const hasOutstanding = await ApiService.hasOutstandingDocuments(customerBasicNumber);
        
        // If customer has outstanding docs, create a status object and fetch the list of missing documents
        const statusObj: Record<string, boolean> = {};
        
        if (hasOutstanding) {
          statusObj['customer'] = true;
          
          // Get list of outstanding documents
          try {
            const response = await axios.get(DOCUMENT_API.GET_OUTSTANDING_LIST(customerBasicNumber));
            setMissingDocuments(response.data || []);
          } catch (listError) {
            console.error('Error fetching missing documents list:', listError);
            setMissingDocuments([]);
          }
        } else {
          setMissingDocuments([]);
        }
        
        setDocumentStatus(statusObj);
      } catch (err) {
        console.error('Error fetching document status:', err);
      } finally {
        setLoadingDocStatus(false);
      }
    };
    
    fetchDocumentStatus();
  }, [customerBasicNumber, accounts]);
  
  // Format currency amount
  const formatCurrency = (amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('en-SG', { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': 
      case 'Active': return 'success';
      case 'PENDING_APPROVAL': 
      case 'PendingApproval': return 'warning';
      case 'FROZEN': 
      case 'Frozen': return 'error';
      case 'DORMANT': 
      case 'Dormant': return 'info';
      case 'CLOSED': 
      case 'Closed': return 'default';
      default: return 'default';
    }
  };
  
  if (isLoading) {
    return (
      <SummaryBox>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading account information...</Typography>
        </Box>
      </SummaryBox>
    );
  }
  
  if (error) {
    return (
      <SummaryBox>
        <Alert severity="error">{error}</Alert>
      </SummaryBox>
    );
  }
  
  if (accounts.length === 0) {
    return (
      <SummaryBox>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h6">Financial Accounts</Typography>
        </Box>
        <Typography color="textSecondary">
          No financial accounts found for this customer. To create accounts, use the Accounts tab.
        </Typography>
      </SummaryBox>
    );
  }
  
  // Calculate total balance by currency
  const balancesByCurrency: Record<string, number> = {};
  accounts.forEach(account => {
    // Convert to string for comparison or check for a specific status that represents "closed"
    const status = String(account.status).toUpperCase();
    if (status !== 'CLOSED') {
      const currKey = account.currency || 'USD';
      balancesByCurrency[currKey] = (balancesByCurrency[currKey] || 0) + (account.balance || 0);
    }
  });
  
  return (
    <SummaryBox>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h6">Financial Accounts Summary</Typography>
          
          {/* Document status indicator for the customer */}
          {documentStatus['customer'] && (
            <Tooltip title="Click to view missing customer documents">
              <Badge 
                color="warning" 
                badgeContent={missingDocuments.length > 0 ? missingDocuments.length : "!"}
                sx={{ cursor: 'pointer' }}
                onClick={(e) => handlePopoverOpen(e, 'customer')}
              >
                <FolderIcon color="action" />
              </Badge>
            </Tooltip>
          )}
        </Box>
        <Box>
          <Chip 
            label={`${accounts.length} Account${accounts.length > 1 ? 's' : ''}`} 
            color="primary" 
            size="small"
            icon={<CreditCardIcon />} 
          />
        </Box>
      </Box>
      
      {/* Account balances summary */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {Object.entries(balancesByCurrency).map(([currency, balance]) => (
          <Box 
            key={currency}
            sx={{ 
              bgcolor: 'background.default',
              p: 2,
              borderRadius: 1,
              minWidth: 150,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Total {currency}
            </Typography>
            <CurrencyAmount color="primary" variant="h6">
              {formatCurrency(balance, currency as CurrencyCode)}
            </CurrencyAmount>
          </Box>
        ))}
      </Box>
      
      {/* Recent accounts table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Account Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Documents</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.slice(0, 3).map((account) => (
              <AccountRow key={account.accountNumber}>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.currency}</TableCell>
                <TableCell>
                  <CurrencyAmount>
                    {formatCurrency(account.balance || 0, account.currency as CurrencyCode)}
                  </CurrencyAmount>
                </TableCell>
                <TableCell>
                  <Chip
                    label={account.status}
                    size="small"
                    color={getStatusColor(account.status || '')}
                  />
                </TableCell>
                <TableCell>
                  {loadingDocStatus ? (
                    <CircularProgress size={16} />
                  ) : documentStatus['customer'] ? (
                    <Tooltip title="Click to view missing documents">
                      <Chip
                        icon={<WarningIcon />}
                        label="Missing"
                        size="small"
                        color="warning"
                        onClick={(e) => handlePopoverOpen(e, 'account')}
                        style={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="All document requirements met">
                      <Chip 
                        label="Complete" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </TableCell>
              </AccountRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {accounts.length > 3 && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'right' }}>
          {accounts.length - 3} more account(s) not shown. View all in the Accounts tab.
        </Typography>
      )}
      
      {/* Popover for missing documents */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 350 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {popoverType === 'customer' ? (
              <FolderIcon fontSize="small" color="warning" />
            ) : (
              <DescriptionIcon fontSize="small" color="warning" />
            )}
            {popoverTitle}
          </Typography>
          
          {missingDocuments.length > 0 ? (
            <List dense>
              {missingDocuments.map((doc, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={doc}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      style: { fontWeight: 500 } 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No specific document information available.
            </Typography>
          )}

          {popoverType === 'customer' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="primary">
                These documents are required at the customer level and must be provided to proceed with account operations.
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </SummaryBox>
  );
};

export default AccountSummary;