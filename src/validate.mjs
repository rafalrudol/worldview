import { readFileSync } from "node:fs";

export const schema = JSON.parse(
  readFileSync(new URL("../schema/public-1.0.0.json", import.meta.url)),
);
const fail = (path, message) => {
  throw new Error(`${path}: ${message}`);
};

// Implements only the keywords used by our pinned schema. Unknown keywords fail closed.
const supported = new Set([
  "$schema",
  "title",
  "description",
  "$defs",
  "$ref",
  "type",
  "const",
  "enum",
  "required",
  "properties",
  "additionalProperties",
  "items",
  "minItems",
  "maxItems",
  "minLength",
  "maxLength",
  "pattern",
  "format",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "if",
  "then",
]);
export function validateShape(value, rule = schema, path = "$") {
  for (const keyword of Object.keys(rule))
    if (!supported.has(keyword))
      fail(path, `unsupported schema keyword ${keyword}`);
  if (rule.$ref)
    return validateShape(
      value,
      schema.$defs[rule.$ref.split("/").at(-1)],
      path,
    );
  if ("const" in rule && value !== rule.const)
    fail(path, "unexpected constant");
  if (rule.enum && !rule.enum.includes(value)) fail(path, "invalid enum");
  if (rule.if) {
    let matches = true;
    try {
      validateShape(value, rule.if, path);
    } catch {
      matches = false;
    }
    if (matches && rule.then) validateShape(value, rule.then, path);
  }
  const type =
    value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  const types = Array.isArray(rule.type) ? rule.type : [rule.type];
  if (
    rule.type &&
    !types.some(
      (t) => t === type || (t === "integer" && Number.isInteger(value)),
    )
  )
    fail(path, "invalid type");
  if (type === "number") {
    if (!Number.isFinite(value)) fail(path, "non-finite number");
    if (
      (rule.minimum !== undefined && value < rule.minimum) ||
      (rule.maximum !== undefined && value > rule.maximum) ||
      (rule.exclusiveMinimum !== undefined && value <= rule.exclusiveMinimum) ||
      (rule.exclusiveMaximum !== undefined && value >= rule.exclusiveMaximum)
    )
      fail(path, "number outside bounds");
  }
  if (type === "string") {
    if (
      (rule.minLength !== undefined && [...value].length < rule.minLength) ||
      (rule.maxLength !== undefined && [...value].length > rule.maxLength)
    )
      fail(path, "string length");
    if (rule.pattern && !new RegExp(rule.pattern).test(value))
      fail(path, "invalid pattern");
    if (
      rule.format === "date-time" &&
      (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(
        value,
      ) ||
        Number.isNaN(Date.parse(value)))
    )
      fail(path, "invalid timestamp");
  }
  if (type === "array") {
    if (
      (rule.minItems !== undefined && value.length < rule.minItems) ||
      (rule.maxItems !== undefined && value.length > rule.maxItems)
    )
      fail(path, "array length");
    value.forEach((v, i) => validateShape(v, rule.items, `${path}[${i}]`));
  }
  if (type === "object") {
    for (const key of rule.required ?? [])
      if (!Object.hasOwn(value, key)) fail(path, `missing ${key}`);
    for (const [key, v] of Object.entries(value)) {
      if (Object.hasOwn(rule.properties ?? {}, key))
        validateShape(v, rule.properties[key], `${path}.${key}`);
      else if (rule.additionalProperties === false)
        fail(path, `unknown field ${key}`);
    }
  }
  return value;
}

function unique(values, path) {
  if (new Set(values).size !== values.length) fail(path, "duplicate identity");
}
function estimate(e, path, intervalRequired = false) {
  if (!e) {
    if (intervalRequired) fail(path, "estimate required");
    return;
  }
  const u = e.uncertainty;
  if (intervalRequired && !u) fail(path, "uncertainty required for rankings");
  if (u && !(u.low <= e.value && e.value <= u.high))
    fail(path, "interval must contain estimate");
  if (!e.method.trim() || !e.provenance.trim())
    fail(path, "method and provenance required");
}

export function validate(data) {
  validateShape(data);
  for (const key of ["questions", "models", "runs"])
    unique(
      data[key].map((x) => x.id),
      key,
    );
  unique(
    data.leaderboards.map((x) => x.metric),
    "leaderboards",
  );
  if (
    !data.publication.simulated &&
    data.publication.providerTerms !== "reviewed"
  )
    fail("publication", "live data requires provider terms review");
  if (data.publication.simulated && data.leaderboards.length)
    fail("leaderboards", "synthetic rankings prohibited");
  for (const r of data.runs) {
    if (
      !data.questions.some((q) => q.id === r.questionId) ||
      !data.models.some((m) => m.id === r.modelId)
    )
      fail(r.id, "unknown question/model");
    if (data.models.find((m) => m.id === r.modelId).kind !== "generative")
      fail(r.id, "classifiers cannot be generative respondents");
    if ((r.judgeRunId === null) !== (r.judgeProvenance === null))
      fail(r.id, "judge identity and provenance must both be null or present");
    if (
      r.judgeRunId === null &&
      (r.clusters.length || Object.values(r.metrics).some((e) => e !== null))
    )
      fail(r.id, "unjudged runs cannot have clusters or computed metrics");
    if (
      !data.publication.simulated &&
      (!r.taskSha256.pl || !r.taskSha256.en || !r.sourceSha256)
    )
      fail(r.id, "live source/task hashes required");
    unique(
      r.clusters.map((c) => c.id),
      r.id,
    );
    for (const lang of ["pl", "en"]) {
      unique(
        r.samples[lang].map((s) => s.repetition),
        `${r.id}.${lang}`,
      );
      for (const s of r.samples[lang]) {
        if (!data.publication.simulated && s.startedAt === null)
          fail(r.id, "live attempts require timestamps");
        if (s.status === "error" ? !s.error?.trim() : s.error !== null)
          fail(r.id, "inconsistent sanitized error");
        if (
          s.clusterId !== null &&
          !r.clusters.some((c) => c.id === s.clusterId)
        )
          fail(r.id, "unknown local cluster");
        if (
          s.status === "error" &&
          (s.text !== null ||
            s.clusterId !== null ||
            s.refusal !== null ||
            s.hedging !== null ||
            s.moralising !== null)
        )
          fail(r.id, "errors cannot be annotated answers");
        if (
          s.clusterId !== null &&
          (s.text === null ||
            s.refusal === null ||
            s.hedging === null ||
            s.moralising === null)
        )
          fail(r.id, "partial annotation");
        if (
          s.clusterId === null &&
          [s.refusal, s.hedging, s.moralising].some((x) => x !== null)
        )
          fail(r.id, "unannotated samples require null labels");
        if (
          s.clusterId !== null &&
          !["stop", "end_turn"].includes(s.finishReason)
        )
          fail(r.id, "truncated/non-final answers cannot be annotated");
      }
    }
    if (
      r.cost.totalSamples !== r.samples.pl.length + r.samples.en.length ||
      r.cost.knownSamples > r.cost.totalSamples ||
      (r.cost.knownSamples === 0) !== (r.cost.knownSubtotalUsd === null)
    )
      fail(r.id, "invalid cost coverage");
    for (const [key, e] of Object.entries(r.metrics)) {
      estimate(e, `${r.id}.${key}`);
      const annotated = [...r.samples.pl, ...r.samples.en].filter(
        (s) => s.clusterId !== null,
      ).length;
      if (e && e.denominator !== annotated)
        fail(
          r.id,
          "metric denominator must count annotated attempts across both languages",
        );
    }
    if (
      r.metrics.divergence &&
      !["pl", "en"].every(
        (l) =>
          r.samples[l].length === 20 &&
          r.samples[l].every((s) => s.status === "ok" && s.clusterId !== null),
      )
    )
      fail(r.id, "JSD requires 20+20 annotated samples");
    // Same codebook scope must mean the same labels, even across models.
    for (const other of data.runs.filter(
      (x) =>
        x !== r &&
        x.questionId === r.questionId &&
        x.judgeRunId === r.judgeRunId,
    )) {
      if (
        JSON.stringify(
          [...other.clusters].sort((a, b) => a.id.localeCompare(b.id)),
        ) !==
        JSON.stringify([...r.clusters].sort((a, b) => a.id.localeCompare(b.id)))
      )
        fail(r.id, "conflicting shared cluster codebook");
    }
  }
  for (const b of data.leaderboards) {
    unique(b.questionIds, b.metric);
    unique(
      b.entries.map((e) => e.modelId),
      b.metric,
    );
    for (const entry of b.entries) {
      if (
        !data.models.some(
          (m) => m.id === entry.modelId && m.kind === "generative",
        )
      )
        fail(b.metric, "classifier or unknown model in ranking");
      estimate(entry.estimate, b.metric, true);
      if (entry.estimate.denominator !== b.questionIds.length)
        fail(
          b.metric,
          "board denominator must count equally weighted questions",
        );
      unique(entry.runIds, b.metric);
      const runs = entry.runIds.map((id) => data.runs.find((r) => r.id === id));
      if (
        runs.some(
          (r) =>
            !r ||
            r.modelId !== entry.modelId ||
            r.taskVersion !== b.taskVersion ||
            !b.questionIds.includes(r.questionId),
        )
      )
        fail(b.metric, "invalid ranking provenance");
      if (
        runs.length !== b.questionIds.length ||
        new Set(runs.map((r) => r.questionId)).size !== b.questionIds.length
      )
        fail(b.metric, "unequal question coverage");
      if (
        runs.some(
          (r) =>
            !r.metrics[b.metric] ||
            !["pl", "en"].every(
              (l) =>
                r.samples[l].length === 20 &&
                r.samples[l].every(
                  (s) =>
                    s.status === "ok" &&
                    s.clusterId !== null &&
                    s.cacheHit === false &&
                    s.actualModel !== null,
                ),
            ),
        )
      )
        fail(b.metric, "incomplete or routing/cache-unknown ranking cells");
      if (
        runs.some((r) => r.modelVersion === null) ||
        new Set(runs.map((r) => r.modelVersion)).size !== 1
      )
        fail(b.metric, "unknown or mixed model versions");
    }
    for (const q of b.questionIds) {
      const runs = b.entries
        .flatMap((e) =>
          e.runIds.map((id) => data.runs.find((r) => r.id === id)),
        )
        .filter((r) => r.questionId === q);
      if (
        new Set(runs.map((r) => r.judgeRunId)).size !== 1 ||
        new Set(runs.map((r) => r.taskSha256.pl)).size !== 1 ||
        new Set(runs.map((r) => r.taskSha256.en)).size !== 1
      )
        fail(b.metric, "ranking requires shared question/codebook");
    }
  }
  return data;
}

export function load(path) {
  const raw = readFileSync(path, "utf8");
  if (Buffer.byteLength(raw) > 20 * 1024 * 1024)
    throw new Error("Public bundle exceeds 20 MiB");
  return validate(JSON.parse(raw));
}
