import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { config } from "../config.js";

/**
 * Wrapper cho Whisper API. Prefer Groq (large-v3-turbo, rẻ ~10x OpenAI).
 * Giới hạn 25MB/request ở cả 2 provider → audio ≥25MB phải chunk trước.
 *
 * Mock mode: nếu cả 2 key đều rỗng → trả mock segment để dev/test offline.
 */
export interface TranscribeChunk {
  /** local file path (đã extract WAV/MP3) */
  path: string;
  /** offset trong full audio (để merge timestamp đúng) */
  startOffsetSec: number;
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscribeResult {
  segments: WhisperSegment[];
  /** Provider thực sự xử lý chunk này */
  provider: "groq" | "openai" | "mock";
  durationMs: number;
}

export async function transcribeChunk(chunk: TranscribeChunk): Promise<WhisperSegment[]> {
  const r = await transcribeChunkWithMeta(chunk);
  return r.segments;
}

/** Phiên bản trả thêm metadata để caller log usage chính xác. */
export async function transcribeChunkWithMeta(chunk: TranscribeChunk): Promise<TranscribeResult> {
  const start = Date.now();
  if (config.groq.apiKey) {
    const segs = await callProvider(chunk, "groq");
    return { segments: segs, provider: "groq", durationMs: Date.now() - start };
  }
  if (config.openai.apiKey) {
    const segs = await callProvider(chunk, "openai");
    return { segments: segs, provider: "openai", durationMs: Date.now() - start };
  }
  return {
    segments: [{ start: chunk.startOffsetSec, end: chunk.startOffsetSec + 15, text: "(mock transcript segment)" }],
    provider: "mock",
    durationMs: Date.now() - start,
  };
}

const ENDPOINTS = {
  groq: "https://api.groq.com/openai/v1/audio/transcriptions",
  openai: "https://api.openai.com/v1/audio/transcriptions",
} as const;

const MODELS = {
  groq: "whisper-large-v3-turbo",
  openai: "whisper-1",
} as const;

async function callProvider(chunk: TranscribeChunk, provider: "groq" | "openai"): Promise<WhisperSegment[]> {
  const apiKey = provider === "groq" ? config.groq.apiKey : config.openai.apiKey;
  const audio = await readFile(chunk.path);
  const fileName = basename(chunk.path);

  const form = new FormData();
  form.append("file", new Blob([audio]), fileName);
  form.append("model", MODELS[provider]);
  form.append("response_format", "verbose_json");
  form.append("temperature", "0");

  const res = await fetch(ENDPOINTS[provider], {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[whisper:${provider}] ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    segments?: Array<{ start: number; end: number; text: string }>;
    text?: string;
  };

  const segs = (data.segments ?? []).map((s) => ({
    start: s.start + chunk.startOffsetSec,
    end: s.end + chunk.startOffsetSec,
    text: s.text.trim(),
  }));
  if (segs.length > 0) return segs;
  if (data.text) {
    return [{ start: chunk.startOffsetSec, end: chunk.startOffsetSec + 60, text: data.text.trim() }];
  }
  return [];
}

/**
 * Merge transcripts từ nhiều chunk với timestamp offset + dedupe ở overlap.
 */
export function mergeTranscripts(perChunk: WhisperSegment[][]): WhisperSegment[] {
  const all: WhisperSegment[] = [];
  for (const segs of perChunk) {
    for (const seg of segs) {
      const last = all[all.length - 1];
      if (last && Math.abs(seg.start - last.start) < 2 && seg.text.slice(0, 30) === last.text.slice(0, 30)) continue;
      all.push(seg);
    }
  }
  return all.sort((a, b) => a.start - b.start);
}

export function estimateCostUSD(audioSeconds: number, provider: "groq" | "openai"): number {
  // Backward compat — usage-log.ts có cùng số.
  const perSec = provider === "groq" ? 0.0000056 : 0.0001;
  return audioSeconds * perSec;
}
