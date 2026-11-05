import { readFile, writeFile, mkdir, rm, copyFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "./validate.mjs";
import {
  layout,
  home,
  question,
  model,
  boards,
  words,
  esc,
  markdown,
} from "./render.mjs";
import { ogPng } from "./og.mjs";

export async function build({
  input = "data/demo.json",
  out = "dist",
  origin = "",
} = {}) {
  const data = load(input);
  if (origin) {
    const url = new URL(origin);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error("SITE_URL must be an HTTPS origin");
    origin = url.origin;
  }
  // Never delete an arbitrary caller-supplied directory.
  if (
    resolve(out) === resolve(".") ||
    !["dist", "site"].includes(resolve(out).split("/").at(-1))
  )
    throw new Error("Output must end with dist or site");
  await rm(out, { recursive: true, force: true });
  async function emit(path, value) {
    const target = resolve(out, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, value);
  }
  await emit(
    "style.css",
    await readFile(new URL("./style.css", import.meta.url)),
  );
  await emit("results.json", JSON.stringify(data, null, 2) + "\n");
  await emit(
    "schema/public-1.0.0.json",
    await readFile(new URL("../schema/public-1.0.0.json", import.meta.url)),
  );
  await emit(
    "index.html",
    '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Worldview — PL / EN</title><link rel="stylesheet" href="/style.css"></head><body><main><h1>Worldview</h1><p><a href="/pl/" lang="pl">Polski</a> / <a href="/en/" lang="en">English</a></p></main></body></html>',
  );
  let pages = 1;
  for (const lang of ["pl", "en"]) {
    const t = words(lang);
    async function page(path, title, content, card = false) {
      const og = card
        ? `/og/${lang}/${path.replace(/\/$/, "").replaceAll("/", "-") || "index"}.png`
        : "";
      if (og)
        await emit(og.slice(1), ogPng(title, data.publication.simulated, lang));
      await emit(
        `${lang}/${path}index.html`,
        layout({ lang, path, title, content, data, origin, og }),
      );
      pages++;
    }
    await page("", t.title, home(data, lang), true);
    for (const q of data.questions)
      await page(`questions/${q.id}/`, q[lang], question(data, q, lang), true);
    await page(
      "models/",
      t.models,
      `<h1>${t.models}</h1><ul>${data.models.map((m) => `<li><a href="/${lang}/models/${m.id}/">${esc(m.name)}</a> · ${esc(m.kind)}</li>`).join("")}</ul>`,
    );
    for (const m of data.models)
      await page(`models/${m.id}/`, m.name, model(data, m, lang), true);
    await page("leaderboards/", t.boards, boards(data, lang));
    for (const section of ["method", "changelog"])
      await page(
        `${section}/`,
        section === "method" ? t.method : t.journal,
        markdown(
          await readFile(
            new URL(`../content/${section}.${lang}.md`, import.meta.url),
            "utf8",
          ),
        ),
      );
  }
  await emit(
    "404.html",
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 · Worldview</title></head><body><main><h1>404</h1><p>Nie znaleziono / Not found</p><a href="/pl/">Polski</a> / <a href="/en/">English</a></main></body></html>',
  );
  await emit("robots.txt", "User-agent: *\nDisallow: /\n");
  await copyFile(
    new URL("../public/_headers", import.meta.url),
    resolve(out, "_headers"),
  );
  return {
    pages,
    questions: data.questions.length,
    runs: data.runs.length,
    simulated: data.publication.simulated,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  console.log(
    JSON.stringify(
      await build({
        input: process.env.RESULTS_FILE || "data/demo.json",
        origin: process.env.SITE_URL || "",
      }),
    ),
  );
}
