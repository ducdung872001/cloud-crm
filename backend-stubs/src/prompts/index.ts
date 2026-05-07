/**
 * Prompt registry — single entry point để load prompt template theo tên + version.
 *
 * Convention:
 *   <name>.<version>  →  prompts[name][version]
 *   getPrompt("session-summary", "v1")
 *
 * Mỗi prompt module export PromptTemplate với metadata. Caching thân thiện:
 * `cacheable` = true → BE wrap trong system block với cache_control ephemeral.
 */

import { sessionSummaryV1 } from "./session-summary.v1.js";
import { perStudentBreakdownV1 } from "./per-student-breakdown.v1.js";
import { zaloOutboundV1 } from "./zalo-outbound.v1.js";

export interface PromptTemplate {
  name: string;
  version: string;
  description: string;
  cacheable: boolean;
  system: string;
  /** Optional user template — pure function, BE truyền vars vào. */
  buildUser?: (vars: Record<string, unknown>) => string;
}

const REGISTRY: Record<string, Record<string, PromptTemplate>> = {
  "session-summary": { v1: sessionSummaryV1 },
  "per-student-breakdown": { v1: perStudentBreakdownV1 },
  "zalo-outbound": { v1: zaloOutboundV1 },
};

export function getPrompt(name: string, version = "v1"): PromptTemplate {
  const tmpl = REGISTRY[name]?.[version];
  if (!tmpl) throw new Error(`[prompts] Unknown prompt ${name}@${version}`);
  return tmpl;
}

export function listPrompts(): { name: string; versions: string[] }[] {
  return Object.entries(REGISTRY).map(([name, versions]) => ({
    name,
    versions: Object.keys(versions),
  }));
}
