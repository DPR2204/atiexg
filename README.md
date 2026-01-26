<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dXFC0cVllhtpFtxdPBZCKDO3ILBQ1UOk

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## SEO, indexación y sitemap

### Generar/actualizar sitemap
1. Ejecuta: `npm run sitemap`
2. El archivo se genera en `public/sitemap.xml` y se copia a `dist/` al hacer build.

### Ver sitemap localmente
1. Ejecuta `npm run build` y luego `npm run preview`.
2. Abre `http://localhost:4173/sitemap.xml`.

### Verificar indexación en Google
- Usa Search Console y solicita indexación de:
  - `https://atitlanexperience.com/`
  - `https://atitlanexperience.com/catalogo`
  - `https://atitlanexperience.com/conocenos`
  - `https://atitlanexperience.com/contacto`
  - `https://atitlanexperience.com/experiencias/<slug>`
- Verifica robots y sitemap:
  - `https://atitlanexperience.com/robots.txt`
  - `https://atitlanexperience.com/sitemap.xml`

### Checklist SEO (no visual)
- ✅ Títulos y descripciones únicos por página.
- ✅ Canonical correcto y hreflang `es-419`.
- ✅ Open Graph + Twitter Cards.
- ✅ JSON-LD: Organization/LocalBusiness, WebSite, y TouristTrip por experiencia.
- ✅ Robots.txt y sitemap.xml configurados.
- ✅ Contenido SSR/SSG (HTML pre-renderizado en build).

### Ejemplos de títulos y metas (ES)
- Inicio:
  - Title: “Atitlán Experiences | Tours premium en Lago Atitlán”
  - Description: “Experiencias premium en el Lago Atitlán: tours curados, hospitalidad bilingüe y logística sin fricciones.”
- Catálogo:
  - Title: “Catálogo de experiencias premium en Lago Atitlán”
  - Description: “Explora el catálogo de experiencias premium: tours culturales, aventura, gastronomía y bienestar.”
- Conócenos:
  - Title: “Conócenos | Atitlán Experiences”
  - Description: “Conoce al equipo detrás de Atitlán Experiences: hospitalidad local y curaduría premium.”
- Contacto:
  - Title: “Contacto | Atitlán Experiences”
  - Description: “Habla con nuestro equipo para planificar tours privados y experiencias gastronómicas.”
