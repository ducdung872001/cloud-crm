import React from "react";
import SelectCustom from "components/selectCustom/selectCustom";
import Checkbox from "components/checkbox/checkbox";
import Icon from "components/icon";
import "./ShiftRulesNotifyTab.scss";

export type RulesSettings = {
  warningDiff: number;
  requireReason: boolean;
  allowDenomination: boolean;

  maxOpenHours: number;
  blockIfMissingStaff: boolean;
  managerConfirmClose: boolean;

  sendCloseReport: boolean;
  sendDiffWarning: boolean;
  remindOpenShift: boolean;
  shiftOverRule: boolean;

  receiver: string;
  channel: string;
};

type Props = {
  value: RulesSettings;
  onChange: (next: RulesSettings) => void;
};

export default function ShiftRulesNotifyTab(props: Props) {
  const { value, onChange } = props;

  const receiverOptions = [
    { label: "Quản lý cửa hàng (tất cả)", value: "all_manager" },
    { label: "Chỉ quản lý cửa hàng hiện tại", value: "current_manager" },
  ];

  const channelOptions = [
    { label: "Zalo OA + Email", value: "zalo_email" },
    { label: "Email", value: "email" },
    { label: "Zalo OA", value: "zalo" },
  ];

  const set = <K extends keyof RulesSettings>(key: K, v: RulesSettings[K]) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <div className="shift-rules-tab">
      <div className="rules-grid-top">
        {/* Card 1 */}
        <div className="rule-card">
          <div className="card-head">
            <div className="icon-box icon-box--money">
              <Icon name="Dollar" />
            </div>
            <div>
              <div className="title">Tiền mặt &amp; Kết</div>
              <div className="sub">Quy tắc kiểm tra tiền đầu/cuối ca</div>
            </div>
          </div>

          <div className="card-body">
            <div className="row-item row-item--input">
              <div className="left">
                <div className="label">Ngưỡng cảnh báo chênh lệch</div>
                <div className="desc">Cảnh báo QM khi vượt mức này</div>
              </div>
              <div className="right inline-input">
                <input
                  className="mini-input"
                  type="number"
                  value={value.warningDiff}
                  onChange={(e) => set("warningDiff", Number(e.target.value || 0))}
                />
                <span className="unit">nghìn VNĐ</span>
              </div>
            </div>

            <div className="divider" />

            <div className="row-item">
              <div className="left">
                <div className="label">Bắt buộc nhập lý do</div>
                <div className="desc">Khi tiền thực đếm ≠ kỳ vọng</div>
              </div>
              <div className="right">
                <Checkbox checked={value.requireReason} onChange={() => set("requireReason", !value.requireReason)} />
              </div>
            </div>

            <div className="row-item">
              <div className="left">
                <div className="label">Cho phép nhập mệnh giá</div>
                <div className="desc">Luôn mệnh giá khi đóng/mở ca</div>
              </div>
              <div className="right">
                <Checkbox checked={value.allowDenomination} onChange={() => set("allowDenomination", !value.allowDenomination)} />
              </div>
            </div>
          </div>
        </div>

        <div className="rule-card">
          <div className="card-head">
            <div className="icon-box icon-box--shift">
              <Icon name="Clock" />
            </div>
            <div>
              <div className="title">Vận hành ca</div>
              <div className="sub">Kiểm soát mở ca, đóng ca</div>
            </div>
          </div>

          <div className="card-body">
            <div className="row-item row-item--input">
              <div className="left">
                <div className="label">Thời gian tối đa mở ca</div>
                <div className="desc">Cảnh báo khi ca vượt giới hạn</div>
              </div>
              <div className="right inline-input">
                <input
                  className="mini-input"
                  type="number"
                  value={value.maxOpenHours}
                  onChange={(e) => set("maxOpenHours", Number(e.target.value || 0))}
                />
                <span className="unit">tiếng</span>
              </div>
            </div>

            <div className="divider" />

            <div className="row-item">
              <div className="left">
                <div className="label">Chặn mở ca khi thiếu NV</div>
                <div className="desc">Dựa trên số tối thiểu đã cài</div>
              </div>
              <div className="right">
                <Checkbox checked={value.blockIfMissingStaff} onChange={() => set("blockIfMissingStaff", !value.blockIfMissingStaff)} />
              </div>
            </div>

            <div className="row-item">
              <div className="left">
                <div className="label">QM xác nhận khi đóng ca</div>
                <div className="desc">Quản lý phê duyệt trước khi đóng</div>
              </div>
              <div className="right">
                <Checkbox checked={value.managerConfirmClose} onChange={() => set("managerConfirmClose", !value.managerConfirmClose)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rule-card rule-card--large">
        <div className="card-head">
          <div className="icon-box icon-box--notify">
            <Icon name="Phone" />
          </div>
          <div>
            <div className="title">Thông báo tự động</div>
            <div className="sub">Gửi báo cáo và cảnh báo đến quản lý</div>
          </div>
        </div>

        <div className="card-body">
          <div className="notify-grid">
            <div className="row-item">
              <div className="left">
                <div className="label">
                  <span className="mini-ic mini-ic--doc">
                    <Icon name="Document" />
                  </span>
                  Báo cáo kết ca
                </div>
                <div className="desc">Gửi PDF sau khi đóng ca</div>
              </div>
              <div className="right">
                <Checkbox checked={value.sendCloseReport} onChange={() => set("sendCloseReport", !value.sendCloseReport)} />
              </div>
            </div>

            <div className="row-item">
              <div className="left">
                <div className="label">
                  <span className="mini-ic mini-ic--clock">
                    <Icon name="Clock" />
                  </span>
                  Nhắc mở ca đúng giờ
                </div>
                <div className="desc">15 phút trước giờ ca</div>
              </div>
              <div className="right">
                <Checkbox checked={value.remindOpenShift} onChange={() => set("remindOpenShift", !value.remindOpenShift)} />
              </div>
            </div>

            <div className="row-item">
              <div className="left">
                <div className="label">
                  <span className="mini-ic mini-ic--warn">
                    <Icon name="Warning" />
                  </span>
                  Cảnh báo chênh lệch tiền
                </div>
                <div className="desc">Khi vượt ngưỡng đã cài</div>
              </div>
              <div className="right">
                <Checkbox checked={value.sendDiffWarning} onChange={() => set("sendDiffWarning", !value.sendDiffWarning)} />
              </div>
            </div>

            <div className="row-item">
              <div className="left">
                <div className="label">
                  <span className="mini-ic mini-ic--alert">
                    <Icon name="InfoCircle" />
                  </span>
                  Ca vượt giờ quy định
                </div>
                <div className="desc">Cảnh báo khi bất thường</div>
              </div>
              <div className="right">
                <Checkbox checked={value.shiftOverRule} onChange={() => set("shiftOverRule", !value.shiftOverRule)} />
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="send-row">
            <div className="send-label">Gửi đến</div>
            <div className="send-select">
              <SelectCustom options={receiverOptions} value={value.receiver} onChange={(e: any) => set("receiver", e?.value)} />
            </div>
            <div className="send-label small">qua</div>
            <div className="send-select small">
              <SelectCustom options={channelOptions} value={value.channel} onChange={(e: any) => set("channel", e?.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
