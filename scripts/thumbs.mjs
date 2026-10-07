// Gera as versões leves das capas dos projetos a partir de cada cover.webp:
//  thumb.webp (960x600): listas, miniaturas e "próximo projeto"
//  rail.webp (1280x800): textura da vitrine 3D (a capa grande só entra no card ativo)
// Uso: node scripts/thumbs.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve("public/work");
for (const slug of fs.readdirSync(root)) {
  const cover = path.join(root, slug, "cover.webp");
  if (!fs.existsSync(cover)) continue;
  const src = fs.readFileSync(cover);
  const thumb = await sharp(src).resize(960, 600, { fit: "cover", position: "top" }).webp({ quality: 80 }).toBuffer();
  const rail = await sharp(src).resize(1280, 800, { fit: "cover", position: "top" }).webp({ quality: 76 }).toBuffer();
  fs.writeFileSync(path.join(root, slug, "thumb.webp"), thumb);
  fs.writeFileSync(path.join(root, slug, "rail.webp"), rail);
  console.log(slug, `thumb ${Math.round(thumb.length / 1024)}KB`, `rail ${Math.round(rail.length / 1024)}KB`, `cover ${Math.round(src.length / 1024)}KB`);
}
