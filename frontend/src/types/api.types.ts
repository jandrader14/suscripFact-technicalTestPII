export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface ApiValidationError {
  statusCode: 400;
  message: string[];
  error: string;
  timestamp: string;
  path: string;
}
