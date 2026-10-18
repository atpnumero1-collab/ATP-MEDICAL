# Guía de Despliegue en Vercel — ATP MEDICAL

Este proyecto está 100% preparado y optimizado para ser desplegado en **Vercel** de manera automática.

---

## Archivos de Configuración Incluidos

1. **`vercel.json`**:
   - Define el framework como **Vite**.
   - Comando de instalación: `npm install --legacy-peer-deps` (evita conflictos de peer dependencies).
   - Comando de compilación: `npm run build`.
   - Carpeta de salida: `dist`.
   - Reglas de reescritura (`rewrites`) para soportar enrutamiento Single Page Application (SPA).

2. **`.npmrc`**:
   - Configurado con `legacy-peer-deps=true` para garantizar que la instalación de dependencias en Vercel y entornos de CI/CD sea 100% limpia sin errores de ERESOLVE.

---

## Métodos de Despliegue

### Opción 1: Despliegue mediante GitHub (Recomendado)

1. **Sube este repositorio a GitHub**:
   ```bash
   git add .
   git commit -m "Preparar proyecto para despliegue en Vercel"
   git push origin main
   ```

2. **Inicia sesión en Vercel**:
   - Entra en [vercel.com](https://vercel.com) con tu cuenta.
   - Haz clic en **"Add New..."** → **"Project"**.

3. **Importa el repositorio**:
   - Selecciona tu repositorio de GitHub.
   - Vercel detectará automáticamente la configuración desde `vercel.json`:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

4. **Haz clic en "Deploy"**:
   - En menos de 1 minuto tendrás tu enlace de producción HTTPS (ejemplo: `atp-medical.vercel.app`).
   - Cada cambio que hagas en `main` se desplegará de forma automática con CI/CD.

---

### Opción 2: Despliegue mediante Vercel CLI (Línea de comandos)

1. Instala Vercel CLI globalmente (si no lo tienes):
   ```bash
   npm i -g vercel
   ```

2. En la raíz del proyecto ejecuta:
   ```bash
   vercel
   ```

3. Sigue las instrucciones interactivas en pantalla:
   - ¿Set up and deploy? **Y**
   - ¿Which scope? (tu cuenta)
   - ¿Link to existing project? **N**
   - ¿Project name? `atp-medical`
   - ¿In which directory is your code located? `./`

4. Para desplegar a producción:
   ```bash
   vercel --prod
   ```

---

## Características Listas para Producción
- **PWA Ready**: Carga ultrarrápida con assets optimizados por Vite.
- **Tailwind CSS v4**: Compilación sin overhead de CSS en tiempo de ejecución.
- **LocalStorage Persistente**: Mantiene los tickets, citas y médicos de ATP Medical Caracas en el navegador del usuario.
- **Estándar SPA**: Todas las rutas recargan limpiamente sin dar error 404 gracias a `vercel.json`.
