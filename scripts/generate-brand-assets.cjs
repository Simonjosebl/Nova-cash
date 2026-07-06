/**
 * Genera todos los activos de marca de Nova Cash a partir del logo original.
 *
 * Fuente:  assets/brand/source/Logo_NovaCash.jpeg
 * Salidas: assets/brand/**, assets/capacitor/**, public/**, src/shared/assets/**
 *
 * Requisitos (dev):  npm i -D sharp png-to-ico
 * Uso:               node scripts/generate-brand-assets.cjs
 *
 * Nota: el color navy (#0a2045) y el recorte (box) fueron detectados desde el
 * arte original. Si cambias el logo, reejecuta el análisis (ver docs/branding).
 */
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default || require('png-to-ico');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/brand/source/logo_NovaCash.png');
const box = { left: 111, top: 12, width: 1092, height: 1156 }; // recorte del icono redondeado
const navy = { r: 1, g: 21, b: 63 }; // #01153f (fondo real del icono)
const navyDark = { r: 1, g: 14, b: 42 };
const RADIUS_RATIO = 0.2237; // superelipse estilo iOS

const P = (...p) => path.join(ROOT, ...p);
const ensure = (d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
};
const written = [];
const save = async (buf, ...rel) => {
  const f = P(...rel);
  ensure(path.dirname(f));
  await sharp(buf).toFile(f);
  written.push(rel.join('/'));
};

(async () => {
  const S = 1024,
    R = Math.round(S * RADIUS_RATIO);
  // Cuadrar el bbox rellenando el lado menor con navy (el fondo del icono es navy → sin costura).
  const dw = Math.max(0, box.height - box.width);
  const dh = Math.max(0, box.width - box.height);
  // Pasada 1: recortar + aplanar transparencia + padear a cuadrado.
  // (sharp aplica .extend() DESPUÉS de .resize() en un mismo pipeline, así que se separa en dos pasadas.)
  const squared = await sharp(SRC)
    .extract(box)
    .flatten({ background: navy }) // transparencia exterior/esquinas → navy
    .extend({
      left: Math.floor(dw / 2),
      right: dw - Math.floor(dw / 2),
      top: Math.floor(dh / 2),
      bottom: dh - Math.floor(dh / 2),
      background: navy,
    })
    .png()
    .toBuffer();
  // Pasada 2: escalar el cuadrado al master de 1024. Opaco, full-bleed.
  const master = await sharp(squared).resize(S, S, { fit: 'fill' }).png().toBuffer();
  const maskSvg = Buffer.from(
    `<svg width="${S}" height="${S}"><rect width="${S}" height="${S}" rx="${R}" ry="${R}"/></svg>`,
  );
  const rounded = await sharp(master)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer(); // transparente
  const round = async (size) => {
    const r = Math.round(size * RADIUS_RATIO);
    const m = Buffer.from(
      `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`,
    );
    return sharp(rounded)
      .resize(size, size)
      .composite([{ input: m, blend: 'dest-in' }])
      .png()
      .toBuffer();
  };

  // Brand masters
  await save(master, 'assets/brand/icon/icon-master-1024.png');
  await save(await round(512), 'assets/brand/favicon/favicon-512.png');
  for (const s of [1024, 512, 256, 128, 64])
    await save(await round(s), 'assets/brand/logo/png', `logo-${s}.png`);

  // Capacitor (@capacitor/assets)
  await save(master, 'assets/capacitor/icon-only.png');
  const splashLogo = await sharp(master).resize(1100, 1100).png().toBuffer();
  const mkSplash = (bg) =>
    sharp({ create: { width: 2732, height: 2732, channels: 3, background: bg } })
      .composite([{ input: splashLogo, gravity: 'center' }])
      .png()
      .toBuffer();
  await save(await mkSplash(navy), 'assets/capacitor/splash.png');
  await save(await mkSplash(navyDark), 'assets/capacitor/splash-dark.png');

  // Web / public
  await save(await round(16), 'public/favicon-16x16.png');
  await save(await round(32), 'public/favicon-32x32.png');
  ensure(P('public'));
  await sharp(master).resize(180, 180).toFile(P('public/apple-touch-icon.png'));
  written.push('public/apple-touch-icon.png');
  await save(await round(192), 'public/icon-192.png');
  await sharp(master).resize(512, 512).toFile(P('public/icon-512-maskable.png'));
  written.push('public/icon-512-maskable.png');
  await save(await round(512), 'public/icon-512.png');
  fs.writeFileSync(
    P('public/favicon.ico'),
    await pngToIco(await Promise.all([16, 32, 48].map(round))),
  );
  written.push('public/favicon.ico');

  // In-app logo
  await save(await round(512), 'src/shared/assets/logo.png');
  await save(await round(256), 'src/shared/assets/logo@2x.png');
  await save(await round(128), 'src/shared/assets/logo@1x.png');

  console.log(`OK — ${written.length} activos generados:`);
  written.forEach((w) => console.log('  ' + w));
})();
