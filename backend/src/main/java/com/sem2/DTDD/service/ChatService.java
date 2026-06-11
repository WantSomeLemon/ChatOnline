package com.sem2.DTDD.service;

import com.sem2.DTDD.model.ChatRoom;
import com.sem2.DTDD.model.Message;

import java.util.List;

public interface ChatService {
    /**
     * Khởi tạo một phòng chat mới (phòng chat riêng tư 1-1 hoặc phòng chat nhóm).
     * @param room Đối tượng cấu hình phòng chat do Client yêu cầu
     * @return Đối tượng ChatRoom sau khi đã lưu trữ thành công
     */
    ChatRoom createRoom(ChatRoom room);

    /**
     * Lấy toàn bộ dữ liệu lịch sử tin nhắn của một phòng chat cụ thể.
     * @param roomId ID định danh duy nhất của phòng chat
     * @return Danh sách các Message xếp theo thứ tự thời gian tăng dần
     */
    List<Message> getMessageHistory(String roomId);

    /**
     * Tìm kiếm thông tin chi tiết một phòng chat theo ID.
     * @param roomId ID định danh của phòng chat
     * @return ChatRoom tìm thấy hoặc null nếu không tồn tại
     */
    ChatRoom findRoomById(String roomId);
}
