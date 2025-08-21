import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as http from 'http';
import * as https from 'https';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

type Endpoint = {
  key: string;
  url: string;
  method: 'get' | 'post';
  data?: any;
};

@Controller('http-client')
export class HttpClientController {
  constructor(private readonly http: HttpService) {}

  @Get('agregado')
  async orquestar(): Promise<Record<string, any>> {
    const endpoints: Endpoint[] = [
      { key: 'get', url: 'https://httpbin.org/get', method: 'get' },
      { key: 'uuid', url: 'https://httpbin.org/uuid', method: 'get' },
      { key: 'post1', url: 'https://httpbin.org/post', method: 'post', data: { foo: 'bar' } },
      { key: 'post2', url: 'https://httpbin.org/post', method: 'post', data: { hello: 'world' } },
    ];

    const results = await Promise.all(
      endpoints.map(async ({ key, url, method, data }) => {
        try {
          const res = method === 'get'
            ? await firstValueFrom(this.http.get(url, { httpAgent, httpsAgent, headers: { 'Accept': 'application/json' }, timeout: 2000 }))
            : await firstValueFrom(this.http.post(url, data, { httpAgent, httpsAgent, headers: { 'Accept': 'application/json' }, timeout: 2000 }));
          return [key, res.data];
        } catch (e) {
          return [key, { error: 'timeout or error', detail: (e instanceof Error ? e.message : String(e)) }];
        }
      })
    );

    return Object.fromEntries(results);
  }
}
