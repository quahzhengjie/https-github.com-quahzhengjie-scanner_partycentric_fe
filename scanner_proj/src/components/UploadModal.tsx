import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
} from '@mui/icons-material'
import { UploadModalProps } from '@/types/upload';

const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: { target: { files: FileList | null}}) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
            setSelectedFile(null);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    }
    
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                        <Box className="flex justify-between items-center">
                        Upload Documents
                        <IconButton
                            onClick={handleClose}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Box className="py-4">
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload">
                            <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            >
                            Choose File
                            </Button>
                        </label>
                        {selectedFile && (
                            <Typography className="mt-2">
                            Selected: {selectedFile.name}
                            </Typography>
                        )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                        onClick={handleClose}
                        color="error"
                        >
                            Cancel
                        </Button>
                        <Button
                        onClick={handleUpload}
                        variant="contained"
                        color="primary"
                        disabled={!selectedFile}
                        >
                            Upload
                        </Button>
                    </DialogActions>
        </Dialog>
    )
};


export default UploadModal;