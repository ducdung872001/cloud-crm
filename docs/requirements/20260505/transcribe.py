#!/usr/bin/env python3
import sys, time, os
from pathlib import Path
from faster_whisper import WhisperModel

HERE = Path(__file__).parent
FILES = ["audio_part1.mp3", "audio_part2.mp3", "audio_part3.mp3"]
MODEL_SIZE = "medium"

print(f"[load] model={MODEL_SIZE} compute_type=int8", flush=True)
t0 = time.time()
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 8)
print(f"[load] done in {time.time()-t0:.1f}s", flush=True)

for fname in FILES:
    src = HERE / fname
    out_txt = HERE / (src.stem + ".txt")
    out_srt = HERE / (src.stem + ".srt")
    print(f"\n[transcribe] {fname}", flush=True)
    t0 = time.time()
    segments, info = model.transcribe(
        str(src),
        language="vi",
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        beam_size=5,
    )
    print(f"[info] duration={info.duration:.1f}s lang={info.language}", flush=True)

    def fmt_ts(sec: float) -> str:
        h = int(sec // 3600); m = int((sec % 3600) // 60); s = sec - h*3600 - m*60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

    with out_txt.open("w", encoding="utf-8") as ftxt, out_srt.open("w", encoding="utf-8") as fsrt:
        for i, seg in enumerate(segments, 1):
            ftxt.write(seg.text.strip() + "\n")
            fsrt.write(f"{i}\n{fmt_ts(seg.start)} --> {fmt_ts(seg.end)}\n{seg.text.strip()}\n\n")
            if i % 20 == 0:
                print(f"  seg #{i} t={seg.end:.1f}s", flush=True)
    print(f"[done] {fname} in {time.time()-t0:.1f}s -> {out_txt.name}, {out_srt.name}", flush=True)

print("\n[ALL DONE]", flush=True)
