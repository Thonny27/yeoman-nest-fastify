import { Controller, Get, Query } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('keys')
  async listKeys(@Query('pattern') pattern = '*') {
    const keys = await this.redisService.keys(pattern);
    return {
      message: '🔑 Claves encontradas en Redis',
      total: keys.length,
      keys,
    };
  }
}