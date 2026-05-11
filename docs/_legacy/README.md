# _legacy — Tài liệu cũ không liên quan loyalty

Folder này lưu **các tài liệu được kế thừa từ branch retail/spa/community-hub** — không thuộc bài toán loyalty siêu thị. Giữ lại để:
- Tham chiếu khi cần
- Source code chỉ sang các trang generic (POS, kho, vận chuyển) vẫn map được
- Không xoá vĩnh viễn data có giá trị

> ⚠️ **KHÔNG CẬP NHẬT** tài liệu trong folder này. Tài liệu active của dự án loyalty nằm ở [`../02-requirements/`](../02-requirements/), [`../03-architecture/`](../03-architecture/), [`../09-userguides/`](../09-userguides/).

## Cấu trúc

```
_legacy/
├── urd/                           URD generic cũ (15 parts)
│   ├── README.md                  Header URD cũ
│   ├── part-00-gioi-thieu.md      Phần được giữ làm reference
│   ├── part-01-truy-cap.md
│   ├── part-02-pos-ban-hang.md    POS generic (không loyalty)
│   ├── part-03-khach-hang.md
│   ├── part-04-don-hang-hoa-don.md
│   ├── part-05-kho-san-pham.md    Kho generic
│   ├── part-06-mua-hang-ncc.md    Mua hàng NCC
│   ├── part-07-van-chuyen.md      Vận chuyển
│   ├── part-08-tai-chinh.md       Tài chính (cashbook, debt, fund)
│   ├── part-09-marketing-khuyen-mai.md
│   ├── part-10-loyalty-cham-soc.md  ← Loyalty (đã được rewrite trong 02-requirements)
│   ├── part-11-bao-cao-phan-tich.md
│   ├── part-12-cai-dat.md
│   ├── part-13-bpm-automation.md  BPM generic
│   ├── part-14-nfr-tich-hop.md
│   └── diagrams/
│
├── sa/                            SA generic cũ (15 parts)
│   ├── README.md
│   ├── part-00 → part-14
│   └── diagrams/
│
├── userguides/                    UG generic cũ (14 parts)
│   ├── README.md
│   ├── part-01 → part-14
│   └── images/
│
└── misc/                          Tài liệu khác
    └── taxes-test-findings.md     Test findings phần thuế HKD/CNKD (không thuộc loyalty)
```

## Mapping legacy → loyalty-focused

| Legacy | New (loyalty-focused) |
|---|---|
| `urd/part-10-loyalty-cham-soc.md` (UR-LOY-01→20) | Expanded into 12 parts: `../02-requirements/part-00` đến `part-12` |
| `urd/part-03-khach-hang.md` (membership generic) | `../02-requirements/part-02-membership-core.md` |
| `urd/part-09-marketing-khuyen-mai.md` (promotion generic) | `../02-requirements/part-06-promotions-campaigns.md` |
| `urd/part-11-bao-cao-phan-tich.md` (reports generic) | `../02-requirements/part-10-analytics-reports.md` |
| `urd/part-12-cai-dat.md` (settings generic) | `../02-requirements/part-11-settings-admin.md` |
| `urd/part-14-nfr-tich-hop.md` (NFR generic) | `../02-requirements/part-12-nfr.md` |
| `sa/part-00` đến `sa/part-14` (architecture generic) | Rewritten in `../03-architecture/part-00` đến `part-10` |
| `userguides/part-10-loyalty-cham-soc.md` | `../09-userguides/part-03-points-tier.md` + `part-04-rewards.md` |

## Khi nào tham chiếu legacy?

- Khi triển khai integration cần đọc legacy POS workflow để hiểu context
- Khi support customer migrate từ retail/spa stack
- Khi audit nội dung gốc trước rewrite

## Khi nào archive vĩnh viễn?

Sau 12 tháng nếu không có ai access:
1. Verify không có reference từ active docs
2. Archive vào git tag `legacy-archive-YYYY-MM-DD`
3. Xoá folder để giảm noise
