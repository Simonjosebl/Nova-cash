/**
 * Genera los íconos de la app (navegador, Apple, PWA) y la marca de la barra lateral
 * a partir del logo "N con flecha" (fondo transparente).
 *
 * Fuente:  assets/brand/source/logo-mark.png
 * Salidas: public/favicon*.{ico,png}, public/apple-touch-icon.png, public/icon-*.png,
 *          src/shared/assets/logo-mark.png
 *
 * Requisitos (dev):  sharp, png-to-ico
 * Uso:               node scripts/generate-app-icons.cjs
 */
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default || require('png-to-ico');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'assets/brand/source/logo-mark.png');
const PUBLIC = path.join(ROOT, 'public');
const NAVY = { r: 15, g: 23, b: 42, alpha: 1 }; // Nova Navy #0F172A
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

/** Logo recortado a su contenido y centrado en un cuadrado con margen (`padding` 0–0.5). */
async function square(size, { padding, background }) {
  const inner = Math.round(size * (1 - padding * 2));
  const mark = await sharp(SOURCE)
    .trim({ threshold: 20 })
    .resize(inner, inner, { fit: 'contain', background: CLEAR })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function write(file, buffer) {
  fs.writeFileSync(file, buffer);
  console.log('✓', path.relative(ROOT, file));
}

async function main() {
  const transparent = { padding: 0.04, background: CLEAR };

  // Pestaña del navegador
  const f16 = await square(16, { padding: 0, background: CLEAR });
  const f32 = await square(32, { padding: 0.02, background: CLEAR });
  const f48 = await square(48, { padding: 0.03, background: CLEAR });
  await write(path.join(PUBLIC, 'favicon-16x16.png'), f16);
  await write(path.join(PUBLIC, 'favicon-32x32.png'), f32);
  await write(path.join(PUBLIC, 'favicon.ico'), await pngToIco([f16, f32, f48]));

  // iOS (sin transparencia) y PWA
  await write(
    path.join(PUBLIC, 'apple-touch-icon.png'),
    await square(180, { padding: 0.14, background: NAVY }),
  );
  await write(path.join(PUBLIC, 'icon-192.png'), await square(192, transparent));
  await write(path.join(PUBLIC, 'icon-512.png'), await square(512, transparent));
  // Maskable: el contenido debe caber en el 80 % central (zona segura).
  await write(
    path.join(PUBLIC, 'icon-512-maskable.png'),
    await square(512, { padding: 0.2, background: NAVY }),
  );

  // Marca para la barra lateral: recortada a su forma real (sin aire arriba/abajo) para
  // alinearse con el texto "NovaCash". 3x de 32 px para pantallas retina.
  await write(
    path.join(ROOT, 'src/shared/assets/logo-mark.png'),
    await sharp(SOURCE).trim({ threshold: 20 }).resize({ height: 96 }).png().toBuffer(),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
