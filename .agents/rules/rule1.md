---
trigger: always_on
---

## PHẦN 0 — SESSION MANAGEMENT (BẮT BUỘC)
 
> Áp dụng cho MỌI session, MỌI task. Không được bỏ qua.
 
### Trước khi làm bất cứ điều gì
 
Nếu project có thư mục `_docs/`, đọc theo thứ tự:
 
```
1. _docs/PROJECT.md      → hiểu mục tiêu, scope, tech stack
2. _docs/ARCHITECTURE.md → hiểu cấu trúc hệ thống
3. _docs/CONTEXT.md      → biết trạng thái hiện tại, file nào được phép sửa
4. _docs/TASKS.md        → biết task nào đang làm, ưu tiên gì
```
 
Nếu project KHÔNG có `_docs/` → đọc `CLAUDE.md` của project (nếu có) rồi tiếp tục.
 
### Sau khi hoàn thành mỗi task
 
Cập nhật theo thứ tự:
 
```
1. _docs/CHANGELOG.md  → ghi lại đã làm gì, file nào thay đổi
2. _docs/TASKS.md      → chuyển task vừa xong sang ✅
3. _docs/CONTEXT.md    → cập nhật trạng thái, chuẩn bị cho session tiếp theo
4. _docs/BUGS.md       → nếu phát hiện bug trong quá trình làm, ghi vào đây
```
 
> ❌ Không được kết thúc session mà không cập nhật CHANGELOG  
> ❌ Không được sửa file ngoài danh sách cho phép trong `_docs/CONTEXT.md`  
> ❌ Không được bỏ qua bước đọc docs trước khi bắt tay vào làm
 
---
 
## PHẦN 1 — CODING BEHAVIOR
 
> Áp dụng cho mọi task, kể cả khi không dùng agent.
 
### 1. Think Before Coding
 
**Đừng đoán. Đừng giấu sự mơ hồ. Nêu rõ tradeoffs.**
 
Trước khi implement:
- Nêu rõ assumptions. Nếu không chắc → hỏi.
- Nếu có nhiều cách hiểu → trình bày tất cả, không tự chọn im lặng.
- Nếu có cách đơn giản hơn → nói ra. Phản biện khi cần.
- Nếu có gì không rõ → dừng lại. Nêu tên vấn đề. Hỏi.
### 2. Simplicity First
 
**Code tối thiểu giải quyết được vấn đề. Không suy diễn thêm.**
 
- Không làm thêm feature ngoài yêu cầu.
- Không tạo abstraction cho code chỉ dùng 1 lần.
- Không thêm "flexibility" hay "configurability" không được yêu cầu.
- Không xử lý error cho scenario không thể xảy ra.
- Viết 200 dòng mà có thể làm 50 dòng → viết lại.
Tự hỏi: *"Senior engineer có nói cái này overcomplicated không?"* Nếu có → đơn giản hóa.
 
### 3. Surgical Changes
 
**Chỉ chạm vào đúng phần cần thiết. Dọn dẹp đúng mess của mình.**
 
Khi edit code có sẵn:
- Không "cải thiện" code lân cận, comments, hay formatting.
- Không refactor những thứ không bị broken.
- Match style hiện tại, dù bạn có thể làm khác.
- Thấy dead code không liên quan → mention, không xóa.
Khi thay đổi tạo ra orphans:
- Xóa imports/variables/functions mà **thay đổi của bạn** làm thừa.
- Không xóa dead code có sẵn trừ khi được yêu cầu.
Test: Mỗi dòng thay đổi phải trace trực tiếp về request của user.
 
### 4. Goal-Driven Execution
 
**Định nghĩa success criteria. Loop cho đến khi verified.**
 
Chuyển task thành verifiable goals:
- "Add validation" → "Viết tests cho invalid inputs, sau đó make them pass"
- "Fix the bug" → "Viết test reproduce bug, sau đó make it pass"
- "Refactor X" → "Đảm bảo tests pass trước và sau"
Với multi-step tasks, nêu plan ngắn gọn:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```
 