/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TextField,
  Box,
  LinearProgress,
  TableHead,
  TableBody,
  Checkbox,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Snackbar,
  CircularProgress
} from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  CloudUpload,
  Download,
  Delete,
  Visibility,
  ArrowBack,
  ArrowForward,
  PictureAsPdf as PictureAsPdfIcon,
  Close as CloseIcon,
  Scanner as ScannerIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios"; // Import axios for error type checking
import { CustomerDocumentApiService } from "../services/CustomerDocumentApiService";
import { DocumentCategory, DOCUMENT_STATUS, DOCUMENT_CATEGORIES } from "../types/customerDocument";
import CustomerApiService from "@/services/CustomerApiService";
import ApiService from "@/services/ApiService";

// API base URL - configurable via environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Helper function to convert byte array to data URL
function convertByteArrayToDataUrl(
  byteArray: string | number[] | Uint8Array | undefined, 
  contentType: string
): string {
  if (!byteArray) return '';
  
  try {
    // Handle different types of byte array representations
    let base64String = '';
    
    if (Array.isArray(byteArray)) {
      // Convert numeric array to binary string
      let binary = '';
      const bytes = new Uint8Array(byteArray);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64String = window.btoa(binary);
    } else if (typeof byteArray === 'string') {
      // If it's already a string, check if it's a data URL
      if (byteArray.startsWith('data:')) {
        return byteArray;
      }
      // Otherwise assume it's already base64
      base64String = byteArray;
    } else if (byteArray instanceof Uint8Array) {
      // Handle Uint8Array directly
      let binary = '';
      for (let i = 0; i < byteArray.byteLength; i++) {
        binary += String.fromCharCode(byteArray[i]);
      }
      base64String = window.btoa(binary);
    } else {
      console.warn('Unknown file content format:', byteArray);
      return '';
    }
    
    return `data:${contentType || 'application/octet-stream'};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting byte array to data URL:', error);
    return '';
  }
}

// ----- Data Type -----
type DocumentType = {
  id?: number;
  filename: string;
  uploadedFile: string | null;
  uploadedName: string;
  expiryDate: string;
  status: "Pending" | "Uploaded" | string;
  category: DocumentCategory;
  contentType?: string;
};

// Add props interface with parameters
interface DocumentUploaderProps {
  basicNumber?: string;
  accountNumber?: string;
  onClose?: () => void;
  mode?: 'full' | 'single';
  initialDocument?: string;
  initialCategory?: string;
  customerName?: string;
}

// ----- Theme and Styled Components -----
const brandTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
});

const StyledContainer = styled(Container)({
  backgroundColor: "#2D2D2D",
  minHeight: "100vh",
  paddingTop: "20px",
  color: "#FFFFFF",
  display: "flex",
  gap: "20px",
});

const StyledPaper = styled(Paper)({
  padding: "20px",
  backgroundColor: "#2D2D2D",
  borderRadius: "8px",
  color: "#FFFFFF",
  flex: 2,
  boxShadow: "none",
});

const PreviewPaper = styled(Paper)({
  padding: "20px",
  backgroundColor: "#2D2D2D",
  borderRadius: "8px",
  textAlign: "center",
  minWidth: "300px",
  maxWidth: "400px",
  flex: 1,
  boxShadow: "none",
});

const DarkTableHead = styled(TableHead)({
  backgroundColor: "#2D2D2D",
});
const DarkTableBody = styled(TableBody)({
  backgroundColor: "#2D2D2D",
});
const HeaderCell = styled(TableCell)({
  color: "#FFFFFF",
  borderBottom: "1px solid #555",
  fontWeight: "bold",
});
const BodyCell = styled(TableCell)({
  color: "#FFFFFF",
  borderBottom: "1px solid #555",
});
const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#555",
    "& input": { color: "#FFFFFF" },
    "& fieldset": { borderColor: "#777" },
    "&:hover fieldset": { borderColor: "#BBB" },
    "&.Mui-focused fieldset": { borderColor: "#FFF" },
  },
});

const StyledTab = styled(Tab)({
  color: "#CCCCCC",
  "&.Mui-selected": {
    color: "#FFFFFF",
  },
});

// ----- SummaryBar Component -----
type SummaryBarProps = {
  uploadedCount: number;
  totalCount: number;
  uploadProgress: number;
  outstandingDocs: DocumentType[];
  onDownloadAll: () => void;
  onDownloadSelected: () => void;
  onRefresh: () => void;
  isLoading: boolean;
};

const SummaryBar: React.FC<SummaryBarProps> = ({
  uploadedCount,
  totalCount,
  uploadProgress,
  outstandingDocs,
  onDownloadAll,
  onDownloadSelected,
  onRefresh,
  isLoading
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography variant="subtitle1" sx={{ whiteSpace: "nowrap" }}>
        Uploaded {uploadedCount} of {totalCount} documents
      </Typography>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{
            height: 8,
            borderRadius: 2,
            backgroundColor: "#333",
            "& .MuiLinearProgress-bar": { backgroundColor: "#1976d2" },
          }}
        />
      </Box>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={onDownloadAll}
        disabled={uploadedCount === 0 || isLoading}
        size="small"
      >
        Download All
      </Button>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={onDownloadSelected}
        disabled={isLoading}
        size="small"
      >
        Download Selected
      </Button>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={isLoading}
        size="small"
      >
        Refresh
      </Button>
    </Box>
    {outstandingDocs.length > 0 && (
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Outstanding Documents to Upload:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          {outstandingDocs.map((doc, i) => (
            <li key={i}>{doc.filename}</li>
          ))}
        </ul>
      </Box>
    )}
  </Box>
);

// ----- DocumentTable Component -----
type DocumentTableProps = {
  documents: DocumentType[];
  selectedIndices: number[];
  onRowSelect: (index: number) => void;
  onSelectAll: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onExpiryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onPreview: (index: number) => void;
  onDelete: (index: number) => void;
  onFileDownload: (index: number) => void;
  onScan: (index: number) => void;
  isLoading: boolean;
};

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedIndices,
  onRowSelect,
  onSelectAll,
  onFileUpload,
  onExpiryChange,
  onPreview,
  onDelete,
  onFileDownload,
  onScan,
  isLoading
}) => {
  const allSelected = selectedIndices.length === documents.length;
  const someSelected = selectedIndices.length > 0 && selectedIndices.length < documents.length;

  return (
    <TableContainer>
      <Table aria-label="document table">
        <DarkTableHead>
          <TableRow>
            <HeaderCell>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onSelectAll}
                size="small"
                disabled={isLoading}
              />
            </HeaderCell>
            <HeaderCell>Preview</HeaderCell>
            <HeaderCell>Document</HeaderCell>
            <HeaderCell>File Name</HeaderCell>
            <HeaderCell>Expiry Date</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Actions</HeaderCell>
          </TableRow>
        </DarkTableHead>
        <DarkTableBody>
          {documents.map((doc, index) => {
            const isSelected = selectedIndices.includes(index);
            const isUploaded = doc.status === "Uploaded" || doc.status === DOCUMENT_STATUS.UPLOADED;
            
            return (
              <TableRow key={index}>
                <BodyCell>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onRowSelect(index)}
                    size="small"
                    disabled={isLoading}
                  />
                </BodyCell>
                <BodyCell>
                  {doc.uploadedFile ? (
                    doc.contentType?.includes("application/pdf") || doc.uploadedFile.startsWith("data:application/pdf") ? (
                      <PictureAsPdfIcon sx={{ fontSize: 40 }} />
                    ) : (
                      <img
                        src={doc.uploadedFile}
                        alt={doc.uploadedName}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    )
                  ) : (
                    <Typography variant="body2" color="GrayText">
                      No preview
                    </Typography>
                  )}
                </BodyCell>
                <BodyCell>{doc.filename}</BodyCell>
                <BodyCell>{doc.uploadedName || "No file uploaded"}</BodyCell>
                <BodyCell>
                  <StyledTextField
                    type="date"
                    value={doc.expiryDate}
                    onChange={(e) => onExpiryChange(e, index)}
                    size="small"
                    disabled={isLoading}
                  />
                </BodyCell>
                <BodyCell>
                  <Typography
                    sx={{
                      color: isUploaded ? "#4caf50" : "#ff9800",
                      fontWeight: "bold",
                    }}
                  >
                    {doc.status}
                  </Typography>
                </BodyCell>
                <BodyCell>
                  {!isUploaded && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<ScannerIcon />}
                      onClick={() => onScan(index)}
                      sx={{ mr: 1, mb: 1 }}
                      size="small"
                      disabled={isLoading}
                    >
                      Scan
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{ mr: 1, mb: 1 }}
                    size="small"
                    disabled={isLoading}
                  >
                    Upload
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => onFileUpload(e, index)}
                      hidden
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    disabled={!doc.uploadedFile || isLoading}
                    onClick={() => onPreview(index)}
                    sx={{ mr: 1, mb: 1 }}
                    size="small"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    disabled={!doc.uploadedFile || isLoading}
                    onClick={() => onFileDownload(index)}
                    sx={{ mr: 1, mb: 1 }}
                    size="small"
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    disabled={!doc.uploadedFile || isLoading}
                    onClick={() => onDelete(index)}
                    sx={{ mb: 1 }}
                    size="small"
                  >
                    Delete
                  </Button>
                </BodyCell>
              </TableRow>
            );
          })}
        </DarkTableBody>
      </Table>
    </TableContainer>
  );
};

// ----- DocumentPreview Component -----
type DocumentPreviewProps = {
  document: DocumentType;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFileDownload: () => void;
};

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onNext,
  onPrevious,
  onFileDownload,
}) => (
  <PreviewPaper>
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
      <Button onClick={onClose} size="small">
        <CloseIcon fontSize="small" />
      </Button>
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Button variant="contained" startIcon={<ArrowBack />} onClick={onPrevious} size="small">
        Back
      </Button>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={onFileDownload}
        disabled={!document.uploadedFile}
        size="small"
      >
        Download
      </Button>
      <Button variant="contained" startIcon={<ArrowForward />} onClick={onNext} size="small">
        Next
      </Button>
    </Box>
    <Typography variant="h6" gutterBottom>
      {document.filename}
    </Typography>
    <div style={{ marginBottom: "10px" }}>
      {document.uploadedFile && (document.contentType?.includes("application/pdf") || document.uploadedFile?.startsWith("data:application/pdf")) ? (
        <embed src={document.uploadedFile} type="application/pdf" width="100%" height="400px" />
      ) : (
        <img
          src={document.uploadedFile || ""}
          alt={document.uploadedName}
          style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
        />
      )}
    </div>
  </PreviewPaper>
);

// ----- Main DocumentUploader Component -----
const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  basicNumber,
  accountNumber,
  onClose,
  mode = 'full',
  initialDocument,
  initialCategory,
  customerName
}) => {
  // State for documents
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>("all");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number | null>(null);
  
  // State for operations
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [customerType, setCustomerType] = useState<string>("STANDARD");
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning"
  });

  // Initial document request
  useEffect(() => {
    if (basicNumber) {
      loadCustomerDocuments();
    } else if (initialDocument && initialCategory) {
      // For single document mode
      setDocuments([{
        filename: initialDocument,
        uploadedFile: null,
        uploadedName: "",
        expiryDate: "",
        status: "Pending",
        category: initialCategory as DocumentCategory,
      }]);
    }
  }, [basicNumber, initialDocument, initialCategory]);

  // Define document templates based on customer type
  const getDocumentTemplates = (): DocumentType[] => {
    // Standard documents for all customer types
    const standardDocuments: DocumentType[] = [
      {
        filename: "Passport Copy",
        uploadedFile: null,
        uploadedName: "",
        expiryDate: "",
        status: "Pending",
        category: DOCUMENT_CATEGORIES.IDENTIFICATION,
      },
      {
        filename: "Bank Statement",
        uploadedFile: null,
        uploadedName: "",
        expiryDate: "",
        status: "Pending",
        category: DOCUMENT_CATEGORIES.FINANCIAL,
      },
      {
        filename: "Employment Letter",
        uploadedFile: null,
        uploadedName: "",
        expiryDate: "",
        status: "Pending",
        category: DOCUMENT_CATEGORIES.IDENTIFICATION,
      },
      {
        filename: "Utility Bill",
        uploadedFile: null,
        uploadedName: "",
        expiryDate: "",
        status: "Pending",
        category: DOCUMENT_CATEGORIES.IDENTIFICATION,
      },
    ];
    
    // Additional documents based on customer type
    let additionalDocs: DocumentType[] = [];
    
    switch (customerType) {
      case "CORPORATE":
      case "PrivateLimited": // Added from screenshot
        additionalDocs = [
          {
            filename: "Certificate of Incorporation",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.IDENTIFICATION,
          },
          {
            filename: "Business Registration",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.IDENTIFICATION,
          },
          {
            filename: "Board Resolution",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.AUTHORIZATION,
          },
          {
            filename: "Shareholder Information",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.LEGAL,
          },
          {
            filename: "Director Identification",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.KYC,
          },
          {
            filename: "Signature Specimen",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.SIGNATURE,
          },
        ];
        break;
      case "SME":
        additionalDocs = [
          {
            filename: "Business Plan",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "Tax Registration",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "Business License",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.LEGAL,
          },
          {
            filename: "Proof of Business Address",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.IDENTIFICATION,
          },
          {
            filename: "Financial Statements",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "Signature Specimen",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.SIGNATURE,
          },
        ];
        break;
      case "PREMIUM":
        additionalDocs = [
          {
            filename: "Investment Portfolio",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "Property Deeds",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "Wealth Verification Statement",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "Source of Funds Declaration",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.LEGAL,
          },
          {
            filename: "Investment Agreement",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.LEGAL,
          },
          {
            filename: "Signature Specimen",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.SIGNATURE,
          },
        ];
        break;
      default:
        // For individual customers, add additional standard documents
        additionalDocs = [
          {
            filename: "Proof of Income",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.FINANCIAL,
          },
          {
            filename: "ID Card",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.IDENTIFICATION,
          },
          {
            filename: "Tax Declaration Form",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.IDENTIFICATION, // Changed from OTHER to IDENTIFICATION
          },
          {
            filename: "Address Verification",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.IDENTIFICATION,
          },
          {
            filename: "Reference Letter",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.KYC,
          },
          {
            filename: "Signature Specimen",
            uploadedFile: null,
            uploadedName: "",
            expiryDate: "",
            status: "Pending",
            category: DOCUMENT_CATEGORIES.SIGNATURE,
          },
        ];
    }
    
    // Combine standard and additional documents
    return [...standardDocuments, ...additionalDocs];
  };

  // Load customer documents from API
  const loadCustomerDocuments = async () => {
    if (!basicNumber) return;
    
    setIsLoading(true);
    try {
      // Clear any old notifications
      setNotification(prev => ({
        ...prev,
        open: false
      }));
      
      let missingDocs: string[] = [];
      const targetDocumentCount = 10; // Target document count - typically 10 based on your UI
      
      // First try to get customer details to determine customer type
      try {
        // Get customer details from API
        const customerDetails = await CustomerApiService.getCustomerByBasicNumber(basicNumber);
        
        // Set customer type
        console.log("Customer details received:", customerDetails);
        setCustomerType(customerDetails.customerType || "STANDARD");
        console.log("Customer type set to:", customerDetails.customerType || "STANDARD");
        
        // Check if there are missing documents and get the list
        try {
          const hasOutstanding = await ApiService.hasOutstandingDocuments(basicNumber);
          if (hasOutstanding) {
            // Get list of missing documents
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
            const outstandingUrl = `${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`;
            const response = await axios.get(outstandingUrl);
            missingDocs = response.data || [];
            console.log("Missing documents from API:", missingDocs);
          }
        } catch (docError) {
          console.error("Error checking outstanding documents:", docError);
        }
      } catch (error) {
        console.error("Error fetching customer type:", error);
        // Default to standard if we can't determine type
        setCustomerType("STANDARD");
      }
      
      // Get API documents
      const apiDocuments = await CustomerDocumentApiService.getCustomerDocuments(basicNumber);
      console.log("API documents received:", apiDocuments);
      
      let finalDocuments: DocumentType[] = [];
      
      // Strategy: Use a mix of API documents, missing documents, and template documents up to 10 total
      
      // 1. Start with API documents - these are highest priority as they're already in the system
      if (apiDocuments && apiDocuments.length > 0) {
        // Process and add API documents first
        apiDocuments.forEach(apiDoc => {
          const fileContentAsString = apiDoc.fileContent 
            ? (typeof apiDoc.fileContent === 'string' 
               ? apiDoc.fileContent 
               : convertByteArrayToDataUrl(apiDoc.fileContent, apiDoc.contentType))
            : null;
          
          finalDocuments.push({
            id: apiDoc.id,
            filename: apiDoc.documentName,
            uploadedFile: fileContentAsString,
            uploadedName: apiDoc.documentName,
            expiryDate: apiDoc.expiryDate ? apiDoc.expiryDate.toString() : "",
            status: apiDoc.uploadStatus,
            category: apiDoc.category as DocumentCategory,
            contentType: apiDoc.contentType
          });
        });
      }
      
      // 2. Add any missing documents that aren't already in the API documents
      missingDocs.forEach(missingDoc => {
        // Skip if already in finalDocuments
        if (finalDocuments.some(doc => doc.filename === missingDoc)) {
          return;
        }
        
        // Determine category based on name
        let category: DocumentCategory = DOCUMENT_CATEGORIES.IDENTIFICATION;
        if (missingDoc.includes("Tax") || missingDoc.includes("tax")) {
          category = DOCUMENT_CATEGORIES.IDENTIFICATION;
        } else if (missingDoc.includes("Finance") || missingDoc.includes("Statement") || missingDoc.includes("Bank")) {
          category = DOCUMENT_CATEGORIES.FINANCIAL;
        } else if (missingDoc.includes("Legal") || missingDoc.includes("Contract") || missingDoc.includes("Agreement")) {
          category = DOCUMENT_CATEGORIES.LEGAL;
        } else if (missingDoc.includes("Signature") || missingDoc.includes("Sign")) {
          category = DOCUMENT_CATEGORIES.SIGNATURE;
        } else if (missingDoc.includes("Authorization") || missingDoc.includes("Authorize")) {
          category = DOCUMENT_CATEGORIES.AUTHORIZATION;
        } else if (missingDoc.includes("KYC") || missingDoc.includes("Customer")) {
          category = DOCUMENT_CATEGORIES.KYC;
        }
        
        finalDocuments.push({
          filename: missingDoc,
          uploadedFile: null,
          uploadedName: "",
          expiryDate: "",
          status: "Pending",
          category: category
        });
      });
      
      // 3. Add template documents to reach the target count, but only if we have less than target
      if (finalDocuments.length < targetDocumentCount) {
        // Get document templates based on customer type
        const documentTemplates = getDocumentTemplates();
        
        // Add templates that aren't already in finalDocuments
        for (const template of documentTemplates) {
          // Skip if we've reached the target count
          if (finalDocuments.length >= targetDocumentCount) {
            break;
          }
          
          // Skip if this template is already in finalDocuments
          if (finalDocuments.some(doc => doc.filename === template.filename)) {
            continue;
          }
          
          finalDocuments.push(template);
        }
      }
      
      // 4. If we still have too many documents, trim to the target count
      // (This should rarely happen but ensures consistency)
      if (finalDocuments.length > targetDocumentCount) {
        // Preserve documents with uploads first
        const withUploads = finalDocuments.filter(doc => doc.uploadedFile);
        const withoutUploads = finalDocuments.filter(doc => !doc.uploadedFile);
        
        // Sort without uploads to keep more important ones
        withoutUploads.sort((a, b) => {
          // Prioritize standard documents
          const aIsStandard = ["Passport Copy", "Bank Statement", "Employment Letter", "Utility Bill"].includes(a.filename);
          const bIsStandard = ["Passport Copy", "Bank Statement", "Employment Letter", "Utility Bill"].includes(b.filename);
          
          if (aIsStandard && !bIsStandard) return -1;
          if (!aIsStandard && bIsStandard) return 1;
          return 0;
        });
        
        // Combine to reach exactly target count
        finalDocuments = [
          ...withUploads,
          ...withoutUploads.slice(0, targetDocumentCount - withUploads.length)
        ];
        
        if (finalDocuments.length > targetDocumentCount) {
          finalDocuments = finalDocuments.slice(0, targetDocumentCount);
        }
      }
      
      console.log("Final document count:", finalDocuments.length);
      
      // Set the documents
      setDocuments(finalDocuments);
      setNotification({
        open: true,
        message: "Documents loaded successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error loading documents:", error);
      
      // Show appropriate error message
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 404) {
          setNotification({
            open: true,
            message: "Customer not found. Please verify the customer ID.",
            severity: "error"
          });
        } else if (status === 500) {
          setNotification({
            open: true,
            message: "Server error while loading documents. Please try again later.",
            severity: "error"
          });
        } else if (error.code === 'ECONNABORTED') {
          setNotification({
            open: true,
            message: "Connection timed out. Please check your network and try again.",
            severity: "error"
          });
        } else {
          setNotification({
            open: true,
            message: `Failed to load documents: ${error.response?.statusText || error.message}`,
            severity: "error"
          });
        }
      } else {
        setNotification({
          open: true,
          message: "Failed to load documents. Please try again.",
          severity: "error"
        });
      }
      
      // Create default document structure even if API fails
      setDocuments(getDocumentTemplates().slice(0, 10));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter documents based on selected category
  const filteredDocuments = currentCategory === "all" 
    ? documents 
    : documents.filter(doc => doc.category === currentCategory);

  // Get the actual indices from the original array for the filtered documents
  const getOriginalIndex = (filteredIndex: number) => {
    const filteredDoc = filteredDocuments[filteredIndex];
    return documents.findIndex(doc => 
      doc.filename === filteredDoc.filename && 
      doc.category === filteredDoc.category
    );
  };

  // Document statistics
  const uploadedCount = documents.filter((doc) => doc.status === "Uploaded" || doc.status === DOCUMENT_STATUS.UPLOADED).length;
  const totalCount = documents.length;
  const uploadProgress = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;
  const outstandingDocs = documents.filter((doc) => doc.status === "Pending" || doc.status === DOCUMENT_STATUS.PENDING);

  // Get unique categories from documents
  const categories = Array.from(new Set([...documents.map(doc => doc.category), "all"]));

  // Handler Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, filteredIndex: number) => {
    const file = event.target.files?.[0];
    if (!file || !basicNumber) return;
    
    const originalIndex = getOriginalIndex(filteredIndex);
    const docToUpload = documents[originalIndex];
    
    // Show loading state
    setIsLoading(true);
    
    // Show upload started notification
    setNotification({
      open: true,
      message: `Uploading ${file.name}...`,
      severity: "info"
    });
    
    try {
      // Check file size before upload
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        setNotification({
          open: true,
          message: "File size exceeds 10MB limit. Please select a smaller file.",
          severity: "error"
        });
        setIsLoading(false);
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setNotification({
          open: true,
          message: "Invalid file type. Please upload JPG, PNG, GIF or PDF files only.",
          severity: "error"
        });
        setIsLoading(false);
        return;
      }
      
      // Create a mock success response for development testing if API is not available
      const MOCK_MODE = false; // Set to true for testing without API
      
      let success = false;
      if (MOCK_MODE) {
        // Mock successful upload (for development without API)
        console.log("MOCK MODE: Simulating successful upload");
        success = true;
        
        // Wait to simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Actual API upload
        success = await CustomerDocumentApiService.uploadDocument(
          basicNumber, 
          docToUpload.filename, 
          file
        );
      }
      
      if (success) {
        if (MOCK_MODE) {
          // Create a mock document update for development
          const reader = new FileReader();
          reader.onloadend = () => {
            const updatedDocs = [...documents];
            updatedDocs[originalIndex] = {
              ...updatedDocs[originalIndex],
              id: Math.floor(Math.random() * 1000), // Mock ID
              uploadedFile: reader.result as string,
              uploadedName: file.name,
              status: "Uploaded",
              contentType: file.type
            };
            
            setDocuments(updatedDocs);
            setNotification({
              open: true,
              message: "Document uploaded successfully! (MOCK MODE)",
              severity: "success"
            });
            setIsLoading(false);
          };
          reader.readAsDataURL(file);
          return;
        }
        
        try {
          // Fetch the updated document from the API
          const updatedDoc = await CustomerDocumentApiService.getCustomerDocument(
            basicNumber,
            docToUpload.filename
          );
          
          if (updatedDoc) {
            // Create updated documents array
            const updatedDocs = [...documents];
            updatedDocs[originalIndex] = {
              ...updatedDocs[originalIndex],
              id: updatedDoc.id,
              uploadedFile: updatedDoc.fileContent as string || null,
              uploadedName: file.name,
              status: updatedDoc.uploadStatus,
              contentType: updatedDoc.contentType,
              // Preserve the existing expiry date
              expiryDate: updatedDoc.expiryDate ? updatedDoc.expiryDate.toString() : updatedDocs[originalIndex].expiryDate
            };
            
            setDocuments(updatedDocs);
            setNotification({
              open: true,
              message: "Document uploaded successfully!",
              severity: "success"
            });
          } else {
            // Document was uploaded but retrieval failed
            // Refresh document list to get updated data
            await loadCustomerDocuments();
            
            setNotification({
              open: true,
              message: "Document uploaded, but couldn't retrieve the updated document. Document list refreshed.",
              severity: "info"
            });
          }
        } catch (retrieval_error) {
          console.error("Error retrieving uploaded document:", retrieval_error);
          
          // Create a local preview as fallback
          const reader = new FileReader();
          reader.onloadend = () => {
            const updatedDocs = [...documents];
            updatedDocs[originalIndex] = {
              ...updatedDocs[originalIndex],
              uploadedFile: reader.result as string,
              uploadedName: file.name,
              status: "Uploaded",
              contentType: file.type
            };
            
            setDocuments(updatedDocs);
          };
          reader.readAsDataURL(file);
          
          setNotification({
            open: true,
            message: "Document uploaded, but couldn't retrieve the updated document. Using local preview.",
            severity: "warning"
          });
        }
      } else {
        setNotification({
          open: true,
          message: "Failed to upload document. The server reported an error. Please try again or contact support.",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      
      // Show different messages based on error type
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          setNotification({
            open: true,
            message: "Server error occurred. The file may be corrupted or in an unsupported format.",
            severity: "error"
          });
        } else if (error.response?.status === 413) {
          setNotification({
            open: true,
            message: "File is too large for the server to process. Please upload a smaller file.",
            severity: "error"
          });
        } else if (error.code === 'ECONNABORTED') {
          setNotification({
            open: true,
            message: "Upload timed out. Please try again with a smaller file or check your connection.",
            severity: "error"
          });
        } else {
          setNotification({
            open: true,
            message: `Upload failed: ${error.response?.statusText || error.message}`,
            severity: "error"
          });
        }
      } else {
        setNotification({
          open: true,
          message: "An unexpected error occurred during upload. Please try again.",
          severity: "error"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for scanning documents
  const handleScan = (filteredIndex: number) => {
    if (!basicNumber) return;
    
    const originalIndex = getOriginalIndex(filteredIndex);
    setScanningIndex(originalIndex);
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            simulateDocumentScan(originalIndex);
          }, 500);
        }
        return newProgress;
      });
    }, 100);
  };

  // Simulate document scan
  const simulateDocumentScan = async (originalIndex: number) => {
    if (!basicNumber) return;
    
    const doc = documents[originalIndex];
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `${basicNumber}_${doc.filename.replace(/\s+/g, '')}_${dateStr}.pdf`;
    
    // Create canvas for mock document
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a mock document image
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = '30px Arial';
      ctx.fillText(`${doc.filename}`, 100, 100);
      ctx.fillText(`Customer ID: ${basicNumber}`, 100, 150);
      ctx.fillText(`Customer Name: ${customerName || 'Customer'}`, 100, 200);
      ctx.fillText(`Date: ${today.toLocaleDateString()}`, 100, 250);
      ctx.fillText(`Scanned Document`, 100, 300);
      
      // Draw some lines to make it look like a document
      ctx.beginPath();
      ctx.moveTo(80, 350);
      ctx.lineTo(920, 350);
      ctx.stroke();
      
      for (let i = 400; i < 1300; i += 40) {
        ctx.beginPath();
        ctx.moveTo(100, i);
        ctx.lineTo(900, i);
        ctx.stroke();
      }
    }
    
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(blob => resolve(blob), 'application/pdf');
      });
      
      if (blob) {
        // Create a File object from the blob
        const scannedFile = new File([blob], fileName, { type: 'application/pdf' });
        
        // Upload the "scanned" file to the API
        setIsLoading(true);
        const success = await CustomerDocumentApiService.uploadDocument(
          basicNumber,
          doc.filename,
          scannedFile
        );
        
        if (success) {
          // Get the updated document from the API
          const updatedDoc = await CustomerDocumentApiService.getCustomerDocument(
            basicNumber,
            doc.filename
          );
          
          if (updatedDoc) {
            // Convert the file to base64 for preview
            const reader = new FileReader();
            reader.onloadend = () => {
              // Update document
              const updatedDocs = [...documents];
              updatedDocs[originalIndex] = {
                ...updatedDocs[originalIndex],
                id: updatedDoc.id,
                uploadedFile: reader.result as string,
                uploadedName: fileName,
                status: updatedDoc.uploadStatus,
                contentType: 'application/pdf',
                // Preserve the existing expiry date
                expiryDate: updatedDoc.expiryDate ? updatedDoc.expiryDate.toString() : updatedDocs[originalIndex].expiryDate
              };
              
              setDocuments(updatedDocs);
              setNotification({
                open: true,
                message: "Document scanned and uploaded successfully!",
                severity: "success"
              });
            };
            reader.readAsDataURL(scannedFile);
          }
        } else {
          setNotification({
            open: true,
            message: "Failed to upload scanned document.",
            severity: "error"
          });
        }
      }
    } catch (error) {
      console.error("Error scanning document:", error);
      setNotification({
        open: true,
        message: "An error occurred while scanning the document.",
        severity: "error"
      });
    } finally {
      setIsLoading(false);
      setIsScanning(false);
      setScanningIndex(null);
    }
  };

const handleExpiryChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, filteredIndex: number) => {
  const originalIndex = getOriginalIndex(filteredIndex);
  const value = (event.target as HTMLInputElement).value;
  const document = documents[originalIndex];
  
  // Update local state first for immediate UI feedback
  const updatedDocs = [...documents];
  updatedDocs[originalIndex] = {
    ...updatedDocs[originalIndex],
    expiryDate: value
  };
  
  setDocuments(updatedDocs);
  
  // If the document has an ID and we have a basicNumber, update on server
  if (document.id && basicNumber) {
    try {
      // Show subtle notification that we're saving
      setNotification({
        open: true,
        message: "Saving date change...",
        severity: "info"
      });
      
      // Log what we're about to send
      console.log(`Updating expiry date for ${document.filename} to ${value}`);
      
      // The API service expects a string directly, not an object
      const success = await CustomerDocumentApiService.updateDocumentExpiryDate(
        basicNumber,
        document.filename,
        value // Pass the string value directly as the API service expects
      );
      
      if (success) {
        setNotification({
          open: true,
          message: "Expiry date updated successfully",
          severity: "success"
        });
      } else {
        // If server update fails, show error but keep local state updated
        setNotification({
          open: true,
          message: "Failed to update expiry date on server. The change is only saved locally.",
          severity: "warning"
        });
      }
    } catch (error) {
      console.error("Error updating expiry date:", error);
      setNotification({
        open: true,
        message: "Error updating expiry date on server. The change is only saved locally.",
        severity: "warning"
      });
    }
  }
};

  const handlePreview = (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    if (!documents[originalIndex].uploadedFile) {
      setNotification({
        open: true,
        message: "No file uploaded for preview!",
        severity: "warning"
      });
      return;
    }
    setCurrentPreviewIndex(originalIndex);
  };

  const handleDelete = async (filteredIndex: number) => {
    if (!basicNumber) return;
    
    const originalIndex = getOriginalIndex(filteredIndex);
    const document = documents[originalIndex];
    
    if (!document.id) {
      setNotification({
        open: true,
        message: "Cannot delete: Document not found on server.",
        severity: "error"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Call API to delete document
      const success = await CustomerDocumentApiService.deleteDocument(
        basicNumber,
        document.filename
      );
      
      if (success) {
        // Create updated documents array
        const updatedDocs = [...documents];
        updatedDocs[originalIndex] = {
          ...updatedDocs[originalIndex],
          uploadedFile: null,
          uploadedName: "",
          status: "Pending"
        };
        
        setDocuments(updatedDocs);
        
        if (currentPreviewIndex === originalIndex) {
          setCurrentPreviewIndex(null);
        }
        
        setSelectedIndices((prev) => prev.filter((i) => i !== originalIndex));
        
        setNotification({
          open: true,
          message: "Document deleted successfully!",
          severity: "success"
        });
      } else {
        setNotification({
          open: true,
          message: "Failed to delete document. Please try again.",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setNotification({
        open: true,
        message: "An error occurred while deleting the document.",
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = async (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    const docToDownload = documents[originalIndex];
    
    if (!docToDownload.uploadedFile) {
      setNotification({
        open: true,
        message: "No file available to download!",
        severity: "warning"
      });
      return;
    }
    
    if (basicNumber && docToDownload.id) {
      try {
        // Direct API download
        window.open(`${API_BASE_URL}/customer-documents/${basicNumber}/${docToDownload.filename}?download=true`, '_blank');
      } catch (error) {
        console.error("Error downloading from API:", error);
        
        // Fallback to local download if API fails
        const a = window.document.createElement("a");
        a.href = docToDownload.uploadedFile;
        a.download = docToDownload.uploadedName;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
      }
    } else {
      // Local download for client-side files
      const a = window.document.createElement("a");
      a.href = docToDownload.uploadedFile;
      a.download = docToDownload.uploadedName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  const handleNext = () => {
    if (currentPreviewIndex !== null && currentPreviewIndex < documents.length - 1) {
      setCurrentPreviewIndex(currentPreviewIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPreviewIndex !== null && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  };

  // Helper function to get the proper file extension based on MIME type
  const getFileExtension = (contentType: string): string => {
    switch (contentType.toLowerCase()) {
      case 'image/jpeg':
      case 'image/jpg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/gif':
        return '.gif';
      case 'application/pdf':
        return '.pdf';
      case 'application/msword':
        return '.doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      default:
        // Extract extension from MIME type if possible
        const parts = contentType.split('/');
        if (parts.length === 2 && parts[1]) {
          return '.' + parts[1];
        }
        return '.bin'; // Default binary extension
    }
  };

  // Improved dataURLtoBlob function to properly handle binary conversion
  const dataURLtoBlob = (dataurl: string): Blob | null => {
    if (!dataurl) return null;
    
    try {
      // Handle data URLs (formatted as "data:mimetype;base64,...")
      if (dataurl.startsWith('data:')) {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        
        return new Blob([u8arr], { type: mime });
      } 
      // Handle non-data URLs (perhaps direct base64 strings)
      else {
        try {
          const bstr = atob(dataurl);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          
          for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }
          
          return new Blob([u8arr], { type: 'application/octet-stream' });
        } catch (error) {
          console.error('Failed to decode as base64:', error);
          return null;
        }
      }
    } catch (error) {
      console.error('Error creating blob from data URL:', error);
      return null;
    }
  };

  // Updated handleDownloadAll function with better error handling
  const handleDownloadAll = async () => {
    const uploadedDocs = documents.filter(doc => doc.uploadedFile);
    if (uploadedDocs.length === 0) {
      setNotification({
        open: true,
        message: "No documents available to download!",
        severity: "warning"
      });
      return;
    }
    
    try {
      const zip = new JSZip();
      let filesAdded = 0;
      
      for (const doc of uploadedDocs) {
        if (doc.uploadedFile) {
          // Get the appropriate file extension based on content type
          const extension = getFileExtension(doc.contentType || '');
          
          // Create a proper filename with extension if it doesn't have one
          let fileName = doc.uploadedName || `${doc.filename}`;
          if (!fileName.includes('.')) {
            fileName = fileName + extension;
          }
          
          // Convert to blob and add to zip
          const blob = dataURLtoBlob(doc.uploadedFile);
          if (blob) {
            zip.file(fileName, blob);
            filesAdded++;
          } else {
            console.warn(`Failed to convert document to blob: ${doc.filename}`);
          }
        }
      }
      
      if (filesAdded === 0) {
        setNotification({
          open: true,
          message: "Could not prepare any files for download. Please try downloading individually.",
          severity: "error"
        });
        return;
      }
      
      const content = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6 // Balanced compression
        }
      });
      
      saveAs(content, `${basicNumber || "Customer"}_Documents_${new Date().toISOString().split('T')[0]}.zip`);
      
      setNotification({
        open: true,
        message: `${filesAdded} documents downloaded successfully!`,
        severity: "success"
      });
    } catch (error) {
      console.error("Error downloading all documents:", error);
      setNotification({
        open: true,
        message: "Failed to download documents. Technical error occurred.",
        severity: "error"
      });
    }
  };

  // Updated handleDownloadSelected function with similar improvements
  const handleDownloadSelected = async () => {
    if (selectedIndices.length === 0) {
      setNotification({
        open: true,
        message: "No documents selected for download!",
        severity: "warning"
      });
      return;
    }
    
    try {
      const zip = new JSZip();
      let filesAdded = 0;
      
      for (const index of selectedIndices) {
        const doc = documents[index];
        if (doc.uploadedFile) {
          // Get the appropriate file extension based on content type
          const extension = getFileExtension(doc.contentType || '');
          
          // Create a proper filename with extension if it doesn't have one
          let fileName = doc.uploadedName || `${doc.filename}`;
          if (!fileName.includes('.')) {
            fileName = fileName + extension;
          }
          
          // Convert to blob and add to zip
          const blob = dataURLtoBlob(doc.uploadedFile);
          if (blob) {
            zip.file(fileName, blob);
            filesAdded++;
          } else {
            console.warn(`Failed to convert document to blob: ${doc.filename}`);
          }
        }
      }
      
      if (filesAdded === 0) {
        setNotification({
          open: true,
          message: "Could not prepare any files for download. Please try downloading individually.",
          severity: "error"
        });
        return;
      }
      
      const content = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6 // Balanced compression
        }
      });
      
      saveAs(content, `${basicNumber || "Customer"}_SelectedDocuments_${new Date().toISOString().split('T')[0]}.zip`);
      
      setNotification({
        open: true,
        message: `${filesAdded} documents downloaded successfully!`,
        severity: "success"
      });
    } catch (error) {
      console.error("Error downloading selected documents:", error);
      setNotification({
        open: true,
        message: "Failed to download selected documents. Technical error occurred.",
        severity: "error"
      });
    }
  };

  // Handle row selection
  const handleRowSelect = (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    setSelectedIndices((prev) =>
      prev.includes(originalIndex) ? prev.filter((i) => i !== originalIndex) : [...prev, originalIndex]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    // Only select documents in the current filtered view
    const filteredIndices = filteredDocuments.map((_, index) => getOriginalIndex(index));
    const allSelected = filteredIndices.every(index => selectedIndices.includes(index));
    
    if (allSelected) {
      // Remove these indices from selection
      setSelectedIndices(prev => prev.filter(index => !filteredIndices.includes(index)));
    } else {
      // Add these indices to selection
      setSelectedIndices(prev => {
        const newIndices = [...prev];
        filteredIndices.forEach(index => {
          if (!newIndices.includes(index)) {
            newIndices.push(index);
          }
        });
        return newIndices;
      });
    }
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  // Add a close handler
  const handleCloseUploader = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <ThemeProvider theme={brandTheme}>
      <StyledContainer maxWidth={false} disableGutters>
        <StyledPaper>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" sx={{ color: "#FFFFFF" }}>
              Upload Required Documents
              {basicNumber && (
                <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                  {customerName ? `${customerName} (${basicNumber})` : `Customer: ${basicNumber}`}
                </Typography>
              )}
              {accountNumber && (
                <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                  Account: {accountNumber}
                </Typography>
              )}
            </Typography>
            {onClose && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCloseUploader}
                startIcon={<CloseIcon />}
              >
                Close
              </Button>
            )}
          </Box>
          
          {/* Summary Bar */}
          <SummaryBar
            uploadedCount={uploadedCount}
            totalCount={totalCount}
            uploadProgress={uploadProgress}
            outstandingDocs={outstandingDocs}
            onDownloadAll={handleDownloadAll}
            onDownloadSelected={handleDownloadSelected}
            onRefresh={loadCustomerDocuments}
            isLoading={isLoading}
          />
          
          {/* Category Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentCategory} 
              onChange={(_, newValue) => setCurrentCategory(newValue)} 
              textColor="inherit"
              indicatorColor="primary"
            >
              {categories.map(category => (
                <StyledTab 
                  key={category} 
                  value={category} 
                  label={category === "all" ? "All Documents" : category} 
                />
              ))}
            </Tabs>
          </Box>
          
          {/* Loading indicator */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Document Table */}
          {!isLoading && filteredDocuments.length > 0 && (
            <DocumentTable
              documents={filteredDocuments}
              selectedIndices={selectedIndices.filter(index => 
                filteredDocuments.some(doc => 
                  doc.filename === documents[index].filename && 
                  doc.category === documents[index].category
                )
              ).map(originalIndex => 
                filteredDocuments.findIndex(doc => 
                  doc.filename === documents[originalIndex].filename && 
                  doc.category === documents[originalIndex].category
                )
              )}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onFileUpload={handleFileUpload}
              onExpiryChange={handleExpiryChange}
              onPreview={handlePreview}
              onDelete={handleDelete}
              onFileDownload={handleFileDownload}
              onScan={handleScan}
              isLoading={isLoading}
            />
          )}
          
          {/* Empty state */}
          {!isLoading && filteredDocuments.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6">
                No documents found in this category.
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => setCurrentCategory("all")}
              >
                View All Documents
              </Button>
            </Box>
          )}
        </StyledPaper>
        
        {/* Document Preview */}
        {currentPreviewIndex !== null && documents[currentPreviewIndex] && (
          <DocumentPreview
            document={documents[currentPreviewIndex]}
            onClose={() => setCurrentPreviewIndex(null)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onFileDownload={() => {
              if (currentPreviewIndex !== null) {
                handleFileDownload(
                  filteredDocuments.findIndex(doc => 
                    doc.filename === documents[currentPreviewIndex].filename && 
                    doc.category === documents[currentPreviewIndex].category
                  )
                );
              }
            }}
          />
        )}
        
        {/* Scanning Dialog */}
        <Dialog open={isScanning} maxWidth="sm" fullWidth>
          <DialogTitle>Scanning Document</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {scanningIndex !== null && documents[scanningIndex]?.filename}
              </Typography>
              <Box sx={{ position: 'relative', mt: 4, mb: 4 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={scanProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    position: 'absolute', 
                    top: '10px', 
                    left: 0, 
                    right: 0, 
                    textAlign: 'center' 
                  }}
                >
                  {Math.round(scanProgress)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Please wait while the document is being scanned...
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
        
        {/* Notifications */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </StyledContainer>
    </ThemeProvider>
  );
};

export default DocumentUploader;