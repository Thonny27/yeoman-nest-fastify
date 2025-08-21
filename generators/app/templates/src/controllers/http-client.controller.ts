
import { Controller, Get, Body, Post } from '@nestjs/common';
import { CircuitBreakerService } from '../../../common/circuit-breaker/circuit-breaker.service';
import * as http from 'http';
import * as https from 'https';
import { appHttpConfig } from '../../../config/app-http.config';

const httpAgent = new http.Agent(appHttpConfig.httpClient.httpAgent);
const httpsAgent = new https.Agent(appHttpConfig.httpClient.httpsAgent);

import { ApiResponse } from '../interfaces/api-response.interface';
import { CustomRequest } from '../interfaces/custom-request.interface';

@Controller('http-client')
export class HttpClientController {
  constructor(private readonly circuitBreaker: CircuitBreakerService) {}

  // Ejemplo de orquestación, composición y agregación
  @Get('agregado')

  async orquestar(): Promise<ApiResponse> {
    const start = Date.now();
    const path = '/http-client/agregado';
    const errors: Array<{ key?: string; message: string; detail?: any }> = [];
    let uuidRes, getRes, postResults;
    try {
      // 1. Orquestación: primero obtener uuid
      uuidRes = await this.safeRequest({
        url: 'https://httpbin.org/uuid',
        method: 'get',
      });
      if (uuidRes.error) errors.push({ key: 'uuid', message: uuidRes.error });

      // 2. Composición: usar uuid en el siguiente GET
      getRes = await this.safeRequest({
        url: 'https://httpbin.org/get?uuid=' + encodeURIComponent(uuidRes?.data?.uuid || ''),
        method: 'get',
      });
      if (getRes.error) errors.push({ key: 'get', message: getRes.error });

      // 3. Agregación: hacer dos POST en paralelo y agregar los resultados
      const postEndpoints = [
        { key: 'post1', url: 'https://httpbin.org/post', method: 'post', data: { foo: 'bar', uuid: uuidRes?.data?.uuid } },
        { key: 'post2', url: 'https://httpbin.org/post', method: 'post', data: { hello: 'world', uuid: uuidRes?.data?.uuid } },
      ];
      postResults = await Promise.all(
        postEndpoints.map(({ url, method, data, key }) => this.safeRequest({ url, method: method as 'get' | 'post', data }))
      );
      postResults.forEach((res, idx) => {
        if (res.error) errors.push({ key: postEndpoints[idx].key, message: res.error });
      });

      // Cocinar la data: solo exponer lo relevante y estructurado
      const cookedData = {
        uuid: uuidRes.data?.uuid || null,
        get: getRes.data?.args || null,
        post1: postResults[0].data?.json || null,
        post2: postResults[1].data?.json || null,
      };

      return {
        success: errors.length === 0,
        timestamp: new Date().toISOString(),
        path,
        data: cookedData,
        meta: {
          durationMs: Date.now() - start,
          orchestrated: true,
          composed: true,
          aggregated: true,
        },
        errors,
      };
    } catch (error) {
      errors.push({ message: error instanceof Error ? error.message : String(error) });
      return {
        success: false,
        timestamp: new Date().toISOString(),
        path,
        data: {},
        meta: { durationMs: Date.now() - start },
        errors,
      };
    }
  }

  // Endpoint POST para recibir requests customizadas
  @Post('custom')

  async customOrchestration(@Body() body: CustomRequest): Promise<ApiResponse> {
    const start = Date.now();
    const path = '/http-client/custom';
    const errors: Array<{ key?: string; message: string; detail?: any }> = [];
    if (!body.endpoints || !Array.isArray(body.endpoints)) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        path,
        data: {},
        meta: { durationMs: Date.now() - start },
        errors: [{ message: 'Invalid endpoints array' }],
      };
    }
    // Performance: llamadas en paralelo
    const results = await Promise.all(
      body.endpoints.map(async ({ url, method, data, key }) => {
        const res = await this.safeRequest({ url, method, data });
        if (res.error) errors.push({ key, message: res.error });
        // Cocinar la data: solo exponer el json o data relevante
        return [key, res.data?.json ?? res.data ?? null];
      })
    );
    return {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      path,
      data: Object.fromEntries(results),
      meta: { durationMs: Date.now() - start, parallel: true, aggregated: true },
      errors,
    };
  }

  // Utilidad para requests performantes y con timeout
  private async safeRequest(endpoint: { url: string; method: 'get' | 'post'; data?: any }): Promise<{ data: any; error?: any }> {
    try {
      const config = {
        httpAgent,
        httpsAgent,
        headers: appHttpConfig.httpClient.headers,
        timeout: appHttpConfig.httpClient.timeout,
      };
      let res;
      if (endpoint.method === 'get') {
        res = await this.circuitBreaker.get(endpoint.url, config);
      } else {
        res = await this.circuitBreaker.post(endpoint.url, endpoint.data, config);
      }
      // Si la respuesta es un objeto de error
      if (res && typeof res === 'object' && 'error' in res) {
        return { data: null, error: (res as any).error };
      }
      // axios responses: { data, ... }
      if (res && typeof res === 'object' && 'data' in res) {
        return { data: (res as any).data };
      }
      return { data: res };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : String(e) };
    }
  }
}
