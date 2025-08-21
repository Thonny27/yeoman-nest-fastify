export interface ApiResponse<T = any> {
  success: boolean;
  timestamp: string;
  path: string;
  data: T;
  meta: {
    durationMs: number;
    [key: string]: any;
  };
  errors: Array<{ key?: string; message: string; detail?: any }>;
}
