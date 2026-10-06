// Gera miniaturas (thumb.webp 960x600) das capas dos projetos para a prévia WebGL e listas.
// Uso: node scripts/thumbs.mjs  (precisa do sharp disponível via NODE_PATH)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve("public/work");
for (const slug of fs.readdirSync(root)) {
  const cover = path.join(root, slug, "cover.webp");
  if (!fs.existsSync(cover)) continue;
  const out = path.join(root, slug, "thumb.webp");
  await sharp(cover).resize(960, 600, { fit: "cover", position: "top" }).webp({ quality: 80 }).toFile(out);
  console.log("thumb", slug);
}
