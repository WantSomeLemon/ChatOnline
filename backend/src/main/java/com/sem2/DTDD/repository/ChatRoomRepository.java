package com.sem2.DTDD.repository;

import com.sem2.DTDD.model.ChatRoom;
import com.sem2.DTDD.model.RoomType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    // Tìm tất cả các phòng chat mà một User cụ thể đang tham gia (để hiển thị danh sách chat ở thanh bên cạnh)
    List<ChatRoom> findByMemberIdsContains(String userId);

    @Override
    Optional<ChatRoom> findById(String roomId);
}
