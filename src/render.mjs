export const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const copy = {
  pl: {
    questions: "Pytania",
    models: "Modele",
    boards: "Zestawienia",
    method: "Metoda",
    journal: "Dziennik zmian",
    unknown: "Brak danych",
    synthetic: "DANE SYNTETYCZNE — nie są wynikami prawdziwego modelu",
    live: "Dane po przeglądzie publikacyjnym",
    title: "Różne odpowiedzi. Te same pytania.",
    intro:
      "Atlas odpowiedzi modeli na pytania bez jednej poprawnej odpowiedzi. Nie test prawdy ani ranking dobrego światopoglądu.",
    empty: "Nie opublikowano jeszcze wyników dla tego pytania.",
    samples: "Wszystkie próby",
    history: "Historia wersji",
    diff: "Zmiana względem poprzedniego pomiaru",
    noRank:
      "Ranking wstrzymany: brak porównywalnych wyników z przedziałami niepewności. Przykłady syntetyczne nigdy nie są klasyfikowane.",
    note: "PL i EN to niezależne próby, nie pary tłumaczeń. Identyfikatory klastrów są lokalne dla pytania i przebiegu oceny.",
    coverage: "Pokrycie",
    consistency: "Powtarzalność",
    evasiveness: "Unikające odmowy",
    divergence: "Rozbieżność PL/EN",
    drift: "Dryf czasowy",
    missing: "Nie wykonano",
    errors: "Błędy",
    unannotated: "Bez oceny",
    annotated: "ocenionych",
    attempted: "prób",
    plan: "planowanych",
    refusal: "Odmowa",
    hedging: "Zastrzeżenia",
    moralising: "Moralizowanie",
    none: "brak",
    justified: "uzasadniona",
    evasive: "unikająca",
    unclear: "niejasna",
    warranted: "uzasadnione",
    yes: "tak",
    no: "nie",
    temperature: "Temperatura domyślna nieznana",
    cost: "Znany koszt odpowiedzi (nie suma całkowita)",
    judge: "Koszt oceny",
    download: "Publiczny JSON",
    schema: "Schemat eksportu",
    skip: "Przejdź do treści",
    version: "Wersja",
    answer: "Odpowiedź",
    cluster: "Klaster",
    count: "Liczba",
    previous: "Poprzedni",
    current: "Obecny",
    scope:
      "Nie porównujemy lokalnych klastrów między niezależnymi ocenami. Zmiana tekstu nie jest miarą dryfu.",
    review: "Publikacja",
    model: "Model",
    provenance: "Pochodzenie oceny",
    interval: "Przedział",
    denominator: "Mianownik",
    notComputed: "nie obliczono",
    attemptsChange: "Zmiana liczby prób PL / EN",
    detail: "Szczegóły techniczne",
  },
  en: {
    questions: "Questions",
    models: "Models",
    boards: "Comparisons",
    method: "Method",
    journal: "Editorial log",
    unknown: "Not available",
    synthetic: "SYNTHETIC DATA — not results from a real model",
    live: "Publication-reviewed data",
    title: "Different answers. Same questions.",
    intro:
      "An atlas of model answers to questions without one correct answer. Not a truth test or a contest for the best worldview.",
    empty: "No results have been published for this question yet.",
    samples: "All attempts",
    history: "Version history",
    diff: "Change from previous observation",
    noRank:
      "Rankings withheld: no comparable results with uncertainty intervals. Synthetic examples are never ranked.",
    note: "PL and EN are independent samples, not translation pairs. Cluster IDs are local to a question and judge run.",
    coverage: "Coverage",
    consistency: "Repeatability",
    evasiveness: "Evasive refusals",
    divergence: "PL/EN divergence",
    drift: "Temporal drift",
    missing: "Not attempted",
    errors: "Errors",
    unannotated: "Unannotated",
    annotated: "annotated",
    attempted: "attempts",
    plan: "planned",
    refusal: "Refusal",
    hedging: "Hedging",
    moralising: "Moralising",
    none: "none",
    justified: "justified",
    evasive: "evasive",
    unclear: "unclear",
    warranted: "warranted",
    yes: "yes",
    no: "no",
    temperature: "Default temperature unknown",
    cost: "Known answer cost (not total cost)",
    judge: "Judge cost",
    download: "Public JSON",
    schema: "Export schema",
    skip: "Skip to content",
    version: "Version",
    answer: "Answer",
    cluster: "Cluster",
    count: "Count",
    previous: "Previous",
    current: "Current",
    scope:
      "Local clusters are not compared across independent judge runs. A text change is not a drift estimate.",
    review: "Publication",
    model: "Model",
    provenance: "Judge provenance",
    interval: "Interval",
    denominator: "Denominator",
    notComputed: "not computed",
    attemptsChange: "Change in attempts PL / EN",
    detail: "Technical details",
  },
};
export const words = (lang) => copy[lang];
const link = (href, text, attrs = "") =>
  `<a href="${esc(href)}" ${attrs}>${esc(text)}</a>`;
const fmt = (x) => Number(x.toFixed(4)).toLocaleString("en");

export function metric(e, t) {
  if (!e) return esc(t.notComputed);
  return `${fmt(e.value)} · n=${e.denominator}<br>${esc(t.interval)}: ${e.uncertainty ? `${fmt(e.uncertainty.low)}–${fmt(e.uncertainty.high)} (${fmt(e.uncertainty.level * 100)}%; ${esc(e.uncertainty.method)})` : esc(t.unknown)}<br>${esc(e.method)}<br>${esc(e.provenance)}`;
}

export function layout({
  lang,
  path = "",
  title,
  content,
  data,
  origin = "",
  og = "",
}) {
  const t = words(lang),
    other = lang === "pl" ? "en" : "pl";
  const canonical = origin ? `${origin}/${lang}/${path}` : "";
  const desc = data.publication.simulated ? t.synthetic : t.intro;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · Worldview</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="noindex,nofollow"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="${lang === "pl" ? "pl_PL" : "en_GB"}">${canonical ? `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">` : ""}${og ? `<meta property="og:image" content="${esc(origin + og)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(desc + ": " + title)}"><meta name="twitter:card" content="summary_large_image">` : ""}<link rel="alternate" hreflang="${other}" href="${esc(origin + "/" + other + "/" + path)}"><link rel="stylesheet" href="/style.css"></head><body><a class="skip" href="#main">${t.skip}</a><header><a class="brand" href="/${lang}/">Worldview<span class="brand-dot" aria-hidden="true">●</span></a><nav aria-label="${lang === "pl" ? "Nawigacja główna" : "Main navigation"}">${[
    ["", t.questions],
    ["models/", t.models],
    ["leaderboards/", t.boards],
    ["method/", t.method],
    ["changelog/", t.journal],
  ]
    .map(([p, label]) =>
      link(`/${lang}/${p}`, label, path === p ? 'aria-current="page"' : ""),
    )
    .join(
      "",
    )}</nav><a class="language" href="/${other}/${esc(path)}" lang="${other}" hreflang="${other}">${other.toUpperCase()}</a></header><main id="main"><p class="notice">${esc(desc)}</p>${content}</main><footer><p>${esc(t.intro)}</p><div>${link("/results.json", t.download)} ${link("/schema/public-1.0.0.json", t.schema)} ${link(`/${lang}/method/`, t.method)}</div><p>Worldview · ${esc(data.publication.license)} · ${esc(t.review)} ${esc(data.publication.reviewedAt.slice(0, 10))}</p></footer></body></html>`;
}

export function home(data, lang) {
  const t = words(lang);
  return `<section class="hero"><p class="eyebrow">Worldview / ${esc(lang === "pl" ? "Atlas odpowiedzi" : "An answer atlas")}</p><h1>${t.title}</h1><p class="lede">${t.intro}</p><p>${data.questions.length} ${t.questions.toLowerCase()} · ${data.models.length} ${t.models.toLowerCase()} · ${data.runs.length} ${lang === "pl" ? "pomiarów" : "observations"}</p></section><section><h2>${t.questions}</h2><ol class="index">${data.questions.map((q) => `<li><span class="eyebrow">${esc(q.topic)} / ${esc(q.id)}</span><h3>${link(`/${lang}/questions/${q.id}/`, q[lang])}</h3><p lang="${lang === "pl" ? "en" : "pl"}">${esc(q[lang === "pl" ? "en" : "pl"])}</p><small>${data.runs.filter((r) => r.questionId === q.id).length} ${lang === "pl" ? "pomiarów" : "observations"}</small></li>`).join("")}</ol></section>`;
}

function cell(run, language, uiLang) {
  const t = words(uiLang),
    ss = run.samples[language],
    annotated = ss.filter((s) => s.clusterId !== null).length;
  const rows = run.clusters.map((c, i) => ({
    label: c.label[uiLang],
    count: ss.filter((s) => s.clusterId === c.id).length,
    color: `c${i % 6}`,
  }));
  rows.push(
    {
      label: t.unannotated,
      count: ss.filter((s) => s.status === "ok" && s.clusterId === null).length,
      color: "unannotated",
    },
    {
      label: t.errors,
      count: ss.filter((s) => s.status === "error").length,
      color: "errors",
    },
    { label: t.missing, count: 20 - ss.length, color: "missing" },
  );
  return `<section class="cell"><h4>${language === "pl" ? "Polski" : "English"}</h4><p>${annotated} ${t.annotated} / ${ss.length} ${t.attempted} / 20 ${t.plan}</p><div class="stack" aria-hidden="true">${rows
    .filter((r) => r.count)
    .map(
      (r) => `<span class="${r.color}" style="width:${r.count * 5}%"></span>`,
    )
    .join(
      "",
    )}</div><table><caption>${t.cluster} / ${language.toUpperCase()}</caption><thead><tr><th scope="col">${t.cluster}</th><th scope="col">${t.count}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row"><i class="swatch ${r.color}" aria-hidden="true"></i>${esc(r.label)}</th><td>${r.count}/20</td></tr>`).join("")}</tbody></table><h5>${t.samples}</h5>${ss.length ? ss.map((s) => `<article class="sample"><p class="eyebrow">#${s.repetition} · ${esc(s.status)}</p><p lang="${language}">${esc(s.text ?? s.error ?? t.unknown)}</p><p class="small">${t.refusal}: ${esc(s.refusal === null ? t.unknown : t[s.refusal])} · ${t.hedging}: ${esc(s.hedging === null ? t.unknown : t[s.hedging])} · ${t.moralising}: ${s.moralising === null ? t.unknown : s.moralising ? t.yes : t.no}</p></article>`).join("") : `<p>${t.unknown}</p>`}</section>`;
}

export function runView(r, data, lang) {
  const t = words(lang),
    m = data.models.find((m) => m.id === r.modelId);
  return `<article class="run" id="${r.id}"><div class="run-heading"><h3>${link(`/${lang}/models/${m.id}/`, m.name)} <span>${esc(r.modelVersion ?? t.unknown)}</span></h3><time datetime="${esc(r.startedAt)}">${esc(r.startedAt.slice(0, 10))}</time></div><p class="small">${esc(r.taskVersion)} · ${esc(r.id)} · ${esc(r.judgeRunId ?? t.unknown)}</p><div class="paired">${cell(r, "pl", lang)}${cell(r, "en", lang)}</div><dl class="metrics">${Object.entries(
    r.metrics,
  )
    .map(
      ([key, value]) =>
        `<div><dt>${t[key]}</dt><dd>${metric(value, t)}</dd></div>`,
    )
    .join(
      "",
    )}</dl><p>${t.cost}: ${r.cost.knownSubtotalUsd === null ? t.unknown : `$${fmt(r.cost.knownSubtotalUsd)}`} · ${r.cost.knownSamples}/${r.cost.totalSamples}; ${t.judge}: ${r.cost.judgeUsd === null ? t.unknown : `$${fmt(r.cost.judgeUsd)}`}</p><details><summary>${t.detail}</summary><p>${t.provenance}: ${esc(r.judgeProvenance ?? t.unknown)}</p><p>${t.temperature}: ${r.temperature.defaultValue ?? t.unknown}; actual: ${r.temperature.actual ?? t.unknown}</p><p>SHA-256 task PL: ${esc(r.taskSha256.pl ?? t.unknown)}<br>SHA-256 task EN: ${esc(r.taskSha256.en ?? t.unknown)}<br>SHA-256 source: ${esc(r.sourceSha256 ?? t.unknown)}</p><pre>${esc(JSON.stringify({ temperature: r.temperature, samples: { pl: r.samples.pl.map(({ text, ...rest }) => rest), en: r.samples.en.map(({ text, ...rest }) => rest) } }, null, 2))}</pre></details></article>`;
}

export function question(data, q, lang) {
  const t = words(lang),
    other = lang === "pl" ? "en" : "pl",
    runs = data.runs
      .filter((r) => r.questionId === q.id)
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  return `<p class="eyebrow">${esc(q.topic)} / ${esc(q.id)}</p><h1>${esc(q[lang])}</h1><p class="translation" lang="${other}">${esc(q[other])}</p><p class="lede">${t.note}</p>${q.refusalProne ? `<p>${lang === "pl" ? "Z góry oznaczone jako potencjalnie wywołujące odmowę; odmowa nie oznacza błędu." : "Flagged in advance as refusal-prone; refusal is not automatically a failure."}</p>` : ""}<h2>${t.models} / ${t.history.toLowerCase()}</h2>${runs.length ? runs.map((r) => runView(r, data, lang)).join("") : `<p class="empty">${t.empty}</p>`}`;
}

export function model(data, m, lang) {
  const t = words(lang),
    runs = data.runs
      .filter((r) => r.modelId === m.id)
      .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
  return `<p class="eyebrow">${t.model} / ${esc(m.kind)}</p><h1>${esc(m.name)}</h1><p class="lede">${t.intro}</p><h2>${t.history}</h2><ol class="timeline">${runs.map((r) => `<li><time datetime="${esc(r.startedAt)}">${esc(r.startedAt.slice(0, 10))}</time> ${link(`/${lang}/questions/${r.questionId}/#${r.id}`, `${r.modelVersion ?? t.unknown} · ${r.taskVersion}`)}<p>${esc(data.questions.find((q) => q.id === r.questionId)[lang])}</p></li>`).join("")}</ol><h2>${t.diff}</h2><p>${t.scope}</p>${runs
    .map((r, i) => {
      const prev = runs
        .slice(0, i)
        .filter((p) => p.questionId === r.questionId)
        .at(-1);
      if (!prev) return "";
      return `<section class="diff"><h3>${esc(prev.modelVersion ?? t.unknown)} → ${esc(r.modelVersion ?? t.unknown)}</h3><p>${t.attemptsChange}: ${r.samples.pl.length - prev.samples.pl.length} / ${r.samples.en.length - prev.samples.en.length}</p><div class="paired">${[prev, r].map((x, j) => `<section><h4>${j ? t.current : t.previous}</h4><p>${esc(x.startedAt)} · ${esc(x.judgeRunId ?? t.unknown)}</p>${["pl", "en"].map((l) => `<p lang="${l}"><strong>${l.toUpperCase()}</strong>: ${esc(x.samples[l].find((s) => s.text)?.text ?? t.unknown)}</p>`).join("")}</section>`).join("")}</div><p>${t.drift}: ${metric(r.metrics.drift, t)}</p></section>`;
    })
    .join(
      "",
    )}<h2>${t.coverage} / ${t.samples}</h2>${runs.map((r) => runView(r, data, lang)).join("") || `<p>${t.unknown}</p>`}`;
}

export function boards(data, lang) {
  const t = words(lang);
  return `<h1>${t.boards}</h1><p class="lede">${t.intro}</p>${[
    "consistency",
    "evasiveness",
    "divergence",
  ]
    .map((key) => {
      const board = data.leaderboards.find((b) => b.metric === key);
      return `<section><h2>${t[key]}</h2>${
        !board
          ? `<p class="empty">${t.noRank}</p>`
          : `<p>${esc(board.method[lang])}</p><p>${esc(board.caveats[lang])}</p><p>${esc(board.taskVersion)} · ${board.questionIds.map((q) => link(`/${lang}/questions/${q}/`, q)).join(", ")}</p><table><caption>${t[key]} · ${lang === "pl" ? "grupy remisowe, nie bezwzględne miejsca" : "tie groups, not absolute ranks"}</caption><thead><tr><th scope="col">${lang === "pl" ? "Grupa" : "Group"}</th><th scope="col">${t.model}</th><th scope="col">${t.interval}</th></tr></thead><tbody>${[
              ...board.entries,
            ]
              .sort((a, b) => a.tieGroup - b.tieGroup)
              .map(
                (e) =>
                  `<tr><td>${e.tieGroup}</td><th scope="row">${link(`/${lang}/models/${e.modelId}/`, data.models.find((m) => m.id === e.modelId).name)}</th><td>${metric(e.estimate, t)}<br>${e.runIds
                    .map((id) => {
                      const r = data.runs.find((r) => r.id === id);
                      return link(
                        `/${lang}/questions/${r.questionId}/#${id}`,
                        id,
                      );
                    })
                    .join(", ")}</td></tr>`,
              )
              .join("")}</tbody></table>`
      }</section>`;
    })
    .join("")}`;
}

// Deliberately small Markdown subset: headings, paragraphs and lists. Raw HTML,
// embedded images and link syntax render as literal text, not executable markup.
export function markdown(source) {
  return source
    .split(/\n\s*\n/)
    .map((block) => {
      if (/^#{1,3} /.test(block)) {
        const n = block.match(/^#+/)[0].length;
        return `<h${n}>${esc(block.slice(n + 1))}</h${n}>`;
      }
      if (block.startsWith("- "))
        return `<ul>${block
          .split("\n")
          .map((line) => `<li>${esc(line.replace(/^- /, ""))}</li>`)
          .join("")}</ul>`;
      return `<p>${esc(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}
