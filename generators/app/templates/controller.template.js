// Template para generar controllers básicos desde OpenAPI
module.exports = (controllerName, serviceName) => {
  return `import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';

@Controller('${controllerName}')
export class ${controllerName.charAt(0).toUpperCase() + controllerName.slice(1)}Controller {
  
  @Get()
  findAll(@Query() query: any) {
    return { message: 'Implement logic here', service: '${serviceName}' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: 'Implement logic here', id };
  }

  @Post()
  create(@Body() data: any) {
    return { message: 'Implement logic here', data };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return { message: 'Implement logic here', id, data };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: 'Implement logic here', id };
  }
}`;
};
