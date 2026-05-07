import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import { transcribeChunkWithMeta, mergeTranscripts, type WhisperSegment } from "../services/whisper.js";
import { summarize } from "../services/claude.js";
import { sendZaloPush } from "../services/zalo.js";
import { logWhisperUsage } from "../services/usage-log.js";

/**
 * Pipeline full: download recording → audio extract → chunk → whisper → merge
 * → summarize (Claude) → save MeetingNote → push Zalo OA.
 *
 * Production: dùng BullMQ/Temporal. Stubs dùng setTimeout để không block.
 */
export interface TranscribeJobInput {
  mentorId: string;
  zoomMeetingId: string;
  downloadUrl: string;
  downloadToken: string;
  recordingStart: string;
}

export function queueTranscribeJob(input: TranscribeJobInput) {
  // Simulate async queue
  setTimeout(() => void runTranscribeJob(input), 200);
}

async function runTranscribeJob(input: TranscribeJobInput) {
  const jobId = "JOB-" + uuid().slice(0, 8);
  console.log(`[JOB ${jobId}] Start transcribe for mentor ${input.mentorId}, meeting ${input.zoomMeetingId}`);

  try {
    // 1. Download (mock — production: fetch with downloadToken)
    // const mp4 = await downloadZoomRecording(input.downloadUrl, input.downloadToken);

    // 2. Extract audio 16kHz mono — ffmpeg
    // const wavPath = await ffmpegExtractAudio(mp4);

    // 3. Chunk bằng silencedetect, ≤20min/chunk, overlap 5s
    // const chunks = await chunkBySilence(wavPath, 20 * 60, 5);
    const mockChunks = [
      { path: "/tmp/chunk-0.wav", startOffsetSec: 0 },
      { path: "/tmp/chunk-1.wav", startOffsetSec: 1200 },
      { path: "/tmp/chunk-2.wav", startOffsetSec: 2400 },
    ];

    // 4. Parallel Whisper (dùng meta version để biết provider thật)
    const perChunkResults = await Promise.all(mockChunks.map((c) => transcribeChunkWithMeta(c)));
    const perChunk: WhisperSegment[][] = perChunkResults.map((r) => r.segments);
    const allSegments = mergeTranscripts(perChunk);
    const transcript = allSegments.map((s) => s.text).join(" ");
    const audioSeconds = allSegments.at(-1)?.end ?? 3600;
    const whisperProvider = perChunkResults[0]?.provider ?? "mock";

    // 5. Summarize với Claude (pick model theo plan)
    const sub = db.subscriptions.get(input.mentorId);
    const model: "haiku" | "sonnet" = sub?.plan === "unlimited" ? "sonnet" : "haiku";
    const summary = await summarize({
      transcript,
      courseName: "(mock course)",
      sessionNumber: 1,
      sessionTitle: "(mock)",
      model,
      mentorId: input.mentorId,
      // sessionId is set sau khi tạo MeetingNote — gọi summarize lần 2 hoặc skip log
    });

    // 6. Lưu MeetingNote
    const noteId = "MN-" + uuid().slice(0, 8);
    db.meetingNotes.set(noteId, {
      id: noteId,
      mentorId: input.mentorId,
      courseId: "CRS-01",
      sessionNumber: 1,
      sessionTitle: "(auto)",
      date: input.recordingStart.split("T")[0],
      status: "ready",
      duration: `${Math.floor(audioSeconds / 3600)}h ${Math.floor((audioSeconds % 3600) / 60)}m`,
      summary: summary.summary,
      transcript,
      keyPoints: summary.keyPoints,
      questions: summary.questions,
      actionItems: summary.actionItems,
      zoomMeetingId: input.zoomMeetingId,
      createdAt: new Date().toISOString(),
    });

    // 7. Log cost qua centralized helpers
    if (whisperProvider !== "mock") {
      logWhisperUsage({
        mentorId: input.mentorId,
        sessionId: noteId,
        provider: whisperProvider,
        audioSeconds,
      });
    }
    // Claude usage đã được log bên trong summarize() nếu mentorId được truyền

    // 8. Tăng usage counter
    if (sub) sub.usage.aiSessionsUsed += 1;

    // 9. Push Zalo notification cho mentor
    const mapping = db.zaloMappings.get(input.mentorId);
    if (mapping?.oaFollowed) {
      await sendZaloPush({
        zaloUserId: mapping.zaloUserId,
        template: "ai_note_ready",
        params: {
          course: "(auto course)",
          sessionNumber: 1,
          keyPointsCount: summary.keyPoints.length,
          qaCount: summary.questions.length,
          link: `http://localhost:4000/crm/mh/session-review?noteId=${noteId}`,
        },
      });
    }

    console.log(`[JOB ${jobId}] ✓ Done. Note ${noteId}. Whisper(${whisperProvider}) ${audioSeconds}s, Claude $${summary.costUSD.toFixed(4)}`);
  } catch (e) {
    console.error(`[JOB ${jobId}] ✕ Failed`, e);
  }
}
