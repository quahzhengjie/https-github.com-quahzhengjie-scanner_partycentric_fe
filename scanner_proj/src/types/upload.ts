export interface UploadedFile {
    name: string;
    uploadDate: string;
    size: string;
}

export interface UploadModalProps {
    open: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
}