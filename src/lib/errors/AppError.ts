/**
 * Specific error codes for predictable error handling.
 */
export type ErrorCode =
  | 'ELEVATION_FETCH_FAILED'
  | 'CESIUM_PICK_FAILED'
  | 'CZML_BUILD_FAILED'
  | 'MAX_WAYPOINTS_REACHED'
  | 'PROVIDER_NOT_FOUND'

/**
 * Custom application error class to handle domain-specific failures.
 */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly cause?: unknown

  /**
   * Creates an instance of AppError.
   * 
   * @param code - A unique error code for the failure type
   * @param message - Human-readable error message
   * @param cause - Optional underlying cause (e.g. native Error)
   */
  constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = cause
  }
}
