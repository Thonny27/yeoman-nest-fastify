const fs = require('fs');
const path = require('path');

function generateRealControllersFromServices(servicesPath, controllersPath, serviceFiles, log = () => {}) {
  // Remove dist folder if exists in the parent project directory
  const projectRoot = path.resolve(controllersPath, '../../..');
  const distPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    log('🧹 Removed dist folder to avoid confusion.');
  }
  serviceFiles.forEach(file => {
    const name = path.basename(file, '.ts');
    const controllerName = name.replace('.service', '');
    // Convert to PascalCase and remove dot: pet.service -> PetService
    const serviceClassName = name
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    const importService = `import { ${serviceClassName} } from '../services/${controllerName}.service';`;

    const servicePath = path.join(servicesPath, file);
    const serviceContent = fs.readFileSync(servicePath, 'utf8');


    // Extraer métodos públicos y sus parámetros, evitando duplicados por nombre
    const methodWithParamsRegex = /public ([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
    let match;
    const methodMap = new Map();
    while ((match = methodWithParamsRegex.exec(serviceContent)) !== null) {
      const methodName = match[1];
      if (methodName !== 'constructor' && !methodMap.has(methodName)) {
        // Extraer nombres de parámetros
        const paramsRaw = match[2].trim();
        let paramNames = [];
        if (paramsRaw.length > 0) {
          paramNames = paramsRaw.split(',').map(p => {
            // Soporta: nombre: tipo, nombre?: tipo, nombre = valor, ...nombre: tipo
            const nameMatch = p.match(/([a-zA-Z0-9_]+)\s*[:=?]/) || p.match(/([a-zA-Z0-9_]+)\s*$/);
            return nameMatch ? nameMatch[1] : 'param';
          });
        }
        methodMap.set(methodName, paramNames);
      }
    }

    let methodsCode = '';
    const reserved = new Set(['body', 'query', 'params', 'param', 'request', 'req', 'res', 'next']);
    for (const [name, paramNames] of methodMap.entries()) {
      // Evitar parámetros duplicados con los decoradores estándar
      const filteredParamNames = paramNames.filter(p => !reserved.has(p.toLowerCase()));
      const args = filteredParamNames.map(p => `${p}: any`).join(', ');
      const callArgs = paramNames.join(', ');
      methodsCode += `\n  @Get('${name}')\n  async ${name}(@Query() query: any, @Body() body: any${args ? ', ' + args : ''}) {\n    // TODO: Map parameters correctly\n    return this.service.${name}(${callArgs});\n  }\n`;
    }

    const content = `import { Controller, Get, Post, Body, Query } from '@nestjs/common';\n${importService}\n\n@Controller('${controllerName}')\nexport class ${controllerName.charAt(0).toUpperCase() + controllerName.slice(1)}Controller {\n  constructor(private readonly service: ${serviceClassName}) {}\n${methodsCode}\n}\n`;
    const controllerFilePath = path.join(controllersPath, `${controllerName}.controller.ts`);
    fs.writeFileSync(controllerFilePath, content);
    log(`📄 Real controller generated: ${controllerName}.controller.ts`);
  });
  log(`✅ Real controllers generated: ${serviceFiles.length} files`);
}

module.exports = generateRealControllersFromServices;
