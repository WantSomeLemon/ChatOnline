# Chat Online Real-time System - Ứng Dụng Nhắn Tin Thời Gian Thực Cho Thiết Bị

Đồ án Điện toán di động xây dựng hệ thống nhắn tin thời gian thực (Real-time Messaging) tối ưu cho môi trường di động dựa trên kiến trúc hướng sự kiện (Event-driven Architecture). Hệ thống thiết lập kết nối song công lâu dài thông qua giao thức STOMP trên nền tảng WebSocket, tách biệt luồng xử lý và đồng bộ hóa tức thì dữ liệu giữa Backend (Spring Boot) và Frontend (Angular Single Page Application) thông qua cơ sở dữ liệu MongoDB.

## 🚀 Tính Năng Chính
* **Quản lý phiên & Trạng thái người dùng:** Xác thực người dùng qua mã định danh tài khoản (`userId`), tự động duy trì trạng thái đăng nhập ngầm trên thiết bị di động và đồng bộ trạng thái trực tuyến (`ONLINE` / `OFFLINE`).
* **Phân định phòng chat động:** Định tuyến luồng dữ liệu độc lập theo từng phòng hội thoại (`roomId`) trực tiếp qua URL của trình duyệt thiết bị di động mà không làm ảnh hưởng đến các phòng chat khác.
* **Nhắn tin thời gian thực (Real-time Broadcaster):** Phân phối và hiển thị tin nhắn ngay lập tức đến toàn bộ thành viên đang có mặt trong phòng với độ trễ tính bằng mili-giây (< 200ms), đáp ứng tiêu chuẩn mạng di động.
* **Đồng bộ lịch sử hội thoại:** Tự động tải lại và kết xuất danh sách lịch sử tin nhắn cũ bất đồng bộ từ cơ sở dữ liệu MongoDB ngay khi người dùng vừa truy cập vào phòng chat.
* **Tối ưu hóa di động & Phục hồi kết nối:** Triển khai cơ chế lập trình phản ứng (Reactive Programming với RxJS) giải phóng bộ nhớ để tránh hiện tượng đơ lag thiết bị, tích hợp khả năng tự động kết nối lại (`Auto-reconnect`) khi di động thay đổi môi trường mạng (Wifi/4G).

## 🛠️ Công Nghệ Sử Dụng & Phiên Bản
Hệ thống được đồng bộ hóa cấu hình và phiên bản nghiêm ngặt đảm bảo hiệu năng chạy mượt mà trên môi trường di động:
* **Ngôn ngữ lập trình:** Java 17+ (Backend) & TypeScript / HTML / CSS (Frontend)
* **Framework Backend:** Spring Boot 3.x (Module cốt lõi: Spring Web, Spring WebSocket, Spring Data MongoDB)
* **Framework Frontend:** Angular 17+ (Kiến trúc Standalone Components, RxJS Reactive Streams)
* **Giao thức truyền tải thời gian thực:** STOMP Over WebSocket (Hỗ trợ thư viện dự phòng SockJS khi mạng yếu/không hỗ trợ WebSocket)
* **Cơ sở dữ liệu (Metadata & Message Store):** MongoDB 7.0 (Mô hình tham chiếu Reference Model, quản lý các tài liệu hướng đối tượng `User`, `ChatRoom`, `Message`)
* **Công cụ build hệ thống:** Maven 3.x (Backend) & Angular CLI / npm (Frontend)

## 🔄 Luồng Hoạt Động Của Hệ Thống (Workflow)

1. **Khởi tạo kết nối (Handshake):** Client di động (Angular) gửi yêu cầu nâng cấp giao thức mạng từ HTTP thông thường sang kết nối lâu dài WebSocket qua SockJS tới điểm cuối (Endpoint) `/ws-chat` được cấu hình tại Backend (Spring Boot). Sau khi bắt tay thành công, cổng TCP song công được giữ mở vính viễn giữa hai bên.
2. **Đăng ký kênh phòng chat (Subscribe):** Giao thức STOMP kích hoạt, client Angular tự động gửi một gói tin lệnh `SUBSCRIBE` tới địa chỉ đích của phòng chat mục tiêu dựa theo URL (Ví dụ: `/topic/room.{roomId}`). Simple Message Broker ngầm của Spring Boot tiếp nhận và đưa client này vào danh sách lắng nghe sự kiện của phòng đó.
3. **Gửi tin nhắn (Send):** Khi người dùng nhập nội dung và bấm gửi, Angular đóng gói dữ liệu thành cấu trúc JSON (gồm `senderId`, `content`) rồi phát lệnh `SEND` tới cổng tiếp nhận xử lý của ứng dụng tại địa chỉ `/app/chat.sendMessage/{roomId}`.
4. **Xử lý & Lưu trữ dữ liệu (Persistence):** Hàm `@MessageMapping` trong lớp `ChatController` của Spring Boot bắt được thông điệp bất đồng bộ, gán nhãn thời gian thực `timestamp` theo giờ hệ thống, sau đó gọi tầng Service thực hiện lưu trữ vĩnh viễn bản ghi tin nhắn vào cơ sở dữ liệu MongoDB.
5. **Phát tán tin nhắn diện rộng (Broadcast):** Ngay sau khi lưu vào MongoDB thành công, Message Broker đẩy ngược tin nhắn vừa xử lý xuống tất cả các thiết bị di động đang duy trì trạng thái `SUBSCRIBE` kênh phòng chat chung đó. Luồng dữ liệu RxJS `Observable` bên phía Angular bắt sự kiện, áp dụng toán tử Spread (`[...]`) tạo địa chỉ ô nhớ mới cho mảng và gọi `ChangeDetectorRef` ép màn hình render tin nhắn lên giao diện ngay lập tức.

## 📁 Cấu Trúc Thư Mục Dự Án
```text
ChatOnline/
│   .gitignore
│   pom.xml
│   README.md
│
├───backend
│   │   pom.xml
│   │
│   └───src
│       └───main
│           ├───java
│           │   └───com
│           │       └───sem2.DTDD
│           │           └───ChatOnline
│           │                   ChatOnlineApplication.java
│           │
│           │                   ├───config
│           │                   │       WebSocketConfig.java
│           │                   │
│           │                   ├───controller
│           │                   │       ChatController.java
│           │                   │
│           │                   ├───model
│           │                   │       MessagePayload.java
│           │                   │
│           │                   └───service
│           │                           MessageService.java
│           │
│           └───resources
│                   application.properties
│
└───frontend
│   package.json
│   angular.json
│
└───src
└───app
├───components
│   └───chat
│           chat.component.ts
│           chat.component.html
│           chat.component.css
│
└───services
chat.service.ts
```

## ⚡ Hướng Dẫn Triển Khai Chi Tiết (Setup & Run)

Do các thư mục thực thi tự động (`target/`, `node_modules/`, `.angular/`) đã được cấu hình chặn bởi tệp `.gitignore` nhằm tránh làm nặng Git Repository, người sử dụng khi lấy dự án về cần thao tác khởi chạy tuần tự theo các bước sau:

### 1. Khởi Tạo Cơ Sở Dữ Liệu MongoDB
* Đảm bảo máy tính của bạn đã được cài đặt và kích hoạt dịch vụ **MongoDB Server** (Phiên bản 7.0+).
* Cổng kết nối mặc định của cơ sở dữ liệu local là `27017`.
* Hệ thống sẽ tự động khởi tạo cơ sở dữ liệu và các Collection (`user`, `message`, `chatRoom`) ngay trong lần đầu chạy ứng dụng dựa trên cấu hình tệp `application.properties`.

### 2. Khởi Chạy Ứng Dụng Backend (Spring Boot)
Hệ thống sử dụng công cụ quản lý Maven Multi-module. Bạn có thể chọn một trong hai cách sau để build và chạy file thực thi:

* **Cách 1: Chạy bằng câu lệnh Terminal**
  Mở Terminal tại thư mục con `backend/` của dự án và thực hiện chuỗi lệnh:
  ```bash
  mvn clean package -DskipTests
  java -jar target/ChatOnline-0.0.1-SNAPSHOT.jar

* **Cách 2: Sử dụng giao diện IntelliJ IDEA**
  * Ở cạnh phải màn hình, mở tab công cụ Maven.
  * Chọn module gốc của dự án backend.
  * Tìm đến mục Lifecycle.
  * Giữ phím Ctrl và chọn đồng thời cả hai mục clean và package.
  * Click đúp chuột hoặc bấm nút Run (biểu tượng tam giác xanh) để tạo file thực thi .jar.
  * Sau khi chạy xong, mở tệp ChatOnlineApplication.java và chọn Run để kích hoạt server.

* **3. Khởi Chạy Ứng Dụng Frontend (Angular)**
  * Yêu cầu máy tính cài đặt sẵn môi trường Node.js (phiên bản LTS) phù hợp để chạy Angular 17.
  * Mở một cửa sổ Terminal mới, chuyển hướng đường dẫn vào thư mục frontend/.
  * Cài đặt toàn bộ các gói thư viện phụ thuộc của dự án bằng cách thực thi lệnh:
  ```bash
  npm install
  ```
  * Khởi chạy máy chủ ảo để phát triển giao diện và tự động biên dịch mã nguồn
  ```bash
  npm start
  Hoặc lệnh hệ thống: ng serve --open
  ```
  * Sau khi quá trình biên dịch kết thúc thành công, trình duyệt sẽ tự động mở ra hoặc bạn truy cập thủ công thông qua liên kết: http://localhost:4200

## 🔌 Cổng Dịch Vụ Mặc Định (Default Ports)

* **Frontend Angular Web App:** `http://localhost:4200` — Giao diện hiển thị các hộp thoại chat, danh sách phòng và tiếp nhận tương tác trực quan từ người dùng di động.
* **Backend REST API & WebSocket Server:** `http://localhost:8080` — Điểm cuối xử lý nghiệp vụ, lưu trữ và mở cổng bắt tay truyền tin thời gian thực (`ws://localhost:8080/ws-chat`).
* **MongoDB Database Store:** `mongodb://localhost:27017` — Cổng kết nối cơ sở dữ liệu NoSQL lưu trữ phi cấu trúc toàn bộ thông tin hội thoại và tài khoản.

---

## 🔒 Xử Lý Sự Cố Thực Tế (Engineering Insights & Debugging)

Trong quá trình liên kết hệ thống giữa Backend và Frontend, mã nguồn đã được tối ưu hóa sâu để xử lý dứt điểm 3 lỗi kinh điển thuộc kiến trúc mạng thời gian thực trên thiết bị di động:

1. **Angular Change Detection (Mất đồng bộ dữ liệu hiển thị DOM):**
    * *Sự cố:* Nhật ký Console báo nhận gói tin chứa chuỗi ký tự tin nhắn mới rất đầy đủ từ Socket, nhưng khung chat HTML trơ trơ, không tự động bổ sung dòng tin nhắn mới nào lên màn hình.
    * *Khắc phục:* Do kết nối mạng WebSocket chạy bất đồng bộ bên ngoài vùng kiểm soát tự động của Angular. Việc gọi hàm `.push()` mảng truyền thống giữ nguyên địa chỉ ô nhớ cũ nên cơ chế phát hiện thay đổi của Angular 17 bỏ qua bước vẽ lại màn hình. Giải pháp là sử dụng toán tử phân rã Spread (`this.messagesList = [...this.messagesList, newRawMessage]`) để ép sinh ra một mảng mới có địa chỉ tham chiếu hoàn toàn mới, kết hợp gọi lệnh thủ công `ChangeDetectorRef.detectChanges()` nhằm ép giao diện cập nhật lập tức khối lệnh `@for`.

2. **Memory Leak Subscriptions (Trùng liên kết mạng & Nhân đôi tin nhắn):**
    * *Sự cố:* Khi người dùng thao tác chuyển đổi qua lại liên tục giữa các phòng chat khác nhau, tin nhắn gửi đi bắt đầu bị nhân đôi, nhân ba và xuất hiện tình trạng nhận thông tin chéo dữ liệu giữa phòng chat cũ và mới.
    * *Khắc phục:* Do các phiên làm việc kết nối ngầm của WebSocket và luồng đăng ký `.subscribe()` tin nhắn cũ không được ngắt đi khi thay đổi URL tham số phòng chat. Hệ thống tiến hành chuẩn hóa vòng đời của Component: gọi lệnh ngắt kết nối mạng ngầm bằng `this.chatService.disconnect()` và giải phóng vùng nhớ bằng câu lệnh `.unsubscribe()` cho các luồng cũ trước khi cấu hình một phiên lắng nghe dữ liệu mới.

3. **Routing Outlet Conflict (Trùng bản sao giao diện hiển thị):**
    * *Sự cố:* Giao diện ứng dụng xuất hiện lỗi nghiêm trọng khi hiển thị hai khung hộp thoại chat giống hệt nhau, xếp chồng thẳng đứng lên nhau trên cùng một trang màn hình di động.
    * *Khắc phục:* Do sai sót đặt đồng thời thẻ gọi cứng tĩnh `<app-chat></app-chat>` và thẻ phân phối tuyến động `<router-outlet></router-outlet>` tại tệp cấu trúc layout gốc. Hệ thống tiến hành loại bỏ dòng gọi mã thẻ cứng, bàn giao toàn bộ quyền định vị và dựng giao diện động của các phòng chat dựa theo tham số URL cho duy nhất thẻ điều hướng `<router-outlet>`.

---

## 📦 Module Cấu Trúc Thành Phần (Project Structure Configuration)

Hệ thống được tổ chức phân rã theo các module cấu trúc độc lập rõ ràng:
* **ChatOnline (Root Module)**
    * *Excluded:* `target/`, `.angular/`, `node_modules/` (Cấu hình loại bỏ tự động để tối ưu dung lượng khi lưu trữ và đẩy mã nguồn lên Git Repository).
* **backend (Tầng xử lý trung tâm)**
    * *Source:* `src/main/java` — Chứa mã nguồn cấu hình WebSocket Broker, REST API điều hướng và tầng xử lý nghiệp vụ Java.
    * *Resource:* `src/main/resources` — Quản lý tệp cấu hình kết nối database thông qua hệ thống thuộc tính `application.properties`.
* **frontend (Tầng hiển thị thiết bị)**
    * *Source & Components:* `src/app/components/chat` — Thành phần quản lý tệp hiển thị HTML, mã xử lý logic TypeScript và phong cách CSS của giao diện khung chat di động.
    * *Services:* `src/app/services` — Dịch vụ quản lý luồng dữ liệu phản ứng RxJS, chịu trách nhiệm thiết lập và duy trì cổng kết nối mạng StompJS / SockJS Client.