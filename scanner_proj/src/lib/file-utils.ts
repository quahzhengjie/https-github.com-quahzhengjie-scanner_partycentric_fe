// src/lib/file-utils.ts - Utilities for file handling and blob conversion

/**
 * Convert a File object to base64 string for API transport
 * The backend will convert this to VARBINARY (MSSQL) or BLOB (MySQL)
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:*/*;base64, prefix
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  }
  
  /**
   * Convert base64 string back to Blob for display/download
   */
  export function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
  
  /**
   * Create a download URL for a base64 file
   */
  export function createDownloadUrl(base64: string, mimeType: string): string {
    const blob = base64ToBlob(base64, mimeType);
    return URL.createObjectURL(blob);
  }
  
  /**
   * Trigger file download
   */
  export function downloadFile(base64: string, fileName: string, mimeType: string): void {
    const url = createDownloadUrl(base64, mimeType);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Get file extension from mime type
   */
  export function getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
    };
    return mimeToExt[mimeType] || 'bin';
  }
  
  /**
   * Validate file size (in bytes)
   */
  export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
  
  /**
   * Validate file type
   */
  export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }
  
  /**
   * Get human-readable file size
   */
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Create a file preview URL for images
   */
  export async function createImagePreview(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) {
      return null;
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Example usage for uploading a document
   */
  export async function prepareDocumentForUpload(
    file: File,
    documentData: {
      ownerPartyId: string;
      docType: string;
      category: string;
      issuer?: string;
      issueDate?: string;
      expiryDate?: string;
      documentNumber?: string;
    }
  ) {
    // Validate file
    if (!validateFileSize(file, 10)) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validateFileType(file, allowedTypes)) {
      throw new Error('File type not allowed');
    }
    
    // Convert to base64
    const base64Data = await fileToBase64(file);
    
    // Prepare document object
    return {
      ...documentData,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileData: base64Data, // This will be stored as BLOB in database
      isVerified: false,
      uploadedAt: new Date().toISOString(),
      tags: []
    };
  }