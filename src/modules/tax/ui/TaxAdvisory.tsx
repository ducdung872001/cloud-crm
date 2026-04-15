// T5 — Tư vấn thuế: FAQ, bản tin chính sách, kết nối đại lý thuế.

import React, { useState } from "react";
import { Card, Button, Badge, Alert, Field, inputStyle } from "./common";
import { taxTheme as T } from "./theme";
import { taxStorage } from "../services/taxStorage";
import { useTaxpayerProfile } from "./hooks";

const FAQS: { q: string; a: string; tags?: string[] }[] = [
  {
    q: "Doanh thu dưới 100 triệu/năm có phải nộp thuế không?",
    a: "Không. HKD/CNKD có doanh thu ≤ 100 triệu/năm được miễn thuế GTGT, TNCN và lệ phí môn bài (Luật QLT 38/2019 + TT 40/2021).",
    tags: ["Miễn thuế", "Ngưỡng"],
  },
  {
    q: "Tôi đang nộp khoán, khi nào buộc chuyển sang kê khai?",
    a: "Theo NĐ 70/2025, khi doanh thu vượt ngưỡng miễn thuế và rơi vào nhóm ngành bắt buộc, hoặc khi >3 tỷ/năm. Ngoài ra cá nhân có thể chủ động chuyển nếu muốn được khấu trừ chi phí.",
    tags: ["NĐ 70/2025"],
  },
  {
    q: "Máy tính tiền kết nối TCT là gì, tôi có bắt buộc dùng không?",
    a: "Theo NĐ 123/2020 và NĐ 70/2025, HKD ngành F&B/bán lẻ/siêu thị có doanh thu >1 tỷ/năm phải dùng máy tính tiền kết nối dữ liệu trực tiếp với cơ quan thuế — mỗi giao dịch bán hàng sẽ được gửi thẳng về TCT.",
    tags: ["Máy tính tiền"],
  },
  {
    q: "Tỷ lệ thuế GTGT + TNCN cho quán cafe là bao nhiêu?",
    a: "Quán cafe thuộc nhóm ‘Dịch vụ, xây dựng không bao thầu NVL’ — GTGT 5% + TNCN 2% = 7% trên doanh thu (TT 40/2021).",
    tags: ["Ngành", "Cafe"],
  },
  {
    q: "Môn bài tính như thế nào?",
    a: "Theo bậc doanh thu năm: ≤100tr miễn; 100–300tr = 300k; 300–500tr = 500k; >500tr = 1.000k. Nộp 1 lần/năm bằng tờ khai mẫu 01/LPMB.",
    tags: ["Môn bài"],
  },
  {
    q: "Tờ khai bị phát hiện sai sau khi đã nộp — phải làm gì?",
    a: "Lập tờ khai bổ sung (tick ô 'Bổ sung lần thứ' trên mẫu 01/CNKD). Có thể bị phạt chậm nộp 0,03%/ngày trên số tiền khai thiếu.",
    tags: ["Sửa sai"],
  },
];

const POLICIES: { title: string; date: string; body: string; tag: string }[] = [
  {
    title: "NĐ 70/2025/NĐ-CP — Bắt buộc HKD vượt ngưỡng chuyển sang khai thực tế",
    date: "01/01/2026",
    body: "Hộ kinh doanh có doanh thu vượt ngưỡng miễn thuế phải khai theo doanh thu thực tế thay vì khoán cố định. Áp dụng toàn quốc.",
    tag: "MỚI",
  },
  {
    title: "TT 40/2021/TT-BTC — Thông tư hiện hành về HKD/CNKD",
    date: "01/06/2021",
    body: "Quy định phương pháp tính thuế, tỷ lệ %, mẫu 01/CNKD và phụ lục 01-2/BK-HDKD.",
    tag: "HIỆN HÀNH",
  },
  {
    title: "NĐ 123/2020/NĐ-CP — Hoá đơn điện tử & máy tính tiền kết nối",
    date: "19/10/2020",
    body: "Yêu cầu HKD >1 tỷ/năm ngành F&B/bán lẻ/siêu thị phải dùng máy tính tiền kết nối dữ liệu với cơ quan thuế.",
    tag: "HIỆN HÀNH",
  },
];

export default function TaxAdvisory() {
  const [profile] = useTaxpayerProfile();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    topic: "Tư vấn khai thuế chung",
    message: "",
  });

  const handleSubmitSupport = () => {
    if (!form.fullName.trim()) {
      setFormError("Vui lòng nhập họ tên");
      return;
    }
    if (!form.phone.trim()) {
      setFormError("Vui lòng nhập số điện thoại");
      return;
    }
    if (!form.message.trim()) {
      setFormError("Vui lòng mô tả yêu cầu cần hỗ trợ");
      return;
    }
    taxStorage.addSupportRequest(form);
    setSubmitted(true);
    setFormError(null);
    setForm({
      fullName: "",
      phone: "",
      topic: "Tư vấn khai thuế chung",
      message: "",
    });
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
    }, 4000);
  };

  // Prefill họ tên + SĐT từ profile nếu có
  React.useEffect(() => {
    if (showForm && !form.fullName && profile.fullName) {
      setForm((f) => ({
        ...f,
        fullName: profile.fullName,
        phone: profile.phone ?? "",
      }));
    }
  }, [showForm]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: T.spacing.lg,
      }}
    >
      <div>
        <Card title="❓ Câu hỏi thường gặp" subtitle={`${FAQS.length} câu hỏi`}>
          <div style={{ display: "grid", gap: 12 }}>
            {FAQS.map((f, i) => (
              <details
                key={i}
                style={{
                  border: `1px solid ${T.colors.border}`,
                  borderRadius: T.radius.md,
                  padding: 12,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 700,
                    color: T.colors.primaryDark,
                    fontSize: T.font.body,
                  }}
                >
                  {f.q}
                </summary>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: T.font.small,
                    color: T.colors.textMain,
                    lineHeight: 1.6,
                  }}
                >
                  {f.a}
                </div>
                {f.tags && (
                  <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                    {f.tags.map((t) => (
                      <Badge key={t} tone="neutral">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </details>
            ))}
          </div>
        </Card>

        <div style={{ height: T.spacing.lg }} />

        <Card title="📜 Bản tin chính sách thuế">
          <div style={{ display: "grid", gap: 10 }}>
            {POLICIES.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  border: `1px solid ${T.colors.border}`,
                  borderRadius: T.radius.md,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: T.colors.primaryDark,
                      fontSize: T.font.body,
                    }}
                  >
                    {p.title}
                  </div>
                  <Badge tone={p.tag === "MỚI" ? "warning" : "info"}>
                    {p.tag}
                  </Badge>
                </div>
                <div
                  style={{
                    fontSize: T.font.tiny,
                    color: T.colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  Hiệu lực: {p.date}
                </div>
                <div
                  style={{
                    fontSize: T.font.small,
                    color: T.colors.textMain,
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card title="👨‍💼 Kết nối đại lý thuế" subtitle="Chuyên viên hỗ trợ khai hộ">
          <Alert tone="info">
            Không có thời gian tự khai? Kết nối với đại lý thuế chuyên nghiệp, họ
            sẽ kiểm tra tờ khai trong &lt;24h và nộp giúp bạn.
          </Alert>
          {!showForm && !submitted && (
            <div
              style={{
                textAlign: "center",
                padding: T.spacing.md,
              }}
            >
              <div style={{ fontSize: 48 }}>🤝</div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowForm(true)}
              >
                Yêu cầu hỗ trợ
              </Button>
            </div>
          )}

          {submitted && (
            <Alert tone="success" title="Đã gửi yêu cầu">
              Chuyên viên tư vấn sẽ liên hệ với bạn trong vòng 24h qua số điện
              thoại đã đăng ký.
            </Alert>
          )}

          {showForm && !submitted && (
            <div style={{ marginTop: 10 }}>
              {formError && <Alert tone="danger">{formError}</Alert>}
              <Field label="Họ tên" required>
                <input
                  style={inputStyle}
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </Field>
              <Field label="Số điện thoại" required>
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Chủ đề">
                <select
                  style={inputStyle}
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                >
                  <option>Tư vấn khai thuế chung</option>
                  <option>Khai hộ tờ khai 01/CNKD</option>
                  <option>Chuyển phương pháp khoán → kê khai</option>
                  <option>Hỗ trợ máy tính tiền kết nối TCT</option>
                  <option>Giải trình thanh tra thuế</option>
                  <option>Khác</option>
                </select>
              </Field>
              <Field label="Nội dung yêu cầu" required>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  placeholder="Mô tả ngắn gọn tình huống của bạn..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </Field>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Huỷ
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitSupport}
                >
                  📨 Gửi yêu cầu
                </Button>
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: T.spacing.md,
              padding: T.spacing.md,
              background: T.colors.primarySoft,
              borderRadius: T.radius.md,
              fontSize: T.font.tiny,
              color: T.colors.textMain,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Gói Enterprise</div>
            Bao gồm đại lý thuế trọn gói: kiểm tra tờ khai, ký số thay, nộp hộ, đại
            diện giải trình khi thanh tra thuế.
          </div>
        </Card>

        <div style={{ height: 12 }} />

        <Card title="📚 Văn bản pháp luật tham khảo">
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: T.font.small,
              color: T.colors.textMain,
              lineHeight: 1.8,
            }}
          >
            <li>Luật Quản lý thuế 38/2019/QH14</li>
            <li>TT 40/2021/TT-BTC</li>
            <li>NĐ 70/2025/NĐ-CP</li>
            <li>NĐ 123/2020/NĐ-CP — HĐĐT</li>
            <li>NĐ 139/2016/NĐ-CP — Lệ phí môn bài</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
