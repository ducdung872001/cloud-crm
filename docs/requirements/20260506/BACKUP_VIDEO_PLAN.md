# Backup video walkthrough — MentorHub demo 2026-05-08

**Mục đích:** dự phòng nếu demo live thất bại (mạng, Zoom share, browser crash, blank page).
**Người record:** Dũng (hoặc 1 người trong team có quyền truy cập).
**Khi quay:** chiều/tối **2026-05-07** (HÔM NAY) — trước demo mai.
**Output:** 1 file MP4 ~4–5 phút, 1080p, no music, có voice-over Vietnamese.

---

## Setup trước khi record

1. **Browser**: Chrome ẩn danh, full-screen 1920×1080 (hoặc max).
2. **Tab duy nhất** mở `https://mentorhub.reborn.vn/crm/mh/dashboard` đã đăng nhập.
3. **Disable** mọi notification / Slack / email popup trên máy.
4. **Tool record**:
   - macOS: QuickTime → File → New Screen Recording (có voice-over qua mic).
   - Hoặc Loom (free tier 5 phút) — link share trực tiếp anh chủ vẫn xem được.
   - Hoặc OBS nếu muốn polish.
5. **Mic test** trước 30 giây — nói thử "test 1 2 3" để đảm bảo voice rõ.
6. **Zoom level browser**: 100% (Cmd+0 reset). Layout font đã optimal.

---

## Storyboard chi tiết (theo timecode dự kiến)

| Time | Scene | Voiceover |
|---|---|---|
| 00:00 – 00:15 | Dashboard `/mh/dashboard` — show KPI 48tr revenue, 1240 students, NPS 4.92 | "MentorHub — SaaS hỗ trợ vận hành lớp đào tạo cho mentor cá nhân. Đây là dashboard của anh Khoa, mentor solo, 1240 học viên đang theo." |
| 00:15 – 00:30 | Calendar `/mh/calendar` — show buổi sắp tới 23/30 | "Trước buổi học, mentor thấy được số đăng ký và pre-class digest — câu hỏi học viên đặt sẵn, bài tập đã nộp." |
| 00:30 – 00:45 | Live session `/mh/live-session` — lướt nhanh | "Đang dạy thì có Live Assistant — bắt câu hỏi realtime, gợi ý câu trả lời. Phần này deep dive sau." |
| 00:45 – 01:30 | Session Review `/mh/session-review` — full scroll qua AI summary, key points, Q&A, action items | "Buổi vừa kết thúc, AI tự transcribe và sinh meeting notes: tóm tắt, 8 điểm chính có timestamp, 3 câu hỏi quan trọng, 5 action items." |
| 01:30 – 02:00 | Scroll xuống "Phân tích từng học viên" — cho thấy 6 card với engagement score khác nhau | "Đến đây hầu hết SaaS dạy học dừng. MentorHub đi tiếp một bước — AI breakdown từng học viên: engagement, talk time, chat, sentiment." |
| 02:00 – 03:00 | Hover qua từng tin nhắn — đọc voice-over 3 ví dụ tương phản (Nam top, Tuấn vào trễ, Linh vắng) | "Mỗi học viên một tin riêng. Anh Nam top contributor — tin cảm ơn cụ thể. Anh Tuấn vào trễ 22 phút — hệ thống tự cắt clip 22 phút đầu kèm tin. Chị Linh vắng 2 buổi liên tiếp + có ticket Zoom — tin win-back kèm recording 2 buổi và tóm tắt 5 phút." |
| 03:00 – 03:45 | Click "Mở cockpit gửi cá nhân hoá" → modal | "Mentor không cần ngồi viết 6 tin. AI viết sẵn — mentor click vào từng tên, đọc, edit nếu cần, approve. Gói Pro+ có thể bật auto-send." |
| 03:45 – 04:00 | Trỏ vào button "📤 Lên lịch gửi 3 tin lúc 22:30" | "Tin gửi qua Zalo OA công ty — không phải Zalo cá nhân — vì Zalo cá nhân bị Zalo Inc chặn gửi tự động." |
| 04:00 – 04:30 | Đóng modal, mở Chat `/mh/chat` | "Học viên reply về — tin gắn đúng thread, mentor 1 chỗ xử lý. AI gợi ý draft trả lời." |
| 04:30 – 05:00 | Quay lại Dashboard, kết | "Vòng đầu cuối: pre-class → live → post-class AI → cá nhân hoá → reply. Soft launch tháng 6, commercial mở rộng tháng 7. USP credit pool Zoom sẽ demo riêng phase sau. Cám ơn các anh." |

**Tổng: ~5 phút**.

---

## Recording tips

- **Speak chậm rõ** — không "ấp úng", không "ờ ờ". Có thể quay 2-3 take, chọn cái mượt nhất.
- **Đừng gõ phím trên video** — chỉ dùng mouse. Click chậm, để khán giả theo dõi được.
- **Khi scroll**, scroll chậm — không flick.
- **Khi mở modal** (cockpit cá nhân hoá), pause 2 giây cho khán giả nhìn layout trước khi narrate.
- **Tránh "uhh, ahh, ờm"** — nếu gặp, dừng lại, ghi đè đoạn đó (re-record từ đầu phần).

---

## Sau khi record xong

1. Upload lên Drive Reborn (folder `/Reborn/MentorHub/Demo/`) — share link với anh chủ.
2. Tạo link Loom backup nếu dùng Loom — paste vào pinned message Slack.
3. Test mở video trên 2 thiết bị: laptop + mobile — đảm bảo play được không lỗi.
4. **Chuẩn bị fallback URL trong điện thoại** — nếu Zoom share screen lỗi mà laptop ổn, có thể chiếu video từ phone qua AirPlay/HDMI.

---

## Risk checklist trước buổi demo mai

- [ ] Internet check 30 phút trước demo (ít nhất 50Mbps download).
- [ ] Browser đã clear cache hôm nay (tránh stale).
- [ ] Đã test full flow demo 1 lần trước 1 tiếng.
- [ ] Backup laptop có sẵn (nếu máy chính lỗi).
- [ ] Phone sẵn link video.
- [ ] Voice-over file riêng (`.mp3`) phòng video bị mất sound.
- [ ] In `DEMO_SCRIPT_20260508.md` ra giấy A4 hoặc mở tab thứ 2 — phòng quên kịch bản.

---

## Nếu hoàn toàn không thể demo live và cũng không play được video

1. Mở tab `DEMO_SCRIPT_20260508.md` ở chế độ Markdown render — đọc kịch bản như story.
2. Chuyển sang chế độ "talk + slide": dùng REQUIREMENTS_mentorhub.md các section + GAP_AND_PLAN, kể câu chuyện lớn hơn.
3. Cam kết với anh chủ "buổi UAT tuần sau em sẽ demo lại trên môi trường ổn định" — không cố sale ép.
