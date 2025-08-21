
# ads-microservice-template-nodejs



Generador de microservicios Node.js con NestJS + Fastify + OpenAPI

Este generador crea una estructura de microservicio basada en NestJS con Fastify, integrando DTOs y controllers desde un archivo OpenAPI. Está diseñado para Node.js 22.

---

## 🧩 Estructura Generada

```
<application>-<service>/
├── src/
│   ├── controllers/
│   │   └── <openapi-generated>.controller.ts
│   ├── modules/
│   │   └── <service>/
│   │       ├── controllers/
│   │       ├── dto/
│   │       ├── <service>.module.ts
│   │       └── <service>.service.ts
│   └── database/
│       └── entities/
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── .jest.config
└── package.json
```

---

## 🚀 Requisitos

- Node.js 22.x ✅
- Java 17+ para usar OpenAPI Generator CLI (`.jar`)
- Tener instalado Yeoman (`npm install -g yo`)
- Tener instalado OpenAPI Generator CLI local o global

---

## ⚙️ Instalación del Generador

```bash
git clone <tu-repo>
cd ads-microservice-template-nodejs
npm install
npm link
```

---

## 🛠️ Uso del Generador

```bash
yo ads-microservice-template-nodejs --application=<nombre-app> --service=<nombre-servicio> --openapi=<ruta-o-url-openapi>
```

Donde:
- `<nombre-app>`: nombre de tu aplicación (ejemplo: miapp)
- `<nombre-servicio>`: nombre del microservicio (ejemplo: pet)
- `<ruta-o-url-openapi>`: ruta local o URL del archivo OpenAPI (ejemplo: ./pet-api.yaml o https://petstore3.swagger.io/api/v3/openapi.json)

Este comando hará lo siguiente:

1. Copia la plantilla base y renombra los archivos con base en los argumentos.
2. Si se proporciona `--openapi`, usará OpenAPI Generator CLI con `controllerStrategy=tags`.
3. Genera y copia automáticamente:
   - Todos los DTOs (`models/`)
   - Todos los controllers (`controllers/`)
4. Limpia los archivos temporales generados.

---

## 🧪 Verificación


Una vez generado el proyecto, asegúrate de levantar los servicios necesarios con Docker Compose antes de iniciar la app. Esto levantará los contenedores de MySQL y Redis:

```bash
cd miapp-pet
docker-compose up -d   # Levanta MySQL, Redis y otros servicios definidos
npm install
npm run start:dev
```

---


## 📦 Buenas Prácticas Incluidas

- `.editorconfig` + `.prettierrc`: Estilo de código coherente.
- `.gitignore`: Ignora lo que no va al repo.
- `.eslintrc`: Lint básico para mantener calidad.

---
