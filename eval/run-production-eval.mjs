#!/usr/bin/env node
/**
 * MeetFlow AI production evaluation runner.
 *
 * Usage from repository root:
 *   node eval/run-production-eval.mjs
 *
 * Optional:
 *   MEETFLOW_BASE_URL=https://meetflow-ai-ruby.vercel.app node eval/run-production-eval.mjs
 *
 * This script never reads OPENAI_API_KEY. It calls the already deployed server route.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const BASE_URL = (process.env.MEETFLOW_BASE_URL || "https://meetflow-ai-ruby.vercel.app").replace(/\/+$/, "");
const ENDPOINT = `${BASE_URL}/api/summarize`;
const GOLDEN_PATH = path.resolve("eval/golden-set.json");
const OUT_JSON = path.resolve("eval/run-01-results.json");
const OUT_MD = path.resolve("eval/run-01-results.md");

// Route limit is 10 requests/minute. 6.8 seconds keeps the run below that ceiling.
const DELAY_MS = Number(process.env.MEETFLOW_EVAL_DELAY_MS || 6800);
const REQUEST_TIMEOUT_MS = 55_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[“”"'`.,:;!?()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function includesLoose(haystack, needle) {
  return normalize(haystack).includes(normalize(needle));
}

function validateSchema(output) {
  const errors = [];
  if (!output || typeof output !== "object") errors.push("Output không phải object.");
  if (typeof output?.summary !== "string") errors.push("summary không phải string.");
  if (!Array.isArray(output?.keyPoints)) errors.push("keyPoints không phải array.");
  if (!Array.isArray(output?.decisions)) errors.push("decisions không phải array.");
  if (!Array.isArray(output?.actionItems)) errors.push("actionItems không phải array.");
  if (!Array.isArray(output?.openQuestions)) errors.push("openQuestions không phải array.");

  for (const [index, item] of (output?.decisions || []).entries()) {
    if (typeof item?.content !== "string") errors.push(`decisions[${index}].content không hợp lệ.`);
    if (item?.evidence !== null && typeof item?.evidence !== "string") {
      errors.push(`decisions[${index}].evidence không hợp lệ.`);
    }
  }

  for (const [index, item] of (output?.actionItems || []).entries()) {
    if (typeof item?.task !== "string") errors.push(`actionItems[${index}].task không hợp lệ.`);
    if (item?.owner !== null && typeof item?.owner !== "string") {
      errors.push(`actionItems[${index}].owner không hợp lệ.`);
    }
    if (item?.deadline !== null && typeof item?.deadline !== "string") {
      errors.push(`actionItems[${index}].deadline không hợp lệ.`);
    }
    if (item?.status !== "todo") errors.push(`actionItems[${index}].status phải là todo.`);
  }
  return errors;
}

function findDecision(actual, expected) {
  return (actual || []).find(
    (item) =>
      (!expected.content_must_include || includesLoose(item.content, expected.content_must_include)) &&
      (!expected.evidence_must_include || includesLoose(item.evidence, expected.evidence_must_include)),
  );
}

function findAction(actual, expected) {
  return (actual || []).find((item) => {
    if (expected.task_must_include && !includesLoose(item.task, expected.task_must_include)) return false;
    if (Object.hasOwn(expected, "owner")) {
      if (expected.owner === null && item.owner !== null) return false;
      if (expected.owner !== null && !includesLoose(item.owner, expected.owner)) return false;
    }
    if (Object.hasOwn(expected, "deadline")) {
      if (expected.deadline === null && item.deadline !== null) return false;
      if (expected.deadline !== null && !includesLoose(item.deadline, expected.deadline)) return false;
    }
    if (expected.deadline_must_include && !includesLoose(item.deadline, expected.deadline_must_include)) {
      return false;
    }
    if (expected.status && item.status !== expected.status) return false;
    return true;
  });
}

function evaluateCase(testCase, output) {
  const expected = testCase.expected || {};
  const checks = [];
  const fail = (dimension, message) => checks.push({ dimension, pass: false, message });
  const pass = (dimension, message) => checks.push({ dimension, pass: true, message });

  const schemaErrors = validateSchema(output);
  if (schemaErrors.length) fail("Schema validity", schemaErrors.join(" "));
  else pass("Schema validity", "Output đúng cấu trúc cơ bản.");

  for (const term of expected.summary_must_mention || []) {
    if (includesLoose(output.summary, term)) pass("Summary", `Có “${term}”.`);
    else fail("Summary", `Thiếu “${term}”.`);
  }

  const keyText = (output.keyPoints || []).join(" | ");
  for (const term of expected.key_points_must_include || []) {
    if (includesLoose(keyText, term)) pass("Term preservation", `Key points có “${term}”.`);
    else fail("Term preservation", `Key points thiếu “${term}”.`);
  }

  const expectedDecisions = expected.decisions || [];
  if (expectedDecisions.length === 0) {
    if ((output.decisions || []).length === 0) pass("Grounded decision", "Không tạo decision.");
    else fail("Grounded decision", `Kỳ vọng 0 decision nhưng nhận ${output.decisions.length}.`);
  } else {
    for (const item of expectedDecisions) {
      if (findDecision(output.decisions, item)) {
        pass("Grounded decision", `Decision khớp “${item.content_must_include}”.`);
      } else {
        fail("Grounded decision", `Không tìm thấy decision/evidence cho “${item.content_must_include}”.`);
      }
    }
  }

  const expectedActions = expected.action_items || [];
  if (expectedActions.length === 0) {
    if ((output.actionItems || []).length === 0) pass("Action completeness", "Không tạo action item.");
    else fail("Action completeness", `Kỳ vọng 0 action item nhưng nhận ${output.actionItems.length}.`);
  } else {
    for (const item of expectedActions) {
      if (findAction(output.actionItems, item)) {
        pass("Action completeness", `Action khớp “${item.task_must_include}”.`);
      } else {
        fail("Action completeness", `Không tìm thấy action đúng cho “${item.task_must_include}”.`);
      }
    }
  }

  const questionText = (output.openQuestions || []).join(" | ");
  for (const term of expected.open_questions_must_include || []) {
    if (includesLoose(questionText, term)) pass("Ambiguity handling", `Open questions có “${term}”.`);
    else fail("Ambiguity handling", `Open questions thiếu “${term}”.`);
  }

  // Hard guardrail heuristics.
  for (const rule of expected.must_not_infer || []) {
    const n = normalize(rule);
    if (n === "owner" || n.includes("ten nguoi noi")) {
      const hasUnexpectedOwner = (output.actionItems || []).some((item) => item.owner !== null);
      if (hasUnexpectedOwner) fail("Hard guardrail", `Đã suy ra owner dù rule cấm: ${rule}.`);
      else pass("Hard guardrail", `Không suy ra owner: ${rule}.`);
    } else if (n === "deadline" || n.includes("ngay tuyet doi")) {
      const hasUnexpectedDeadline = (output.actionItems || []).some((item) => item.deadline !== null);
      if (hasUnexpectedDeadline) fail("Hard guardrail", `Đã suy ra deadline dù rule cấm: ${rule}.`);
      else pass("Hard guardrail", `Không suy ra deadline: ${rule}.`);
    } else if (n === "decision" || n.includes("da co quyet dinh")) {
      if ((output.decisions || []).length) fail("Proposal distinction", `Tạo decision dù rule cấm: ${rule}.`);
      else pass("Proposal distinction", `Không tạo decision: ${rule}.`);
    } else if (n === "task") {
      if ((output.actionItems || []).length) fail("Hard guardrail", `Tạo task dù rule cấm: ${rule}.`);
      else pass("Hard guardrail", `Không tạo task: ${rule}.`);
    } else {
      const serialized = JSON.stringify(output);
      if (includesLoose(serialized, rule)) fail("Hard guardrail", `Output chứa nội dung bị cấm: “${rule}”.`);
      else pass("Hard guardrail", `Không chứa nội dung bị cấm: “${rule}”.`);
    }
  }

  // Duplicate guard for cases that explicitly expect one item.
  if (expectedDecisions.length === 1 && (output.decisions || []).length > 1) {
    const matches = (output.decisions || []).filter((item) =>
      includesLoose(item.content, expectedDecisions[0].content_must_include),
    );
    if (matches.length > 1) fail("Deduplication", "Decision bị lặp.");
  }
  if (expectedActions.length === 1 && (output.actionItems || []).length > 1) {
    const matches = (output.actionItems || []).filter((item) =>
      includesLoose(item.task, expectedActions[0].task_must_include),
    );
    if (matches.length > 1) fail("Deduplication", "Action item bị lặp.");
  }

  const failed = checks.filter((c) => !c.pass);
  return { pass: failed.length === 0, checks, failed };
}

async function callSummary(input) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: BASE_URL,
        referer: `${BASE_URL}/`,
        "user-agent": "MeetFlow-Hackathon-Eval/1.0",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") || 65);
      throw Object.assign(new Error(`Rate limited; retry after ${retryAfter}s.`), {
        retryAfterMs: retryAfter * 1000,
        status: 429,
      });
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`HTTP ${response.status}; response không phải JSON: ${text.slice(0, 300)}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function markdownReport(run) {
  const lines = [];
  lines.push(`# Eval Run — ${run.runId}`);
  lines.push("");
  lines.push(`- Thời điểm: ${run.startedAt}`);
  lines.push(`- Endpoint: ${run.endpoint}`);
  lines.push(`- Golden set: ${run.datasetName} (${run.total} case)`);
  lines.push(`- Case pass: **${run.passed}/${run.total} — ${run.passRatePercent}%**`);
  lines.push(`- Quality bar: ≥${run.minimumPassRatePercent}%`);
  lines.push(`- Owner/deadline inference failures: **${run.guardrails.ownerDeadlineFailures}**`);
  lines.push(`- Proposal → decision failures: **${run.guardrails.proposalDecisionFailures}**`);
  lines.push(`- Kết luận: **${run.qualityBarMet ? "ĐẠT" : "CHƯA ĐẠT"}**`);
  lines.push("");
  lines.push("> Automated keyword/schema grading có thể đánh fail một output đúng ý nhưng diễn đạt khác.");
  lines.push("> Hai thành viên vẫn phải chấm độc lập ít nhất 5 case khó và ghi điều chỉnh.");
  lines.push("");
  lines.push("| Case | Nhóm | Kết quả | Lỗi chính |");
  lines.push("|---|---|---|---|");
  for (const result of run.results) {
    const errors = result.evaluation.failed.map((f) => `${f.dimension}: ${f.message}`).join("<br>") || "—";
    lines.push(`| ${result.id} | ${result.caseGroup}${result.riskClass ? ` / ${result.riskClass}` : ""} | ${result.evaluation.pass ? "PASS" : "FAIL"} | ${errors} |`);
  }
  lines.push("");
  lines.push("## Kiểm tra chéo thủ công");
  lines.push("");
  lines.push("| Case khó | Người chấm 1 | Người chấm 2 | Khớp? | Ghi chú |");
  lines.push("|---|---|---|---|---|");
  for (const id of ["MF-009", "MF-010", "MF-011", "MF-015", "MF-017"]) {
    lines.push(`| ${id} | [ĐIỀN] | [ĐIỀN] | [ĐIỀN] | |`);
  }
  lines.push("");
  lines.push("Actual output đầy đủ nằm trong `run-01-results.json`. Không commit secret/raw audio.");
  return lines.join("\n");
}

async function main() {
  const golden = JSON.parse(await fs.readFile(GOLDEN_PATH, "utf8"));
  const startedAt = new Date().toISOString();
  const runId = `MF-PROD-${startedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`;
  const results = [];

  console.log(`Running ${golden.cases.length} cases against ${ENDPOINT}`);
  console.log(`Delay between calls: ${DELAY_MS}ms`);

  for (let index = 0; index < golden.cases.length; index += 1) {
    const testCase = golden.cases[index];
    process.stdout.write(`[${index + 1}/${golden.cases.length}] ${testCase.id} ... `);

    let output = null;
    let requestError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        output = await callSummary(testCase.input);
        break;
      } catch (error) {
        requestError = String(error?.message || error);
        if (error?.status === 429 || error?.retryAfterMs) {
          const wait = error.retryAfterMs || 65_000;
          console.log(`429; wait ${Math.round(wait / 1000)}s`);
          await sleep(wait);
          process.stdout.write(`  retry ${attempt} ... `);
          continue;
        }
        if (attempt < 3) {
          await sleep(3000 * attempt);
          continue;
        }
      }
    }

    const evaluation = output
      ? evaluateCase(testCase, output)
      : {
          pass: false,
          checks: [],
          failed: [{ dimension: "Request", pass: false, message: requestError || "Không có output." }],
        };

    results.push({
      id: testCase.id,
      title: testCase.title,
      caseGroup: testCase.case_group,
      riskClass: testCase.risk_class,
      input: testCase.input,
      expected: testCase.expected,
      hardFailIf: testCase.hard_fail_if,
      actual: output,
      requestError,
      evaluation,
    });

    console.log(evaluation.pass ? "PASS" : "FAIL");
    if (index < golden.cases.length - 1) await sleep(DELAY_MS);
  }

  const passed = results.filter((r) => r.evaluation.pass).length;
  const passRate = passed / results.length;
  const ownerDeadlineFailures = results.filter((r) =>
    r.evaluation.failed.some(
      (f) =>
        f.dimension === "Hard guardrail" &&
        (normalize(f.message).includes("owner") || normalize(f.message).includes("deadline")),
    ),
  ).length;
  const proposalDecisionFailures = results.filter((r) =>
    r.evaluation.failed.some((f) => f.dimension === "Proposal distinction"),
  ).length;

  const minimumPassRate = golden.quality_bar.minimum_case_pass_rate;
  const run = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    endpoint: ENDPOINT,
    datasetName: golden.dataset_name,
    schemaVersion: golden.schema_version,
    total: results.length,
    passed,
    failed: results.length - passed,
    passRate,
    passRatePercent: Number((passRate * 100).toFixed(1)),
    minimumPassRate,
    minimumPassRatePercent: Number((minimumPassRate * 100).toFixed(1)),
    guardrails: {
      ownerDeadlineFailures,
      proposalDecisionFailures,
    },
    qualityBarMet:
      passRate >= minimumPassRate &&
      ownerDeadlineFailures === 0 &&
      proposalDecisionFailures === 0,
    results,
  };

  await fs.writeFile(OUT_JSON, `${JSON.stringify(run, null, 2)}\n`, "utf8");
  await fs.writeFile(OUT_MD, `${markdownReport(run)}\n`, "utf8");

  console.log("");
  console.log(`Saved ${OUT_JSON}`);
  console.log(`Saved ${OUT_MD}`);
  console.log(`Result: ${passed}/${results.length} (${run.passRatePercent}%)`);
  console.log(`Quality bar: ${run.qualityBarMet ? "MET" : "NOT MET"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
