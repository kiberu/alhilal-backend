import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Document {
  id: string;
  document_type: 'PASSPORT' | 'VISA' | 'VACCINATION' | 'ID_CARD' | 'BIRTH_CERTIFICATE' | 'TRAVEL_PERMIT' | 'OTHER';
  document_number?: string | null;
  title: string;
  issuing_country?: string | null;
  file_url: string | null;
  file_format?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MISSING';
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MISSING';
  required_for_travel: boolean;
  missing_item: boolean;
  is_expired: boolean;
  is_expiring_soon: boolean;
  support_next_step: string;
  trip?: string | null;
  trip_name?: string | null;
  booking_reference?: string | null;
  last_reviewed_at?: string | null;
  last_changed_at?: string | null;
  created_at?: string;
  updated_at?: string;
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
  static async getMyDocuments(token: string): Promise<ApiResponse<Document[]>> {
    return apiClient.get<Document[]>(API_ENDPOINTS.DOCUMENTS.MY_DOCUMENTS, undefined, token);
  }

  /**
   * Upload a new document
   */
  static uploadDocument(data: DocumentUploadData, token: string): Promise<ApiResponse<Document>> {
    void data;
    void token;
    throw new Error('Document uploads are currently handled by Al Hilal support while the pilgrim upload API is being prepared.');
  }

  /**
   * Get details of a specific document
   */
  static async getDocumentDetail(documentId: string, token: string): Promise<ApiResponse<Document>> {
    return apiClient.get<Document>(API_ENDPOINTS.DOCUMENTS.DETAIL(documentId), undefined, token);
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
