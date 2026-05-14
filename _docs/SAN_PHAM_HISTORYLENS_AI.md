# HistoryLens AI - Tai lieu tong quan san pham

> Phien ban tai lieu: 1.0  
> Ngay cap nhat: 14/05/2026  
> Trang thai san pham: Demo MVP

## 1. Tong quan san pham

### 1.1. Gioi thieu

HistoryLens AI la nen tang hoc lich su Viet Nam theo huong tuong tac, ket hop du lieu lich su co cau truc, hoi dap voi AI, goc nhin nhan vat, am thanh thuyet minh, quiz va cong dong thao luan. San pham huong den viec bien noi dung lich su tu dang "doc - ghi nho" thanh mot trai nghiem co hanh trinh: chon nhan vat hoac su kien, tim hieu boi canh, tro chuyen voi AI theo nhieu vai, nghe cau tra loi, lam quiz va tiep tuc hoc theo lo trinh.

Demo MVP hien tai tap trung vao lich su Viet Nam, voi cac nhan vat va su kien tieu bieu nhu Nguyen Trai, Le Loi, Tran Hung Dao, Ly Thuong Kiet, Nguyen Hue, Ho Chi Minh, Vo Nguyen Giap, Dien Bien Phu, chien thang Bach Dang, khoi nghia Lam Son va nhieu muc trong manifest du lieu.

### 1.2. Muc tieu san pham

- Tao mot cong cu hoc lich su truc quan, de tiep can voi hoc sinh.
- Giup nguoi hoc dat cau hoi thay vi chi doc noi dung co san.
- Trinh bay lich su qua nhieu goc nhin: nhan vat, nguoi cung thoi, su gia, hoac cac ben lien quan trong su kien.
- Cung cap bai on tap nhanh bang quiz, flashcard va lo trinh hoc.
- Tao khong gian cong dong de nguoi dung chia se bai viet, cau hoi va thao luan.
- Tao nen tang ky thuat co the phat trien tiep thanh he thong fullstack hoan chinh.

### 1.3. Ly do build san pham

Viec hoc lich su thuong gap ba van de: noi dung dai va kho nho, cach trinh bay mot chieu, va thieu moi lien he ca nhan voi nhan vat/su kien. HistoryLens AI duoc xay dung de giai quyet cac van de nay bang cach:

- Chuyen noi dung thanh hoi thoai ngan, co ngu canh.
- Cho phep nguoi hoc "hoi truc tiep" nhan vat hoac su gia ve mot su kien.
- Ket hop hinh anh nhan vat, nen co phong cach co phong, am thanh va quiz de tang ghi nho.
- Cho giao vien/hoc sinh co mot ban demo de thu nghiem phuong phap hoc lich su bang AI.

### 1.4. Cong nghe su dung

| Nhom cong nghe | Cong nghe | Vai tro |
| --- | --- | --- |
| Frontend | React 19, React DOM | Xay dung giao dien SPA |
| Build tool | Vite | Dev server, build production, chia chunk |
| Routing | React Router DOM | Dieu huong cac trang Home, Entity, Chat, Quiz, Forum, Admin |
| Styling | Tailwind CSS, PostCSS, CSS custom tokens | Giao dien co phong A Dong, animation, responsive layout |
| AI chat | Gemini 2.5 Flash qua Netlify Function | Sinh cau tra loi lich su theo entity va perspective |
| AI TTS | Gemini 3.1 Flash TTS preview | Tao giong doc tieng Viet cho cau tra loi |
| Serverless | Netlify Functions | Proxy API chat, TTS, RSS news, admin user action |
| Auth | Firebase Authentication | Dang nhap email/password va Google |
| Database | Firestore | Bai viet forum, comment, user profile, moderation |
| Storage | Firebase Storage | Luu anh bai viet forum |
| Export bao cao | ExcelJS, file-saver | Xuat analytics/admin report ra Excel |
| Markdown | react-markdown | Render noi dung tra loi AI dang Markdown |
| Test | Vitest | Kiem thu mot so logic core |

### 1.5. Kien truc tong quan

```text
Nguoi dung
  -> React/Vite SPA
     -> Du lieu tinh: src/data/entities, src/data/events, manifest, learning paths
     -> Netlify Functions
        -> Gemini Chat API
        -> Gemini TTS API
        -> RSS news proxy
        -> Firebase Admin actions
     -> Firebase
        -> Auth
        -> Firestore
        -> Storage
```

San pham hien tai la MVP dang hybrid:

- Noi dung lich su cot loi nam trong JSON tinh de de kiem soat va demo nhanh.
- Chat/quiz/TTS dung Netlify Functions de giu API key o server side.
- Forum, auth va admin moderation da dung Firebase.
- Analytics hoc tap hien dang uu tien privacy-first va luu cuc bo bang localStorage.

## 2. Tinh nang hien co

### 2.1. Trang chu va tim kiem

- Hien thi concept san pham va cac nhan vat noi bat.
- Tim kiem nhan vat/su kien theo ten, tag, alias va thoi ky.
- Phan loai entity theo giai doan lich su.
- Ho tro modal tim kiem nhanh bang phim tat `Ctrl + K`.

### 2.2. Ho so nhan vat/su kien

- Trang chi tiet cho tung entity.
- Hero visual gom anh nen, anh nhan vat tach nen, ten nhan vat/su kien va thoi ky.
- Noi dung tong quan, timeline, goc nhin hoi dap, lien ket sang chat va quiz.
- Goi y entity lien quan theo cung thoi ky, nhan vat lien quan hoac su kien lien quan.
- Flashcard de on nhanh.
- Cap nhat SEO meta co ban cho trang entity.

### 2.3. Chat AI theo goc nhin

- Tro chuyen voi AI theo nhan vat/su kien lich su.
- Ho tro nhieu perspective: tu thuat, nguoi cung thoi, su gia, hoac cac vai lien quan.
- Co preset Q&A cho mot so nhan vat/su kien de tra loi nhanh va co audio san.
- Streaming response qua SSE de hien thi cau tra loi theo thoi gian thuc.
- Loc mot so mau prompt injection co ban o Netlify Function.
- Goi y cau hoi tiep theo sau cau tra loi.
- Sao chep cau tra loi, xoa cuoc tro chuyen, tu dong cuon thong minh.

### 2.4. Am thanh/TTS

- Phat audio preset cho cac cau hoi mau.
- Goi TTS serverless khi can doc cau tra loi.
- Co cau hinh toc do doc.
- Xu ly cat ngan noi dung TTS de tranh timeout.
- Chuyen PCM tu Gemini TTS thanh WAV de trinh duyet phat duoc.

### 2.5. Quiz va on tap

- Tao quiz theo nhan vat/su kien.
- Uu tien quiz sinh bang AI, co fallback cau hoi tu timeline/chunks khi can.
- Luu cache quiz trong sessionStorage.
- Cham diem, hien giai thich dap an, timer 30 giay/cau, streak va best streak.
- Track su kien hoan thanh quiz cho analytics.

### 2.6. Lo trinh hoc tap

- Co cac learning path nhu lich su Viet Nam co ban, trieu dai phong kien, anh hung dan toc, chien tranh va doc lap.
- Moi lo trinh gom nhieu level, danh sach entity, diem yeu cau va reward.
- Tien do hien duoc luu tam bang localStorage.

### 2.7. Tin tuc

- Trang doc bao/tin tuc voi category tabs.
- Lay du lieu qua Netlify Function news-feed va danh sach nguon RSS trong `src/data/news-sources.json`.
- Hien thi title, mo ta, thumbnail, nguon va thoi gian.

### 2.8. Dien dan cong dong

- Dang nhap bang Firebase Auth.
- Tao bai viet theo danh muc discussion/article/question.
- Upload anh toi Firebase Storage, gioi han 10MB/anh.
- Bai viet moi o trang thai pending de admin duyet.
- Xem danh sach bai viet approved.
- Chi tiet bai viet, comment, like/unlike va lightbox gallery.

### 2.9. Quan tri

- Trang admin tai route `/quan-tri`.
- Kiem tra quyen admin qua Firebase profile.
- Duyet, tu choi, xoa bai viet.
- Quan ly user: ban/unban, thang admin, ha cap user.
- Xoa tai khoan qua Netlify Function co Firebase Admin.
- Xem analytics cuc bo va xuat bao cao Excel.
- Duyet entity/noi dung AI dang muc localStorage trong MVP.

### 2.10. UI/UX va tai san hinh anh

- Phong cach co phong A Dong: giay cu, muc tau, hoa van trong dong, mau son do, vang dong, xanh ngoc.
- Animated background gom bui vang, may, hoa van va lop chuyen dong nhe.
- Character assets tach nen PNG/RGBA, dung cho hero va chat sidebar.
- Code-splitting bang `React.lazy` va `Suspense`.
- ErrorBoundary, SkeletonLoader, EmptyState, Toast.

## 3. So sanh voi cac giai phap hien co

| Tieu chi | Sach giao khoa/tai lieu PDF | Video bai giang | Chatbot AI tong quat | HistoryLens AI |
| --- | --- | --- | --- | --- |
| Cach hoc | Doc tuyen tinh | Xem mot chieu | Hoi dap rong | Hanh trinh hoc theo nhan vat/su kien |
| Muc do tuong tac | Thap | Trung binh | Cao | Cao, co chat, quiz, flashcard, forum |
| Ngu canh lich su | Co nhung tinh | Phu thuoc bai giang | De lech ngu canh neu prompt kem | Gan voi entity JSON, timeline, perspective va chunks |
| Goc nhin nhan vat | Han che | Phu thuoc noi dung video | Co the co nhung khong on dinh | Duoc thiet ke thanh perspective rieng |
| On tap | Bai tap rieng | Thuong khong co | Phai tu yeu cau | Quiz va learning path tich hop |
| Am thanh | Khong | Co | Tuy nen tang | TTS/preset audio tich hop |
| Cong dong | Khong | Binh luan ngoai nen tang | Khong tap trung | Forum rieng co moderation |
| Quan tri noi dung | Thu cong | Thu cong | Kho kiem soat | Co admin dashboard, role, moderation |

### Loi the cong nghe cua HistoryLens AI

- **Entity-first AI**: Chat khong bat dau tu prompt rong ma gan voi ho so entity, perspective va du lieu lich su co cau truc.
- **Perspective-aware learning**: Cung mot su kien co the hoi theo vai nhan vat, nguoi cung thoi hoac su gia, giup hoc sinh thay lich su co nhieu lop dien giai.
- **Serverless-first MVP**: Netlify Functions giup tach API key khoi frontend, de deploy nhanh va tiet kiem chi phi.
- **Hybrid static + dynamic**: Du lieu lich su quan trong duoc dong goi tinh de on dinh, trong khi forum/auth/admin dung Firebase de co tinh nang dong.
- **Learning loop khep kin**: Tim hieu -> hoi dap -> nghe -> quiz -> thao luan -> admin kiem duyet.
- **Thiet ke co ban sac**: UI, assets va mau sac duoc tao rieng cho chu de lich su Viet Nam, khac voi chatbot pho thong.

## 4. Huong dan su dung

### 4.1. Doi voi hoc sinh/nguoi hoc

1. Mo trang chu HistoryLens AI.
2. Tim nhan vat hoac su kien trong o tim kiem, vi du: `Nguyen Trai`, `Tran Hung Dao`, `Dien Bien Phu`.
3. Vao trang chi tiet de doc tong quan, timeline va cac y chinh.
4. Chon "Tro chuyen" de hoi AI theo goc nhin mong muon.
5. Chon cau hoi goi y hoac tu nhap cau hoi.
6. Bat audio neu muon nghe cau tra loi.
7. Lam quiz de kiem tra muc do ghi nho.
8. Vao Learning Paths de hoc theo lo trinh.
9. Vao Forum de doc bai viet, dat cau hoi hoac chia se noi dung.

### 4.2. Doi voi giao vien

1. Chon mot nhan vat/su kien phu hop voi bai hoc.
2. Yeu cau hoc sinh doc trang entity truoc khi vao chat.
3. Cho hoc sinh dat cau hoi theo cac perspective khac nhau.
4. So sanh cau tra loi giua goc nhin nhan vat va goc nhin su gia.
5. Dung quiz de kiem tra nhanh sau phan thao luan.
6. Dung forum de giao bai tap viet ngan hoac cau hoi phan bien.

### 4.3. Doi voi quan tri vien

1. Dang nhap bang tai khoan co role admin.
2. Truy cap `/quan-tri`.
3. Kiem tra bai viet pending va chon duyet/tu choi/xoa.
4. Quan ly tai khoan nguoi dung: ban/unban, thang/ha role.
5. Xem so lieu tong quan va xuat bao cao Excel neu can.
6. Kiem tra danh sach entity/noi dung can duyet trong phan nhan vat va su kien.

### 4.4. Huong dan chay local cho developer

Yeu cau:

- Node.js va pnpm/npm.
- Bien moi truong `GEMINI_API_KEY` khi can chat/TTS that qua Netlify Functions.
- Cau hinh Firebase neu test forum/auth/admin.

Lenh chay:

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

Test:

```bash
pnpm test
```

Chay kem Netlify Functions:

```bash
netlify dev
```

## 5. Thuc trang, painpoint va giai phap

| Thuc trang / painpoint | Nguyen nhan | Giai phap trong san pham | Tac dong du kien |
| --- | --- | --- | --- |
| Hoc sinh thay lich su kho nho | Noi dung nhieu moc thoi gian, it lien ket trai nghiem | Timeline, flashcard, quiz, learning path | Tang kha nang ghi nho theo tung buoc nho |
| Noi dung lich su mot chieu | Nguoi hoc chi doc/chep, it duoc hoi | Chat AI theo nhieu perspective | Tang tinh chu dong va kha nang dat cau hoi |
| Kho hinh dung nhan vat/su kien | Tai lieu chu yeu la chu viet | Hero visual, nhan vat tach nen, background theo boi canh | Tao an tuong thi giac va hung thu ban dau |
| Chatbot tong quat de tra loi lan man | Khong co khung entity va ngu canh | buildSystemPrompt, entity JSON, chunks, perspective | Cau tra loi bam hon vao nhan vat/su kien dang hoc |
| Bai hoc khong co feedback nhanh | Lam bai tap thu cong ton thoi gian | Quiz AI/fallback, cham diem tuc thi | Giao vien va hoc sinh nhan phan hoi nhanh |
| Thieu moi truong thao luan an toan | Mang xa hoi khong tap trung vao hoc tap | Forum rieng, bai viet pending, admin moderation | Xay dung cong dong hoc lich su co kiem duyet |
| Kho theo doi hieu qua demo | Chua co dashboard chuyen dung | Analytics local va export Excel | Co du lieu ban dau de danh gia hanh vi hoc tap |
| MVP chua phai fullstack hoan chinh | Nhieu phan con dung JSON/localStorage | Roadmap chuyen sang database, API, role, analytics server-side | San pham co duong phat trien ro thanh nen tang that |

## 6. Lo trinh phat trien fullstack

### Giai doan 1 - On dinh MVP hien tai

- Chuan hoa lai toan bo du lieu entity/event de tranh loi encoding va sai slug.
- Bo sung test cho retrieval, quiz fallback, chat preset, auth/admin guard.
- Kiem tra va sua cac entity trong learning path dang tham chieu slug chua co file du lieu.
- Hoan thien UI mobile cho Chat, Entity, Forum, Admin.
- Tao bo noi dung mau duoc giao vien duyet cho cac bai lich su trong chuong trinh THPT.

### Giai doan 2 - Backend noi dung tap trung

- Chuyen entity/event/chunks/perspectives tu JSON tinh sang database.
- Xay API quan ly noi dung: tao, sua, duyet, versioning, rollback.
- Them workflow kiem duyet: draft -> AI generated -> teacher reviewed -> published.
- Them audit log cho moi thay doi noi dung.
- Tach ro nguon tai lieu, do tin cay, trich dan va ngay cap nhat.

### Giai doan 3 - Hoc tap ca nhan hoa

- Luu tien do learning path theo user that trong Firestore hoac backend rieng.
- Ho so nguoi hoc: diem quiz, streak, level, badge, lich su cau hoi.
- Goi y bai hoc tiep theo dua tren diem yeu va noi dung da hoc.
- Tao de cuong on tap tu dong theo muc tieu: kiem tra 15 phut, thi hoc ky, on HSG.

### Giai doan 4 - AI/RAG nang cao

- Xay pipeline RAG voi vector database cho tai lieu lich su da duyet.
- Moi cau tra loi quan trong co trich dan nguon.
- Them che do "kiem chung cau tra loi" de canh bao khi AI suy dien.
- Bo sung guardrail tieng Viet va rubric rieng cho noi dung lich su.
- Cho giao vien tao bo tri thuc rieng theo lop/truong.

### Giai doan 5 - Cong dong va lop hoc

- Tao lop hoc, ma moi hoc sinh, phan quyen giao vien/hoc sinh/admin.
- Giao bai tap chat/quiz/forum theo lop.
- Dashboard giao vien: tien do lop, cau hoi hay, hoc sinh can ho tro.
- Moderation nang cao: report bai viet, loc tu khoa, lich su vi pham.
- He thong thong bao va email digest.

### Giai doan 6 - San pham hoan chinh

- PWA/offline cache cho noi dung co ban.
- Mobile-first app shell.
- He thong CMS noi dung co giao dien bien tap.
- Thanh toan/goi truong hoc neu thuong mai hoa.
- Monitoring production: logging, error tracking, analytics server-side.
- Bao mat: rate limit, App Check, secret rotation, backup du lieu, phan quyen chi tiet.

## 7. Brand guideline

Phan nay dung de thong nhat khi thiet ke Word, slide, poster hoac tai lieu truyen thong.

### 7.1. Ten thuong hieu

- Ten chinh: **HistoryLens AI**
- Cach viet khuyen nghi: `HistoryLens AI`
- Ten mo ta tieng Viet: **Lang kinh lich su bang AI**
- Tagline goi y: **Hoc lich su qua lang kinh nhan vat**

### 7.2. Tinh cach thuong hieu

- Tri thuc, dang tin cay.
- Gan voi van hoa Viet Nam.
- Hien dai nhung khong xa cach.
- Goi mo su to mo, tranh cam giac hoc thuoc kho khan.
- Ton trong lich su, khong giai tri hoa qua muc.

### 7.3. Mau sac chu dao

| Vai tro | Mau | Ma mau goi y | Cach dung |
| --- | --- | --- | --- |
| Nen giay co | Paper | `#F5EFE0` | Nen tai lieu, vung doc noi dung |
| Muc nau/den | Ink | `#1A0F0A` | Tieu de, body text chinh |
| Do son | Vermillion | `#8B1E1E` | Nut chinh, diem nhan quan trong |
| Vang dong | Gold | `#B8860B` | Vien, divider, icon, heading phu |
| Xanh ngoc | Jade | `#2F6F5E` | Diem nhan phu, trang thai tich cuc |
| Nau mem | Soft Ink | `#5A4638` | Mo ta, ghi chu |

Luu y khi tao Word:

- Nen dung nen trang sang mau giay, khong dung nen den.
- Do son va vang dong chi dung lam nhan, khong phu toan bo trang.
- Tranh gradient loe loet; uu tien vien mong, divider va hoa van nhe.

### 7.4. Typography

- Tieu de: font serif co dau tieng Viet tot, vi du Playfair Display, Merriweather, Noto Serif.
- Noi dung: font de doc, vi du Arial, Inter, Aptos, Noto Sans.
- Khong dung font co phong kho doc cho doan dai.
- Heading nen ngan, ro, co khoang cach dong thoang.

### 7.5. Hinh anh va minh hoa

- Phong cach: semi-realistic historical/fantasy Vietnamese character art.
- Nhan vat nen tach nen PNG, co outline ro, anh sang manh vua phai.
- Nen dung hoa van Dong Son, giay cu, muc tau, son do, dong co.
- Tranh dung hinh anh qua Trung Hoa/Nhat/Chau Au neu khong phu hop boi canh Viet Nam.
- Khong chen chu truc tiep len anh nhan vat neu anh dung lam asset.

### 7.6. Bo cuc tai lieu Word

- Trang bia: logo/ten HistoryLens AI, tagline, anh nhan vat lich su hoac texture trong dong.
- Moi chuong bat dau bang heading lon va mot divider vang dong.
- Bang nen co vien vang dong nhat, header mau do son hoac nau dam.
- Moi tinh nang nen co cau truc: van de -> giai phap -> tac dong.
- Chen screenshot theo tung man hinh: Home, Entity, Chat, Quiz, Forum, Admin.

### 7.7. Giong van

- Trang trong, de hieu, phu hop moi truong giao duc.
- Noi ro dau la tinh nang da co, dau la roadmap.
- Khong noi qua rang AI "luon chinh xac"; nen dung cach dien dat "ho tro", "goi y", "can kiem duyet".

## 8. Thong tin lien he

### Don vi/nhom phat trien

- San pham: **HistoryLens AI**
- Trang thai: Demo MVP phuc vu hoc tap va thuyet trinh san pham.

### Giao vien huong dan va ho tro

- Ho ten: **Thay giao Luong Hai Anh**
- Don vi: **Giao vien Truong THPT Chuyen Nguyen Trai**
- So dien thoai: **0328186264**

## 9. Ghi chu ve gioi han MVP

- Mot phan noi dung lich su van duoc luu bang JSON tinh, chua co CMS day du.
- Mot so tien do hoc tap va analytics dang luu localStorage, chua dong bo server-side.
- Chat AI can `GEMINI_API_KEY` va moi truong Netlify Functions de chay that.
- Forum/auth/admin phu thuoc Firebase va cau hinh quyen dung.
- Noi dung AI can duoc giao vien/quan tri vien kiem duyet truoc khi dung trong boi canh chinh thuc.
