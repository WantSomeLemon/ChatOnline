package com.sem2.DTDD.repository;

import com.sem2.DTDD.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    // Lấy toàn bộ lịch sử tin nhắn của một phòng chat dựa vào roomId và sắp xếp theo thời gian gửi tăng dần
    List<Message> findByRoomIdOrderByTimestampAsc(String roomId);
}
