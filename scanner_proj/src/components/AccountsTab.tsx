import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Card,
  CardContent,
  Alert,
  styled,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  DoNotDisturb as DoNotDisturbIcon,
} from '@mui/icons-material';

// Import ApiService instead of mock services
import { ApiService } from '@/services/ApiService';
import { AccountDTO } from '@/types/account';
import { AccountType, AccountStatus, CurrencyCode, accountTypeDetails } from '@/types/accountTypes';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
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

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  '& .MuiChip-icon': {
    marginLeft: theme.spacing(0.5),
  }
}));

const DetailItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0
  }
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}));

const DetailValue = styled(Typography)(({  }) => ({
  fontSize: '0.875rem',
  fontWeight: 400
}));

const CurrencyAmount = styled(Typography)(({  }) => ({
  fontFamily: 'monospace',
  fontWeight: 600
}));

interface AccountsTabProps {
  customerBasicNumber: string;
}

const AccountsTab: React.FC<AccountsTabProps> = ({ customerBasicNumber }) => {
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountDTO | null>(null);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [isAccountDetailsDialogOpen, setIsAccountDetailsDialogOpen] = useState(false);
  
  // New account form state
  const [newAccountForm, setNewAccountForm] = useState({
    accountName: '',
    accountType: 'SavingsAccount' as AccountType,
    currency: 'SGD' as CurrencyCode,
    isJoint: false,
    jointHolders: [] as string[]
  });

  // Fetch accounts from the backend API
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!customerBasicNumber) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching accounts for customer: ${customerBasicNumber}`);
        const accountData = await ApiService.getAccountsByCustomerNumber(customerBasicNumber);
        console.log('Accounts received:', accountData);
        setAccounts(accountData);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, [customerBasicNumber]);
  
  // Status color mapping
  const getStatusColor = (status: AccountStatus) => {
    switch(status) {
      case 'Active': return 'success';
      case 'PendingApproval': return 'warning';
      case 'Frozen': return 'error';
      case 'Dormant': return 'info';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };
  
  // Status icon mapping for Chip components - ensuring we return a ReactElement or undefined
  const getStatusIconForChip = (status: AccountStatus): React.ReactElement | undefined => {
    switch(status) {
      case 'Active': return <CheckCircleIcon />;
      case 'PendingApproval': return <HourglassEmptyIcon />;
      case 'Frozen': return <BlockIcon />;
      case 'Dormant': return <WarningIcon />;
      case 'Closed': return <DoNotDisturbIcon />;
      default: return undefined;
    }
  };
  
  // Handler for form changes
  const handleFormChange = (field: string, value: unknown) => {
    setNewAccountForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Format currency amount
  const formatCurrency = (amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('en-SG', { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
  // Handle account creation with API
  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      // Create account using API
      const createData = {
        accountName: newAccountForm.accountName,
        accountType: newAccountForm.accountType,
        currency: newAccountForm.currency,
        customerBasicNumber: customerBasicNumber,
        isJoint: newAccountForm.isJoint
      };
      
      console.log('Creating account with data:', createData);
      await ApiService.createAccount(createData);
      
      // Refresh the accounts list
      const updatedAccounts = await ApiService.getAccountsByCustomerNumber(customerBasicNumber);
      setAccounts(updatedAccounts);
      
      // Reset form and close dialog
      setNewAccountForm({
        accountName: '',
        accountType: 'SavingsAccount',
        currency: 'SGD',
        isJoint: false,
        jointHolders: []
      });
      setIsNewAccountDialogOpen(false);
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle viewing account details
  const handleViewAccountDetails = (account: AccountDTO) => {
    setSelectedAccount(account);
    setIsAccountDetailsDialogOpen(true);
  };
  
  // Render loading state
  if (loading && accounts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading account information...</Typography>
      </Box>
    );
  }
  
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Customer Accounts
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsNewAccountDialogOpen(true)}
            disabled={loading}
          >
            New Account
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {accounts.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setIsNewAccountDialogOpen(true)}
                disabled={loading}
              >
                Create Now
              </Button>
            }
          >
            This customer doesnt have any accounts yet.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {accounts.map((account) => (
              <Grid item xs={12} md={6} key={account.accountNumber}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {account.accountType} Account
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {account.accountNumber}
                        </Typography>
                      </Box>
                      <StatusChip
                        icon={getStatusIconForChip(account.status as AccountStatus)}
                        label={account.status}
                        color={getStatusColor(account.status as AccountStatus)}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {account.accountType}
                        </Typography>
                      </Box>
                      <CurrencyAmount variant="h6">
                        {formatCurrency(account.balance || 0, account.currency as CurrencyCode)}
                      </CurrencyAmount>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Opened: {account.openingDate || 'N/A'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleViewAccountDetails(account)}
                        disabled={loading}
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* New Account Dialog */}
      <Dialog 
        open={isNewAccountDialogOpen} 
        onClose={() => setIsNewAccountDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Account Name"
                  fullWidth
                  value={newAccountForm.accountName}
                  onChange={(e) => handleFormChange('accountName', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={newAccountForm.accountType}
                    onChange={(e) => handleFormChange('accountType', e.target.value)}
                    label="Account Type"
                  >
                    {Object.keys(accountTypeDetails).map((type) => (
                      <MenuItem key={type} value={type}>
                        {accountTypeDetails[type as AccountType].name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={newAccountForm.currency}
                    onChange={(e) => handleFormChange('currency', e.target.value)}
                    label="Currency"
                  >
                    {accountTypeDetails[newAccountForm.accountType].currenciesSupported.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Account Requirements:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {accountTypeDetails[newAccountForm.accountType].documentRequirements.map((req, index) => (
                      <li key={index}>
                        <Typography variant="body2">
                          {req.documentName} {req.isRequired && <strong>(Required)</strong>}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewAccountDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAccount} 
            variant="contained" 
            color="primary"
            disabled={!newAccountForm.accountName || loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Account Details Dialog */}
      {selectedAccount && (
        <Dialog 
          open={isAccountDetailsDialogOpen} 
          onClose={() => setIsAccountDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Account Details: {selectedAccount.accountNumber}
              <StatusChip
                icon={getStatusIconForChip(selectedAccount.status as AccountStatus)}
                label={selectedAccount.status}
                color={getStatusColor(selectedAccount.status as AccountStatus)}
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                    Account Information
                  </Typography>

                  <DetailItem>
                    <DetailLabel>Account Manager</DetailLabel>
                    <DetailValue>
                      {selectedAccount.accountManager || 'Not Assigned'}
                      </DetailValue>
                      </DetailItem>
                  
                  <DetailItem>
                    <DetailLabel>Account Number</DetailLabel>
                    <DetailValue>{selectedAccount.accountNumber}</DetailValue>
                  </DetailItem>
                  
                  
                  <DetailItem>
                    <DetailLabel>Account Type</DetailLabel>
                    <DetailValue>{selectedAccount.accountType}</DetailValue>
                  </DetailItem>
                  
                  <DetailItem>
                    <DetailLabel>Currency</DetailLabel>
                    <DetailValue>{selectedAccount.currency}</DetailValue>
                  </DetailItem>
                  
                  <DetailItem>
                    <DetailLabel>Opening Date</DetailLabel>
                    <DetailValue>{selectedAccount.openingDate || 'N/A'}</DetailValue>
                  </DetailItem>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                    Balance Information
                  </Typography>
                  
                  <DetailItem>
                    <DetailLabel>Current Balance</DetailLabel>
                    <CurrencyAmount variant="h5" color="primary">
                      {formatCurrency(selectedAccount.balance || 0, selectedAccount.currency as CurrencyCode)}
                    </CurrencyAmount>
                  </DetailItem>
                  
                  <DetailItem>
                    <DetailLabel>Available Balance</DetailLabel>
                    <CurrencyAmount variant="h6">
                      {formatCurrency(selectedAccount.availableBalance || selectedAccount.balance || 0, 
                                     selectedAccount.currency as CurrencyCode)}
                    </CurrencyAmount>
                  </DetailItem>

                 
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAccountDetailsDialogOpen(false)} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default AccountsTab;