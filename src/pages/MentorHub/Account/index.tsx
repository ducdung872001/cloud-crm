// MentorHub Account — profile + đổi mật khẩu, thay thế stub /setting_account.
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext, ContextType } from "contexts/userContext";
import UserService from "services/UserService";
import { showToast } from "utils/common";
import "../_shared/styles.scss";
import "./index.scss";

export default function MentorHubAccount() {
  const ctx = useContext(UserContext) as ContextType;

  const [profile, setProfile] = useState({
    name: ctx.name || "",
    email: ctx.email || "",
    phone: ctx.phone || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ plainPassword: "", newPassword: "", retypeNewPassword: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState({ cur: false, n: false, c: false });

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      showToast("Tên không được để trống", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await UserService.basicInfo({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      });
      if (res?.code === 0) {
        showToast("Đã lưu thông tin", "success");
      } else {
        showToast(res?.message ?? "Lưu thất bại", "error");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!pwd.plainPassword || !pwd.newPassword || !pwd.retypeNewPassword) {
      showToast("Vui lòng điền đủ 3 ô mật khẩu", "error");
      return;
    }
    if (pwd.newPassword.length < 6) {
      showToast("Mật khẩu mới tối thiểu 6 ký tự", "error");
      return;
    }
    if (pwd.newPassword !== pwd.retypeNewPassword) {
      showToast("Mật khẩu mới và xác nhận không khớp", "error");
      return;
    }
    if (pwd.newPassword === pwd.plainPassword) {
      showToast("Mật khẩu mới phải khác mật khẩu hiện tại", "error");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await UserService.changePass(pwd);
      if (res?.code === 0) {
        showToast("Đổi mật khẩu thành công", "success");
        setPwd({ plainPassword: "", newPassword: "", retypeNewPassword: "" });
      } else {
        showToast(res?.message ?? "Đổi mật khẩu thất bại", "error");
      }
    } catch {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="mh mh-account">
      <div className="mh-course-edit__topbar">
        <Link to="/mh/courses" className="mh-course-edit__back">
          ← Tất cả khoá học
        </Link>
      </div>

      <div className="mh__hero" style={{ marginBottom: 20 }}>
        <div className="mh__kicker">TÀI KHOẢN</div>
        <h1>
          Hồ sơ <em>của bạn</em>
        </h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
          Cập nhật thông tin liên hệ và mật khẩu đăng nhập.
        </p>
      </div>

      {/* PROFILE */}
      <section className="mh__card mh-account__section">
        <h3>Thông tin cơ bản</h3>

        <div className="mh-form__row">
          <label className="mh-form__label">Họ và tên <span className="mh-form__req">*</span></label>
          <input
            className="mh-form__input"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Nguyễn Văn A"
            maxLength={120}
          />
        </div>

        <div className="mh-form__grid-2">
          <div className="mh-form__row">
            <label className="mh-form__label">Email</label>
            <input
              type="email"
              className="mh-form__input"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="email@reborn.vn"
            />
          </div>
          <div className="mh-form__row">
            <label className="mh-form__label">Số điện thoại</label>
            <input
              type="tel"
              className="mh-form__input"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="09xxxxxxxx"
            />
          </div>
        </div>

        <div className="mh-account__actions">
          <button
            type="button"
            className="mh__btn mh__btn--primary"
            onClick={saveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? "Đang lưu…" : "Lưu thông tin"}
          </button>
        </div>
      </section>

      {/* CHANGE PASSWORD */}
      <section className="mh__card mh-account__section">
        <h3>Đổi mật khẩu</h3>
        <p className="mh-account__hint">Sau khi đổi, hệ thống có thể yêu cầu đăng nhập lại.</p>

        <div className="mh-form__row">
          <label className="mh-form__label">Mật khẩu hiện tại <span className="mh-form__req">*</span></label>
          <div className="mh-account__pwd-wrap">
            <input
              type={showPwd.cur ? "text" : "password"}
              className="mh-form__input"
              value={pwd.plainPassword}
              onChange={(e) => setPwd({ ...pwd, plainPassword: e.target.value })}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="mh-account__pwd-toggle"
              onClick={() => setShowPwd((s) => ({ ...s, cur: !s.cur }))}
              tabIndex={-1}
            >
              {showPwd.cur ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div className="mh-form__grid-2">
          <div className="mh-form__row">
            <label className="mh-form__label">Mật khẩu mới <span className="mh-form__req">*</span></label>
            <div className="mh-account__pwd-wrap">
              <input
                type={showPwd.n ? "text" : "password"}
                className="mh-form__input"
                value={pwd.newPassword}
                onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                className="mh-account__pwd-toggle"
                onClick={() => setShowPwd((s) => ({ ...s, n: !s.n }))}
                tabIndex={-1}
              >
                {showPwd.n ? "Ẩn" : "Hiện"}
              </button>
            </div>
            <div className="mh-form__hint">Tối thiểu 6 ký tự.</div>
          </div>
          <div className="mh-form__row">
            <label className="mh-form__label">Xác nhận mật khẩu <span className="mh-form__req">*</span></label>
            <div className="mh-account__pwd-wrap">
              <input
                type={showPwd.c ? "text" : "password"}
                className="mh-form__input"
                value={pwd.retypeNewPassword}
                onChange={(e) => setPwd({ ...pwd, retypeNewPassword: e.target.value })}
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                className="mh-account__pwd-toggle"
                onClick={() => setShowPwd((s) => ({ ...s, c: !s.c }))}
                tabIndex={-1}
              >
                {showPwd.c ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>
        </div>

        <div className="mh-account__actions">
          <button
            type="button"
            className="mh__btn mh__btn--primary"
            onClick={changePassword}
            disabled={savingPwd}
          >
            {savingPwd ? "Đang đổi…" : "Đổi mật khẩu"}
          </button>
        </div>
      </section>
    </div>
  );
}
