declare module 'opossum' {
  export default class CircuitBreaker {
    constructor(action: (...args: any[]) => any, options?: any);
    fire(...args: any[]): Promise<any>;
    fallback(handler: (...args: any[]) => any): void;
    on(event: string, listener: (...args: any[]) => void): void;
  }
}