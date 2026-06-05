package com.sem2.DTDD.controller;

import com.sem2.DTDD.model.Message;
import com.sem2.DTDD.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * API tiếp nhận tin nhắn real-time từ Client gửi lên, tiến hành lưu trữ và phát tán.
     * @param roomId ID của phòng chat mà tin nhắn này được gửi vào
     * @param message Đối tượng chứa nội dung và thông tin người gửi do Client đóng gói
     * <br><br>
     * <b>Luồng xử lý:</b>
     * <ol>
     *   <li>Nhận tin nhắn từ địa chỉ: {@code /app/chat.sendMessage/{roomId}}</li>
     *   <li>Bổ sung thời gian thực và lưu lịch sử vào MongoDB</li>
     *   <li>Phát tán tin nhắn tới kênh: {@code /topic/room/{roomId}} để toàn bộ thành viên trong phòng nhận được ngay lập tức.</li>
     * </ol>
     */
    @MessageMapping("/chat.sendMessage/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload Message message) {
        // 1. Chuẩn hóa lại thông tin tin nhắn trước khi lưu
        message.setRoomId(roomId);
        message.setTimestamp(LocalDateTime.now()); // Gắn thời gian thực tại hệ thống

        // 2. Lưu tin nhắn vào cơ sở dữ liệu MongoDB để làm lịch sử chat (History)
        Message savedMessage = messageRepository.save(message);

        // 3. Đẩy tin nhắn vừa lưu tới tất cả những ai đang lắng nghe (Subscribe) phòng chat này
        // Địa chỉ nhận tin của Client: /topic/room/{roomId}
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
    }
}
