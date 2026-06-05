package com.sem2.DTDD.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "messages")// Khai báo bảng messages trong MongoDB
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message {
    private String id;

    private String roomId;      // Tin nhắn này thuộc phòng chat nào
    private String senderId;    // Ai là người gửi (ID của User)
    private String content;     // Nội dung tin nhắn chữ
    private MessageType type;        // Loại tin nhắn: "TEXT", "IMAGE", "FILE", "VIDEO"
    private LocalDateTime timestamp; // Thời gian gửi tin nhắn
}
