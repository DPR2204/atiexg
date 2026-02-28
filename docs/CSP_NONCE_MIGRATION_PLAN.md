# Plan de migración: CSP `unsafe-inline` → Nonces

## Estado actual (`vercel.json`)

```
script-src 'self' 'unsafe-inline' https://vercel.live
style-src  'self' 'unsafe-inline' https://fonts.googleapis.com
```

`unsafe-inline` permite que cualquier script/estilo inline se ejecute, lo cual debilita la protección CSP contra XSS.

---

## Objetivo

Reemplazar `'unsafe-inline'` con **nonces criptográficos** por request, manteniendo compatibilidad con Vite, React y Tailwind.

---

## Fase 1 — Auditoría de inline scripts/styles (1-2 días)

1. Buscar todos los `<script>` y `<style>` inline en `index.html`.
2. Identificar scripts inline generados por Vite en producción (chunks, preload hints).
3. Verificar si Tailwind genera `<style>` inline en runtime (normalmente no — genera archivos CSS).
4. Listar dependencias que inyectan inline styles (ej: `gsap`, `lenis`, `react-leaflet`).

**Resultado esperado**: Lista completa de dependencias de `unsafe-inline`.

---

## Fase 2 — Implementar Vercel Edge Middleware para nonces (2-3 días)

Vercel no soporta nonces en `vercel.json` (headers estáticos). Se necesita un Edge Middleware.

### Crear `middleware.ts` en la raíz del proyecto:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generar nonce criptográfico único por request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Construir CSP con nonce
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://vercel.live`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com https://vercel.live",
    "img-src 'self' https://res.cloudinary.com https://static.wixstatic.com data: blob:",
    "media-src 'self' https://res.cloudinary.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.recurrente.com wss://ws-us3.pusher.com",
    "frame-src https://vercel.live",
  ].join('; ');

  const response = NextResponse.next();

  // Inyectar nonce como header para que el HTML template lo use
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);

  return response;
}
```

> **Nota**: Esto requiere migrar de headers estáticos en `vercel.json` a un Edge Middleware.
> Vercel Edge Functions corren en Cloudflare Workers y no añaden latencia significativa.

> **Alternativa para Vite (sin Next.js)**: Usar una Vercel Serverless Function como middleware
> o usar `vite-plugin-csp` para inyectar nonces en build time con `'strict-dynamic'`.

---

## Fase 3 — Adaptar el HTML template (1 día)

Modificar `index.html` para usar el nonce en scripts inline:

```html
<!-- Vite inyecta scripts con nonce automáticamente si se configura -->
<script nonce="__CSP_NONCE__" type="module" src="/index.tsx"></script>
```

El Edge Middleware reemplaza `__CSP_NONCE__` con el nonce real en cada request.

---

## Fase 4 — Eliminar inline styles de dependencias (2-3 días)

1. **gsap/lenis**: Mover animaciones a clases CSS o usar `style-src 'unsafe-inline'` temporalmente solo para styles (menor riesgo que scripts).
2. **react-leaflet**: Extraer estilos a un archivo CSS externo.
3. **Tailwind**: Ya genera CSS externo — sin cambios necesarios.

**Estrategia incremental**:
- Primero eliminar `'unsafe-inline'` de `script-src` (mayor impacto en seguridad).
- Después eliminar de `style-src` (menor riesgo, más trabajo por dependencias).

---

## Fase 5 — Considerar `strict-dynamic` (alternativa simplificada)

En lugar de nonces manuales, se puede usar:

```
script-src 'strict-dynamic' 'nonce-{random}';
```

Con `strict-dynamic`:
- Solo el script raíz necesita el nonce.
- Scripts cargados dinámicamente por ese script raíz heredan la confianza.
- Simplifica enormemente la migración para SPAs como esta.

---

## Cronograma estimado

| Fase | Esfuerzo | Prioridad |
|------|----------|-----------|
| 1. Auditoría | 1-2 días | Alta |
| 2. Edge Middleware | 2-3 días | Alta |
| 3. HTML template | 1 día | Alta |
| 4. Inline styles | 2-3 días | Media |
| 5. strict-dynamic | 1 día | Alternativa a 2-4 |

**Total**: ~5-8 días de desarrollo.

---

## Riesgo de no migrar

- `unsafe-inline` en `script-src` permite ejecución de scripts inyectados por XSS.
- Con RLS y validación de input (DOMPurify ya está en dependencias), el riesgo práctico es **medio**.
- La migración a nonces es una mejora de defensa-en-profundidad, no una emergencia.

---

## Referencia

- [MDN: CSP nonce](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#nonce)
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware)
- [strict-dynamic explainer](https://web.dev/strict-csp/)
