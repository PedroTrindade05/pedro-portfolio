// Gera versões reduzidas (-sm.webp) das peças gráficas para grades e leque; o visualizador usa as originais.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const jobs = [
  ["public/design/adrena", /^page-\d+\.webp$/, 640],
  ["public/design/feirao-g10", /^(feed|count-feed)-.+\.webp$/, 560],
  ["public/design/feirao-g10", /^(story|count-story)-.+\.webp$/, 480],
];
for (const [dir, re, w] of jobs) {
  for (const f of fs.readdirSync(dir)) {
    if (!re.test(f) || f.includes("-sm")) continue;
    const out = path.join(dir, f.replace(".webp", "-sm.webp"));
    const buf = await sharp(fs.readFileSync(path.join(dir, f))).resize({ width: w }).webp({ quality: 80 }).toBuffer();
    fs.writeFileSync(out, buf);
  }
}
console.log("ok");
