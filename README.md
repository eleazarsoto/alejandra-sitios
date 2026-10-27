# Sitios de Psic. Alejandra García Franco

Tres sitios estáticos (HTML, CSS y JS sin compilación), publicados con Cloudflare Pages.

| Carpeta | Dominio | Proyecto en Cloudflare Pages |
|---|---|---|
| `principal/` | alejandraconsultora.com · www | alejandra-principal |
| `empresas/` | empresas.alejandraconsultora.com | alejandra-empresas |
| `psicoeducale/` | psicoeducale.alejandraconsultora.com | alejandra-psicoeducale |

## Configuración en Cloudflare (Workers con archivos estáticos)

Cada sitio es un proyecto de Workers conectado a este repositorio, con su propio archivo de configuración:

| Proyecto | Deploy command | Preview command |
|---|---|---|
| alejandra-principal | `npx wrangler deploy --config wrangler.principal.jsonc` | `npx wrangler versions upload --config wrangler.principal.jsonc` |
| alejandra-empresas | `npx wrangler deploy --config wrangler.empresas.jsonc` | `npx wrangler versions upload --config wrangler.empresas.jsonc` |
| alejandra-psicoeducale | `npx wrangler deploy --config wrangler.psicoeducale.jsonc` | `npx wrangler versions upload --config wrangler.psicoeducale.jsonc` |

Build command: vacío. El nombre del proyecto debe coincidir con `name` en su archivo `wrangler.*.jsonc`.

Cada carpeta lleva su propia copia de `motion.js` y `motion.css` (motor de animaciones).

## Pendientes

- Cédula profesional en `principal/index.html` (Formación).
- Constancia DC-3 en `empresas/index.html` (comentario PENDIENTE en Método).

Sitio realizado por Oráculo Analytics · https://oraculoanalytics.com
