export interface CustomRequest {
  endpoints: Array<{
    key: string;
    url: string;
    method: 'get' | 'post';
    data?: any;
  }>;
}
