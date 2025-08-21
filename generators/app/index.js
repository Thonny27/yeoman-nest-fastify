const Generator = require('yeoman-generator');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const controllerTemplate = require('./templates/controller.template.js');
const generateRealControllersFromServices = require('./generateRealControllersFromServices');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('application', { type: String });
    this.option('service', { type: String });
    this.option('version', {
      type: String,
      description: 'Versión del artefacto/proyecto',
      default: '1.0.0'
    });
    this.option('openapi', {
      type: String,
      description: 'Ruta o URL del archivo OpenAPI',
      default: ''
    });
  }

  async prompting() {
    this.answers = {
      application: this.options.application || 'demo',
      service: this.options.service || 'default',
      version: this.options.version || '1.0.0',
    };
  }

  async writing() {
    const { application, service, version } = this.answers;
    const serviceClass = service.charAt(0).toUpperCase() + service.slice(1);
    const destRoot = `${application}-${service}`;
    const { openapi } = this.options;

    // Copiar template base
    this.fs.copyTpl(
      this.templatePath(),
      this.destinationPath(destRoot),
      { application, service, serviceClass, version, openapi }
    );

    [
      '.env',
      '.gitignore',
      '.prettierrc',
      '.editorconfig',
      '.eslintrc.json',
      'README.md',
      'jest.config.js',
    ].forEach(file => {
      this.fs.copy(
        this.templatePath(file),
        this.destinationPath(path.join(destRoot, file))
      );
    });

    // Crear carpetas controllers y services dentro del módulo
    const moduleControllersPath = path.join(destRoot, `src/modules/${service}/controllers`);
    const moduleServicesPath = path.join(destRoot, `src/modules/${service}/services`);
    fs.mkdirSync(moduleControllersPath, { recursive: true });
    fs.mkdirSync(moduleServicesPath, { recursive: true });

    // Crear carpeta de interfaces dentro del módulo
    const moduleInterfacesPath = path.join(destRoot, `src/modules/${service}/interfaces`);
    fs.mkdirSync(moduleInterfacesPath, { recursive: true });

    // Copiar interfaces base al módulo desde la plantilla
    const interfaceFilesToCopy = [
      { src: 'src/interfaces/api-response.interface.ts', dest: `src/modules/${service}/interfaces/api-response.interface.ts` },
      { src: 'src/interfaces/custom-request.interface.ts', dest: `src/modules/${service}/interfaces/custom-request.interface.ts` },
    ];
    interfaceFilesToCopy.forEach(file => {
      this.fs.copy(
        this.templatePath(file.src),
        this.destinationPath(path.join(destRoot, file.dest))
      );
    });

    // Esperar a que los archivos sean procesados por Yeoman antes de moverlos
    this.fs.commit(() => {
      // Definir controllers base a mover (sin incluir __service__.controller.ts si hay OpenAPI)
      const controllersToMove = [
        { src: `src/controllers/oauth.controller.ts`, dest: 'oauth.controller.ts' },
        { src: `src/controllers/redis.controller.ts`, dest: 'redis.controller.ts' },
        { src: `src/controllers/user.controller.ts`, dest: 'userDb.controller.ts' },
        { src: `src/controllers/http-client.controller.ts`, dest: 'http-client.controller.ts' }
      ];

      // Solo agregar el controller base del servicio si NO hay OpenAPI
      if (!openapi) {
        controllersToMove.push({
          src: `src/controllers/__service__.controller.ts`,
          dest: `${service}.controller.ts`
        });
      }

      controllersToMove.forEach(controller => {
        const srcPath = path.join(destRoot, controller.src);
        const destPath = path.join(moduleControllersPath, controller.dest);

        if (fs.existsSync(srcPath)) {
          if (fs.existsSync(destPath)) {
            fs.unlinkSync(srcPath);
            return;
          }
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.renameSync(srcPath, destPath);
        }
      });

      // Limpiar archivos no utilizados cuando hay OpenAPI
      if (openapi) {
        const unusedServiceController = path.join(destRoot, `src/controllers/__service__.controller.ts`);
        if (fs.existsSync(unusedServiceController)) {
          fs.unlinkSync(unusedServiceController);
        }
      }

      // Eliminar carpeta global de controllers si está vacía
      const globalControllersPath = path.join(destRoot, 'src/controllers');
      if (fs.existsSync(globalControllersPath)) {
        const remainingFiles = fs.readdirSync(globalControllersPath);
        if (remainingFiles.length === 0) {
          fs.rmSync(globalControllersPath, { recursive: true, force: true });
        }
      }
    });

    // Renombrar archivos base
    const filesToRename = [
      {
        src: `src/modules/user/__service__.module.ts`,
        dest: `src/modules/${service}/${service}.module.ts`
      },
      {
        src: `src/modules/user/__service__.service.ts`,
        dest: `src/modules/${service}/services/${service}Db.service.ts` // Renombrar a petDb.service.ts
      },
      {
        src: `src/modules/example/dto/create-user.dto.ts`,
        dest: `src/modules/${service}/model/${service}Db.ts` // Renombrar a petDb.ts para evitar conflicto
      },
      {
        src: `src/database/entities/user.entity.ts`,
        dest: `src/database/entities/${service}.entity.ts`
      }
    ];

    filesToRename.forEach(file => {
      this.fs.move(
        this.destinationPath(`${destRoot}/${file.src}`),
        this.destinationPath(`${destRoot}/${file.dest}`)
      );
    });

    // ==========================
    // OpenAPI Generator CLI
    // ==========================
    if (openapi) {
      try {
        const generator = 'typescript-nestjs';
        const outputDir = this.destinationPath(`${destRoot}/__openapi-temp__`);
        const modulePath = this.destinationPath(`${destRoot}/src/modules/${service}`);

        this.log(`🚀 Running OpenAPI Generator CLI with npx...`);

        execSync(
          `npx @openapitools/openapi-generator-cli generate -i "${openapi}" -g ${generator} -o "${outputDir}" --additional-properties=controllerStrategy=tags`,
          { stdio: 'inherit' }
        );

        // Copiar TODO tal como viene de OpenAPI Generator usando fs directo
        const fse = require('fs-extra');

        fse.copySync(
          path.join(outputDir, 'model'),
          path.join(modulePath, 'model')
        );

        fse.copySync(
          path.join(outputDir, 'api'),
          path.join(modulePath, 'services')
        );

        // Copiar archivos de configuración y variables al nivel del módulo
        const configFiles = ['configuration.ts','app-http.config.ts', 'variables.ts'];
        configFiles.forEach(file => {
          const srcFile = path.join(outputDir, file);
          const destFile = path.join(modulePath, file);
          if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        });

        // Eliminar api.ts innecesario de services/
        const apiFile = path.join(modulePath, 'services', 'api.ts');
        if (fs.existsSync(apiFile)) {
          fs.unlinkSync(apiFile);
        }

        // Eliminar carpeta temporal
        fs.rmSync(outputDir, { recursive: true, force: true });

        // Crear controllers básicos después de que los archivos estén copiados
        this.createControllers(modulePath, service);

        this.log(`✅ Project generated with OpenAPI successfully`);
        this.log(`🎯 HTTP services are ready to use`);
        this.log(`📦 OpenAPI dependencies will be installed automatically with postinstall`);
      } catch (err) {
        this.log('❌ Error running OpenAPI Generator:', err.message);
      }
    }

    this.log(`✨ Project generated in '${destRoot}' with modular structure and OpenAPI support.`);
  }

  createControllers(modulePath, serviceName) {
    if (!modulePath) return;
    if (!fs.existsSync(modulePath)) return;
    const servicesPath = path.join(modulePath, 'services');
    if (!fs.existsSync(servicesPath)) return;
    const controllersPath = path.join(modulePath, 'controllers');
    if (!fs.existsSync(controllersPath)) {
      fs.mkdirSync(controllersPath, { recursive: true });
    }
    // Buscar archivos de servicios generados por OpenAPI (excluir archivos de configuración)
    const serviceFiles = fs.readdirSync(servicesPath).filter(f =>
      f.endsWith('.ts') &&
      !f.includes('configuration') &&
      !f.includes('variables') &&
      !f.includes('index') &&
      !f.includes('api.') &&
      f.includes('.service')
    );
    if (serviceFiles.length === 0) return;
    generateRealControllersFromServices(servicesPath, controllersPath, serviceFiles, this.log.bind(this));
  }

};
