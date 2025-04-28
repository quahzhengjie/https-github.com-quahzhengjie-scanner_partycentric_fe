import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  styled,
  Stepper,
  Step,
  StepLabel,
  Divider,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Alert,
  SelectChangeEvent,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab
} from "@mui/material";
import {
  ArrowBackIosRounded,
  Person as PersonIcon,
  ContactMail as ContactMailIcon,
  AccountBalance as CorporateIcon,
  ReportProblem as RiskIcon,
  Autorenew as LifecycleIcon
} from "@mui/icons-material";
import Header from "@/components/Header";
import { Customer, CustomerType } from "@/types/customer";
import { DocumentRequirementsService } from "@/services/documentRequirementsService";
import { CustomerApiService } from "@/services/CustomerApiService";

// Define types for our dropdown options
interface OptionType {
  value: string;
  label: string;
}

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.text.secondary,
    borderRadius: theme.shape.borderRadius,
    "& input, & textarea": {
      color: "#000000",
      padding: "12px 14px",
    },
    "& fieldset": {
      borderColor: theme.palette.grey[300],
      transition: "0.3s all",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  },
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  "&:after": {
    content: '""',
    position: "absolute",
    left: 0,
    bottom: 0,
    height: "3px",
    width: "40px",
    backgroundColor: theme.palette.primary.main,
  },
}));

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customerTypeTab, setCustomerTypeTab] = useState<'individual' | 'corporate'>('individual');
  const [customerData, setCustomerData] = useState<Partial<Customer>>({
    basicNumber: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    passport: "",
    customerType: "Individual" as CustomerType,
    registrationCountry: "Singapore",
    isPEP: false,
    riskRating: "Low",
    lifecycleStatus: "Prospective", // Start as prospective by default
  });

  // State for dropdown options loaded from API
  const [lifecycleStatusOptions, setLifecycleStatusOptions] = useState<OptionType[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Define steps based on customer type
  const individualSteps = ["Personal Information", "Contact Details", "Risk Profile", "Lifecycle Status"];
  const corporateSteps = ["Company Information", "Contact Details", "Risk & Compliance", "Lifecycle Status"];
  
  // Get active steps based on customer type
  const steps = customerTypeTab === 'individual' ? individualSteps : corporateSteps;

  // Customer type options filtered by the selected tab
  const customerTypeOptions: OptionType[] = DocumentRequirementsService.getCustomerTypeOptions().filter(option => {
    if (customerTypeTab === 'individual') {
      return option.value === "Individual";
    } else {
      return option.value !== "Individual";
    }
  });
  
  // Country options - simplified list for demo
  const countryOptions: OptionType[] = [
    { value: "Singapore", label: "Singapore" },
    { value: "Malaysia", label: "Malaysia" },
    { value: "Hong Kong", label: "Hong Kong" },
    { value: "British Virgin Islands", label: "British Virgin Islands" },
    { value: "Cayman Islands", label: "Cayman Islands" },
    { value: "Panama", label: "Panama" },
    { value: "Isle of Man", label: "Isle of Man" },
    { value: "Jersey", label: "Jersey" },
    { value: "Guernsey", label: "Guernsey" }
  ];
  
  // Risk rating options
  const riskRatingOptions: OptionType[] = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Extreme", label: "Extreme" }
  ];

  // Handle customer type tab change
  const handleCustomerTypeTabChange = (_event: React.SyntheticEvent, newValue: 'individual' | 'corporate') => {
    setCustomerTypeTab(newValue);
    
    // Reset activeStep when changing tabs
    setActiveStep(0);
    
    // Update customer type based on selected tab
    if (newValue === 'individual') {
      setCustomerData(prev => ({
        ...prev,
        customerType: "Individual",
        // Clear corporate-specific fields
        incorporationNumber: "",
        ubos: []
      }));
    } else {
      setCustomerData(prev => ({
        ...prev,
        customerType: "PrivateLimited", // Default corporate type
        // Clear individual-specific fields
        passport: ""
      }));
    }
  };

  // Fetch lifecycle status options from API on component mount
  useEffect(() => {
    const fetchLifecycleOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const options = await CustomerApiService.getLifecycleStatusOptions();
        setLifecycleStatusOptions(options);
      } catch (err) {
        console.error("Failed to load lifecycle options:", err);
        
        // Fallback to static options if API fails
        setLifecycleStatusOptions([
          { value: "Prospective", label: "Prospective" },
          { value: "Onboarding", label: "Onboarding" },
          { value: "Active", label: "Active" },
          { value: "Dormant", label: "Dormant" },
          { value: "Suspended", label: "Suspended" },
          { value: "Closed", label: "Closed" },
          { value: "Rejected", label: "Rejected" }
        ]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchLifecycleOptions();
  }, []);

  // Check if a country is high risk
  const isHighRiskCountry = (country: string): boolean => {
    return DocumentRequirementsService.isHighRiskJurisdiction(country);
  };

  // Handle form field changes
  const handleChange = (field: keyof Customer) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ): void => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof Customer) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validate form based on customer type
    let isValid = true;
    let errorMessage = "";
    
    // Common validations for all customer types
    if (!customerData.name || !customerData.email || !customerData.phoneNumber || 
        !customerData.address || !customerData.customerType || !customerData.lifecycleStatus) {
      isValid = false;
      errorMessage = "Please fill in all required fields";
    }
    
    // Type-specific validations
    if (customerData.customerType === "Individual" && !customerData.passport) {
      isValid = false;
      errorMessage = "Passport number is required for individual customers";
    }
    
    if (["PrivateLimited", "PublicLimited", "OffshoreCompany", 
         "RegulatedEntity", "CryptoBusiness"].includes(customerData.customerType as string) && 
         !customerData.incorporationNumber) {
      isValid = false;
      errorMessage = "Incorporation number is required for business entities";
    }
    
    if (!isValid) {
      setError(errorMessage);
      return;
    }
    
    setLoading(true);
    
    try {
      // Make API call to create customer
      const newCustomer = await CustomerApiService.addCustomer(customerData as Omit<Customer, 'basicNumber'>);
      
      setSuccess(true);
      
      // Redirect to customer details page after a short delay
      setTimeout(() => {
        router.push(`/customer/${newCustomer.basicNumber}`);
      }, 1500);
    } catch (err) {
      // Type guard to check if it's an Axios error
      if (axios.isAxiosError(err)) {
        // Access the error message from the response data
        setError(err.response?.data?.message || "An error occurred while creating the customer. Please try again.");
      } else {
        // For non-Axios errors
        setError("An error occurred while creating the customer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step validation logic
  const isStepComplete = (step: number): boolean => {
    if (customerTypeTab === 'individual') {
      // Individual customer validation
      switch (step) {
        case 0: // Personal Information
          return !!customerData.name && !!customerData.passport;
        case 1: // Contact Details
          return !!customerData.email && !!customerData.phoneNumber && !!customerData.address;
        case 2: // Risk Profile
          return !!customerData.riskRating && !!customerData.registrationCountry;
        case 3: // Lifecycle Status
          return !!customerData.lifecycleStatus;
        default:
          return false;
      }
    } else {
      // Corporate customer validation
      switch (step) {
        case 0: // Company Information
          return !!customerData.name && !!customerData.incorporationNumber && !!customerData.customerType;
        case 1: // Contact Details
          return !!customerData.email && !!customerData.phoneNumber && !!customerData.address;
        case 2: // Risk & Compliance
          return !!customerData.riskRating && !!customerData.registrationCountry;
        case 3: // Lifecycle Status
          return !!customerData.lifecycleStatus;
        default:
          return false;
      }
    }
  };

  const goToStep = (step: number): void => {
    if (step <= activeStep || isStepComplete(step - 1)) {
      setActiveStep(step);
    }
  };

  const nextStep = (): void => {
    if (activeStep < steps.length - 1 && isStepComplete(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = (): void => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Show risk warning for high-risk countries
  const showRiskWarning = customerData.registrationCountry && 
    isHighRiskCountry(customerData.registrationCountry);

  const renderStepContent = () => {
    if (customerTypeTab === 'individual') {
      // Individual customer onboarding steps
      switch (activeStep) {
        case 0: // Personal Information
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon color="primary" />
                  Personal Information
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Full Name*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter full name"
                    size="small"
                    value={customerData.name || ""}
                    onChange={handleChange("name")}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Passport Number*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter passport number"
                    size="small"
                    value={customerData.passport || ""}
                    onChange={handleChange("passport")}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date of Birth
                  </Typography>
                  <StyledTextField
                    fullWidth
                    type="date"
                    size="small"
                    value={customerData.dateOfBirth || ""}
                    onChange={handleChange("dateOfBirth")}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Nationality
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.nationality || ""}
                      onChange={handleChange("nationality")}
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {countryOptions.map((option: OptionType) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          );
        case 1: // Contact Details
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ContactMailIcon color="primary" />
                  Contact Details
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email Address*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter email address"
                    size="small"
                    type="email"
                    value={customerData.email || ""}
                    onChange={handleChange("email")}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone Number*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter phone number"
                    size="small"
                    value={customerData.phoneNumber || ""}
                    onChange={handleChange("phoneNumber")}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter full address"
                    size="small"
                    multiline
                    rows={2}
                    value={customerData.address || ""}
                    onChange={handleChange("address")}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          );
        case 2: // Risk Profile
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RiskIcon color="primary" />
                  Risk Profile
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Country of Residence*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.registrationCountry || "Singapore"}
                      onChange={handleChange("registrationCountry")}
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {countryOptions.map((option: OptionType) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the country of residence</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Risk Rating*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.riskRating || "Low"}
                      onChange={handleChange("riskRating")}
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {riskRatingOptions.map((option: OptionType) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Assess the customer risk level</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={customerData.isPEP || false}
                        onChange={handleCheckboxChange("isPEP")}
                        color="primary"
                      />
                    }
                    label="Politically Exposed Person (PEP)"
                  />
                  <FormHelperText>
                    Check if the customer is a political figure or closely related to one
                  </FormHelperText>
                </Grid>
                
                {showRiskWarning && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<RiskIcon />} sx={{ mt: 2 }}>
                      This jurisdiction is considered high-risk. Enhanced Due Diligence will be required.
                    </Alert>
                  </Grid>
                )}
                
                {(customerData.isPEP || customerData.riskRating === "High" || customerData.riskRating === "Extreme") && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<RiskIcon />} sx={{ mt: 2 }}>
                      Enhanced Due Diligence will be required for this customer.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        case 3: // Lifecycle Status
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LifecycleIcon color="primary" />
                  Lifecycle Status
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Current Lifecycle Status*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.lifecycleStatus || "Prospective"}
                      onChange={handleChange("lifecycleStatus")}
                      size="small"
                      disabled={isLoadingOptions}
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {isLoadingOptions ? (
                        <MenuItem value="">Loading options...</MenuItem>
                      ) : (
                        lifecycleStatusOptions.map((option: OptionType) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>Select the customer current lifecycle status</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Relationship Manager
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter relationship manager's name"
                    size="small"
                    value={customerData.relationshipManager || ""}
                    onChange={handleChange("relationshipManager")}
                  />
                  <FormHelperText>Person responsible for managing this customer relationship</FormHelperText>
                </Grid>
                
                {customerData.lifecycleStatus === "Rejected" && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Rejected customers will not proceed to document collection. Make sure to provide rejection reasons in notes.
                    </Alert>
                  </Grid>
                )}
                
                {customerData.lifecycleStatus === "Prospective" && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Prospective customers are in initial contact phase. Their information will be saved but they will not be fully onboarded yet.
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Next Steps</Typography>
                    <Typography variant="body2">
                      After creating the customer profile, you will be redirected to the customer details page where you can:
                    </Typography>
                    <ul>
                      <li>Upload customer identification documents (Passport, Proof of Address, etc.)</li>
                      <li>Create accounts for this customer</li>
                      <li>Update customer information</li>
                    </ul>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          );
        default:
          return null;
      }
    } else {
      // Corporate customer onboarding steps
      switch (activeStep) {
        case 0: // Company Information
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CorporateIcon color="primary" />
                  Company Information
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Company Type*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.customerType || "PrivateLimited"}
                      onChange={handleChange("customerType")}
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {customerTypeOptions.map((option: OptionType) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the type of company</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Company Name*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter company name"
                    size="small"
                    value={customerData.name || ""}
                    onChange={handleChange("name")}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Incorporation Number*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter incorporation number"
                    size="small"
                    value={customerData.incorporationNumber || ""}
                    onChange={handleChange("incorporationNumber")}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Country of Registration*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.registrationCountry || "Singapore"}
                      onChange={handleChange("registrationCountry")}
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {countryOptions.map((option: OptionType) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the country of registration</FormHelperText>
                  </FormControl>
                </Grid>
                
                {showRiskWarning && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<RiskIcon />} sx={{ mt: 2 }}>
                      This jurisdiction is considered high-risk. Enhanced Due Diligence will be required.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        case 1: // Contact Details
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ContactMailIcon color="primary" />
                  Contact Details
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Business Email*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter business email address"
                    size="small"
                    type="email"
                    value={customerData.email || ""}
                    onChange={handleChange("email")}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Business Phone*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter business phone number"
                    size="small"
                    value={customerData.phoneNumber || ""}
                    onChange={handleChange("phoneNumber")}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Registered Address*
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter registered company address"
                    size="small"
                    multiline
                    rows={2}
                    value={customerData.address || ""}
                    onChange={handleChange("address")}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Primary Contact Person
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter name of primary contact person"
                    size="small"
                    value={customerData.primaryContact || ""}
                    onChange={handleChange("primaryContact")}
                  />
                </Grid>
              </Grid>
            </Box>
          );
        case 2: // Risk & Compliance
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RiskIcon color="primary" />
                  Risk & Compliance
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Risk Rating*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.riskRating || "Low"}
                      onChange={handleChange("riskRating")}
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {riskRatingOptions.map((option: OptionType) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Assess the company risk level</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={customerData.isPEP || false}
                        onChange={handleCheckboxChange("isPEP")}
                        color="primary"
                      />
                    }
                    label="Any PEP in ownership/management"
                  />
                  <FormHelperText>
                    Check if any directors or beneficial owners are political figures
                  </FormHelperText>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Business Nature/Industry
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter nature of business or industry"
                    size="small"
                    value={customerData.businessNature || ""}
                    onChange={handleChange("businessNature")}
                  />
                </Grid>
                
                {(customerData.isPEP || customerData.riskRating === "High" || customerData.riskRating === "Extreme") && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<RiskIcon />} sx={{ mt: 2 }}>
                      Enhanced Due Diligence will be required for this business entity.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        case 3: // Lifecycle Status
          return (
            <Box>
              <SectionTitle variant="h6">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LifecycleIcon color="primary" />
                  Lifecycle Status
                </Box>
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Current Lifecycle Status*
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={customerData.lifecycleStatus || "Prospective"}
                      onChange={handleChange("lifecycleStatus")}
                      size="small"
                      disabled={isLoadingOptions}
                      sx={{
                        backgroundColor: "white",
                        "& .MuiSelect-select": {
                          color: "#000000",
                          padding: "12px 14px",
                        },
                      }}
                    >
                      {isLoadingOptions ? (
                        <MenuItem value="">Loading options...</MenuItem>
                      ) : (
                        lifecycleStatusOptions.map((option: OptionType) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>Select the companys current lifecycle status</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Relationship Manager
                  </Typography>
                  <StyledTextField
                    fullWidth
                    placeholder="Enter relationship manager's name"
                    size="small"
                    value={customerData.relationshipManager || ""}
                    onChange={handleChange("relationshipManager")}
                  />
                  <FormHelperText>Person responsible for managing this business relationship</FormHelperText>
                </Grid>
                
                {customerData.lifecycleStatus === "Rejected" && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Rejected customers will not proceed to document collection. Make sure to provide rejection reasons in notes.
                    </Alert>
                  </Grid>
                )}
                
                {customerData.lifecycleStatus === "Prospective" && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Prospective companies are in initial contact phase. Their information will be saved but they will not be fully onboarded yet.
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Next Steps</Typography>
                    <Typography variant="body2">
                      After creating the company profile, you will be redirected to the customer details page where you can:
                    </Typography>
                    <ul>
                      <li>Upload company documentation (Certificate of Incorporation, Business Registration, etc.)</li>
                      <li>Add information about directors and beneficial owners</li>
                      <li>Create business accounts for this company</li>
                      <li>Update company information</li>
                    </ul>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-darkBackground text-darkText">
      <Header />
      <Container maxWidth="lg" className="py-8">
        <Box>
          <Box className="mb-6">
            <Box className="flex items-center gap-4 mb-4">
              <Button
                variant="outlined"
                color="info"
                startIcon={<ArrowBackIosRounded fontSize="inherit" />}
                onClick={() => router.push("/")}
              >
                Back to home
              </Button>
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
              Customer Onboarding
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Please fill in the customer information according to their type and risk profile.
            </Typography>

            {/* Customer type tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={customerTypeTab}
                onChange={(e, value) => handleCustomerTypeTabChange(e, value)}
                aria-label="customer type tabs"
              >
                <Tab 
                  icon={<PersonIcon />} 
                  iconPosition="start" 
                  label="Individual" 
                  value="individual" 
                />
                <Tab 
                  icon={<CorporateIcon />} 
                  iconPosition="start" 
                  label="Corporate" 
                  value="corporate" 
                />
              </Tabs>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <FormContainer elevation={3}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label} completed={isStepComplete(index)}>
                    <StepLabel
                      onClick={() => goToStep(index)}
                      sx={{
                        cursor:
                          index <= activeStep || isStepComplete(index - 1)
                            ? "pointer"
                            : "default",
                        "&:hover": {
                          opacity:
                            index <= activeStep || isStepComplete(index - 1)
                              ? 0.7
                              : 1,
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ mb: 4 }} />

              {renderStepContent()}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 4,
                  pt: 2,
                  borderTop: "1px solid #eee",
                }}
              >
                <Button variant="outlined" onClick={prevStep} disabled={activeStep === 0 || loading}>
                  Previous
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button 
                    variant="contained"
                    onClick={nextStep}
                    disabled={!isStepComplete(activeStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!isStepComplete(0) || !isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3) || loading}
                    onClick={handleSubmit}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                  >
                    {loading ? "Creating Customer..." : "Create Customer"}
                  </Button>
                )}
              </Box>
            </FormContainer>
          </form>
        </Box>
      </Container>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Customer created successfully! Redirecting to details page...
        </Alert>
      </Snackbar>
    </div>
  );
};

export default OnboardingPage;