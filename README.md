# Villa Kebo

## Proyecto final para la materia
Tecnologías de Desarrollo en el Servidor, P2024

## Encuéntralo en Render como
https://villakebo.onrender.com

## Cómo correr el proyecto
Después de descargar o clonar la carpeta raíz, instalar las librerías necesarias (`package-lock.json`) con:
```
npm install
```
Si hay problemas con la versión de node, instalar la v16.20.1 o la que indique el campo "required" de npm.

Crear un archivo `.env` en la raíz del proyecto con las variables indicadas en el `.envTemplate`, sustituyéndolas por lo indicado en el campo.

Primero, se debe crear un build con:
```
npm run build
```

**Importante**: si se cuenta con un SO sobre UNIX, utilizar ``` npm run build:unix ```. Este comando también es necesario para desplegar el proyecto en plataformas de hosting.

Después, correr el proyecto con
```
npm start
```

O en modo dev:
```
npm run dev
```

