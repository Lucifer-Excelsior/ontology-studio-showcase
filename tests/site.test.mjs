import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? filesUnder(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}

test("build produces the three public surfaces and disables Jekyll processing", () => {
  for (const file of ["index.html", "tutorial/index.html", "demo/index.html", "assets/styles.css", "assets/site.js", ".nojekyll"]) {
    assert.equal(existsSync(resolve(dist, file)), true, `${file} should exist`);
  }
});

test("pages have accessible document landmarks and no credential collection", async () => {
  const pages = (await filesUnder(dist)).filter((file) => extname(file) === ".html");
  assert.equal(pages.length, 3);
  for (const page of pages) {
    const html = await readFile(page, "utf8");
    assert.match(html, /<html lang="zh-CN"/);
    assert.match(html, /<a class="skip-link" href="#main">/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.doesNotMatch(html, /type=["']password["']/i);
  }
});

test("static showcase contains no backend calls or absolute deployment paths", async () => {
  const files = await filesUnder(dist);
  for (const file of files.filter((candidate) => /\.(?:html|js|css)$/.test(candidate))) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
    assert.doesNotMatch(content, /https?:\/\/8\.160\.181\.3/);
    assert.doesNotMatch(content, /(?:href|src)=["']\/(?!\/)/);
  }
});

test("public artifact contains no institutional attribution", async () => {
  const decode = (points) => String.fromCodePoint(...points);
  const forbiddenAttributions = [
    [67, 65, 73, 67, 84],
    [20013, 22269, 20449, 36890, 38498],
    [20013, 22269, 20449, 24687, 36890, 20449, 30740, 31350, 38498],
    [20449, 36890, 38498],
  ].map(decode);
  const files = await filesUnder(dist);
  for (const file of files.filter((candidate) => /\.(?:html|js|css|md|json|svg)$/.test(candidate))) {
    const content = await readFile(file, "utf8");
    for (const attribution of forbiddenAttributions) assert.equal(content.toLowerCase().includes(attribution.toLowerCase()), false);
  }
});

test("all local HTML links and assets resolve inside the Pages artifact", async () => {
  const pages = (await filesUnder(dist)).filter((file) => extname(file) === ".html");
  for (const page of pages) {
    const html = await readFile(page, "utf8");
    const references = [...html.matchAll(/(?:href|src)=["']([^"'#]+)(?:#[^"']*)?["']/g)].map((match) => match[1]);
    for (const reference of references) {
      if (/^(?:https?:|mailto:|tel:|data:)/.test(reference)) continue;
      const target = resolve(dirname(page), reference);
      const resolved = reference.endsWith("/") ? resolve(target, "index.html") : target;
      assert.equal(existsSync(resolved), true, `${reference} referenced by ${page} should resolve`);
    }
  }
});

test("demo clearly states its non-production boundary", async () => {
  const demo = await readFile(resolve(dist, "demo/index.html"), "utf8");
  assert.match(demo, /不上传文件/);
  assert.match(demo, /不调用模型/);
  assert.match(demo, /非 ITU 正式结论/);
});
