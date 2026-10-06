// Monta uma folha de contato com imagens lado a lado (uso interno para revisar peças).
// Uso: node scripts/sheet.mjs <saida.jpg> <altura> <img1> <img2> ...
import sharp from "sharp";
import fs from "node:fs";
const [, , out, h, ...files] = process.argv;
const H = +h;
let x = 0;
const comps = [];
for (const f of files) {
  const b = await sharp(fs.readFileSync(f)).resize({ height: H }).toBuffer({ resolveWithObject: true });
  comps.push({ input: b.data, left: x, top: 0 });
  x += b.info.width + 8;
}
await sharp({ create: { width: x, height: H, channels: 3, background: "#111" } }).composite(comps).jpeg({ quality: 72 }).toBuffer().then((b) => fs.writeFileSync(out, b));
console.log("ok", out, x);
