# So Dang Ky Rui Ro - Reborn Retail CRM

> **Du an:** Reborn Retail CRM (Chuoi cua hang ban le)
> **Phien ban:** 1.0
> **Ngay cap nhat:** 2026-04-16
> **Nguoi lap:** Project Manager

---

## 1. Ma tran rui ro tong quan

|                | **Tac dong Thap** | **Tac dong TB** | **Tac dong Cao** |
|----------------|:-----------------:|:---------------:|:----------------:|
| **Xac suat Cao**   | TB                | Cao             | Nghiem trong     |
| **Xac suat TB**    | Thap              | TB              | Cao              |
| **Xac suat Thap**  | Thap              | Thap            | TB               |

**Quy uoc muc do:**
- **Nghiem trong:** Can xu ly ngay, bao cao Ban giam doc
- **Cao:** Uu tien xu ly trong sprint hien tai
- **TB:** Len ke hoach xu ly trong 1-2 sprint toi
- **Thap:** Theo doi, xu ly khi co nguon luc

---

## 2. Danh sach rui ro

### 2.1. Rui ro Ky thuat

| ID | Mo ta rui ro | Xac suat | Tac dong | Muc do | Bien phap giam thieu | Nguoi chiu trach nhiem | Trang thai |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| KT-01 | **POS offline sync fail** - Mat du lieu giao dich khi POS mat ket noi internet va dong bo lai that bai | Cao | Cao | Nghiem trong | (1) Luu toan bo giao dich vao IndexedDB/local storage truoc khi gui server. (2) Retry queue tu dong voi exponential backoff. (3) Canh bao admin khi co giao dich pending > 30 phut. (4) Cong cu doi soat sync thu cong | Tech Lead | Dang xu ly |
| KT-02 | **Multi-branch data conflict** - Xung dot du lieu khi nhieu chi nhanh cap nhat cung san pham (ton kho, gia) dong thoi | Cao | Cao | Nghiem trong | (1) Ap dung optimistic locking voi version field. (2) Conflict resolution rule: last-write-wins cho gia, additive cho ton kho. (3) Audit log moi thay doi. (4) Thong bao realtime khi co conflict | Tech Lead | Dang xu ly |
| KT-03 | **Payment gateway downtime** - Cong thanh toan (VNPay, Momo, ZaloPay) ngung hoat dong trong gio ban hang | TB | Cao | Cao | (1) Tich hop toi thieu 2 cong thanh toan. (2) Tu dong fallback sang cong phu khi cong chinh loi. (3) Cho phep thanh toan tien mat khi tat ca cong loi. (4) Dashboard theo doi trang thai gateway | Tech Lead | Chua bat dau |
| KT-04 | **API performance at scale** - API cham khi so luong cua hang va giao dich tang (>50 cua hang, >10K don/ngay) | TB | Cao | Cao | (1) Load test dinh ky voi k6/Artillery. (2) Database indexing toi uu. (3) Redis cache cho du lieu doc nhieu (san pham, gia). (4) Pagination + lazy loading. (5) Horizontal scaling plan | Backend Lead | Dang theo doi |
| KT-05 | **E-invoice integration error** - Loi tich hop hoa don dien tu (VNPT, Viettel, BKAV) gay sai lech thue, mat hoa don | TB | Cao | Cao | (1) Retry mechanism voi dead letter queue. (2) Doi soat tu dong giua he thong va nha cung cap HDDT. (3) Fallback: luu hoa don pending, phat hanh lai khi he thong phuc hoi. (4) Canh bao email/SMS khi phat hanh that bai | Backend Lead | Chua bat dau |
| KT-06 | **Inventory stock mismatch** - Ton kho thuc te khong khop voi he thong do loi tinh toan hoac race condition | Cao | Cao | Nghiem trong | (1) Su dung database transaction voi row-level locking cho moi thay doi ton kho. (2) Kiem kho dinh ky + doi soat tu dong. (3) Audit trail moi bien dong kho. (4) Canh bao khi chenh lech > nguong cho phep | Backend Lead | Dang xu ly |

### 2.2. Rui ro Du an

| ID | Mo ta rui ro | Xac suat | Tac dong | Muc do | Bien phap giam thieu | Nguoi chiu trach nhiem | Trang thai |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| DA-01 | **Timeline delay** - Tre tien do do ước luong sai, dependency block, hoac thay doi yeu cau | Cao | TB | Cao | (1) Buffer 20% cho moi milestone. (2) Sprint review 2 tuan/lan. (3) Dependency tracking board. (4) Escalation sớm khi tre > 3 ngay | Project Manager | Dang theo doi |
| DA-02 | **Scope creep** - Yeu cau mo rong pham vi lien tuc tu khach hang hoac stakeholder | Cao | TB | Cao | (1) Change request process chinh thuc. (2) Moi thay doi phai co impact assessment (time, cost, risk). (3) Product backlog uu tien ro rang. (4) Sprint scope lock sau planning | Project Manager | Dang theo doi |
| DA-03 | **Resource turnover** - Mat thanh vien chu chot (dev, QA) giua du an | TB | Cao | Cao | (1) Documentation day du (code, API, architecture). (2) Cross-training giua cac thanh vien. (3) Knowledge sharing session hang tuan. (4) Code review bat buoc de giam bus factor | Project Manager | Dang theo doi |
| DA-04 | **Training adoption** - Nhan vien cua hang khong su dung duoc he thong moi, quay lai quy trinh cu | TB | TB | TB | (1) Tai lieu huong dan HDSD day du bang tieng Viet. (2) Video training cho tung chuc nang. (3) Hotline ho tro 7 ngay dau. (4) Super-user tai moi cua hang | BA Lead | Chua bat dau |
| DA-05 | **Data migration from legacy POS** - Loi khi chuyen du lieu tu he thong POS cu (san pham, khach hang, lich su giao dich) | TB | Cao | Cao | (1) Migration script co dry-run mode. (2) Doi soat so luong record truoc/sau. (3) Rollback plan neu loi. (4) Chay migration ngoai gio kinh doanh. (5) Giu he thong cu song song 1 thang | Tech Lead | Chua bat dau |

### 2.3. Rui ro Nghiep vu

| ID | Mo ta rui ro | Xac suat | Tac dong | Muc do | Bien phap giam thieu | Nguoi chiu trach nhiem | Trang thai |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| NV-01 | **Wrong promotion rules** - Cau hinh khuyen mai sai dan den giam gia qua muc hoac khong ap dung dung dieu kien | Cao | Cao | Nghiem trong | (1) Preview/simulate khuyen mai truoc khi kich hoat. (2) Gioi han muc giam toi da. (3) Approval workflow cho khuyen mai lon. (4) Bao cao realtime doanh thu khuyen mai. (5) Co the tam dung khuyen mai ngay lap tuc | BA Lead | Dang xu ly |
| NV-02 | **Cashbook reconciliation errors** - Sai lech giua so quy va thuc thu/chi, khong can doi duoc cuoi ngay | TB | Cao | Cao | (1) Tu dong tao but toan khi co giao dich. (2) Doi soat cuoi ca tu dong. (3) Bao cao chenh lech realtime. (4) Khong cho phep dong ca khi chenh lech vuot nguong | BA Lead | Dang xu ly |
| NV-03 | **Customer data privacy breach** - Lo lot thong tin khach hang (SDT, dia chi, lich su mua hang) | Thap | Cao | TB | (1) Ma hoa du lieu nhay (AES-256). (2) RBAC phan quyen theo chi nhanh. (3) Audit log truy cap du lieu khach hang. (4) Mask SDT/email tren giao dien (chi hien 4 so cuoi). (5) Chinh sach bao mat va dao tao nhan vien | Tech Lead | Dang theo doi |
| NV-04 | **Wrong stock calculation** - Tinh sai ton kho do loi cong thuc (nhap, xuat, chuyen kho, tra hang, huy) | TB | Cao | Cao | (1) Unit test day du cho moi loai phieu kho. (2) Cong thuc tinh ton kho duoc review boi BA + Dev. (3) Doi soat ton kho theo lo/batch. (4) Kiem kho dot xuat khi nghi ngo sai lech | Backend Lead | Dang xu ly |

### 2.4. Rui ro Van hanh

| ID | Mo ta rui ro | Xac suat | Tac dong | Muc do | Bien phap giam thieu | Nguoi chiu trach nhiem | Trang thai |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| VH-01 | **Server downtime during peak sales** - Server sap trong gio cao diem (11h-13h, 17h-21h) hoac dip le/Tet | Thap | Cao | TB | (1) Auto-scaling policy cho gio cao diem. (2) Health check + auto-restart. (3) CDN cho static assets. (4) POS offline mode dam bao ban hang khong gian doan. (5) SLA 99.9% uptime | DevOps Lead | Dang theo doi |
| VH-02 | **Backup failure** - Mat du lieu do backup that bai hoac khong the restore | Thap | Cao | TB | (1) Backup tu dong hang ngay (daily) + hang tuan (weekly full). (2) Backup luu tai 2 vi tri (on-site + cloud). (3) Test restore hang thang. (4) Monitoring alert khi backup fail. (5) RPO < 1h, RTO < 4h | DevOps Lead | Dang theo doi |
| VH-03 | **Redis cache corruption** - Cache bi sai du lieu dan den hien thi sai gia, ton kho, thong tin san pham | TB | TB | TB | (1) TTL hop ly cho tung loai cache (gia: 5 phut, ton kho: 1 phut). (2) Cache invalidation khi co write. (3) Fallback ve database khi cache miss. (4) Redis Sentinel/Cluster cho HA. (5) Monitoring Redis memory + hit rate | DevOps Lead | Dang theo doi |

---

## 3. Quy trinh quan ly rui ro

### 3.1. Nhan dien rui ro
- Review danh sach rui ro moi **2 tuan** trong Sprint Retrospective
- Bat ky thanh vien nao deu co the bao cao rui ro moi qua Jira/Slack
- Danh gia rui ro khi co thay doi lon (feature moi, thay doi infrastructure, them chi nhanh)

### 3.2. Danh gia va phan loai
- Su dung ma tran **Xac suat x Tac dong** de xac dinh muc do
- Rui ro muc **Nghiem trong** va **Cao**: bao cao trong daily standup
- Rui ro muc **TB** va **Thap**: review trong sprint planning

### 3.3. Xu ly rui ro
- **Tranh (Avoid):** Thay doi ke hoach de loai bo rui ro
- **Giam thieu (Mitigate):** Thuc hien bien phap giam xac suat hoac tac dong
- **Chuyen giao (Transfer):** Chuyen rui ro cho ben thu 3 (bao hiem, SLA vendor)
- **Chap nhan (Accept):** Ghi nhan va theo doi neu chi phi xu ly > tac dong

### 3.4. Theo doi va bao cao
- **Dashboard rui ro:** Cap nhat tren Jira board rieng
- **Bao cao tuan:** Tong hop rui ro moi, rui ro da xu ly, rui ro dang mo
- **Escalation:** Rui ro Nghiem trong chua xu ly sau 48h -> bao cao Ban giam doc

---

## 4. Lich su cap nhat

| Ngay | Nguoi cap nhat | Noi dung thay doi |
|------|---------------|-------------------|
| 2026-04-16 | Project Manager | Tao phien ban dau tien voi 17 rui ro |

---

> **Ghi chu:** Tai lieu nay can duoc review va cap nhat dinh ky moi 2 tuan hoac khi co su kien anh huong den du an.
