// HEAD-checks every image URL in src/config/media.json. Exits 1 if any is not a 200 image.
import { readFileSync } from "node:fs";

const media = JSON.parse(readFileSync(new URL("../src/config/media.json", import.meta.url), "utf8"));

const urls = [];
(function walk(node) {
  if (Array.isArray(node)) node.forEach(walk);
  else if (node && typeof node === "object") {
    if (typeof node.src === "string") urls.push(node.src);
    Object.values(node).forEach(walk);
  }
})(media);

let failed = 0;
for (const url of urls) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    if (res.status !== 200 || !type.startsWith("image/")) throw new Error(`${res.status} ${type}`);
    console.log(`ok    ${url}`);
  } catch (err) {
    failed++;
    console.error(`FAIL  ${url}  (${err.message})`);
  }
}
console.log(`${urls.length - failed}/${urls.length} images reachable`);
process.exit(failed ? 1 : 0);
