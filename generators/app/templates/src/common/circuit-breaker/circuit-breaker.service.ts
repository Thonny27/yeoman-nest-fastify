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
    this.breaker.fallback((url: string) => {
      return {
        status: '⚠️ Fallback ejecutado',
        fallbackData: true,
        url,
      };
    });

    // 👁️ 3. Eventos útiles para logging
    this.breaker.on('open', () => console.warn('⚠️ Circuito ABIERTO'));
    this.breaker.on('close', () => console.log('✅ Circuito CERRADO'));
    this.breaker.on('halfOpen', () => console.log('🟡 Circuito en prueba'));
  }

  // 🔁 Método que hace la request real
  private async makeRequest(url: string, config?: any): Promise<any> {
    return axios.get(url, config);
  }

  // 🔥 Método expuesto
  async get(url: string, config?: any) {
    return this.breaker.fire(url, config);
  }
}