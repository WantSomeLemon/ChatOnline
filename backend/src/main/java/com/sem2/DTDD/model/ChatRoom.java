package com.sem2.DTDD.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "chat_rooms") // Khai báo bảng 'chat_rooms' trong MongoDB
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private String id;

    private String name;        // Tên nhóm (nếu là GROUP), chat PRIVATE 1-1 thì có thể để null

    private RoomType type;      // Dùng Enum (PRIVATE hoặc GROUP) 

    private List<String> memberIds; // Danh sách các ID của User có mặt trong phòng chat này
}