import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Document {
  id: string;
  document_type: 'PASSPORT' | 'VISA' | 'VACCINATION' | 'OTHER';
  document_number?: string;
  title: string;
  file_url: string;
  uploaded_at: string;
  expiry_date?: string;
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface DocumentUploadData {
  document_type: 'PASSPORT' | 'VISA' | 'VACCINATION' | 'OTHER';
  title: string;
  document_number?: string;
  expiry_date?: string;
  file: File | Blob;
}

export class DocumentsService {
  /**
   * Get all documents for the authenticated user
   */
  static getMyDocuments(token: string): Promise<ApiResponse<Document[]>> {
    return apiClient.get<Document[]>(API_ENDPOINTS.DOCUMENTS.MY_DOCUMENTS, undefined, token);
  }

  /**
   * Upload a new document
   */
  static uploadDocument(data: DocumentUploadData, token: string): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('title', data.title);
    if (data.document_number) formData.append('document_number', data.document_number);
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
    formData.append('file', data.file);

    return apiClient.post<Document>(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, undefined, token);
  }

  /**
   * Get details of a specific document
   */
  static getDocumentDetail(documentId: string, token: string): Promise<ApiResponse<Document>> {
    return apiClient.get<Document>(
      API_ENDPOINTS.DOCUMENTS.DETAIL(documentId),
      undefined,
      token
    );
  }

  /**
   * Delete a document
   */
  static deleteDocument(documentId: string, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      API_ENDPOINTS.DOCUMENTS.DELETE(documentId),
      undefined,
      token
    );
  }
}

