package com.sem2.DTDD.controller;

import com.sem2.DTDD.model.ChatRoom;
import com.sem2.DTDD.model.Message;
import com.sem2.DTDD.model.User;
import com.sem2.DTDD.service.ChatService;
import com.sem2.DTDD.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    /**
     * API vào ứng dụng chat nhanh không cần mật khẩu.
     * Đường dẫn gọi API: <b>POST http://localhost:8080/api/chat/login-quick?username=...</b>
     * @param username Biệt danh người dùng gõ từ màn hình chào mừng
     * @return ResponseEntity chứa thông tin User để Angular lưu lại Session hoạt động
     */
    @PostMapping("/login-quick")
    public ResponseEntity<User> loginQuick(@RequestParam("username") String username) {
        return ResponseEntity.ok(userService.loginQuick(username));
    }

    /**
     * API lấy danh sách toàn bộ người dùng để hiển thị lên màn hình danh bạ cho Client chọn lựa người chat cùng.
     * Đường dẫn gọi API: <b>GET http://localhost:8080/api/chat/users</b>
     * @return ResponseEntity chứa danh sách mảng toàn bộ người dùng hệ thống
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * API khởi tạo một phòng chat mới (hoặc lấy phòng cũ nếu đã tồn tại).
     * Đường dẫn gọi API: <b>POST http://localhost:8080/api/chat/room</b>
     * @param room Đối tượng phòng chat do Client yêu cầu tạo (chứa danh sách thành viên)
     * @return ResponseEntity chứa thông tin phòng chat kèm theo ID định danh để kết nối WebSocket
     */
    @PostMapping("/room")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoom room) {
        return ResponseEntity.ok(chatService.createRoom(room));
    }

    /**
     * API truy xuất toàn bộ lịch sử tin nhắn cũ của một phòng chat cụ thể để hiển thị lên khung chat.
     * Đường dẫn gọi API: <b>GET http://localhost:8080/api/chat/room/{roomId}/messages</b>
     * @param roomId ID định danh của phòng chat cần lấy dữ liệu tin nhắn cũ
     * @return ResponseEntity chứa danh sách mảng các tin nhắn cũ xếp theo thời gian tăng dần
     */
    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<List<Message>> getRoomMessages(@PathVariable("roomId") String roomId) {
        return ResponseEntity.ok(chatService.getMessageHistory(roomId));
    }
}
