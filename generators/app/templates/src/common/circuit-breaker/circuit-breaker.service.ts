import { Injectable } from '@nestjs/common';
import axios from 'axios';
import CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private breaker: any;

  constructor() {
    // ⬇️ 1. Configuramos el breaker
    this.breaker = new CircuitBreaker(this.makeRequest, {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 5000,
    });

    // ✅ 2. Aquí va el fallback
    this.breaker.fallback((url: string, method: string = 'get', data?: any) => {
      return {
        status: '⚠️ Fallback ejecutado',
        fallbackData: true,
        url,
        method,
        data,
      };
    });

    // 👁️ 3. Eventos útiles para logging
    this.breaker.on('open', () => console.warn('⚠️ Circuito ABIERTO'));
    this.breaker.on('close', () => console.log('✅ Circuito CERRADO'));
    this.breaker.on('halfOpen', () => console.log('🟡 Circuito en prueba'));
  }

  // 🔁 Método que hace la request real (GET o POST)
  private async makeRequest(url: string, method: string = 'get', data?: any, config?: any): Promise<any> {
    if (method.toLowerCase() === 'post') {
      return axios.post(url, data, config);
    }
    return axios.get(url, config);
  }

  // 🔥 Métodos expuestos para GET y POST
  async get(url: string, config?: any) {
    return this.breaker.fire(url, 'get', undefined, config);
  }

  async post(url: string, data?: any, config?: any) {
    return this.breaker.fire(url, 'post', data, config);
  }
}