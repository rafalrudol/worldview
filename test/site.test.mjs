import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { validate, validateShape, load } from "../src/validate.mjs";
import { build } from "../src/build.mjs";
import { question, model, boards, markdown } from "../src/render.mjs";

const fixture = () => load("data/demo.json");
const estimate = () => ({
  value: 0.5,
  denominator: 40,
  method: "test-only equal question mean",
  provenance: "test-only review",
  uncertainty: {
    low: 0.2,
    high: 0.8,
    level: 0.95,
    method: "test-only interval",
  },
});

test("review boundary rejects private fields, wrong versions, missing consent and unsafe paths", () => {
  for (const edit of [
    (d) => (d.endpoint = "private"),
    (d) => (d.runs[0].apiKey = "secret"),
    (d) => (d.schemaVersion = "2"),
    (d) => delete d.publication.humanConsent,
    (d) => (d.questions[0].id = "../escape"),
    (d) => (d.runs[0].samples.pl[0].usage = { raw: {} }),
    (d) => (d.runs[0].startedAt = "yesterday"),
    (d) => (d.runs[0].id = "main"),
    (d) => (d.questions[0].pl = " "),
    (d) => (d.runs[0].clusters[0].label.en = ""),
  ]) {
    const d = fixture();
    edit(d);
    assert.throws(() => validate(d));
  }
  const d = fixture();
  d.publication.simulated = false;
  assert.throws(() => validateShape(d), /providerTerms/);
  d.publication.providerTerms = "reviewed";
  assert.throws(() => validate(d), /hashes/);
});

test("references, duplicate samples, errors and unknown costs cannot become measured data", () => {
  for (const edit of [
    (d) => (d.runs[0].questionId = "missing"),
    (d) => (d.runs[0].samples.pl[0].clusterId = "unknown"),
    (d) => (d.runs[0].samples.pl[1].repetition = 1),
    (d) => (d.runs[0].samples.en[1].refusal = "evasive"),
    (d) => (d.runs[0].cost.knownSubtotalUsd = 0),
    (d) => (d.runs[0].samples.pl[0].finishReason = "length"),
    (d) => (d.runs[0].metrics.divergence = estimate()),
    (d) =>
      (d.runs[0].metrics.consistency = {
        ...estimate(),
        uncertainty: { low: 0.6, high: 0.8, level: 0.95, method: "bad" },
      }),
  ]) {
    const d = fixture();
    edit(d);
    assert.throws(() => validate(d));
  }
});

test("unjudged runs and unknown versions remain null, without invented annotations", () => {
  const d = fixture(),
    r = d.runs[0];
  r.judgeRunId = null;
  r.judgeProvenance = null;
  r.modelVersion = null;
  r.clusters = [];
  for (const s of [...r.samples.pl, ...r.samples.en]) {
    s.clusterId = null;
    s.refusal = null;
    s.hedging = null;
    s.moralising = null;
  }
  validate(d);
  const html = question(d, d.questions[0], "en");
  assert.match(html, /Not available/);
  assert.ok(!html.includes(">null<"));
  r.metrics.consistency = estimate();
  assert.throws(() => validate(d), /unjudged/);
  r.metrics.consistency = null;
  r.judgeProvenance = "invented";
  assert.throws(() => validate(d), /both be null/);
});

test("question pages preserve independent PL/EN attempts, failures, denominators and missing data", () => {
  const d = fixture(),
    html = question(d, d.questions[0], "en");
  assert.match(html, /2 annotated \/ 2 attempts \/ 20 planned/);
  assert.match(html, /1 annotated \/ 2 attempts \/ 20 planned/);
  assert.match(html, /Synthetic collection failure/);
  assert.match(html, /18\/20/);
  assert.match(html, /Refusal: Not available/);
  assert.match(html, /not translation pairs/);
  assert.match(html, /Known answer cost \(not total cost\): Not available/);
  assert.match(question(d, d.questions[1], "pl"), /Nie opublikowano/);
});

test("history is chronological, links every run, and avoids bogus cluster or drift comparisons", () => {
  const d = fixture(),
    html = model(d, d.models[0], "en");
  assert.ok(html.indexOf("2026-11-04") < html.indexOf("2026-11-05"));
  assert.match(html, /#demo-v1/);
  assert.match(html, /#demo-v2/);
  assert.match(html, /synthetic-1 → synthetic-2/);
  assert.match(html, /Change in attempts PL \/ EN: -1 \/ -1/);
  assert.match(html, /Temporal drift: not computed/);
  assert.match(html, /not compared across independent judge runs/);
  d.runs[0].startedAt = "2026-11-05T01:00:00Z";
  d.runs[1].startedAt = "2026-11-05T02:00:00+02:00";
  validate(d);
  const timezoneHistory = model(d, d.models[0], "en");
  assert.ok(
    timezoneHistory.indexOf("#demo-v2") < timezoneHistory.indexOf("#demo-v1"),
  );
  assert.match(timezoneHistory, /synthetic-2 → synthetic-1/);
  const timezoneQuestion = question(d, d.questions[0], "en");
  assert.ok(
    timezoneQuestion.indexOf('id="demo-v1"') <
      timezoneQuestion.indexOf('id="demo-v2"'),
  );
});

test("all untrusted text is escaped in content, metadata and Markdown", () => {
  const d = fixture(),
    injection = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
  d.questions[0].pl = injection;
  d.runs[0].samples.pl[0].text = injection;
  validate(d);
  const html = question(d, d.questions[0], "pl");
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img "));
  assert.match(html, /&lt;img/);
  assert.match(markdown(injection), /&lt;script&gt;/);
});

function reviewedRanking() {
  const d = fixture();
  d.publication.simulated = false;
  d.publication.providerTerms = "reviewed";
  d.models.push({
    id: "second-model",
    name: "Second test-only model",
    kind: "generative",
  });
  const base = structuredClone(d.runs[0]);
  d.runs = [];
  for (const m of d.models)
    for (const q of d.questions) {
      const r = structuredClone(base);
      r.id = `${m.id}-${q.id}`;
      r.modelId = m.id;
      r.questionId = q.id;
      r.modelVersion = "test-version";
      r.judgeRunId = `judge-${q.id}`;
      r.taskSha256 = { pl: "a".repeat(64), en: "c".repeat(64) };
      r.sourceSha256 = "b".repeat(64);
      for (const lang of ["pl", "en"])
        r.samples[lang] = Array.from({ length: 20 }, (_, i) => ({
          ...base.samples.pl[0],
          repetition: i + 1,
          startedAt: "2026-11-04T12:00:00Z",
          cacheHit: false,
          actualModel: "test-version",
        }));
      r.cost.totalSamples = 40;
      r.metrics.consistency = estimate();
      d.runs.push(r);
    }
  d.leaderboards = [
    {
      metric: "consistency",
      taskVersion: "worldview-v1",
      questionIds: d.questions.map((q) => q.id),
      method: { pl: "Metoda testowa", en: "Test-only method" },
      caveats: { pl: "Test", en: "Test-only caveat" },
      entries: d.models.map((m) => ({
        modelId: m.id,
        runIds: d.runs.filter((r) => r.modelId === m.id).map((r) => r.id),
        tieGroup: 1,
        estimate: { ...estimate(), denominator: d.questions.length },
      })),
    },
  ];
  return d;
}

test("reviewed leaderboards show intervals, ties and caveats; synthetic/incomplete/classifier rankings fail closed", () => {
  const d = reviewedRanking();
  d.runs[2].clusters = d.runs[2].clusters
    .reverse()
    .map((c) => ({ label: { en: c.label.en, pl: c.label.pl }, id: c.id }));
  validate(d);
  const html = boards(d, "en");
  assert.match(html, /0.2–0.8/);
  assert.match(html, /tie groups/);
  assert.match(html, /Test-only caveat/);
  for (const edit of [
    (x) => (x.publication.simulated = true),
    (x) => (x.leaderboards[0].entries[0].estimate.uncertainty = null),
    (x) => x.runs[0].samples.en.pop(),
    (x) => (x.models[0].kind = "classifier"),
    (x) => (x.runs[0].samples.pl[0].cacheHit = null),
    (x) => (x.runs[0].judgeRunId = "independent"),
    (x) => (x.runs[0].taskSha256.en = "d".repeat(64)),
    (x) => (x.runs[0].modelVersion = null),
    (x) => (x.runs[0].samples.pl[0].startedAt = null),
    (x) => (x.leaderboards[0].entries[0].estimate.denominator = 40),
    (x) => (x.leaderboards[0].entries[0].estimate.uncertainty.method = " "),
    (x) => {
      for (const r of x.runs)
        for (const s of [...r.samples.pl, ...r.samples.en]) s.text = " \n\t";
    },
    (x) => (x.runs[0].samples.pl[0].text = null),
  ]) {
    const bad = structuredClone(d);
    edit(bad);
    assert.throws(() => validate(bad));
  }
  assert.match(boards(fixture(), "en"), /Rankings withheld/);
});

test("static build includes bilingual routes, intact links/anchors, PNG OG cards, downloads and safe headers", async () => {
  const temp = await mkdtemp(join(tmpdir(), "worldview-")),
    out = join(temp, "dist");
  try {
    const result = await build({ out, origin: "https://preview.example.test" });
    assert.equal(result.pages, 17);
    assert.equal(result.simulated, true);
    async function walk(dir) {
      const entries = await readdir(dir, { withFileTypes: true });
      return (
        await Promise.all(
          entries.map((e) =>
            e.isDirectory() ? walk(join(dir, e.name)) : join(dir, e.name),
          ),
        )
      ).flat();
    }
    const files = await walk(out),
      htmlFiles = files.filter((f) => f.endsWith(".html"));
    for (const file of htmlFiles) {
      const html = await readFile(file, "utf8");
      assert.match(html, /<html lang="(pl|en)">/);
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
      assert.ok(!/<script\b/i.test(html));
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length);
      for (const [, href] of html.matchAll(/href="([^"#]*(?:#[^"]*)?)"/g)) {
        if (!href.startsWith("/")) continue;
        const [path, anchor] = href.split("#"),
          target = join(out, path.endsWith("/") ? path + "index.html" : path);
        assert.ok((await stat(target)).isFile(), `${file}: ${href}`);
        if (anchor)
          assert.ok(
            (await readFile(target, "utf8")).includes(`id="${anchor}"`),
          );
      }
      if (
        file.includes("/questions/") ||
        file.includes("/models/demo-model/")
      ) {
        assert.match(
          html,
          /og:image" content="https:\/\/preview.example.test\/og\//,
        );
        assert.match(html, /SYNTHETIC|SYNTETYCZNE/);
      }
    }
    const cards = files.filter((f) => f.endsWith(".png"));
    assert.equal(cards.length, 8);
    for (const file of cards) {
      const png = await readFile(file);
      assert.deepEqual(
        [...png.subarray(0, 8)],
        [137, 80, 78, 71, 13, 10, 26, 10],
      );
      assert.equal(png.readUInt32BE(16), 1200);
      assert.equal(png.readUInt32BE(20), 630);
      const length = png.readUInt32BE(33);
      assert.equal(
        inflateSync(png.subarray(41, 41 + length)).length,
        630 * 3601,
      );
    }
    assert.match(
      await readFile(join(out, "_headers"), "utf8"),
      /default-src 'none'/,
    );
    assert.deepEqual(
      JSON.parse(await readFile(join(out, "results.json"))),
      fixture(),
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("workflow rebuilds committed JSON and never deploys production or uses PR secrets", async () => {
  const workflow = await readFile(".github/workflows/build.yml", "utf8");
  assert.match(workflow, /data\/\*\*/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /npm run check/);
  assert.ok(
    !/pull_request_target|secrets\.|--prod|pages\/deploy|workflow_dispatch/.test(
      workflow,
    ),
  );
  const pkg = JSON.parse(await readFile("package.json"));
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0);
  assert.equal(Object.keys(pkg.devDependencies ?? {}).length, 0);
});
