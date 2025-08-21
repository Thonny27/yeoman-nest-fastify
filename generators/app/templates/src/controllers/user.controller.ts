import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('usersDb')
export class UserDbController {
  constructor() {}

  @Post()
  create(@Body() dto: any) {
    return { message: 'UserDb controller - implement logic here', dto };
  }

  @Get()
  findAll() {
    return { message: 'UserDb controller - implement logic here' };
  }
}