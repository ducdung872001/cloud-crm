import { config } from "../config.js";

/**
 * Wrapper cho Whisper API. Prefer Groq (large-v3-turbo, rẻ 10x OpenAI).
 * Giới hạn 25MB/request ở cả 2 provider → audio ≥25MB phải chunk trước.
 */
export interface TranscribeChunk {
  path: string;           // local file path (hoặc buffer)
  startOffsetSec: number; // offset trong full audio (để merge timestamp đúng)
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export async function transcribeChunk(chunk: TranscribeChunk): Promise<WhisperSegment[]> {
  if (config.groq.apiKey) {
    return callGroq(chunk);
  }
  if (config.openai.apiKey) {
    return callOpenAI(chunk);
  }
  // Mock
  return [
    { start: chunk.startOffsetSec, end: chunk.startOffsetSec + 15, text: "(mock transcript segment)" },
  ];
}

async function callGroq(_chunk: TranscribeChunk): Promise<WhisperSegment[]> {
  // POST https://api.groq.com/openai/v1/audio/transcriptions
  // model: "whisper-large-v3-turbo"
  // response_format: "verbose_json"
  // TODO: real impl
  return [];
}

async function callOpenAI(_chunk: TranscribeChunk): Promise<WhisperSegment[]> {
  // POST https://api.openai.com/v1/audio/transcriptions
  // model: "whisper-1" (hoặc large-v3 khi support)
  // TODO: real impl
  return [];
}

/**
 * Merge transcripts từ nhiều chunk với timestamp offset + dedupe từ ở overlap 5s.
 */
export function mergeTranscripts(perChunk: WhisperSegment[][]): WhisperSegment[] {
  const all: WhisperSegment[] = [];
  for (const segs of perChunk) {
    for (const seg of segs) {
      // Dedupe: nếu segment overlap với last ±2s và text giống → skip
      const last = all[all.length - 1];
      if (last && Math.abs(seg.start - last.start) < 2 && seg.text.slice(0, 30) === last.text.slice(0, 30)) continue;
      all.push(seg);
    }
  }
  return all.sort((a, b) => a.start - b.start);
}

export function estimateCostUSD(audioSeconds: number, provider: "groq" | "openai"): number {
  // Groq large-v3-turbo: ~$0.02/hour → $0.0000056/sec
  // OpenAI whisper-1: $0.006/min → $0.0001/sec
  const perSec = provider === "groq" ? 0.0000056 : 0.0001;
  return audioSeconds * perSec;
}
