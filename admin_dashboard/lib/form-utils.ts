/**
 * Utility functions for form handling and validation
 */

import type { UseFormSetError, FieldValues, Path } from "react-hook-form"

/**
 * Common snake_case to camelCase field mappings
 */
const DEFAULT_FIELD_MAPPING: Record<string, string> = {
  'day_index': 'dayIndex',
  'start_time': 'startTime',
  'end_time': 'endTime',
  'attach_url': 'attachUrl',
  'attach_public_id': 'attachPublicId',
  'body_md': 'bodyMd',
  'publish_at': 'publishAt',
  'title_arabic': 'titleArabic',
  'content_arabic': 'contentArabic',
  'order_index': 'orderIndex',
  'full_name': 'fullName',
  'passport_number': 'passportNumber',
  'date_of_birth': 'dateOfBirth',
  'emergency_name': 'emergencyName',
  'emergency_phone': 'emergencyPhone',
  'emergency_relationship': 'emergencyRelationship',
  'medical_conditions': 'medicalConditions',
  'payment_status': 'paymentStatus',
  'amount_paid': 'amountPaid',
  'amount_paid_minor_units': 'amountPaidMinorUnits',
  'payment_note': 'paymentNote',
  'ticket_number': 'ticketNumber',
  'room_assignment': 'roomAssignment',
  'special_needs': 'specialNeeds',
  'start_date': 'startDate',
  'end_date': 'endDate',
  'cover_image': 'coverImage',
  'operator_notes': 'operatorNotes',
  'price_minor_units': 'priceMinorUnits',
}

/**
 * Handle backend validation errors and set them on form fields
 * 
 * @param setError - React Hook Form's setError function
 * @param error - Error object from API response or thrown exception
 * @param customFieldMapping - Optional custom field name mappings (snake_case -> camelCase)
 * 
 * @example
 * ```tsx
 * try {
 *   const response = await SomeService.create(data, accessToken)
 *   if (!response.success) {
 *     handleFormErrors(form.setError, response.error)
 *   }
 * } catch (err) {
 *   handleFormErrors(form.setError, err)
 * }
 * ```
 */
export function handleFormErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: any,
  customFieldMapping?: Record<string, string>
): void {
  if (!error) return

  // Combine default and custom field mappings
  const fieldMapping = { ...DEFAULT_FIELD_MAPPING, ...customFieldMapping }

  // Extract field errors from different error structures
  let fieldErrors: Record<string, any> | undefined

  // Structure 1: { error: { fields: {...} } } - from API response
  if (error?.error?.fields) {
    fieldErrors = error.error.fields
  }
  // Structure 2: { fields: {...} } - from API response
  else if (error?.fields) {
    fieldErrors = error.fields
  }
  // Structure 3: { errors: {...} } - from thrown exception
  else if (error?.errors) {
    fieldErrors = error.errors
  }

  if (!fieldErrors) return

  // Set errors on form fields
  Object.entries(fieldErrors).forEach(([backendField, errors]: [string, any]) => {
    // Map backend field name (snake_case) to frontend field name (camelCase)
    const frontendField = (fieldMapping[backendField] || backendField) as Path<T>
    
    // Extract error message (handle both array and string formats)
    const errorMessage = Array.isArray(errors) ? errors[0] : errors
    
    // Set the error on the form field
    setError(frontendField, {
      type: 'manual',
      message: typeof errorMessage === 'string' ? errorMessage : String(errorMessage)
    })
  })
}

/**
 * Extract a user-friendly error message from various error formats
 * 
 * @param error - Error object from API response or thrown exception
 * @param fallbackMessage - Default message if no error message found
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any, fallbackMessage = "An error occurred"): string {
  if (!error) return fallbackMessage

  // Try different error message locations
  if (typeof error === 'string') return error
  if (error?.error?.message) return error.error.message
  if (error?.message) return error.message
  if (error?.error) return String(error.error)

  return fallbackMessage
}




