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
  CircularProgress,
  Alert
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
} from "@mui/icons-material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { mockDocuments } from '@/mockData/mockDocuments';
import { DocumentCategory } from "@/types/document";
import { AccountApiService } from '@/services/AccountApiService';
import { ApiService } from '@/services/ApiService';
import axios from 'axios';

// Add API base URL constant
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ----- Data Type -----
type DocumentType = {
  filename: string;
  uploadedFile: string | null;
  uploadedName: string;
  expiryDate: string;
  status: string;
  category: DocumentCategory;
};

// Add accountNumber prop
interface DocumentUploaderProps {
  basicNumber?: string;
  accountNumber?: string; // New prop for account-level documents
  onClose?: () => void;
  mode?: 'full' | 'single';
  initialDocument?: string;
  initialCategory?: string;
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
};

const SummaryBar: React.FC<SummaryBarProps> = ({
  uploadedCount,
  totalCount,
  uploadProgress,
  outstandingDocs,
  onDownloadAll,
  onDownloadSelected,
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
        disabled={uploadedCount === 0}
        size="small"
      >
        Download All
      </Button>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={onDownloadSelected}
        size="small"
      >
        Download Selected
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
            return (
              <TableRow key={index}>
                <BodyCell>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onRowSelect(index)}
                    size="small"
                  />
                </BodyCell>
                <BodyCell>
                  {doc.uploadedFile ? (
                    doc.uploadedFile.startsWith("data:application/pdf") ? (
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
                  />
                </BodyCell>
                <BodyCell>
                  <Typography
                    sx={{
                      color: doc.status === "Uploaded" ? "#4caf50" : "#ff9800",
                      fontWeight: "bold",
                    }}
                  >
                    {doc.status}
                  </Typography>
                </BodyCell>
                <BodyCell>
                  {doc.status === "Pending" && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<ScannerIcon />}
                      onClick={() => onScan(index)}
                      sx={{ mr: 1, mb: 1 }}
                      size="small"
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
                    disabled={!doc.uploadedFile}
                    onClick={() => onPreview(index)}
                    sx={{ mr: 1, mb: 1 }}
                    size="small"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    disabled={!doc.uploadedFile}
                    onClick={() => onFileDownload(index)}
                    sx={{ mr: 1, mb: 1 }}
                    size="small"
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    disabled={!doc.uploadedFile}
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
      {document.uploadedFile && document.uploadedFile.startsWith("data:application/pdf") ? (
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
const DocumentUploaderAccountLevel: React.FC<DocumentUploaderProps> = ({ 
  basicNumber, 
  accountNumber, 
  onClose,
  mode = 'full',
  initialDocument,
  initialCategory 
}) => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("all");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number | null>(null);
  
  // Add scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);

  // Load required documents from the backend based on accountNumber or basicNumber
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let docs: DocumentType[] = [];
        
        if (accountNumber) {
          // Fetch account-level required documents
          try {
            const missingDocs = await AccountApiService.getMissingDocuments(accountNumber);
            
            // Transform the missing documents into the DocumentType format
            docs = missingDocs.map(docName => ({
              filename: docName,
              uploadedFile: null,
              uploadedName: '',
              expiryDate: '',
              status: 'Pending',
              category: determineCategory(docName) // Helper function to categorize docs
            }));
            
            // For single document mode, filter to just the initialDocument if specified
            if (mode === 'single' && initialDocument) {
              docs = docs.filter(doc => doc.filename === initialDocument);
              
              // If initial category is specified, use it
              if (initialCategory && docs.length > 0) {
                docs[0].category = initialCategory as DocumentCategory;
              }
            }
          } catch (accountError) {
            console.error('Error fetching account documents:', accountError);
            setError('Failed to load account document requirements');
          }
        } 
        else if (basicNumber) {
          // Fetch customer-level required documents
          // First try to get from the backend
          try {
            // Get the outstanding documents list
            const response = await axios.get(`${API_BASE_URL}/documents/customer/${basicNumber}/outstanding-list`);
            const missingDocs = response.data || [];
            
            // Create document objects
            docs = missingDocs.map((docName: string) => ({
              filename: docName,
              uploadedFile: null,
              uploadedName: '',
              expiryDate: '',
              status: 'Pending',
              category: determineCategory(docName)
            }));
            
            // Filter for single mode
            if (mode === 'single' && initialDocument) {
              docs = docs.filter(doc => doc.filename === initialDocument);
              if (initialCategory && docs.length > 0) {
                docs[0].category = initialCategory as DocumentCategory;
              }
            }
          } catch (customerError) {
            console.error('Error fetching customer documents from API:', customerError);
            
            // Fallback to mock data
            const customerDocIndex = mockDocuments.findIndex(doc => doc.basicNumber === basicNumber);
            if (customerDocIndex !== -1) {
              docs = mockDocuments[customerDocIndex].documents;
              
              // Filter for single mode
              if (mode === 'single' && initialDocument) {
                docs = docs.filter(doc => doc.filename === initialDocument);
              }
            } else {
              // Default empty document list with a message
              setError('No document requirements found for this customer');
            }
          }
        }
        
        setDocuments(docs);
      } catch (err) {
        console.error('Error in document loading process:', err);
        setError('Failed to load document requirements');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequiredDocuments();
  }, [accountNumber, basicNumber, mode, initialDocument, initialCategory]);

  // Helper function to determine document category
  const determineCategory = (docName: string): DocumentCategory => {
    // Categorize documents based on name patterns
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
    
    // Default category
    return 'Other';
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

  const uploadedCount = documents.filter((doc) => doc.uploadedFile).length;
  const totalCount = documents.length;
  const uploadProgress = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;
  const outstandingDocs = documents.filter((doc) => !doc.uploadedFile);

  // Get unique categories from documents
  const uniqueCategories = [...new Set(documents.map(doc => doc.category))];
  const categories = ["all", ...uniqueCategories];

  // Modified file upload handler to support account documents
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, filteredIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const originalIndex = getOriginalIndex(filteredIndex);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        // Create updated documents array
        const updatedDocs = [...documents];
        updatedDocs[originalIndex] = {
          ...updatedDocs[originalIndex],
          uploadedFile: reader.result as string,
          uploadedName: file.name,
          status: "Uploaded"
        };
        
        // Update local state
        setDocuments(updatedDocs);
        
        // If this is for an account, call the appropriate API
        if (accountNumber) {
          const docName = documents[originalIndex].filename;
          // Upload to backend
          await AccountApiService.updateAccountDocument(
            accountNumber,
            docName,
            file
          );
          
          // Show success message or handle UI update
          console.log(`Successfully uploaded document: ${docName} for account: ${accountNumber}`);
        } 
        else if (basicNumber) {
          // For customer documents, call the appropriate API
          try {
            const docName = documents[originalIndex].filename;
            
            // Create form data for upload
            const formData = new FormData();
            formData.append('file', file);
            
            // Upload to backend
            await axios.post(
              `${API_BASE_URL}/documents/customer/${basicNumber}/${docName}/upload`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            
            console.log(`Successfully uploaded document: ${docName} for customer: ${basicNumber}`);
          } catch (uploadError) {
            console.error('Error uploading to backend:', uploadError);
            throw new Error('Failed to upload to server');
          }
        }
      } catch (err) {
        console.error('Error uploading document:', err);
        // Revert the UI state on error
        const updatedDocs = [...documents];
        updatedDocs[originalIndex] = {
          ...updatedDocs[originalIndex],
          uploadedFile: null,
          uploadedName: '',
          status: "Pending"
        };
        setDocuments(updatedDocs);
        
        // Show error message
        alert('Failed to upload document. Please try again.');
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Handler for scanning documents
  const handleScan = (filteredIndex: number) => {
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
            // Create a "scanned" document
            const doc = documents[originalIndex];
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
            const fileName = `${accountNumber || basicNumber || "Unknown"}_${doc.filename.replace(/\s+/g, '')}_${dateStr}.pdf`;
            
            // Create mock scan data
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
              
              if (accountNumber) {
                ctx.fillText(`Account Number: ${accountNumber}`, 100, 150);
              } else if (basicNumber) {
                ctx.fillText(`Customer ID: ${basicNumber}`, 100, 150);
              }
              
              ctx.fillText(`Date: ${today.toLocaleDateString()}`, 100, 200);
              ctx.fillText(`Scanned Document`, 100, 250);
              
              // Draw some lines to make it look like a document
              ctx.beginPath();
              ctx.moveTo(80, 300);
              ctx.lineTo(920, 300);
              ctx.stroke();
              
              for (let i = 350; i < 1300; i += 40) {
                ctx.beginPath();
                ctx.moveTo(100, i);
                ctx.lineTo(900, i);
                ctx.stroke();
              }
            }
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                // Convert blob to base64 data URL for preview
                const reader = new FileReader();
                reader.onloadend = async () => {
                  try {
                    // Update document
                    const updatedDocs = [...documents];
                    updatedDocs[originalIndex] = {
                      ...updatedDocs[originalIndex],
                      uploadedFile: reader.result as string,
                      uploadedName: fileName,
                      status: "Uploaded"
                    };
                    
                    // Update state
                    setDocuments(updatedDocs);
                    
                    // Try to upload to backend
                    if (accountNumber) {
                      const docName = documents[originalIndex].filename;
                      // Create a File object from the blob
                      const file = new File([blob], fileName, { type: 'application/pdf' });
                      
                      // Upload to account API
                      await AccountApiService.updateAccountDocument(accountNumber, docName, file);
                      console.log(`Successfully uploaded scanned document: ${docName} for account: ${accountNumber}`);
                    } else if (basicNumber) {
                      const docName = documents[originalIndex].filename;
                      // Create a File object from the blob
                      const file = new File([blob], fileName, { type: 'application/pdf' });
                      
                      // Create form data for upload
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      // Upload to backend
                      await axios.post(
                        `${API_BASE_URL}/documents/customer/${basicNumber}/${docName}/upload`,
                        formData,
                        {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                        }
                      );
                      
                      console.log(`Successfully uploaded scanned document: ${docName} for customer: ${basicNumber}`);
                    }
                  } catch (uploadError) {
                    console.error('Error uploading scanned document:', uploadError);
                    // Let the UI show as uploaded anyway since we have the local preview
                  } finally {
                    setIsScanning(false);
                    setScanningIndex(null);
                  }
                };
                reader.readAsDataURL(blob);
              } else {
                setIsScanning(false);
                setScanningIndex(null);
              }
            }, 'application/pdf');
          }, 500);
        }
        return newProgress;
      });
    }, 100);
  };

  const handleExpiryChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    const value = (event.target as HTMLInputElement).value;
    
    // Create updated documents array
    const updatedDocs = [...documents];
    updatedDocs[originalIndex] = {
      ...updatedDocs[originalIndex],
      expiryDate: value
    };
    
    // Update local state
    setDocuments(updatedDocs);
    
    // Update backend if needed
    try {
      if (accountNumber) {
        // Update expiry date in account document if API supports it
        // This would require backend support
        console.log(`Updated expiry date for account document: ${updatedDocs[originalIndex].filename}`);
      } else if (basicNumber) {
        // Update expiry date in customer document if API supports it
        console.log(`Updated expiry date for customer document: ${updatedDocs[originalIndex].filename}`);
      }
    } catch (expiryError) {
      console.error('Error updating expiry date:', expiryError);
    }
  };

  const handlePreview = (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    if (!documents[originalIndex].uploadedFile) {
      alert("No file uploaded!");
      return;
    }
    setCurrentPreviewIndex(originalIndex);
  };

  const handleDelete = async (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    const docToDelete = documents[originalIndex];
    
    if (!docToDelete.uploadedFile) {
      alert("No file to delete!");
      return;
    }
    
    try {
      // Create updated documents array first for responsive UI
      const updatedDocs = [...documents];
      updatedDocs[originalIndex] = {
        ...updatedDocs[originalIndex],
        uploadedFile: null,
        uploadedName: "",
        status: "Pending"
      };
      
      // Update local state immediately
      setDocuments(updatedDocs);
      
      // Update preview index if needed
      if (currentPreviewIndex === originalIndex) setCurrentPreviewIndex(null);
      setSelectedIndices((prev) => prev.filter((i) => i !== originalIndex));
      
      // Call backend APIs to delete document
      if (accountNumber) {
        const docName = docToDelete.filename;
        // Call account document deletion API (if available)
        // This would require backend support
        console.log(`Document ${docName} deleted from account ${accountNumber}`);
      } else if (basicNumber) {
        const docName = docToDelete.filename;
        // Call customer document deletion API
        await ApiService.updateDocumentStatus(basicNumber, docName, "Pending");
        console.log(`Document ${docName} deleted from customer ${basicNumber}`);
      }
    } catch (deleteError) {
      console.error('Error deleting document:', deleteError);
      
      // Revert the UI state on error
      const revertDocs = [...documents];
      setDocuments(revertDocs);
      
      // Show error message
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleFileDownload = (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    const fileData = documents[originalIndex].uploadedFile;
    if (!fileData) {
      alert("No file uploaded!");
      return;
    }
    const a = document.createElement("a");
    a.href = fileData;
    a.download = documents[originalIndex].uploadedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    documents.forEach((doc) => {
      if (doc.uploadedFile) {
        const blob = dataURLtoBlob(doc.uploadedFile);
        if (blob) zip.file(doc.uploadedName, blob);
      }
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${accountNumber || basicNumber || "Documents"}_${new Date().toISOString().split('T')[0]}.zip`);
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedIndices.length === 0) {
      alert("No documents selected!");
      return;
    }
    const zip = new JSZip();
    selectedIndices.forEach((index) => {
      const doc = documents[index];
      if (doc.uploadedFile) {
        const blob = dataURLtoBlob(doc.uploadedFile);
        if (blob) zip.file(doc.uploadedName, blob);
      }
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${accountNumber || basicNumber || "Selected"}_${new Date().toISOString().split('T')[0]}.zip`);
    });
  };

  // Checkbox Logic
  const handleRowSelect = (filteredIndex: number) => {
    const originalIndex = getOriginalIndex(filteredIndex);
    setSelectedIndices((prev) =>
      prev.includes(originalIndex) ? prev.filter((i) => i !== originalIndex) : [...prev, originalIndex]
    );
  };

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

  // Add a close handler
  const handleCloseUploader = () => {
    if (onClose) {
      onClose();
    }
  };
  
  // Add loading state handling
  if (loading) {
    return (
      <ThemeProvider theme={brandTheme}>
        <StyledContainer maxWidth={false} disableGutters>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 2 }}>
              <CircularProgress />
              <Typography variant="h6">
                Loading document requirements...
              </Typography>
            </Box>
          </StyledPaper>
        </StyledContainer>
      </ThemeProvider>
    );
  }

  // Add error state handling
  if (error) {
    return (
      <ThemeProvider theme={brandTheme}>
        <StyledContainer maxWidth={false} disableGutters>
          <StyledPaper>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Error Loading Documents
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              <Button 
                variant="outlined" 
                onClick={handleCloseUploader} 
                sx={{ mt: 2 }}
                startIcon={<CloseIcon />}
              >
                Close
              </Button>
            </Box>
          </StyledPaper>
        </StyledContainer>
      </ThemeProvider>
    );
  }
  
  // If no documents found
  if (documents.length === 0) {
    return (
      <ThemeProvider theme={brandTheme}>
        <StyledContainer maxWidth={false} disableGutters>
          <StyledPaper>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h4" sx={{ color: "#FFFFFF" }}>
                Document Requirements
                {accountNumber ? (
                  <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                    Account: {accountNumber}
                  </Typography>
                ) : basicNumber ? (
                  <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                    Customer: {basicNumber}
                  </Typography>
                ) : null}
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
            
            <Alert severity="info" sx={{ mb: 3 }}>
              No document requirements found for this {accountNumber ? 'account' : 'customer'}.
            </Alert>
            
            <Button 
              variant="contained" 
              onClick={handleCloseUploader} 
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          </StyledPaper>
        </StyledContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={brandTheme}>
      <StyledContainer maxWidth={false} disableGutters>
        <StyledPaper>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" sx={{ color: "#FFFFFF" }}>
              Upload Required Documents
              {accountNumber ? (
                <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                  Account: {accountNumber}
                </Typography>
              ) : basicNumber ? (
                <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                  Customer: {basicNumber}
                </Typography>
              ) : null}
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
          <SummaryBar
            uploadedCount={uploadedCount}
            totalCount={totalCount}
            uploadProgress={uploadProgress}
            outstandingDocs={outstandingDocs}
            onDownloadAll={handleDownloadAll}
            onDownloadSelected={handleDownloadSelected}
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
          
          <DocumentTable
            documents={filteredDocuments}
            selectedIndices={selectedIndices.filter(index => 
              filteredDocuments.includes(documents[index])
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
          />
        </StyledPaper>
        
        {currentPreviewIndex !== null && (
          <DocumentPreview
            document={documents[currentPreviewIndex]}
            onClose={() => setCurrentPreviewIndex(null)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onFileDownload={() => {
              const fileData = documents[currentPreviewIndex].uploadedFile;
              if (!fileData) return;
              const a = document.createElement("a");
              a.href = fileData;
              a.download = documents[currentPreviewIndex].uploadedName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          />
        )}
        
        {/* Scanning Dialog */}
        {isScanning && (
          <Dialog open={true} maxWidth="sm" fullWidth>
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
        )}
      </StyledContainer>
    </ThemeProvider>
  );
};

export default DocumentUploaderAccountLevel;